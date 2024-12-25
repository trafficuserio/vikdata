// pages/api/analytics/[metric].ts
import { NextRequest, NextResponse } from 'next/server';
import analyticsDataClient from '@/lib/googleAnalytics';

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
    const propertyId = url.searchParams.get('propertyId') || '';

    const metrics: Metric[] = [{ name: params.metric }];

    let dateRanges: DateRange[] = [];

    if (start && end) {
        dateRanges.push({ label: `Từ ${start} đến ${end}`, startDate: start, endDate: end });
    } else if (days) {
        dateRanges.push({ label: `${days.replace('daysAgo', ' ngày qua')}`, startDate: days, endDate: 'today' });
    } else {
        dateRanges.push({ label: '30 ngày qua', startDate: '30daysAgo', endDate: 'today' });
    }

    try {
        const data: ReportData[] = [];
        for (const range of dateRanges) {
            const [report] = await analyticsDataClient.runReport({
                property: propertyId,
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
    } catch {
        return NextResponse.json({ error: 'Lỗi khi lấy dữ liệu' }, { status: 500 });
    }
}
