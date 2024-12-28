// lib/googleAnalytics.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export const createAnalyticsDataClient = (credentials: any) => {
    const parsedCredentials = JSON.parse(credentials);

    return new BetaAnalyticsDataClient({
        credentials: {
            client_email: parsedCredentials.client_email,
            private_key: parsedCredentials.private_key,
        },
    });
};
