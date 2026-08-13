import { neon } from '@neondatabase/serverless';

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

async function sendTelegramDocument(jsonString, filename, caption) {
  await Promise.all(TG_ADMINS.map(async (chat_id) => {
    try {
      const form = new FormData();
      form.append("chat_id", chat_id);
      if (caption) form.append("caption", caption);
      form.append("document", new Blob([jsonString], { type: "application/json" }), filename);
      const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendDocument`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) console.error(`Telegram sendDocument failed for ${chat_id}:`, await res.text());
    } catch(e) {
      console.error(`Telegram doc error for ${chat_id}:`, e);
    }
  }));
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
    const rows = await sql`SELECT id, date, answers, parent_name, form_type FROM ankety ORDER BY date DESC`;

    const payload = {
      exported_at: new Date().toISOString(),
      count: rows.length,
      records: rows,
    };
    const jsonString = JSON.stringify(payload, null, 2);
    const sizeMB = (Buffer.byteLength(jsonString, 'utf8') / (1024 * 1024)).toFixed(2);
    const filename = `anketa-rk-backup-${new Date().toISOString().slice(0, 10)}.json`;

    // Telegram не примет файл больше ~50 МБ через sendDocument — на этот случай
    // шлём хотя бы предупреждение, чтобы админ знал, что бэкап не прошёл целиком.
    if (Buffer.byteLength(jsonString, 'utf8') > 49 * 1024 * 1024) {
      await sendTelegramMessage(`⚠️ <b>Резервная копия слишком большая для отправки в Telegram</b>\n\nВсего записей: ${rows.length}\nРазмер: ${sizeMB} МБ\n\nСкачайте копию вручную через кнопку в панели администратора.`);
      return res.status(200).json({ ok: true, count: rows.length, sentToTelegram: false, reason: 'too_large' });
    }

    await sendTelegramMessage(`💾 <b>Еженедельная резервная копия анкет</b>\n\nВсего записей: <b>${rows.length}</b>\nРазмер файла: ${sizeMB} МБ\n🕐 ${new Date().toLocaleString("ru-RU")}`);
    await sendTelegramDocument(jsonString, filename, `Резервная копия — ${rows.length} записей`);

    return res.status(200).json({ ok: true, count: rows.length, sentToTelegram: true });
  } catch(e) {
    console.error('Backup error:', e);
    return res.status(500).json({ error: e.message });
  }
}
