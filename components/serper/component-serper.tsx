'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { sortBy as lodashSortBy } from 'lodash';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';
import IconUpload from '@/components/icon/icon-upload';
import IconPlus from '@/components/icon/icon-plus';
import * as XLSX from 'xlsx';

interface SerperKeyData {
    id: number;
    apiKey: string;
}

const PAGE_SIZES = [10, 20, 30, 50, 100];

export default function ComponentSerper() {
    const token = Cookies.get('token');
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [serperKeys, setSerperKeys] = useState<SerperKeyData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentUpdateId, setCurrentUpdateId] = useState<number | null>(null);
    const [updateApiKey, setUpdateApiKey] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/get-list-api-key-serper?page=1&limit=100`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = response.data;
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                const rows = data.data.data || [];
                const mapped: SerperKeyData[] = rows.map((row: any) => ({
                    id: row.id,
                    apiKey: row.api_key,
                }));
                setSerperKeys(mapped);
            } else {
                ShowMessageError({ content: data?.message || 'Không thể tải danh sách API key Serper' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
        }
    }

    async function handleAddApiKey() {
        if (!newApiKey) {
            ShowMessageError({ content: 'Vui lòng nhập API key' });
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/admin/insert-api-key-serper`,
                { apiKey: newApiKey },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
            );
            const data = response.data;
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm API key thành công' });
                setShowAddModal(false);
                setNewApiKey('');
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Không thể thêm API key' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi thêm API key' });
        }
    }

    function openUpdateModal(id: number, apiKey: string) {
        setCurrentUpdateId(id);
        setUpdateApiKey(apiKey);
        setShowUpdateModal(true);
    }

    async function handleUpdateApiKey() {
        if (currentUpdateId === null || !updateApiKey) {
            ShowMessageError({ content: 'Vui lòng nhập API key mới' });
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/admin/update-api-key-serper`,
                { apiKeyId: currentUpdateId, apiKey: updateApiKey },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
            );
            const data = response.data;
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Cập nhật API key thành công' });
                setShowUpdateModal(false);
                setCurrentUpdateId(null);
                setUpdateApiKey('');
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Cập nhật API key không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi cập nhật API key' });
        }
    }

    async function handleDeleteApiKey(id: number) {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/admin/delete-api-key-serper`,
                { apiKeyId: id },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
            );
            const data = response.data;
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Xóa API key thành công' });
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Xóa API key không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi xóa API key' });
        }
    }

    function handleImportFileExcel() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target?.result;
            const wb = XLSX.read(binaryStr, { type: 'binary' });
            const wsName = wb.SheetNames[0];
            const ws = wb.Sheets[wsName];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            setPreviewData(data);
            setSelectedFile(file);
            setShowPreviewModal(true);
        };
        reader.readAsBinaryString(file);
    }

    async function handleConfirmFileUpload() {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/insert-file-api-key-serper`, formData, { headers: { Authorization: `Bearer ${token}` } });
            const data = response.data;
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }
            if (data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Upload file Excel thành công' });
                fetchData();
            } else {
                ShowMessageError({ content: data?.message || 'Upload file không thành công' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi upload file' });
        } finally {
            setShowPreviewModal(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            setPreviewData([]);
        }
    }

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = serperKeys.filter((item) => {
            const s = search.toLowerCase();
            return item.apiKey.toLowerCase().includes(s);
        });
        filtered = lodashSortBy(filtered, 'id');
        return filtered;
    }, [serperKeys, search]);

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

    const columns: DataTableColumn<SerperKeyData>[] = [
        {
            accessor: 'apiKey',
            title: 'API Key',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'id',
            title: 'Hành động',
            textAlignment: 'center',
            render: (row) => (
                <div className="flex flex-col gap-2">
                    <button onClick={() => openUpdateModal(row.id, row.apiKey)} className="hover:underline" title="Cập nhật API key">
                        Cập nhật
                    </button>
                    <button onClick={() => handleDeleteApiKey(row.id)} className="hover:underline" title="Xóa API key">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[400px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Thêm API Key Serper</h2>
                        <div className="mb-4">
                            <label className="block mb-1">API Key</label>
                            <input className="border p-2 rounded w-full form-input" placeholder="Nhập API key..." value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddModal(false)} className="btn btn-outline-danger">
                                Hủy
                            </button>
                            <button onClick={handleAddApiKey} className="btn btn-primary">
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[400px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Cập nhật API Key Serper</h2>
                        <div className="mb-4">
                            <label className="block mb-1">API Key mới</label>
                            <input className="border p-2 rounded w-full form-input" placeholder="Nhập API key mới..." value={updateApiKey} onChange={(e) => setUpdateApiKey(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowUpdateModal(false)} className="btn btn-outline-danger">
                                Hủy
                            </button>
                            <button onClick={handleUpdateApiKey} className="btn btn-primary">
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-md w-[600px] dark:bg-black dark:text-white">
                        <h2 className="text-lg font-semibold mb-2">Xem trước dữ liệu Excel</h2>
                        <div className="max-h-80 overflow-auto">
                            <table className="min-w-full border">
                                <tbody>
                                    {previewData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell: any, cellIndex: number) => (
                                                <td key={cellIndex} className="border p-1">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowPreviewModal(false)} className="btn btn-outline-danger">
                                Hủy
                            </button>
                            <button onClick={handleConfirmFileUpload} className="btn btn-primary">
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-4">
                <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                    <div className="flex flex-col gap-5 px-5 md:flex-row md:items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                                <IconPlus />
                                Thêm API Key
                            </button>
                            <div>
                                <button type="button" className="btn gap-2 flex items-center btn-success" onClick={handleImportFileExcel}>
                                    <p className="whitespace-nowrap flex items-center gap-2">
                                        <IconUpload />
                                        Import Excel
                                    </p>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".xls,.xlsx" style={{ display: 'none' }} />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Tìm kiếm API key..."
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
                            paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
