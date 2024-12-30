'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

interface RankKeyData {
    id: number;
    keyword: string;
    url_keyword: string;
    rank_keyword: number;
    day: string;
    domain_id: number;
}

interface ApiResponse {
    errorcode: number;
    message: string;
    data: {
        count: number;
        rows: RankKeyData[];
        totalPage: number;
    };
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const ComponentReadDomainRankKey: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const token = Cookies.get('token');

    const [rankKeyData, setRankKeyData] = useState<RankKeyData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [sortBy, setSortBy] = useState<keyof RankKeyData>('keyword');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>('');

    const searchParams = useSearchParams();
    const domainIdParam = searchParams.get('id');
    const domainId = domainIdParam ? parseInt(domainIdParam, 10) : null;

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const fetchRankKeyData = async () => {
        if (!domainId || !startDate || !endDate) return;

        setIsLoading(true);
        setError(null);

        try {
            // Xây dựng URL với các tham số truy vấn
            const params = new URLSearchParams({
                domainId: domainId.toString(),
                startTime: dayjs(startDate).format('YYYY-MM-DD'),
                endTime: dayjs(endDate).format('YYYY-MM-DD'),
                page: page.toString(),
                limit: limit.toString(),
            });

            const url = `${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/get-data-rank-keyword-by-domain-id?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu từ API');
            }

            const result: ApiResponse = await response.json();

            if (result.errorcode !== 200) {
                throw new Error(result.message || 'Lỗi không xác định');
            }

            let data = result.data.rows;

            if (search.trim() !== '') {
                const searchLower = search.toLowerCase();
                data = data.filter((item) => item.keyword.toLowerCase().includes(searchLower));
            }

            data.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }

                if (sortBy === 'day') {
                    const aDate = dayjs(aValue).unix();
                    const bDate = dayjs(bValue).unix();
                    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
                }

                return 0;
            });

            setRankKeyData(data);
            setTotal(result.data.count);
        } catch (err: any) {
            console.error('Error fetching rank key data:', err);
            setError(err.message || 'Lỗi khi lấy dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRankKeyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domainId, startDate, endDate, page, limit, sortBy, sortOrder, search]);

    const columns: DataTableColumn<RankKeyData>[] = [
        { accessor: 'keyword', title: 'Từ khóa', sortable: true },
        {
            accessor: 'url_keyword',
            title: 'URL',
            sortable: false,
            render: ({ url_keyword }) => (
                <a href={url_keyword} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url_keyword}
                </a>
            ),
        },
        { accessor: 'rank_keyword', title: 'Vị trí', sortable: true, render: ({ rank_keyword }) => (rank_keyword > 0 ? formatNumber(rank_keyword) : 'Chưa có') },
        { accessor: 'day', title: 'Ngày', sortable: true, render: ({ day }) => dayjs(day).format('DD/MM/YYYY') },
    ];

    return (
        <div>
            {isLoading && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {error && <div className="text-red-500 mt-4">{error}</div>}

            <div className="panel mt-4 border-white-light px-0 dark:border-[#1b2e4b]">
                {!isLoading && !error && (
                    <>
                        <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                            <h5 className="text-lg font-semibold dark:text-white">Google Rank Keyword - Chi tiết từ khóa</h5>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Tìm kiếm từ khóa..."
                                className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="datatables pagination-padding overflow-auto">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={rankKeyData}
                                columns={columns}
                                totalRecords={total}
                                recordsPerPage={limit}
                                page={page}
                                onPageChange={setPage}
                                recordsPerPageOptions={[10, 20, 30, 50, 100]}
                                onRecordsPerPageChange={(size) => {
                                    setLimit(size);
                                    setPage(1);
                                }}
                                sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
                                onSortStatusChange={({ columnAccessor, direction }) => {
                                    setSortBy(columnAccessor as keyof RankKeyData);
                                    setSortOrder(direction as 'asc' | 'desc');
                                    setPage(1);
                                }}
                                paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                                highlightOnHover
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComponentReadDomainRankKey;
