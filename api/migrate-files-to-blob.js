import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

const DATABASE_URL = "postgresql://neondb_owner:npg_uA7rOk6LdWsV@ep-orange-art-asgqyaia-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

// Разовый скрипт: переносит уже загруженные клиентами файлы (сейчас лежат в базе
// как base64-текст) в Vercel Blob, а в самой записи оставляет только ссылку.
// Запускается ОДИН РАЗ вручную (открыть ссылку в браузере, будучи залогиненным
// администратором) — после успешного переноса эту функцию и её файл можно удалить.
//
// Защита паролем через query-параметр ?password=..., чтобы посторонний не мог
// случайно запустить перенос.
const MIGRATE_PASSWORD = "3211";

function parseMaybeJson(v, fallback) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return fallback; } }
  return v;
}

export default async function handler(req, res) {
  if (req.query.password !== MIGRATE_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль. Добавьте ?password=... в адрес.' });
  }

  const results = { processed: 0, filesMigrated: 0, skippedAlreadyUrl: 0, errors: [] };

  try {
    const sql = neon(DATABASE_URL);
    const rows = await sql`SELECT id, answers FROM ankety WHERE form_type = 'documents'`;

    for (const row of rows) {
      try {
        let ans = row.answers;
        if (typeof ans === 'string') { try { ans = JSON.parse(ans); } catch(e) { ans = {}; } }
        ans = ans || {};
        const fileData = parseMaybeJson(ans.fileData, []);
        if (!Array.isArray(fileData) || !fileData.length) continue;

        let changed = false;
        const newFileData = [];
        for (const fd of fileData) {
          if (!fd) continue;
          if (fd.url) {
            // Уже мигрировано раньше — оставляем как есть.
            newFileData.push(fd);
            results.skippedAlreadyUrl++;
            continue;
          }
          const dataUri = fd.data || '';
          const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUri);
          if (!m) { newFileData.push(fd); continue; }
          const mime = m[1];
          const buf = Buffer.from(m[2], 'base64');
          const pathname = `documents/${row.id}/${fd.docId || 'file'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const blob = await put(pathname, buf, { access: 'public', contentType: mime, addRandomSuffix: true });
          newFileData.push({ docId: fd.docId, url: blob.url });
          changed = true;
          results.filesMigrated++;
        }

        if (changed) {
          const newAns = { ...ans, fileData: JSON.stringify(newFileData) };
          await sql`UPDATE ankety SET answers = ${JSON.stringify(newAns)} WHERE id = ${row.id}`;
        }
        results.processed++;
      } catch (e) {
        results.errors.push({ id: row.id, error: e.message });
      }
    }

    return res.status(200).json({ ok: true, ...results });
  } catch (e) {
    console.error('Migration error:', e);
    return res.status(500).json({ error: e.message, ...results });
  }
}
