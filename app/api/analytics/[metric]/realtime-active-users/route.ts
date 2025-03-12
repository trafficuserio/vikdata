// Vikdata/app/api/analytics/[metric]/realtime-active-users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAnalyticsDataClient } from '@/lib/googleAnalytics';

async function getDomainInfoById(domainId: string, token: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id?id=${domainId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();

    if (data.errorcode === 401) {
        const logoutResponse = NextResponse.json({ error: 'Phiên đăng nhập hết hạn' }, { status: 401 });
        logoutResponse.cookies.set('token', '', { path: '/', expires: new Date(0) });
        return logoutResponse;
    }
    if (!response.ok && data.errorcode !== 401) {
        throw new Error(data.message || 'Failed to refresh access token');
    }
    if (data.errorcode !== 200) {
        throw new Error(data.message || 'Error fetching domain information');
    }
    return data.data;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const domainId = url.searchParams.get('domainId') || '';
    // Tham số minutes được lấy nhưng không sử dụng do GA4 realtime API không hỗ trợ tùy chọn này
    const minutesParam = url.searchParams.get('minutes') || '30';

    if (!domainId) {
        return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Token is missing' }, { status: 401 });
    }

    try {
        const domainInfo = await getDomainInfoById(domainId, token);
        const keyAnalytics = domainInfo.key_analytics;
        const propertyId = domainInfo.property_id; // VD: "439599106"
        const analyticsDataClient = createAnalyticsDataClient(keyAnalytics);

        // Lấy báo cáo realtime với metric activeUsers
        const [response] = await analyticsDataClient.runRealtimeReport({
            property: propertyId,
            metrics: [{ name: 'activeUsers' }],
        });

        let activeUsers = 0;
        if (response && response.rows && response.rows.length > 0) {
            activeUsers = response.rows.reduce((sum, row) => {
                const val = Number(row.metricValues?.[0].value);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);
        }

        return NextResponse.json({ activeUsers });
    } catch (error: any) {
        console.error('Error fetching realtime analytics data:', error);
        return NextResponse.json({ error: error.message || 'Lỗi khi lấy dữ liệu realtime' }, { status: 500 });
    }
}
