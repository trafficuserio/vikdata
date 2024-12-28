import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { metric: string } }) {
    const { searchParams } = req.nextUrl;
    const domainId = searchParams.get('domainId');
    const refreshToken = searchParams.get('refreshToken');
    const clientId = searchParams.get('clientId');
    const clientSecret = searchParams.get('clientSecret');
    const accountId = searchParams.get('accountId');
    const dateRange = searchParams.get('dateRange') || 'CUSTOM';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const token = req.cookies.get('token')?.value;

    if (!refreshToken || !clientId || !clientSecret || !accountId || !token) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const getAccessToken = async () => {
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const payload = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString(),
        });

        if (!response.ok) throw new Error('Failed to refresh access token');
        const data = await response.json();

        if (data.refresh_token) {
            const updateRefreshTokenAdsUrl = `${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/update-refresh-token-ads`;
            const updatePayload = {
                id: domainId,
                refreshTokenAds: data.refresh_token,
            };

            const updateResponse = await fetch(updateRefreshTokenAdsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatePayload),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update refresh token');
            }
        }

        return data.access_token;
    };

    const getAdSenseReport = async (metric: string, accessToken: string) => {
        let url = `https://adsense.googleapis.com/v2/${accountId}/reports:generate?dateRange=${dateRange}&dimensions=DATE&metrics=${metric}`;

        if (dateRange === 'CUSTOM' && startDate && endDate) {
            url += `&startDate.year=${startDate.split('-')[0]}&startDate.month=${startDate.split('-')[1]}&startDate.day=${startDate.split('-')[2]}`;
            url += `&endDate.year=${endDate.split('-')[0]}&endDate.month=${endDate.split('-')[1]}&endDate.day=${endDate.split('-')[2]}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch AdSense report');
        return await response.json();
    };

    try {
        const accessToken = await getAccessToken();
        const report = await getAdSenseReport(params.metric, accessToken);
        return NextResponse.json({ data: report });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
