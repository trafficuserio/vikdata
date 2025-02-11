// Server.tsx
'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import Cookies from 'js-cookie';
const token = Cookies.get('token');
const PAGE_SIZES = [10, 20, 30, 50, 100];

interface ServerInfo {
    id: number;
    domain_server: string;
    name: string;
    description: string;
    domain_id: string;
    user_id: string;
}

export default function Server() {
    const [servers, setServers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [serverForm, setServerForm] = useState({ domain_server: '', name: '', description: '' });
    const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);
    const fetchServers = async () => {
        const offset = (page - 1) * pageSize;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/get-server-infors-admin`, {
            params: { limit: pageSize, offset, byOder: 'ASC' },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const data = res.data;
        const list = data.data || [];
        setServers(list);
        setTotalRecords(data.total || 0);
    };
    useEffect(() => {
        fetchServers();
    }, [page, pageSize]);
    const createServer = async () => {
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/create-server-infor`,
            { domainServer: serverForm.domain_server, name: serverForm.name, description: serverForm.description },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        setServerForm({ domain_server: '', name: '', description: '' });
        fetchServers();
        setIsCreateModalOpen(false);
    };
    const updateServer = async () => {
        if (!selectedServer) return;
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/update-server-infor`,
            { id: selectedServer.id, domainServer: serverForm.domain_server, name: serverForm.name, description: serverForm.description },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        setSelectedServer(null);
        setServerForm({ domain_server: '', name: '', description: '' });
        fetchServers();
        setIsUpdateModalOpen(false);
    };
    const deleteServer = async (id: number) => {
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/delete-server-infor`,
            { id: [id] },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        fetchServers();
    };
    const columns: DataTableColumn<ServerInfo>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        { accessor: 'domain_server', title: 'Domain Server', sortable: true },
        { accessor: 'name', title: 'Tên', sortable: true },
        { accessor: 'description', title: 'Mô tả', sortable: true },
        { accessor: 'domain_id', title: 'Domain ID', sortable: true },
        { accessor: 'user_id', title: 'User ID', sortable: true },
        {
            accessor: 'action',
            title: 'Hành động',
            render: (server: ServerInfo) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedServer(server);
                            setServerForm({ domain_server: server.domain_server, name: server.name, description: server.description });
                            setIsUpdateModalOpen(true);
                        }}
                        className="btn btn-primary"
                    >
                        Sửa
                    </button>
                    <button onClick={() => deleteServer(server.id)} className="btn btn-danger">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];
    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-success">
                    Tạo Server
                </button>
            </div>
            <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    columns={columns}
                    records={servers}
                    totalRecords={totalRecords}
                    page={page}
                    recordsPerPage={pageSize}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={(size) => {
                        setPage(1);
                        setPageSize(size);
                    }}
                    paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                    highlightOnHover
                />
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
                                    Tạo Server
                                </Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Domain Server"
                                        value={serverForm.domain_server}
                                        onChange={(e) => setServerForm({ ...serverForm, domain_server: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tên"
                                        value={serverForm.name}
                                        onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Mô tả"
                                        value={serverForm.description}
                                        onChange={(e) => setServerForm({ ...serverForm, description: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                </div>
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={createServer} className="btn btn-success">
                                        Tạo
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={isUpdateModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsUpdateModalOpen(false)}>
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
                                    Cập nhật Server
                                </Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Domain Server"
                                        value={serverForm.domain_server}
                                        onChange={(e) => setServerForm({ ...serverForm, domain_server: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={serverForm.name}
                                        onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={serverForm.description}
                                        onChange={(e) => setServerForm({ ...serverForm, description: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                </div>
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={updateServer} className="btn btn-success">
                                        Cập nhật
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
