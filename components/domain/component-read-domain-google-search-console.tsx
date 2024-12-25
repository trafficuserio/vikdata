// app/components/domain/component-read-domain-google-search-console.tsx

'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { DataTable, DataTableColumn } from 'mantine-datatable';

interface GSCData {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const ComponentReadDomainGoogleSearchConsole: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [errorGSC, setErrorGSC] = useState<string | null>(null);
    const [isLoadingGSC, setIsLoadingGSC] = useState(false);

    const [gscData, setGscData] = useState<GSCData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [sortBy, setSortBy] = useState<keyof GSCData>('query');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>('');

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    useEffect(() => {
        if (!startDate || !endDate) return;
        setIsLoadingGSC(true);
        const fetchData = async () => {
            try {
                const start = dayjs(startDate).format('YYYY-MM-DD');
                const endFormatted = dayjs(endDate).format('YYYY-MM-DD');
                const siteUrl = 'https://thoitiet4m.com/';
                const response = await fetch(
                    `/api/gsc/queries?start=${start}&end=${endFormatted}&siteUrl=${siteUrl}&limit=${limit}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}`,
                );
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy dữ liệu GSC');
                }
                const result = await response.json();
                setGscData(result.data);
                setTotal(result.total);
                setErrorGSC(null);
            } catch (error) {
                setErrorGSC('Lỗi khi lấy dữ liệu GSC');
            } finally {
                setIsLoadingGSC(false);
            }
        };
        fetchData();
    }, [startDate, endDate, page, limit, sortBy, sortOrder, search]);

    if (errorGSC) return <div>{errorGSC}</div>;

    const columns: DataTableColumn<GSCData>[] = [
        { accessor: 'query', title: 'Từ khóa', sortable: true },
        { accessor: 'clicks', title: 'Clicks', sortable: true, render: ({ clicks }) => formatNumber(clicks) },
        { accessor: 'impressions', title: 'Impressions', sortable: true, render: ({ impressions }) => formatNumber(impressions) },
        { accessor: 'ctr', title: 'CTR', sortable: true, render: ({ ctr }) => `${(ctr * 100).toFixed(2)}%` },
        { accessor: 'position', title: 'Position', sortable: true, render: ({ position }) => position.toFixed(2) },
    ];

    return (
        <>
            <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                <div className="mb-4 flex-col md:flex-row items-center justify-between gap-4 flex px-4">
                    <h5 className="text-lg font-semibold mb-2 dark:text-white">Google Search Console</h5>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Tìm kiếm..."
                        className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white"
                    />
                </div>
                <div className="datatables pagination-padding overflow-auto h-[70dvh]">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={gscData}
                        columns={columns}
                        totalRecords={total}
                        recordsPerPage={limit}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={[10, 20, 30, 50, 100, 200, 500, 1000, 2000, 5000]}
                        onRecordsPerPageChange={(size) => {
                            setLimit(size);
                            setPage(1);
                        }}
                        sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
                        onSortStatusChange={({ columnAccessor, direction }) => {
                            setSortBy(columnAccessor as keyof GSCData);
                            setSortOrder(direction as 'asc' | 'desc');
                            setPage(1);
                        }}
                        paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                        highlightOnHover
                    />
                </div>
                {isLoadingGSC && (
                    <div className="mt-4 flex justify-center">
                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                    </div>
                )}
            </div>
        </>
    );
};

export default ComponentReadDomainGoogleSearchConsole;
