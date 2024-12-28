// lib/googleSearchConsole.ts

import { google } from 'googleapis';

export const createSearchConsoleClient = (credentials: string) => {
    const parsedCredentials = JSON.parse(credentials);

    const auth = new google.auth.JWT(parsedCredentials.client_email, undefined, parsedCredentials.private_key.replace(/\\n/g, '\n'), ['https://www.googleapis.com/auth/webmasters.readonly']);

    return google.webmasters({ version: 'v3', auth });
};
