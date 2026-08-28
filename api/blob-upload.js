import { handleUpload } from '@vercel/blob/client';

// Этот эндпоинт не получает сами файлы — только выдаёт браузеру клиента
// одноразовый токен, чтобы файл летел напрямую в Vercel Blob, минуя наш сервер.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const request = new Request(`https://${req.headers.host || 'anketa-rk.vercel.app'}${req.url}`, {
      method: req.method,
      headers: req.headers,
    });

    const jsonResponse = await handleUpload({
      body: req.body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maximumSizeInBytes: 25 * 1024 * 1024, // 25 МБ на файл — с большим запасом
        addRandomSuffix: true,
      }),
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    console.error('Blob upload token error:', e);
    return res.status(400).json({ error: e.message });
  }
}
