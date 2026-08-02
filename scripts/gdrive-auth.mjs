import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import http from 'node:http';
import { google } from 'googleapis';

const ROOT = process.cwd();
const CREDENTIALS_PATH = resolve(ROOT, 'scripts/gdrive-credentials.json');
const TOKEN_PATH = resolve(ROOT, 'scripts/gdrive-token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

async function loadClient() {
  const raw = await readFile(CREDENTIALS_PATH, 'utf8');
  const { installed } = JSON.parse(raw);
  const oAuth2Client = new google.auth.OAuth2(installed.client_id, installed.client_secret, 'http://localhost:53682/oauth2callback');
  return oAuth2Client;
}

async function loadToken(client) {
  try {
    const raw = await readFile(TOKEN_PATH, 'utf8');
    client.setCredentials(JSON.parse(raw));
    return true;
  } catch {
    return false;
  }
}

function authenticate(client) {
  return new Promise((promiseResolve, promiseReject) => {
    const authUrl = client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:53682');
        if (url.pathname !== '/oauth2callback') return;
        const code = url.searchParams.get('code');
        res.end('Authorization complete. You can close this tab and return to the terminal.');
        server.close();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        await writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
        promiseResolve();
      } catch (error) {
        promiseReject(error);
      }
    });
    server.listen(53682, () => {
      console.log('Open this URL in your browser to authorize Drive access:\n');
      console.log(authUrl);
      console.log('\nWaiting for authorization...');
    });
  });
}

export async function getDriveClient() {
  const client = await loadClient();
  const hasToken = await loadToken(client);
  if (!hasToken) await authenticate(client);
  return google.drive({ version: 'v3', auth: client });
}
