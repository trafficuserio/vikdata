// pages/api/analytics/[metric]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAnalyticsDataClient } from '@/lib/googleAnalytics';

const getDomainInfoById = async (domainId: string, token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id?id=${domainId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch domain information');
    }

    const data = await res.json();

    if (data.errorcode !== 200) {
        throw new Error(data.message || 'Error fetching domain information');
    }

    return data.data;
};

interface Params {
    params: {
        metric: string;
    };
}

interface DateRange {
    label: string;
    startDate: string;
    endDate: string;
}

interface Metric {
    name: string;
}

interface ReportData {
    period: string;
    metrics: Record<string, string>;
}

export async function GET(req: NextRequest, { params }: Params) {
    const url = new URL(req.url);
    const days = url.searchParams.get('days');
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const domainId = url.searchParams.get('domainId') || '';

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
        const propertyIdFromDomain = domainInfo.property_id;

        const analyticsDataClient = createAnalyticsDataClient(keyAnalytics);

        const metrics: Metric[] = [{ name: params.metric }];

        let dateRanges: DateRange[] = [];

        if (start && end) {
            dateRanges.push({ label: `Từ ${start} đến ${end}`, startDate: start, endDate: end });
        } else if (days) {
            dateRanges.push({ label: `${days.replace('daysAgo', ' ngày qua')}`, startDate: days, endDate: 'today' });
        } else {
            dateRanges.push({ label: '30 ngày qua', startDate: '30daysAgo', endDate: 'today' });
        }

        const data: ReportData[] = [];

        for (const range of dateRanges) {
            const [report] = await analyticsDataClient.runReport({
                property: propertyIdFromDomain,
                dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
                metrics: metrics,
                dimensions: [{ name: 'date' }],
            });

            const rows = report?.rows || [];

            rows.forEach((row) => {
                const metricsData: Record<string, string> = {};
                row.metricValues?.forEach((m, i) => {
                    metricsData[metrics[i].name] = m.value ?? '0';
                });
                data.push({
                    period: row.dimensionValues?.[0].value || '',
                    metrics: metricsData,
                });
            });
        }

        data.sort((a, b) => {
            const dateA = new Date(a.period);
            const dateB = new Date(b.period);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA.getTime() - dateB.getTime();
            }
            return a.period.localeCompare(b.period);
        });

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        return NextResponse.json({ error: error.message || 'Lỗi khi lấy dữ liệu' }, { status: 500 });
    }
}
