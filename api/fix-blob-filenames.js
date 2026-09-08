import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

const DATABASE_URL = "postgresql://neondb_owner:npg_uA7rOk6LdWsV@ep-orange-art-asgqyaia-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

// Разовый скрипт: находит файлы, у которых ссылка в Vercel Blob была сохранена
// БЕЗ расширения (так делала самая первая миграция из базы в Blob в августе) —
// в браузере такие файлы открывались нормально (по типу содержимого), но при
// скачивании на компьютер операционная система не понимает, что это за файл,
// и не может его открыть. Скрипт перезаливает такие файлы под новым, правильным
// именем (с расширением) и обновляет ссылку в записи.
//
// Запускается ОДИН РАЗ вручную (открыть ссылку в браузере) — после успешного
// прогона эту функцию и её файл можно удалить.
const FIX_PASSWORD = "3211";

const EXT_BY_MIME = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/heic': '.heic', 'image/webp': '.webp',
  'application/pdf': '.pdf', 'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

function parseMaybeJson(v, fallback) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return fallback; } }
  return v;
}

// У ссылки нет расширения, если последний сегмент пути не содержит точку
// (или точка есть только в самом начале имени, что для файлов не характерно).
function looksLikeMissingExtension(url) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const last = path.split('/').pop() || '';
    return !/\.[a-zA-Z0-9]{2,5}$/.test(last);
  } catch(e) {
    return false;
  }
}

function safeName(name, max = 80) {
  const cleaned = (name || 'file').replace(/[\\/:*?"<>|]/g, '_').trim();
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}

export default async function handler(req, res) {
  if (req.query.password !== FIX_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль. Добавьте ?password=... в адрес.' });
  }

  const results = { recordsProcessed: 0, filesFixed: 0, filesAlreadyOk: 0, errors: [] };

  try {
    const sql = neon(DATABASE_URL);
    const idRows = await sql`SELECT id FROM ankety WHERE form_type = 'documents' ORDER BY id ASC`;

    for (const { id } of idRows) {
      try {
        const rows = await sql`SELECT answers FROM ankety WHERE id = ${id}`;
        if (!rows.length) continue;
        let ans = rows[0].answers;
        if (typeof ans === 'string') { try { ans = JSON.parse(ans); } catch(e) { ans = {}; } }
        ans = ans || {};
        const fileData = parseMaybeJson(ans.fileData, []);
        const fileNames = parseMaybeJson(ans.fileNames, []);
        if (!Array.isArray(fileData) || !fileData.length) continue;

        let changed = false;
        const newFileData = [];
        for (const fd of fileData) {
          if (!fd || !fd.url) { newFileData.push(fd); continue; }
          if (!looksLikeMissingExtension(fd.url)) {
            newFileData.push(fd);
            results.filesAlreadyOk++;
            continue;
          }
          // Нашли файл без расширения — перезаливаем под правильным именем.
          const meta = (fileNames || []).find(fn => fn && fn.docId === fd.docId) || {};
          const origName = meta.fileName || 'file';
          const mime = meta.fileType || '';
          let outName = safeName(origName);
          if (!/\.[a-zA-Z0-9]{2,5}$/.test(outName)) {
            outName += EXT_BY_MIME[mime] || '';
          }
          const fres = await fetch(fd.url);
          if (!fres.ok) {
            results.errors.push({ id, docId: fd.docId, error: `Не удалось скачать старый файл: HTTP ${fres.status}` });
            newFileData.push(fd);
            continue;
          }
          const buf = Buffer.from(await fres.arrayBuffer());
          const pathname = `documents/${id}/${fd.docId || 'file'}-${Date.now()}-${outName}`;
          const blob = await put(pathname, buf, { access: 'public', contentType: mime || undefined, addRandomSuffix: true });
          newFileData.push({ docId: fd.docId, url: blob.url });
          changed = true;
          results.filesFixed++;
        }

        if (changed) {
          const newAns = { ...ans, fileData: JSON.stringify(newFileData) };
          await sql`UPDATE ankety SET answers = ${JSON.stringify(newAns)} WHERE id = ${id}`;
        }
        results.recordsProcessed++;
      } catch (e) {
        results.errors.push({ id, error: e.message });
      }
    }

    return res.status(200).json({ ok: true, ...results });
  } catch (e) {
    console.error('Fix-filenames error:', e);
    return res.status(500).json({ error: e.message, ...results });
  }
}
