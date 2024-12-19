'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import { sortBy } from 'lodash';
import Select, { SingleValue } from 'react-select';
import { DataTable, DataTableColumn } from 'mantine-datatable';

interface DomainData {
    id: number;
    domain: string;
    siteType: string;
    siteGroup: string;
    status: string;
    traffic: number;
    display: string;
    searchTraffic: number;
    checkIndex: boolean;
    searchSEO: string;
    totalPosts: number;
    postsPosted: number;
    draft: number;
    siteIndexDate: string;
    keywordFile: string;
}

interface OptionType {
    value: number;
    label: string;
}

const initialData: DomainData[] = [
    {
        id: 1,
        domain: 'example.com',
        siteType: 'Blog',
        siteGroup: 'Nhóm A',
        status: 'Active',
        traffic: 1000,
        display: 'Có',
        searchTraffic: 500,
        checkIndex: true,
        searchSEO: 'Tốt',
        totalPosts: 200,
        postsPosted: 150,
        draft: 50,
        siteIndexDate: '2023-01-01',
        keywordFile: 'keywords.xlsx',
    },
    {
        id: 2,
        domain: 'example.org',
        siteType: 'E-commerce',
        siteGroup: 'Nhóm B',
        status: 'Inactive',
        traffic: 500,
        display: 'Không',
        searchTraffic: 200,
        checkIndex: false,
        searchSEO: 'Trung bình',
        totalPosts: 100,
        postsPosted: 80,
        draft: 20,
        siteIndexDate: '2023-02-15',
        keywordFile: 'keywords.xlsx',
    },
    {
        id: 3,
        domain: 'example.net',
        siteType: 'Portfolio',
        siteGroup: 'Nhóm C',
        status: 'Active',
        traffic: 800,
        display: 'Có',
        searchTraffic: 400,
        checkIndex: true,
        searchSEO: 'Tốt',
        totalPosts: 150,
        postsPosted: 120,
        draft: 30,
        siteIndexDate: '2023-03-10',
        keywordFile: 'keywords.xlsx',
    },
    {
        id: 4,
        domain: 'example.co',
        siteType: 'Forum',
        siteGroup: 'Nhóm D',
        status: 'Active',
        traffic: 1200,
        display: 'Có',
        searchTraffic: 600,
        checkIndex: true,
        searchSEO: 'Tốt',
        totalPosts: 300,
        postsPosted: 200,
        draft: 100,
        siteIndexDate: '2023-04-05',
        keywordFile: 'keywords.xlsx',
    },
    {
        id: 5,
        domain: 'example.info',
        siteType: 'Blog',
        siteGroup: 'Nhóm E',
        status: 'Inactive',
        traffic: 300,
        display: 'Không',
        searchTraffic: 100,
        checkIndex: false,
        searchSEO: 'Trung bình',
        totalPosts: 50,
        postsPosted: 40,
        draft: 10,
        siteIndexDate: '2023-05-20',
        keywordFile: 'keywords.xlsx',
    },
    // Thêm các mục khác nếu cần
];

const PAGE_SIZES = [10, 20, 30, 50, 100];

const pageSizeOptions: OptionType[] = PAGE_SIZES.map((size) => ({
    value: size,
    label: `${size} mục/trang`,
}));

