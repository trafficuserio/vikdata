'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { Modal, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DataTable } from 'mantine-datatable';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import IconCopy from '@/components/icon/icon-copy';
import IconInfo from '@/components/icon/icon-info';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import Cookies from 'js-cookie';
import { render } from '@headlessui/react/dist/utils/render';
import { text } from 'stream/consumers';

interface RechargeRecord {
    id: number;
    money: number;
    content: string;
    status: boolean | null;
    createdAt: string;
}

const RechargeHistoryPage: React.FC = () => {
    const [data, setData] = useState<RechargeRecord[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [selectedPackage, setSelectedPackage] = useState<{ value: number; label: string } | null>(null);
    const [discountCode, setDiscountCode] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [qrUrl, setQrUrl] = useState<string>('');
    const token = Cookies.get('token');
    const isMobile = useMediaQuery('(max-width: 768px)');

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/get-list-recharge-history`, {
                params: { page, limit },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data.data.data);
            setTotalRecords(response.data.data.totalPage * limit);
        } catch (error) {}
    };

    useEffect(() => {
        fetchHistory();
    }, [page, limit]);

    const handleAccept = async (id: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/admin/accept-recharge`,
                { rechargeId: id },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (response.data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Chấp nhận thành công' });
                fetchHistory();
            } else {
                ShowMessageError({ content: 'Chấp nhận thất bại' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Có lỗi xảy ra' });
        }
    };

    const handleReject = async (id: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/admin/reject-recharge`,
                { rechargeId: id },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (response.data.errorcode === 200) {
                ShowMessageSuccess({ content: 'Từ chối thành công' });
                fetchHistory();
            } else {
                ShowMessageError({ content: 'Từ chối thất bại' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Có lỗi xảy ra' });
        }
    };

    const columns = [
        {
            accessor: 'createdAt',
            title: 'Thời gian',
            render: (row: RechargeRecord) => {
                const date = new Date(row.createdAt);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            },
        },
        {
            accessor: 'money',
            title: 'Số tiền',
            render: (row: RechargeRecord) => row.money.toLocaleString() + ' VND',
        },
        {
            accessor: 'content',
            title: 'Nội dung',
        },
        {
            accessor: 'status',
            title: 'Trạng thái',
            render: (row: RechargeRecord) => (
                <span className={`text-sm badge ${row.status === null ? 'badge-outline-warning' : row.status === true ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {row.status === null ? 'Đang chờ xử lý' : row.status === true ? 'Hợp lệ' : 'Từ chối'}
                </span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Hành động',
            textAlign: 'center',
            render: (row: RechargeRecord) => (
                <div className="justify-center flex flex-col gap-1 w-max">
                    <button className="hover:underline" onClick={() => handleAccept(row.id)}>
                        Chấp nhận
                    </button>
                    <button className="hover:underline" onClick={() => handleReject(row.id)}>
                        Từ chối
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="p-4">
                <div className="panel border-white-light p-0 dark:border-[#1b2e4b] overflow-hidden">
                    <div style={{ position: 'relative', height: '70vh', overflow: 'auto' }} className="datatables pagination-padding">
                        <DataTable columns={columns} records={data} totalRecords={totalRecords} page={page} onPageChange={setPage} recordsPerPage={limit} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default RechargeHistoryPage;
