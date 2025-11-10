// ملف: api/auth/microsoft/callback.js
// استقبال الرد من Microsoft وحفظ الـ tokens

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code received');
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  
  // الحصول على الـ URL بشكل صحيح
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/microsoft/callback`;

  try {
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // إرسال الـ tokens إلى n8n
    const n8nWebhook = 'https://n8n-n8n.pdvkjn.easypanel.host/webhook/credentials';
    
    await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: state,
        service: 'microsoft',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
        token_type: tokens.token_type,
      }),
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>تم الربط بنجاح</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: white;
            text-align: center;
          }
          .success-box {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          }
          h1 { font-size: 48px; margin: 0 0 20px 0; }
          p { font-size: 20px; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="success-box">
          <h1>✅</h1>
          <h1>تم الربط بنجاح!</h1>
          <p>تم ربط حساب Microsoft بنجاح</p>
        </div>
        <script>
          setTimeout(() => {
            window.opener.postMessage({ type: 'microsoft_connected' }, '*');
            setTimeout(() => window.close(), 2000);
          }, 1000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>خطأ في الربط</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            background: #1a1a2e;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: white;
            text-align: center;
          }
          .error-box {
            background: rgba(255, 50, 50, 0.1);
            padding: 40px;
            border-radius: 20px;
            border: 2px solid rgba(255, 50, 50, 0.3);
          }
          h1 { font-size: 48px; margin: 0 0 20px 0; }
          p { font-size: 16px; color: #ff6b6b; }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>❌</h1>
          <h1>حدث خطأ</h1>
          <p>${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
}
