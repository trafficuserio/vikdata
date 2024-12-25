'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sortBy as lodashSortBy } from 'lodash';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconRefresh from '@/components/icon/icon-refresh';

interface DomainData {
    id: number;
    domain: string;
    typeSite: string;
    groupSite: string;
    person: string;
    keyAnalytics: string;
    propertyId: string;
    keySearchConsole: string;
    keyWordpress: string;
    keyAdsense: string;
    status: boolean;
    totalLink: number;
    timeIndex: string | null;
    timeRegDomain: string | null;
    fileKeyword: string;
    description?: string | null;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function ComponentListDomain() {
    const [domains, setDomains] = useState<DomainData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<{
        columnAccessor: keyof DomainData;
        direction: 'asc' | 'desc';
    }>({
        columnAccessor: 'domain',
        direction: 'asc',
    });
    const [selectedRecords, setSelectedRecords] = useState<DomainData[]>([]);
    const token = Cookies.get('token');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchData() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-list-infor-domain?page=1&limit=100&byOrder=ASC&byField=domain`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (!data) {
                ShowMessageError({ content: 'Dữ liệu trả về không đúng cấu trúc' });
                return;
            }
            if ([401, 403].includes(data.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            }

            if (data.errorcode === 200) {
                const rows = data.data.rows || [];
                const mapped: DomainData[] = rows.map((item: any) => ({
                    id: item.id,
                    domain: item.domain,
                    typeSite: item.type_site,
                    groupSite: item.group_site,
                    person: item.person,
                    keyAnalytics: item.key_analytics,
                    propertyId: item.property_id,
                    keySearchConsole: item.key_search_console,
                    keyWordpress: item.key_wordpress,
                    keyAdsense: item.key_adsense,
                    status: item.status,
                    totalLink: item.total_link ? Number(item.total_link) : 0,
                    timeIndex: item.time_index,
                    timeRegDomain: item.time_reg_domain,
                    fileKeyword: item.file_key_word || '',
                    description: item.description || '',
                }));
                setDomains(mapped);
            } else {
                ShowMessageError({ content: data.message || 'Không thể tải danh sách tên miền' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
        }
    }

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = domains.filter((item) => {
            const s = search.toLowerCase();
            return (
                item.domain.toLowerCase().includes(s) ||
                item.typeSite.toLowerCase().includes(s) ||
                item.groupSite.toLowerCase().includes(s) ||
                item.person.toLowerCase().includes(s) ||
                (item.description || '').toLowerCase().includes(s)
            );
        });
        if (sortStatus.columnAccessor) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [domains, search, sortStatus]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredAndSortedRecords.slice(from, to);
    }, [filteredAndSortedRecords, page, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedRecords.length / pageSize);
    }, [filteredAndSortedRecords.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages > 0 ? totalPages : 1);
        }
    }, [totalPages, page]);

    const refreshData = (): void => {
        fetchData();
        ShowMessageSuccess({ content: 'Dữ liệu đã được làm mới' });
    };

    async function handleDelete(id: number | null = null) {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;

        try {
            if (id !== null) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/delete-infor-domain`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: [id] }),
                });
                const data = await res.json();
                if (data && data.errorcode === 200) {
                    ShowMessageSuccess({ content: 'Xóa thành công' });
                    fetchData();
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    ShowMessageError({ content: 'Xóa không thành công' });
                }
            } else {
                const ids = selectedRecords.map((item) => item.id);
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/delete-infor-domain`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: ids }),
                });
                const data = await res.json();
                if (data && data.errorcode === 200) {
                    ShowMessageSuccess({ content: 'Xóa thành công' });
                    fetchData();
                    setSelectedRecords([]);
                    setSearch('');
                    setPage(1);
                } else {
                    ShowMessageError({ content: 'Xóa không thành công' });
                }
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi xóa' });
        }
    }

    const columns: DataTableColumn<DomainData>[] = [
        {
            accessor: 'domain',
            title: 'Tên miền',
            sortable: true,
            textAlignment: 'left',
            render: ({ domain }) => <p>{domain}</p>,
        },
        {
            accessor: 'typeSite',
            title: 'Loại site',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'groupSite',
            title: 'Nhóm site',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'status',
            title: 'Trạng thái',
            sortable: true,
            textAlignment: 'left',
            render: ({ status }) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            accessor: 'totalLink',
            title: 'Tổng link',
            sortable: true,
            textAlignment: 'left',
            render: ({ totalLink }) => totalLink.toLocaleString(),
        },
        {
            accessor: 'timeIndex',
            title: 'Ngày Index',
            sortable: true,
            textAlignment: 'left',
            render: ({ timeIndex }) => (timeIndex ? new Date(timeIndex).toLocaleDateString() : ''),
        },
        {
            accessor: 'timeRegDomain',
            title: 'Ngày Reg Domain',
            sortable: true,
            textAlignment: 'left',
            render: ({ timeRegDomain }) => (timeRegDomain ? new Date(timeRegDomain).toLocaleDateString() : ''),
        },
        {
            accessor: 'fileKeyword',
            title: 'Tập tin từ khóa',
            sortable: true,
            textAlignment: 'left',
            render: ({ fileKeyword }) => (
                <a href={fileKeyword} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                    Link
                </a>
            ),
        },
        {
            accessor: 'action',
            title: 'Hành động',
            sortable: false,
            textAlignment: 'center',
            render: (item) => (
                <div className="flex justify-center gap-4">
                    <Link href={`/domain/read?id=${item.id}`} className="text-blue-500 hover:text-blue-700">
                        <IconEye />
                    </Link>
                    <Link href={`/domain/edit?id=${item.id}`} className="text-yellow-500 hover:text-yellow-700">
                        <IconEdit />
                    </Link>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
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
                        <div className="flex items-center gap-2">
                            <Link href="/domain/add" className="btn btn-primary gap-2 flex items-center">
                                <IconPlus />
                                <p className="hidden md:block">Thêm Mới</p>
                            </Link>
                            <button type="button" className="btn btn-warning gap-2 flex items-center" onClick={() => refreshData()}>
                                <IconRefresh />
                                <p className="hidden md:block">Làm mới</p>
                            </button>
                            <button type="button" className="btn btn-danger gap-2 flex items-center" onClick={() => handleDelete()} disabled={selectedRecords.length === 0}>
                                <IconTrash />
                                <p className="hidden md:block">Xóa</p>
                            </button>
                        </div>
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
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={paginatedRecords}
                            columns={columns}
                            totalRecords={filteredAndSortedRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            sortStatus={sortStatus}
                            onSortStatusChange={({ columnAccessor, direction }) => {
                                setSortStatus({
                                    columnAccessor: columnAccessor as keyof DomainData,
                                    direction: direction as 'asc' | 'desc',
                                });
                                setPage(1);
                            }}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
