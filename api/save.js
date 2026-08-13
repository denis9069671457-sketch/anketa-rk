import { neon } from '@neondatabase/serverless';
import { deflateRawSync } from 'zlib';

const DATABASE_URL = "postgresql://neondb_owner:npg_uA7rOk6LdWsV@ep-orange-art-asgqyaia-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const TG_TOKEN = "8275190161:AAHOi-xx2RGQa2DvlyYQTLwfsf7bBkrUl1M";
const TG_ADMINS = ["7348062407", "7083321677", "8009885685"];
const SITE_URL = "https://anketa-rk.vercel.app";

async function sendTelegram(text) {
  await Promise.all(TG_ADMINS.map(chat_id =>
    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true }),
    }).catch(e => console.error(`Telegram error for ${chat_id}:`, e))
  ));
}

function cabinetLink(id) {
  return `${SITE_URL}/?open=${id}`;
}

// Убирает тяжёлые base64-файлы из ответа для списков/автообновления.
// Реальные файлы догружаются отдельно по id через ?ids=..., либо все разом через ?backup=1
function stripDocsHeavyFields(row) {
  if (!row || row.form_type !== 'documents') return row;
  let ans = row.answers;
  let wasString = typeof ans === 'string';
  try {
    const obj = wasString ? JSON.parse(ans) : (ans || {});
    if (obj && obj.fileData !== undefined) obj.fileData = wasString ? '[]' : [];
    return { ...row, answers: wasString ? JSON.stringify(obj) : obj };
  } catch(e) {
    return row;
  }
}

