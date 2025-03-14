'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { sortBy as lodashSortBy } from 'lodash';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

interface AccountData {
    id: string;
    userName: string;
    expiredDate?: string;
    isBlocked?: boolean;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function ComponentListAccount() {
    const token = Cookies.get('token');
    const router = useRouter();

    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [showAddAccountModal, setShowAddAccountModal] = useState(false);

    const [sortStatus, setSortStatus] = useState<{
        columnAccessor: keyof AccountData;
        direction: 'asc' | 'desc';
    }>({
        columnAccessor: 'userName',
        direction: 'asc',
    });
    const [selectedRecords, setSelectedRecords] = useState<AccountData[]>([]);

    const [showModalSingle, setShowModalSingle] = useState(false);
    const [singleUserId, setSingleUserId] = useState<string | null>(null);
    const [singleDate, setSingleDate] = useState<Date | null>(null);

    const [showModalMulti, setShowModalMulti] = useState(false);
    const [multiDate, setMultiDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/get-list-account?page=1&limit=100`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }

            if (data.errorcode === 200) {
                const rows = data.data.rows || [];
                const mapped: AccountData[] = rows.map((row: any) => ({
                    id: row.id,
                    userName: row.user_name,
                    expiredDate: row.expires,
                    isBlocked: !row.status,
                }));
                setAccounts(mapped);
            } else {
                ShowMessageError({ content: data?.message || 'Không thể tải danh sách tài khoản' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
        }
    }

    async function handleBlockSingle(id: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/block-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds: [id] }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Đã block tài khoản' });
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Block không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi block tài khoản' });
        }
    }

    async function handleUnblockSingle(id: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/unblock-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds: [id] }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Đã unblock tài khoản' });
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Unblock không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi unblock tài khoản' });
        }
    }

    function handleUpdateExpiredDateSingle(id: string) {
        setSingleUserId(id);
        setSingleDate(null);
        setShowModalSingle(true);
    }

    async function confirmSingleDateUpdate() {
        if (!singleDate || !singleUserId) return;
        try {
            const expiredDate = singleDate.toISOString().slice(0, 10);
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/update-expired-date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds: [singleUserId], expiredDate }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Cập nhật ngày hết hạn thành công' });
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Cập nhật không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi cập nhật ngày hết hạn' });
        } finally {
            setShowModalSingle(false);
        }
    }

    function getSelectedUserIds() {
        return selectedRecords.map((acc) => acc.id);
    }

    async function handleBlockAccounts() {
        if (selectedRecords.length === 0) {
            ShowMessageError({ content: 'Vui lòng chọn ít nhất 1 tài khoản' });
            return;
        }
        try {
            const userIds = getSelectedUserIds();
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/block-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Đã block tài khoản' });
                fetchData();
                setSelectedRecords([]);
            } else {
                ShowMessageError({ content: data?.message || 'Block không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi block tài khoản' });
        }
    }

    async function handleUnblockAccounts() {
        if (selectedRecords.length === 0) {
            ShowMessageError({ content: 'Vui lòng chọn ít nhất 1 tài khoản' });
            return;
        }
        try {
            const userIds = getSelectedUserIds();
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/unblock-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Đã unblock tài khoản' });
                fetchData();
                setSelectedRecords([]);
            } else {
                ShowMessageError({ content: data?.message || 'Unblock không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi unblock tài khoản' });
        }
    }

    function handleUpdateExpiredDate() {
        if (selectedRecords.length === 0) {
            ShowMessageError({ content: 'Vui lòng chọn ít nhất 1 tài khoản' });
            return;
        }
        setMultiDate(null);
        setShowModalMulti(true);
    }

    async function confirmMultiDateUpdate() {
        if (!multiDate) return;
        try {
            const userIds = getSelectedUserIds();
            const expiredDate = multiDate.toISOString().slice(0, 10);
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/update-expired-date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds, expiredDate }),
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Cập nhật ngày hết hạn thành công' });
                fetchData();
                setSelectedRecords([]);
            } else {
                ShowMessageError({ content: data?.message || 'Cập nhật không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi cập nhật ngày hết hạn' });
        } finally {
            setShowModalMulti(false);
        }
    }

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = accounts.filter((item) => {
            const s = search.toLowerCase();
            return item.userName.toLowerCase().includes(s);
        });
        if (sortStatus.columnAccessor) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [accounts, search, sortStatus]);

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
    }, [page, totalPages]);

    const columns: DataTableColumn<AccountData>[] = [
        {
            accessor: 'userName',
            title: 'Tên tài khoản',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'expiredDate',
            title: 'Ngày hết hạn',
            sortable: true,
            textAlignment: 'left',
            render: ({ expiredDate }) => (expiredDate ? new Date(expiredDate).toLocaleDateString() : ''),
        },
        {
            accessor: 'isBlocked',
            title: 'Trạng thái',
            textAlignment: 'center',
            render: (row) => <span className={`text-sm badge ${row.isBlocked ? 'badge-outline-danger' : 'badge-outline-success'} `}>{row.isBlocked ? 'Đã khóa' : 'Hoạt động'}</span>,
        },
        {
            accessor: 'id',
            title: 'Hành động',
            textAlignment: 'center',
            render: (row) => (
                <div className="justify-center flex flex-col gap-1">
                    <button className="hover:underline">Chi tiết</button>
                    {row.isBlocked ? (
                        <button onClick={() => handleUnblockSingle(row.id)} className="hover:underline" title="Mở khóa tài khoản">
                            Mở khóa
                        </button>
                    ) : (
                        <button onClick={() => handleBlockSingle(row.id)} className="hover:underline" title="Khóa tài khoản">
                            Khoá tài khoản
                        </button>
                    )}
                    <button onClick={() => handleUpdateExpiredDateSingle(row.id)} className="hover:underline" title="Cập nhật ngày hết hạn">
                        Gia hạn
                    </button>
                </div>
            ),
        },
    ];

    async function handleSubmit() {
        if (!userName || !password) {
            ShowMessageError({ content: 'Vui lòng nhập đủ userName và password' });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/insert-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userName, password }),
            });
            const data = await res.json();

            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }

            if (data?.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm tài khoản thành công' });
                setShowAddAccountModal(false); // Đóng modal
                setUserName('');
                setPassword('');
                fetchData(); // Cập nhật danh sách
            } else {
                ShowMessageError({ content: data?.message || 'Không thể thêm tài khoản' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi thêm tài khoản' });
        }
    }

    return (
        <>
            {/* Modal Single Update */}
            {showModalSingle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[300px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Chọn ngày gia hạn</h2>
                        <Flatpickr
                            className="border p-2 rounded w-full form-input"
                            value={singleDate || undefined}
                            options={{ dateFormat: 'Y-m-d' }}
                            onChange={(dates) => {
                                if (dates && dates.length > 0) {
                                    setSingleDate(dates[0]);
                                }
                            }}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModalSingle(false)} className="btn btn-secondary text-sm">
                                Hủy
                            </button>
                            <button onClick={confirmSingleDateUpdate} className="btn btn-primary text-sm">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Multi Update */}
            {showModalMulti && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[300px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Chọn ngày gia hạn</h2>
                        <Flatpickr
                            className="border p-2 rounded w-full form-input"
                            value={multiDate || undefined}
                            options={{ dateFormat: 'Y-m-d' }}
                            onChange={(dates) => {
                                if (dates && dates.length > 0) {
                                    setMultiDate(dates[0]);
                                }
                            }}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModalMulti(false)} className="btn btn-secondary text-sm">
                                Hủy
                            </button>
                            <button onClick={confirmMultiDateUpdate} className="btn btn-primary text-sm">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddAccountModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[400px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Thêm tài khoản</h2>
                        <div className="mb-4">
                            <label className="block mb-1">Tên đăng nhập</label>
                            <input className="border p-2 rounded w-full form-input" placeholder="Nhập tài khoản..." value={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Mật khẩu</label>
                            <input className="border p-2 rounded w-full form-input" type="password" placeholder="Nhập mật khẩu..." value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddAccountModal(false)} className="btn btn-outline-danger">
                                Hủy
                            </button>
                            <button onClick={handleSubmit} className="btn btn-primary">
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4">
                <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                    <div className="invoice-table">
                        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center justify-between">
                            <div className="flex gap-2">
                                <button onClick={() => setShowAddAccountModal(true)} className="btn btn-primary">
                                    Thêm Tài Khoản
                                </button>
                                <button onClick={handleBlockAccounts} className="btn btn-danger">
                                    Khóa
                                </button>
                                <button onClick={handleUnblockAccounts} className="btn btn-warning">
                                    Mở Khóa
                                </button>
                                <button onClick={handleUpdateExpiredDate} className="btn btn-info">
                                    Gia hạn
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
                                onPageChange={setPage}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={({ columnAccessor, direction }) => {
                                    setSortStatus({
                                        columnAccessor: columnAccessor as keyof AccountData,
                                        direction: direction as 'asc' | 'desc',
                                    });
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
        </>
    );
}
