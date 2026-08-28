import { neon } from '@neondatabase/serverless';
import { deflateRawSync } from 'zlib';

const DATABASE_URL = "postgresql://neondb_owner:npg_uA7rOk6LdWsV@ep-orange-art-asgqyaia-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const TG_TOKEN = "8275190161:AAHOi-xx2RGQa2DvlyYQTLwfsf7bBkrUl1M";
const TG_ADMINS = ["7348062407", "7083321677", "8009885685"];

async function sendTelegramMessage(text) {
  await Promise.all(TG_ADMINS.map(chat_id =>
    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML" }),
    }).catch(e => console.error(`Telegram msg error for ${chat_id}:`, e))
  ));
}

async function sendTelegramDocument(buffer, filename, caption) {
  await Promise.all(TG_ADMINS.map(async (chat_id) => {
    try {
      const form = new FormData();
      form.append("chat_id", chat_id);
      if (caption) form.append("caption", caption);
      form.append("document", new Blob([buffer], { type: "application/zip" }), filename);
      const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendDocument`, { method: "POST", body: form });
      if (!res.ok) console.error(`Telegram sendDocument failed for ${chat_id}:`, await res.text());
    } catch(e) {
      console.error(`Telegram doc error for ${chat_id}:`, e);
    }
  }));
}

// ─── Сборка читаемого ZIP-бэкапа (CSV + распакованные файлы + текст анкет) ───
// Идентично логике в api/save.js (?backup=1) — держите оба места синхронно при правках.
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

// Читает всю таблицу небольшими партиями (а не одним SELECT), чтобы не упереться
// в лимит Neon на размер одного HTTP-ответа (64 МБ) — здесь нужны ВСЕ файлы целиком.
async function fetchAllRowsBatched(sql, batchSize = 20) {
  const all = [];
  let lastId = 0;
  while (true) {
    const batch = await sql`
      SELECT id, date, answers, parent_name, form_type FROM ankety
      WHERE id > ${lastId} ORDER BY id ASC LIMIT ${batchSize}
    `;
    if (!batch.length) break;
    all.push(...batch);
    lastId = batch[batch.length - 1].id;
    if (batch.length < batchSize) break;
  }
  return all;
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
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/heic': '.heic', 'image/webp': '.webp',
  'application/pdf': '.pdf', 'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
function parseMaybeJson(v, fallback) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return fallback; } }
  return v;
}

async function buildBackupZip(rows) {
  const entries = [];
  const csvLines = ['ID;Дата;Тип;Ребёнок;Родитель;Город;Файлов прикреплено;Комментарий'];

  for (const rec of rows) {
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
        for (let idx = 0; idx < fileNames.length; idx++) {
          const fn = fileNames[idx];
          const docId = (fn || {}).docId || '';
          const origName = (fn || {}).fileName || `file_${idx}`;
          let fd = Array.isArray(fileData) ? fileData[idx] : null;
          if (!fd || (fd.docId && fd.docId !== docId)) fd = (fileData || []).find(x => x.docId === docId) || fd;
          // Файлы теперь лежат в Vercel Blob — скачиваем каждый по ссылке для архива.
          const url = (fd || {}).url;
          if (url) {
            try {
              const fres = await fetch(url);
              if (fres.ok) {
                const buf = Buffer.from(await fres.arrayBuffer());
                let outName = safeName(origName, 80);
                if (!outName.includes('.')) {
                  const ct = fres.headers.get('content-type') || '';
                  outName += EXT_BY_MIME[ct] || '';
                }
                entries.push({ name: `Документы/${idSafe}/${outName}`, data: buf });
              }
            } catch(e) { /* пропускаем файл, если не удалось скачать из Blob */ }
          }
        }
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
  }

  entries.unshift({ name: 'Список_анкет.csv', data: Buffer.from('\uFEFF' + csvLines.join('\n'), 'utf8') });
  return buildZip(entries);
}

export default async function handler(req, res) {
  // Защита: этот эндпоинт должен вызываться только по расписанию Vercel Cron,
  // а не быть доступен всем в интернете (там все анкеты клиентов).
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const sql = neon(DATABASE_URL);
    // Тянем данные небольшими партиями — у Neon жёсткий лимит 64 МБ на один HTTP-ответ,
    // и при большом объёме файлов сплошной SELECT в него уже не помещается.
    const rows = await fetchAllRowsBatched(sql);

    const zipBuffer = await buildBackupZip(rows);
    const sizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
    const filename = `anketa-rk-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    // Telegram не примет файл больше ~50 МБ через sendDocument — на этот случай
    // шлём хотя бы предупреждение, чтобы админ знал, что бэкап не прошёл целиком.
    if (zipBuffer.length > 49 * 1024 * 1024) {
      await sendTelegramMessage(`⚠️ <b>Резервная копия слишком большая для отправки в Telegram</b>\n\nВсего записей: ${rows.length}\nРазмер: ${sizeMB} МБ\n\nСкачайте копию вручную через кнопку в панели администратора.`);
      return res.status(200).json({ ok: true, count: rows.length, sentToTelegram: false, reason: 'too_large' });
    }

    await sendTelegramMessage(`💾 <b>Еженедельная резервная копия анкет</b>\n\nВсего записей: <b>${rows.length}</b>\nРазмер файла: ${sizeMB} МБ\n🕐 ${new Date().toLocaleString("ru-RU")}\n\nВ архиве: таблица CSV со списком всех анкет + все прикреплённые файлы клиентов в обычном виде.`);
    await sendTelegramDocument(zipBuffer, filename, `Резервная копия — ${rows.length} записей`);

    return res.status(200).json({ ok: true, count: rows.length, sentToTelegram: true });
  } catch(e) {
    console.error('Backup error:', e);
    return res.status(500).json({ error: e.message });
  }
}
