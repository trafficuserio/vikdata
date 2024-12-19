import { BetaAnalyticsDataClient } from '@google-analytics/data';

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string);

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
    },
});

export default analyticsDataClient;
