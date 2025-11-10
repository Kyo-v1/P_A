// ملف: api/auth/google.js
// بداية OAuth flow لـ Google

module.exports = async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // الحصول على الـ URL بشكل صحيح
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ');

  const state = req.query.state || req.query.user_id || 'default_user';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(authUrl);
}// ملف: api/auth/google.js
// بداية OAuth flow لـ Google

export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/google/callback`;
  
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ');

  const state = req.query.state || req.query.user_id || 'default_user';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(authUrl);
}
