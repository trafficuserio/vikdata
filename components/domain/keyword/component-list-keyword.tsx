// app/components/keyword/component-list-keyword.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { sortBy as lodashSortBy } from 'lodash';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

import IconTrash from '@/components/icon/icon-trash';
import IconPlus from '@/components/icon/icon-plus';
import IconRefresh from '@/components/icon/icon-refresh';
import IconEdit from '@/components/icon/icon-edit';

import { useSearchParams } from 'next/navigation';

interface KeywordData {
    id: number;
    keyword: string;
    urlKeyword: string;
    geolocation?: string;
    host_language?: string;
    domainId?: number;
}

interface ApiResponse {
    errorcode: number;
    message: string;
    data: {
        rows: KeywordData[];
        total: number;
    };
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function ComponentListKeyword() {
    const token = Cookies.get('token');
    const searchParams = useSearchParams();
    const idGoogleSearchParam = searchParams.get('idGoogleSearch');
    const idGoogleSearch = idGoogleSearchParam ? Number(idGoogleSearchParam) : NaN;

    const [keywords, setKeywords] = useState<KeywordData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<{
        columnAccessor: keyof KeywordData;
        direction: 'asc' | 'desc';
    }>({
        columnAccessor: 'keyword',
        direction: 'asc',
    });
    const [selectedRecords, setSelectedRecords] = useState<KeywordData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    useEffect(() => {
        console.log('idGoogleSearch:', idGoogleSearch);
        if (!isNaN(idGoogleSearch) && idGoogleSearch > 0) {
            fetchData();
        } else {
            ShowMessageError({ content: 'ID Google Search không hợp lệ' });
        }
    }, [idGoogleSearch]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/get-list-keyword-by-domain-id?domainId=${idGoogleSearch}&page=1&limit=1000`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data: ApiResponse = await res.json();

            if (!data) {
                ShowMessageError({ content: 'Dữ liệu trả về không đúng cấu trúc' });
                setIsLoading(false);
                return;
            }

            if ([401, 403].includes(data.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                setIsLoading(false);
                return;
            }

            if (data.errorcode === 200) {
                const keywordsArray = data.data?.rows;
                const total = data.data?.total || 0;
                setTotalRecords(total);
                if (keywordsArray && Array.isArray(keywordsArray) && keywordsArray.length > 0) {
                    const mapped: KeywordData[] = keywordsArray.map((keyword) => ({
                        id: keyword.id,
                        keyword: keyword.keyword,
                        urlKeyword: keyword.urlKeyword,
                        domainId: keyword.domainId,
                        geolocation: keyword.geolocation,
                        hostLanguage: keyword.host_language,
                    }));
                    setKeywords(mapped);
                } else {
                    setKeywords([]);
                    ShowMessageError({ content: 'Không có dữ liệu keyword' });
                }
            } else {
                ShowMessageError({ content: data.message || 'Không thể tải danh sách keyword' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
            console.error('Fetch data error:', error);
        } finally {
            setIsLoading(false); // End loading
        }
    }

    const refreshData = (): void => {
        fetchData();
        ShowMessageSuccess({ content: 'Dữ liệu đã được làm mới' });
    };

    async function handleDeleteSingle(id: number) {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/delete-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: [id] }),
            });
            const json = await res.json();
            if (json?.errorcode === 200) {
                ShowMessageSuccess({ content: 'Xóa thành công!' });
                fetchData();
                setSelectedRecords([]);
            } else {
                ShowMessageError({ content: 'Xóa thất bại!' });
            }
        } catch {
            ShowMessageError({ content: 'Lỗi khi xóa' });
        }
    }

    async function handleDeleteMulti() {
        if (!window.confirm('Bạn có chắc muốn xóa các mục đã chọn?')) return;
        try {
            const ids = selectedRecords.map((item) => item.id);
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/delete-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: ids }),
            });
            const json = await res.json();
            if (json?.errorcode === 200) {
                ShowMessageSuccess({ content: 'Xóa thành công!' });
                fetchData();
                setSelectedRecords([]);
            } else {
                ShowMessageError({ content: 'Xóa thất bại!' });
            }
        } catch {
            ShowMessageError({ content: 'Lỗi khi xóa' });
        }
    }

    const filteredAndSortedData = useMemo(() => {
        let filtered = keywords.filter((item) => {
            const s = search.toLowerCase();
            const kw = item.keyword?.toLowerCase() || '';
            const urlKw = item.urlKeyword?.toLowerCase() || '';
            return kw.includes(s) || urlKw.includes(s);
        });
        if (sortStatus.columnAccessor) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [keywords, search, sortStatus]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredAndSortedData.slice(from, to);
    }, [filteredAndSortedData, page, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedData.length / pageSize);
    }, [filteredAndSortedData.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages > 0 ? totalPages : 1);
        }
    }, [page, totalPages]);

    const columns: DataTableColumn<KeywordData>[] = [
        {
            accessor: 'keyword',
            title: 'Keyword',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'urlKeyword',
            title: 'URL Keyword',
            sortable: true,
            textAlignment: 'left',
            render: ({ urlKeyword }) => (
                <a href={urlKeyword} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                    Link
                </a>
            ),
        },
        {
            accessor: 'geolocation',
            title: 'Geolocation',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'hostLanguage',
            title: 'Host Lang',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center',
            render: (record) => (
                <div className="flex gap-2 justify-center">
                    <Link href={`/domain/keyword/edit?id=${record.id}&idGoogleSearch=${idGoogleSearch}`} className="text-yellow-500 hover:text-yellow-700">
                        <IconEdit />
                    </Link>
                    <button onClick={() => handleDeleteSingle(record.id)} className="text-red-500 hover:text-red-700">
                        <IconTrash />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center justify-between">
                        <div className="flex gap-2">
                            <Link href={`/domain/keyword/add?idGoogleSearch=${idGoogleSearch}`} className="btn btn-primary gap-2 flex items-center">
                                <IconPlus />
                                Thêm mới
                            </Link>
                            <button type="button" className="btn btn-warning gap-2 flex items-center" onClick={refreshData}>
                                <IconRefresh />
                                Làm mới
                            </button>
                            <button onClick={handleDeleteMulti} disabled={selectedRecords.length === 0} className="btn btn-danger gap-2 flex items-center">
                                <IconTrash />
                                Xóa
                            </button>
                        </div>
                        <input
                            placeholder="Tìm kiếm..."
                            className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="datatables pagination-padding">
                        {isLoading ? (
                            <div className="text-center py-10">Đang tải dữ liệu...</div>
                        ) : keywords.length > 0 ? (
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={paginatedRecords}
                                columns={columns}
                                totalRecords={filteredAndSortedData.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={setPage}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={(sortStatus) => {
                                    setSortStatus({
                                        columnAccessor: sortStatus.columnAccessor as keyof KeywordData,
                                        direction: sortStatus.direction,
                                    });
                                }}
                                selectedRecords={selectedRecords}
                                onSelectedRecordsChange={setSelectedRecords}
                                paginationText={({ from, to, totalRecords }) => `Hiển thị ${from} - ${to} trong tổng số ${totalRecords} mục`}
                                highlightOnHover
                            />
                        ) : (
                            <div className="text-center py-10">Không có dữ liệu hiển thị.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
