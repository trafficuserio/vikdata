// app/(defaults)/api/gsc/queries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSearchConsoleClient } from '@/lib/googleSearchConsole';

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

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const start = url.searchParams.get('start') || '2023-01-01';
    const end = url.searchParams.get('end') || '2023-01-31';
    const domainId = url.searchParams.get('domainId') || '';
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

    if (!domainId) {
        return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: Token is missing' }, { status: 401 });
    }

    try {
        const domainInfo = await getDomainInfoById(domainId, token);
        if (!domainInfo) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }
        // const keySearchConsole = domainInfo.key_search_console;
        // // const domain = domainInfo.domain.startsWith('https://') ? domainInfo.domain : `https://${domainInfo.domain}`;
        // const domain = {};

        // // const searchConsoleClient = createSearchConsoleClient(keySearchConsole);

        // // const response = await searchConsoleClient.searchanalytics.query({
        // //     siteUrl: domain,
        // //     requestBody: {
        // //         startDate: start,
        // //         endDate: end,
        // //         dimensions: ['query'],
        // //         rowLimit: 5000,
        // //     },
        // // });

        // let rows = response.data.rows || [];
        // let data = rows.map((row) => ({
        //     query: row.keys?.[0] || '',
        //     clicks: row.clicks || 0,
        //     impressions: row.impressions || 0,
        //     ctr: row.ctr || 0,
        //     position: row.position || 0,
        // }));

        // if (search) {
        //     const searchLower = search.toLowerCase();
        //     data = data.filter((item) => item.query.toLowerCase().includes(searchLower));
        // }

        // data = data.sort((a, b) => {
        //     if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        //     if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        //     return 0;
        // });

        // const total = data.length;
        // const startIndex = (page - 1) * limit;
        // const paginatedData = data.slice(startIndex, startIndex + limit);

        return NextResponse.json({ data: domainInfo, total: 0 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Lỗi khi lấy dữ liệu GSC' }, { status: 500 });
    }
}
