import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgresql://neondb_owner:npg_uA7rOk6LdWsV@ep-orange-art-asgqyaia-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const TG_TOKEN = "8275190161:AAHOi-xx2RGQa2DvlyYQTLwfsf7bBkrUl1M";
const TG_ADMINS = ["7348062407", "7083321677", "8009885685"];

async function sendTelegram(text) {
  await Promise.all(TG_ADMINS.map(chat_id =>
    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML" }),
    }).catch(e => console.error(`Telegram error for ${chat_id}:`, e))
  ));
}

async function checkAndNotify(sql, parent_name, childName, newFormType) {
  const rows = await sql`SELECT form_type FROM ankety WHERE parent_name = ${parent_name} ORDER BY date DESC`;
  const formTypes = new Set(rows.map(r => r.form_type));
  formTypes.add(newFormType);
  const hasAnamnez = formTypes.has("anamnez");
  const hasFamily = formTypes.has("family");
  const now = new Date().toLocaleString("ru-RU");

  if (newFormType === "documents") {
    await sendTelegram(`🎉 <b>Клиент завершил оформление!</b>\n\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\n👤 Родитель: <b>${parent_name||"Не указан"}</b>\n🕐 ${now}\n\n<b>Что заполнено:</b>\n${hasAnamnez?"✅":"⬜"} Анкета М.И. Лынской\n${hasFamily?"✅":"⬜"} Семейный фон\n✅ Документы\n\nВойдите в кабинет администратора для просмотра.`);
  } else if (newFormType === "anamnez" && !hasFamily) {
    await sendTelegram(`📋 <b>${parent_name||"Клиент"}</b> заполнил первую анкету.\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\nОжидаем семейный фон и документы...`);
  } else if (newFormType === "family" && hasAnamnez) {
    await sendTelegram(`🧬 <b>${parent_name||"Клиент"}</b> заполнил обе анкеты!\n👶 Ребёнок: <b>${childName||"Не указано"}</b>\n✅ Анкета М.И. Лынской\n✅ Семейный фон\n⏳ Ожидаем документы...`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
      const childName = answers?.s0_1 || answers?.f0_1 || "";
      await checkAndNotify(sql, parent_name || "", childName, form_type || "anamnez");
      return res.status(200).json({ ok: true, id: result[0].id });
    }

    if (req.method === 'GET') {
      const { child_name, form_type } = req.query;
      if (child_name) {
        const rows = await sql`SELECT id, date, answers, parent_name, form_type FROM ankety WHERE form_type = 'documents' ORDER BY date DESC LIMIT 20`;
        const name = child_name.toLowerCase();
        const match = rows.find(r => {
          const n = (r.answers?.s0_1 || r.parent_name || '').toLowerCase();
          return n.includes(name.split(' ')[0]) || name.includes(n.split(' ')[0]);
        });
        return res.status(200).json({ ok: true, data: match || null });
      }
      const rows = form_type
        ? await sql`SELECT id, date, answers, parent_name, form_type FROM ankety WHERE form_type = ${form_type} ORDER BY date DESC`
        : await sql`SELECT id, date, answers, parent_name, form_type FROM ankety ORDER BY date DESC`;
      return res.status(200).json({ ok: true, data: rows });
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
