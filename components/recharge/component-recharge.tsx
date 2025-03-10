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

interface RechargeRecord {
    id: string;
    money: number;
    content: string;
    status: boolean | null;
    createdAt: string;
}

const idBank = '970422';
const idAccount = '0857300073';
const idTheme = 'FVa1f46';
const accountName = 'DAO PHU THINH';

const packages = [
    { label: '20.000 = 20.000 Vik', money: 20000, receive: 20000 },
    { label: '50.000 = 52.000 Vik', money: 50000, receive: 52000 },
    { label: '100.000 = 105.000 Vik', money: 100000, receive: 105000 },
    { label: '200.000 = 225.000 Vik', money: 200000, receive: 225000 },
    { label: '500.000 = 550.000 Vik', money: 500000, receive: 550000 },
    { label: '1.000.000 = 1.100.000 Vik', money: 1000000, receive: 1100000 },
    { label: '2.000.000 = 2.300.000 Vik', money: 2000000, receive: 2300000 },
    { label: '3.000.000 = 3.500.000 Vik', money: 3000000, receive: 3500000 },
    { label: '5.000.000 = 5.800.000 Vik', money: 5000000, receive: 5800000 },
    { label: '10.000.000 = 11.000.000 Vik', money: 10000000, receive: 11000000 },
];

const packageOptions = packages.map((pkg) => ({
    value: pkg.money,
    label: pkg.label,
    receive: pkg.receive,
}));

