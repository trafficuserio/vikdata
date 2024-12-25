// app/(defaults)/api/gsc/queries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import webmasters from '@/lib/googleSearchConsole';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const start = url.searchParams.get('start') || '2023-01-01';
    const end = url.searchParams.get('end') || '2023-01-31';
    const siteUrl = url.searchParams.get('siteUrl') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const sortByParam = url.searchParams.get('sortBy') || 'query';
    const sortOrder = url.searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
    const search = url.searchParams.get('search') || '';

    type GSCDataKey = keyof {
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };

    const validSortBy: GSCDataKey[] = ['query', 'clicks', 'impressions', 'ctr', 'position'];
    const sortBy: GSCDataKey = validSortBy.includes(sortByParam as GSCDataKey) ? (sortByParam as GSCDataKey) : 'query';

    try {
        const response = await webmasters.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: start,
                endDate: end,
                dimensions: ['query'],
                rowLimit: 5000,
            },
        });

        let rows = response.data.rows || [];
        let data = rows.map((row) => ({
            query: row.keys?.[0] || '',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
        }));

        if (search) {
            const searchLower = search.toLowerCase();
            data = data.filter((item) => item.query.toLowerCase().includes(searchLower));
        }

        data = data.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        const total = data.length;
        const startIndex = (page - 1) * limit;
        const paginatedData = data.slice(startIndex, startIndex + limit);

        return NextResponse.json({ data: paginatedData, total });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Lỗi khi lấy dữ liệu GSC' }, { status: 500 });
    }
}
