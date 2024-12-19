// lib/googleSearchConsole.ts
import { google } from 'googleapis';

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string);

// Tạo auth client
const auth = new google.auth.JWT(credentials.client_email, undefined, credentials.private_key.replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/webmasters.readonly']);

const webmasters = google.webmasters({ version: 'v3', auth });

export default webmasters;