const RechargeHistoryPage: React.FC = () => {
    const [data, setData] = useState<RechargeRecord[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [selectedPackage, setSelectedPackage] = useState<{ value: number; label: string; receive: number } | null>(null);
    const [discountCode, setDiscountCode] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [qrUrl, setQrUrl] = useState<string>('');
    const token = Cookies.get('token');
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        if (selectedPackage) {
            const money = selectedPackage.value;
            const content = tempAddInfo;
            const amount = String(money);
            setQrUrl(`https://api.vietqr.io/image/${idBank}-${idAccount}-${idTheme}.jpg?accountName=${accountName}&amount=${amount}&addInfo=${encodeURIComponent(content)}`);
        }
    }, [selectedPackage, discountCode]);

    const handleRechargeConfirm = async () => {
        if (!selectedPackage) {
            Swal.fire('Thông báo', 'Vui lòng chọn gói nạp tiền', 'warning');
            return;
        }
        const money = selectedPackage.value;
        const tempAddInfo = `vikdata_${selectedPackage.value}`;
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/user/request-recharge`,
                { money, content: tempAddInfo },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setOpenModal(false);
            await fetchHistory();
        } catch (error) {}
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/user/get-history-recharge`, {
                params: { page, limit },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data.data.histories);
            setTotalRecords(response.data.data.totalItems);
        } catch (error) {}
    };

    useEffect(() => {
        fetchHistory();
    }, [page, limit]);

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
        { accessor: 'money', title: 'Số tiền', render: (row: RechargeRecord) => row.money.toLocaleString() + ' VND' },
        { accessor: 'content', title: 'Nội dung' },
        {
            accessor: 'status',
            title: 'Trạng thái',
            render: (row: RechargeRecord) => (
                <span className={`text-sm badge ${row.status === null ? 'badge-outline-warning' : row.status === true ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {row.status === null ? 'Đang chờ xử lý' : row.status === true ? 'Thành công' : 'Thất bại'}
                </span>
            ),
        },
    ];

    const tempAddInfo = selectedPackage ? `vikdata${selectedPackage.value}` : '';

    return (
        <>
            <div className="p-4 max-w-[400px] mx-auto panel border-[#e4e9f0] dark:border-[#1b2e4b] rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-6">Nạp tiền</h2>
                <p className="mb-2 text-primary font-semibold">Chọn số lượng VIK cần mua</p>
                <div className="w-full custom-select mb-2">
                    <Select options={packageOptions} value={selectedPackage} onChange={(option) => setSelectedPackage(option)} placeholder="Chọn gói nạp tiền" />
                </div>
                <div className="w-full custom-select">
                    <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Nhập mã giảm giá (nếu có)" className="form-input mb-2" />
                </div>
                <div className="mb-2">
                    <button
                        onClick={() => {
                            if (!selectedPackage) {
                                Swal.fire('Thông báo', 'Vui lòng chọn gói nạp tiền', 'warning');
                                return;
                            }
                            setOpenModal(true);
                        }}
                        className="btn btn-primary w-full"
                    >
                        Nạp ngay
                    </button>
                </div>
            </div>
            <Modal opened={openModal} onClose={() => setOpenModal(false)} title="QR Code Chuyển Khoản" size={isMobile ? '90%' : '50%'}>
                <div className="p-4">
                    <div className="flex justify-center text-white bg-primary rounded-md text-sm p-2 mb-4 flex-row gap-2 items-center">
                        <IconInfo /> Nhập kèm nội dung khi chuyển khoản. Nội dung ở đây là con số màu đỏ.
                    </div>
                    {selectedPackage && <p className="mb-2 text-primary font-semibold text-center">Gói nạp dịch vụ {selectedPackage.label}</p>}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2 rounded-lg bg-black-light dark:bg-black-dark-light p-4">
                            {qrUrl && <img src={qrUrl} alt="QR Code" className="w-full rounded-lg" />}
                            <div className="mt-4">
                                <div className="flex justify-between">
                                    <p>Tổng tiền chuyển:</p>
                                    {selectedPackage && <p>{selectedPackage.value.toLocaleString()} đ</p>}
                                </div>
                                <div className="flex justify-between">
                                    <p>Tổng tiền nhận:</p>
                                    {selectedPackage && <p>{selectedPackage.receive.toLocaleString()} đ</p>}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center flex-col">
                            <h4 className="text-lg mb-4 font-semibold">Thông tin chuyển khoản</h4>
                            <p className="flex flex-col md:flex-row gap-2 mb-1 items-center md:items-start">
                                Số tài khoản: <strong>{idAccount}</strong>
                                <CopyToClipboard
                                    text={idAccount}
                                    onCopy={() => {
                                        ShowMessageSuccess({ content: 'Đã sao chép số tài khoản' });
                                    }}
                                >
                                    <Tooltip label="Sao chép ngay!" position="bottom">
                                        <button className="flex flex-row gap-1 text-primary text-xs justify-end items-center">
                                            <IconCopy />
                                            Sao chép
                                        </button>
                                    </Tooltip>
                                </CopyToClipboard>
                            </p>
                            <p className="flex flex-col md:flex-row gap-2 mb-1 items-center md:items-start">
                                Chủ tài khoản: <strong>{accountName}</strong>
                            </p>
                            <p className="flex flex-col md:flex-row gap-2 mb-1 items-center md:items-start">
                                Tổng tiền chuyển: <strong>{selectedPackage ? selectedPackage.value.toLocaleString() : ''} đ</strong>
                            </p>
                            <p className="flex flex-col md:flex-row gap-2 mb-1 items-center md:items-start">
                                Nội dung: <strong className="text-danger">{tempAddInfo}</strong>
                                <CopyToClipboard
                                    text={tempAddInfo}
                                    onCopy={() => {
                                        ShowMessageSuccess({ content: 'Đã sao chép nội dung chuyển khoản' });
                                    }}
                                >
                                    <Tooltip label="Sao chép ngay!" position="bottom">
                                        <button className="flex flex-row gap-1 text-primary text-xs justify-end items-center">
                                            <IconCopy />
                                            Sao chép
                                        </button>
                                    </Tooltip>
                                </CopyToClipboard>
                            </p>
                        </div>
                    </div>
                    <div className="w-full">
                        <button onClick={handleRechargeConfirm} className="btn btn-primary w-full mt-4">
                            Xác nhận chuyển khoản
                        </button>
                    </div>
                </div>
            </Modal>
            <div className="p-4">
                <div className="panel border-white-light p-0 dark:border-[#1b2e4b] overflow-hidden">
                    <div style={{ position: 'relative', height: '50vh', overflow: 'auto' }} className="datatables pagination-padding">
                        <DataTable columns={columns} records={data} totalRecords={totalRecords} page={page} onPageChange={setPage} recordsPerPage={limit} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default RechargeHistoryPage;
