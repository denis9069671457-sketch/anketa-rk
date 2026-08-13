import { neon } from '@neondatabase/serverless';

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
// Реальные файлы догружаются отдельно по id через ?ids=...
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
      const { child_name, form_type, ids } = req.query;

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
