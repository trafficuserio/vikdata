'use client';
import React, { useEffect, useMemo, useState, Fragment } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { sortBy as lodashSortBy } from 'lodash';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconRefresh from '@/components/icon/icon-refresh';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';
import { Transition, Dialog } from '@headlessui/react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

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
    const [sortStatus, setSortStatus] = useState<{ columnAccessor: keyof GoogleSearchApiData; direction: 'asc' | 'desc' }>({ columnAccessor: 'apiKey', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<GoogleSearchApiData[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createApiKey, setCreateApiKey] = useState('');
    const [createCx, setCreateCx] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editApiKey, setEditApiKey] = useState('');
    const [editCx, setEditCx] = useState('');

    const MySwal = withReactContent(Swal);

    useEffect(() => {
        fetchData();
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
        const result = await MySwal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (!result.isConfirmed) {
            return;
        }
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
        const result = await MySwal.fire({
            title: 'Bạn có chắc muốn xóa?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (!result.isConfirmed) {
            return;
        }
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

    function openCreateModal() {
        setCreateApiKey('');
        setCreateCx('');
        setIsCreateModalOpen(true);
    }

    async function handleCreate() {
        if (!createApiKey.trim() || !createCx.trim()) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường' });
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/insert-google-search-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ dataGoogleSearchApi: [{ apiKey: createApiKey, cx: createCx }] }),
            });
            const result = await res.json();
            if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            } else if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm thành công!' });
                fetchData();
                setIsCreateModalOpen(false);
            } else {
                ShowMessageError({ content: 'Thêm thất bại!' });
            }
        } catch {
            ShowMessageError({ content: 'Lỗi khi thêm dữ liệu' });
        }
    }

    function openEditModal(record: GoogleSearchApiData) {
        setEditId(record.id);
        setEditApiKey(record.apiKey);
        setEditCx(record.cx);
        setIsEditModalOpen(true);
    }

    async function handleEdit() {
        if (!editId) {
            ShowMessageError({ content: 'ID không hợp lệ hoặc không được cung cấp.' });
            return;
        }
        if (!editApiKey.trim() || !editCx.trim()) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/update-google-search-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: editId, apiKey: editApiKey, cx: editCx }),
            });
            const result = await res.json();
            switch (result.errorcode) {
                case 200:
                    ShowMessageSuccess({ content: 'Cập nhật thành công!' });
                    fetchData();
                    setIsEditModalOpen(false);
                    break;
                case 10:
                    ShowMessageError({ content: 'Dữ liệu không được để trống.' });
                    break;
                case 300:
                    ShowMessageError({ content: 'Tên miền đã tồn tại.' });
                    break;
                case 401:
                case 403:
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn.' });
                    logout();
                    break;
                case 102:
                    ShowMessageError({ content: 'Lỗi khi cập nhật dữ liệu.' });
                    break;
                case 311:
                    ShowMessageError({ content: 'Dữ liệu không hợp lệ.' });
                    break;
                default:
                    ShowMessageError({ content: 'Lỗi không xác định.' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi cập nhật dữ liệu.' });
        }
    }

    const columns: DataTableColumn<GoogleSearchApiData>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        { accessor: 'apiKey', title: 'API Key', sortable: true },
        { accessor: 'cx', title: 'CX', sortable: true },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center',
            render: (record) => (
                <div className="justify-center flex flex-col gap-1">
                    <button onClick={() => openEditModal(record)} className="hover:underline">
                        Chỉnh sửa
                    </button>
                    <button onClick={() => handleDeleteSingle(record.id)} className="hover:underline">
                        Xóa
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
                            <button onClick={openCreateModal} className="btn btn-primary gap-2 items-center flex">
                                <IconPlus />
                                <span className="hidden md:inline">Thêm Mới</span>
                            </button>
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
                            onSortStatusChange={(sortStatus) => setSortStatus({ columnAccessor: sortStatus.columnAccessor as keyof GoogleSearchApiData, direction: sortStatus.direction })}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị ${from} - ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                        />
                    </div>
                </div>
            </div>
            <Transition appear show={isCreateModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsCreateModalOpen(false)}>
                    <div className="min-h-screen px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black opacity-30" />
                        </Transition.Child>
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Thêm mới
                                </Dialog.Title>
                                <div className="mt-4">
                                    <label className="block mb-1 dark:text-[#c9d1d9]">API Key</label>
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded form-input"
                                        placeholder="Nhập API Key"
                                        value={createApiKey}
                                        onChange={(e) => setCreateApiKey(e.target.value)}
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block mb-1 dark:text-[#c9d1d9]">CX</label>
                                    <input type="text" className="w-full border p-2 rounded form-input" placeholder="Nhập CX" value={createCx} onChange={(e) => setCreateCx(e.target.value)} />
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                    <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={handleCreate} className="btn btn-primary">
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsEditModalOpen(false)}>
                    <div className="min-h-screen px-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black opacity-30" />
                        </Transition.Child>
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Chỉnh sửa
                                </Dialog.Title>
                                <div className="mt-4">
                                    <label className="block mb-1 dark:text-[#c9d1d9]">API Key</label>
                                    <input type="text" className="w-full border p-2 rounded form-input" placeholder="Nhập API Key" value={editApiKey} onChange={(e) => setEditApiKey(e.target.value)} />
                                </div>
                                <div className="mt-4">
                                    <label className="block mb-1 dark:text-[#c9d1d9]">CX</label>
                                    <input type="text" className="w-full border p-2 rounded form-input" placeholder="Nhập CX" value={editCx} onChange={(e) => setEditCx(e.target.value)} />
                                </div>
                                <div className="mt-6 flex justify-end gap-2">
                                    <button onClick={() => setIsEditModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={handleEdit} className="btn btn-primary">
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
