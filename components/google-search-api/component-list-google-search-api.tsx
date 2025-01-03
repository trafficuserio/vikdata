'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { sortBy as lodashSortBy } from 'lodash';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconRefresh from '@/components/icon/icon-refresh';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

interface GoogleSearchApiData {
    id: number;
    apiKey: string;
    cx: string;
}

const PAGE_SIZES = [5, 10, 20, 30, 50];

export default function ComponentListGoogleSearchApi() {
    const token = Cookies.get('token');

    const [data, setData] = useState<GoogleSearchApiData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<{
        columnAccessor: keyof GoogleSearchApiData;
        direction: 'asc' | 'desc';
    }>({ columnAccessor: 'apiKey', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<GoogleSearchApiData[]>([]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchData() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/get-google-search-api?page=1&limit=100`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();

            if (!json) {
                ShowMessageError({ content: 'Dữ liệu trả về không đúng cấu trúc' });
                return;
            }

            if ([401, 403].includes(json.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            }

            if (json.errorcode === 200) {
                const rows = json.data.rows || [];
                const mapped = rows.map((row: any) => ({
                    id: row.id,
                    apiKey: row.api_google_search || '',
                    cx: row.custom_search_engine_id || '',
                }));
                setData(mapped);
            } else {
                ShowMessageError({ content: json.message || 'Không thể tải danh sách Google Search API' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
        }
    }

    const refreshData = (): void => {
        fetchData();
        ShowMessageSuccess({ content: 'Dữ liệu đã được làm mới' });
    };

    async function handleDeleteSingle(id: number) {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/delete-google-search-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: [id] }),
            });
            const json = await res.json();
            if ([401, 403].includes(json.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            } else if (json?.errorcode === 200) {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/delete-google-search-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: ids }),
            });
            const json = await res.json();
            if ([401, 403].includes(json.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            } else if (json?.errorcode === 200) {
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
        let filtered = data.filter((item) => {
            const s = search.toLowerCase();
            const apiKeyStr = item.apiKey?.toLowerCase() || '';
            const cxStr = item.cx?.toLowerCase() || '';
            return apiKeyStr.includes(s) || cxStr.includes(s);
        });

        if (sortStatus.columnAccessor) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [data, search, sortStatus]);

    // Phân trang
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

    const columns: DataTableColumn<GoogleSearchApiData>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        { accessor: 'apiKey', title: 'API Key', sortable: true },
        { accessor: 'cx', title: 'CX', sortable: true },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center',
            render: (record) => (
                <div className="flex justify-center gap-4">
                    <Link href={`/google-search-api/edit?id=${record.id}`} className="text-info hover:text-primary-dark">
                        <IconEdit />
                    </Link>
                    <button onClick={() => handleDeleteSingle(record.id)} className=" text-red-500 hover:text-red-700">
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
                            <Link href="/google-search-api/create" className="btn btn-primary gap-2 items-center flex">
                                <IconPlus />
                                <span className="hidden md:inline">Thêm Mới</span>
                            </Link>
                            <button type="button" className="btn btn-warning gap-2 flex items-center" onClick={refreshData}>
                                <IconRefresh />
                                <span className="hidden md:inline">Làm mới</span>
                            </button>
                            <button onClick={handleDeleteMulti} disabled={selectedRecords.length === 0} className="btn btn-danger gap-2 flex items-center">
                                <IconTrash />
                                <span className="hidden md:inline">Xóa</span>
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
                            onSortStatusChange={(sortStatus) =>
                                setSortStatus({
                                    columnAccessor: sortStatus.columnAccessor as keyof GoogleSearchApiData,
                                    direction: sortStatus.direction,
                                })
                            }
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị ${from} - ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