const ComponentViewDomain: React.FC = () => {
    const [items, setItems] = useState<DomainData[]>(initialData);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [selectedRecords, setSelectedRecords] = useState<DomainData[]>([]);
    const [search, setSearch] = useState<string>('');
    const [sortStatus, setSortStatus] = useState<{ columnAccessor: keyof DomainData; direction: 'asc' | 'desc' }>({
        columnAccessor: 'domain',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = items.filter((item) => {
            const searchLower = search.toLowerCase();
            return (
                item.domain.toLowerCase().includes(searchLower) ||
                item.siteType.toLowerCase().includes(searchLower) ||
                item.siteGroup.toLowerCase().includes(searchLower) ||
                item.status.toLowerCase().includes(searchLower) ||
                item.searchSEO.toLowerCase().includes(searchLower) ||
                item.keywordFile.toLowerCase().includes(searchLower)
            );
        });

        if (sortStatus.columnAccessor) {
            filtered = sortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }

        return filtered;
    }, [items, search, sortStatus]);

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

    const handleDelete = (id: number | null = null) => {
        if (window.confirm('Bạn có chắc muốn xóa mục đã chọn?')) {
            if (id !== null) {
                const updatedItems = items.filter((item) => item.id !== id);
                setItems(updatedItems);
                setSelectedRecords([]);
                setSearch('');
            } else {
                const ids = selectedRecords.map((item) => item.id);
                const updatedItems = items.filter((item) => !ids.includes(item.id));
                setItems(updatedItems);
                setSelectedRecords([]);
                setSearch('');
                setPage(1);
            }
        }
    };

    const handlePageSizeChange = (selectedOption: SingleValue<OptionType>) => {
        if (selectedOption) {
            setPageSize(selectedOption.value);
            setPage(1);
        }
    };

    const columns: DataTableColumn<DomainData>[] = [
        {
            accessor: 'domain',
            title: 'Tên miền',
            sortable: true,
            render: ({ domain }) => (
                <Link href={`/domains/${domain}/view`} className="text-blue-500 underline hover:no-underline">
                    {domain}
                </Link>
            ),
        },
        {
            accessor: 'siteType',
            title: 'Loại site',
            sortable: true,
        },
        {
            accessor: 'siteGroup',
            title: 'Nhóm site',
            sortable: true,
        },
        {
            accessor: 'status',
            title: 'Trạng thái',
            sortable: true,
            render: ({ status }) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status}
                </span>
            ),
        },
        {
            accessor: 'traffic',
            title: 'Lưu lượng',
            sortable: true,
            textAlignment: 'right',
            render: ({ traffic }) => traffic.toLocaleString(),
        },
        {
            accessor: 'display',
            title: 'Hiển thị',
            sortable: true,
        },
        {
            accessor: 'searchTraffic',
            title: 'Lưu lượng tìm kiếm',
            sortable: true,
            textAlignment: 'right',
            render: ({ searchTraffic }) => searchTraffic.toLocaleString(),
        },
        {
            accessor: 'checkIndex',
            title: 'Kiểm tra chỉ mục',
            sortable: true,
            render: ({ checkIndex }) => (checkIndex ? 'Có' : 'Không'),
        },
        {
            accessor: 'searchSEO',
            title: 'SEO',
            sortable: true,
        },
        {
            accessor: 'siteIndexDate',
            title: 'Ngày chỉ mục',
            sortable: true,
            render: ({ siteIndexDate }) => new Date(siteIndexDate).toLocaleDateString(),
        },
        {
            accessor: 'keywordFile',
            title: 'Tập tin từ khóa',
            sortable: true,
        },
        {
            accessor: 'totalPosts',
            title: 'Tổng bài viết',
            sortable: true,
            textAlignment: 'right',
            render: ({ totalPosts }) => totalPosts.toLocaleString(),
        },
        {
            accessor: 'postsPosted',
            title: 'Bài viết đã đăng',
            sortable: true,
            textAlignment: 'right',
            render: ({ postsPosted }) => postsPosted.toLocaleString(),
        },
        {
            accessor: 'draft',
            title: 'Nháp',
            sortable: true,
            textAlignment: 'right',
            render: ({ draft }) => draft.toLocaleString(),
        },
        {
            accessor: 'action',
            title: 'Hành động',
            sortable: false,
            textAlignment: 'center',
            render: ({ id }) => (
                <div className="flex justify-center gap-4">
                    <Link href={`/domain/read`} className="text-blue-500 hover:text-blue-700">
                        <IconEye />
                    </Link>
                    <Link href={`/domain/${id}/edit`} className="text-yellow-500 hover:text-yellow-700">
                        <IconEdit />
                    </Link>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(id)}>
                        <IconTrashLines />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                        <div className="flex items-center gap-2">
                            <button type="button" className="btn btn-danger gap-2 flex items-center" onClick={() => handleDelete()} disabled={selectedRecords.length === 0}>
                                <IconTrashLines />
                                Xóa
                            </button>
                            <Link href="/domains/add" className="btn btn-primary gap-2 flex items-center">
                                <IconPlus />
                                Thêm mới
                            </Link>
                        </div>
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
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentViewDomain;
