module.exports = async function handler(req, res) {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/microsoft/callback`;
  
  const scopes = [
    'Mail.ReadWrite',
    'Calendars.ReadWrite',
    'Files.ReadWrite.All',
    'offline_access'
  ].join(' ');

  const state = req.query.state || req.query.user_id || 'default_user';

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_mode=query&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  res.redirect(authUrl);
}