// ─── Сборка читаемого ZIP-бэкапа (CSV + распакованные файлы + текст анкет) ───
function crc32(buf) {
  if (!crc32.table) {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    crc32.table = t;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crc32.table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const data = entry.data;
    let payload = data, method = 0;
    try {
      const compressed = deflateRawSync(data);
      if (compressed.length < data.length) { payload = compressed; method = 8; }
    } catch(e) {}
    const crc = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuf, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuf);

    offset += localHeader.length + nameBuf.length + payload.length;
  }

  const centralSize = centralParts.reduce((a, b) => a + b.length, 0);
  const centralOffset = offset;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, end]);
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function safeName(s, maxlen = 70) {
  s = (s || 'без_имени').toString().trim().replace(/[\\/*?:"<>|]/g, '_').replace(/\s+/g, ' ');
  return (s.slice(0, maxlen) || 'без_имени').trim();
}
const TYPE_LABELS = { anamnez: 'Анкета М.И. Лынской', family: 'Семейный фон', documents: 'Документы' };
const EXT_BY_MIME = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/heic': '.heic',
  'application/pdf': '.pdf', 'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
function parseMaybeJson(v, fallback) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return fallback; } }
  return v;
}

function buildBackupZip(rows) {
  const entries = [];
  const csvLines = ['ID;Дата;Тип;Ребёнок;Родитель;Город;Файлов прикреплено;Комментарий'];

  rows.forEach(rec => {
    let ans = rec.answers;
    if (typeof ans === 'string') { try { ans = JSON.parse(ans); } catch(e) { ans = {}; } }
    ans = ans || {};
    const formType = rec.form_type || 'anamnez';
    const childName = ans.s0_1 || ans.f0_1 || '';
    const parentName = rec.parent_name || '';
    const dateStr = rec.date || '';
    const typeLabel = TYPE_LABELS[formType] || formType;
    const idSafe = safeName(`${childName || 'без_имени'} — ${parentName || 'без_родителя'} (id${rec.id})`, 80);

    let fileCount = 0, comment = '';

    if (formType === 'documents') {
      const fileNames = parseMaybeJson(ans.fileNames, []);
      const fileData = parseMaybeJson(ans.fileData, []);
      comment = ans.comment || '';
      fileCount = Array.isArray(fileNames) ? fileNames.length : 0;

      if (Array.isArray(fileNames)) {
        fileNames.forEach((fn, idx) => {
          const docId = (fn || {}).docId || '';
          const origName = (fn || {}).fileName || `file_${idx}`;
          let fd = Array.isArray(fileData) ? fileData[idx] : null;
          if (!fd || (fd.docId && fd.docId !== docId)) fd = (fileData || []).find(x => x.docId === docId) || fd;
          const dataUri = (fd || {}).data || '';
          const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUri);
          if (m) {
            const buf = Buffer.from(m[2], 'base64');
            let outName = safeName(origName, 80);
            if (!outName.includes('.')) outName += (EXT_BY_MIME[m[1]] || '');
            entries.push({ name: `Документы/${idSafe}/${outName}`, data: buf });
          }
        });
      }
    } else {
      const lines = [typeLabel, `Ребёнок: ${childName || '—'}`, `Родитель: ${parentName || '—'}`, `Дата: ${dateStr}`, ''];
      Object.keys(ans).sort().forEach(k => {
        const v = ans[k];
        if (v !== undefined && v !== null && v !== '') lines.push(`${k}: ${v}`);
      });
      entries.push({ name: `Анкеты/${typeLabel}_${idSafe}.txt`, data: Buffer.from(lines.join('\n'), 'utf8') });
    }

    csvLines.push([rec.id, dateStr, typeLabel, childName, parentName, ans.s0_4 || ans.f0_4 || '', fileCount, comment].map(csvEscape).join(';'));
  });

  entries.unshift({ name: 'Список_анкет.csv', data: Buffer.from('\uFEFF' + csvLines.join('\n'), 'utf8') });
  return buildZip(entries);
}

async function checkAndNotify(sql, parent_name, childName, newFormType, recordId) {
  const rows = await sql`SELECT form_type FROM ankety WHERE parent_name = ${parent_name} ORDER BY date DESC`;
  const formTypes = new Set(rows.map(r => r.form_type));
  formTypes.add(newFormType);
  const hasAnamnez = formTypes.has("anamnez");
  const hasFamily = formTypes.has("family");
  const now = new Date().toLocaleString("ru-RU");
  const link = cabinetLink(recordId);

  if (newFormType === "documents") {
    await sendTelegram(`🎉 <b>Клиент завершил оформление!</b>\n\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\n👤 Родитель: <b>${parent_name||"Не указан"}</b>\n🕐 ${now}\n\n<b>Что заполнено:</b>\n${hasAnamnez?"✅":"⬜"} Анкета М.И. Лынской\n${hasFamily?"✅":"⬜"} Семейный фон\n✅ Документы\n\n🔗 <a href="${link}">Открыть в кабинете администратора</a>`);
  } else if (newFormType === "anamnez" && !hasFamily) {
    await sendTelegram(`📋 <b>${parent_name||"Клиент"}</b> заполнил первую анкету.\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\nОжидаем семейный фон и документы...\n\n🔗 <a href="${link}">Открыть в кабинете администратора</a>`);
  } else if (newFormType === "family" && hasAnamnez) {
    await sendTelegram(`🧬 <b>${parent_name||"Клиент"}</b> заполнил обе анкеты!\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\n✅ Анкета М.И. Лынской\n✅ Семейный фон\n⏳ Ожидаем документы...\n\n🔗 <a href="${link}">Открыть в кабинете администратора</a>`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sql = neon(DATABASE_URL);

    if (req.method === 'POST') {
      const { date, answers, parent_name, form_type } = req.body;
      const result = await sql`
        INSERT INTO ankety (date, answers, parent_name, form_type)
        VALUES (${date}, ${JSON.stringify(answers)}, ${parent_name || ''}, ${form_type || 'anamnez'})
        RETURNING id
      `;
      const newId = result[0].id;
      const childName = answers?.s0_1 || answers?.f0_1 || "";
      await checkAndNotify(sql, parent_name || "", childName, form_type || "anamnez", newId);
      return res.status(200).json({ ok: true, id: newId });
    }

    if (req.method === 'PATCH') {
      const { id, answers, form_type } = req.body;
      await sql`
        UPDATE ankety SET answers = ${JSON.stringify(answers)}, form_type = ${form_type}
        WHERE id = ${id}
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const { child_name, form_type, ids, backup } = req.query;

      // Читаемый ZIP-бэкап ВСЕХ записей: CSV-таблица + распакованные файлы клиентов +
      // текстовые файлы анкет — кнопка "Скачать резервную копию" в панели администратора.
      if (backup) {
        const rows = await sql`SELECT id, date, answers, parent_name, form_type FROM ankety ORDER BY date DESC`;
        const zipBuffer = buildBackupZip(rows);
        const filename = `anketa-rk-backup-${new Date().toISOString().slice(0, 10)}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(zipBuffer);
      }

      // Догрузка конкретных записей ПОЛНОСТЬЮ (с файлами) — используется только
      // когда админ реально открывает карточку "Документы" или печатает её.
      if (ids) {
        const idList = String(ids).split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n));
        if (!idList.length) return res.status(200).json({ ok: true, data: [] });
        const rows = await sql`SELECT id, date, answers, parent_name, form_type FROM ankety WHERE id = ANY(${idList})`;
        return res.status(200).json({ ok: true, data: rows });
      }

      if (child_name) {
        const rows = await sql`SELECT id, date, answers, parent_name, form_type FROM ankety WHERE form_type = 'documents' ORDER BY date DESC LIMIT 20`;
        const name = child_name.toLowerCase();
        const match = rows.find(r => {
          const n = (r.answers?.s0_1 || r.parent_name || '').toLowerCase();
          return n.includes(name.split(' ')[0]) || name.includes(n.split(' ')[0]);
        });
        return res.status(200).json({ ok: true, data: match ? stripDocsHeavyFields(match) : null });
      }

      // Обычный список (первая загрузка, автообновление, поиск в разделе "Редактировать")
      // — отдаём БЕЗ содержимого файлов, чтобы не гонять тяжёлые base64-строки лишний раз.
      const rows = form_type
        ? await sql`SELECT id, date, answers, parent_name, form_type FROM ankety WHERE form_type = ${form_type} ORDER BY date DESC`
        : await sql`SELECT id, date, answers, parent_name, form_type FROM ankety ORDER BY date DESC`;
      return res.status(200).json({ ok: true, data: rows.map(stripDocsHeavyFields) });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM ankety WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) {
    console.error('API error:', e);
    return res.status(500).json({ error: e.message });
  }
}
