'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTableSortStatus, DataTableColumnTextAlignment } from 'mantine-datatable';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';
import axios from 'axios';
import IconUpload from '@/components/icon/icon-upload';
import IconTrash from '@/components/icon/icon-trash';
import { Modal, Tooltip } from '@mantine/core';
import Dropdown from '@/components/dropdown';
import 'tippy.js/dist/tippy.css';
import 'flatpickr/dist/flatpickr.css';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

interface ServerStatus {
    id: number;
    url: string;
    loading: boolean;
    is_running: boolean;
    has_temp: any;
    timedOut: boolean;
    domain_id: number;
}

export default function DomainDetailKeyword() {
    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');
    const [domainInfo, setDomainInfo] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [importedExcelData, setImportedExcelData] = useState<any[]>([]);
    const [isImported, setIsImported] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [uniqueSites, setUniqueSites] = useState<string[]>([]);
    const [sitePrompts, setSitePrompts] = useState<{ [key: string]: number }>({});
    const [promptList, setPromptList] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const PAGE_SIZES = [10, 20, 50, 100];
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: '', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [modalPage, setModalPage] = useState<number>(1);
    const [modalPageSize, setModalPageSize] = useState<number>(10);
    const MODAL_PAGE_SIZES = [10, 20, 50, 100];
    const [serverData, setServerData] = useState<ServerStatus[]>([]);
    const [activeServer, setActiveServer] = useState<ServerStatus | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
    const [progressPercentage, setProgressPercentage] = useState<number>(0);
    const isRtl = false;
    const filteredAndSortedRecords = data;
    const paginatedRecords = filteredAndSortedRecords.slice((page - 1) * pageSize, page * pageSize);
    const MySwal = withReactContent(Swal);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const typeSiteMapping: { [key: string]: string } = {
        'Tất cả': 'tatca',
        'Hình ảnh': 'images',
        'Hướng dẫn': 'huongdan',
        'Tổng hợp': 'tonghop',
        'Học thuật': 'hocthuat',
        Toplist: 'toplist',
        'Bán hàng': 'product',
    };
    const displayMapping: { [key: string]: string } = {
        tatca: 'Tất cả',
        images: 'Hình ảnh',
        huongdan: 'Hướng dẫn',
        tonghop: 'Tổng hợp',
        hocthuat: 'Học thuật',
        toplist: 'Toplist',
        product: 'Bán hàng',
    };
    const animateProgress = (start: number, end: number) => {
        return new Promise<void>((resolve) => {
            const steps = 20;
            const stepTime = 15;
            let currentStep = 0;
            const intervalId = setInterval(() => {
                currentStep++;
                const newProgress = start + ((end - start) * currentStep) / steps;
                setProgressPercentage(newProgress);
                if (currentStep === steps) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, stepTime);
        });
    };
    useEffect(() => {
        if (domainId && token) {
            axios
                .get(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id`, {
                    params: { id: domainId },
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const json = response.data;
                    if ([401, 403].includes(json.errorcode)) {
                        ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                        logout();
                        return;
                    } else if (json.errorcode === 200) {
                        setDomainInfo(json.data);
                    }
                })
                .catch(() => {});
        }
    }, [domainId, token]);
    useEffect(() => {
        if (domainInfo?.domain) {
            const apiUrl = `https://${domainInfo.domain}/wp-json/custom-api/v1/get-excel-data/`;
            axios
                .get(apiUrl, {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const resData = response.data;
                    if (!resData) {
                        setData([]);
                        setImportedExcelData([]);
                        setIsImported(false);
                    } else {
                        setData(resData);
                        setImportedExcelData(resData);
                        setIsImported(true);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                    setImportedExcelData([]);
                    setIsImported(false);
                });
        }
    }, [domainInfo?.domain, token]);
    useEffect(() => {
        if (domainInfo?.domain) {
            axios
                .get(`${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/get-server-infors`, {
                    params: { limit: 100, offset: 0, byOder: 'ASC' },
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const servers = response.data.data || [];
                    const serverStatusPromises = servers.map((server: any) => {
                        const serverUrl = server.domain_server;
                        const serverObj: ServerStatus = {
                            id: server.id,
                            url: serverUrl,
                            loading: true,
                            is_running: false,
                            has_temp: null,
                            timedOut: false,
                            domain_id: server.domain_id,
                        };
                        return axios
                            .get(`${serverUrl}/api/site/status`, {
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                timeout: 3000,
                            })
                            .then((res) => {
                                const status = res.data;
                                return { ...serverObj, is_running: status.is_running, loading: false };
                            })
                            .catch(() => {
                                return { ...serverObj, is_running: false, loading: false, timedOut: true };
                            });
                    });
                    Promise.all(serverStatusPromises).then((updatedServers) => {
                        setServerData(updatedServers);
                        const syncingServer = updatedServers.find((s) => s.is_running && Number(s.domain_id) === Number(domainInfo.id));
                        if (syncingServer) {
                            setActiveServer(syncingServer);
                            setIsServerRunning(true);
                            setIsSyncing(true);
                        } else {
                            setIsServerRunning(false);
                            setIsSyncing(false);
                        }
                    });
                })
                .catch((err) => console.error(err));
        }
    }, [domainInfo, token]);

    useEffect(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }

        if (domainInfo && token && isServerRunning) {
            if (data.some((row) => row.is_done === 0)) {
                refreshIntervalRef.current = setInterval(() => {
                    refreshData();
                }, 5000);
            }
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [domainInfo, token, isServerRunning, data]);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_URL_API}/api/user/get-list-prompt`, {
                params: { page: 1, limit: 100 },
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const json = response.data;
                if (json.errorcode === 200) {
                    setPromptList(json.data.dataPrompt || []);
                }
            })
            .catch((error) => {
                console.error('Error fetching prompt list:', error);
            });
    }, [token]);
    const handleImportFileExcel = () => {
        fileInputRef.current?.click();
    };
    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const fileData = evt.target?.result;
            const workbook = XLSX.read(fileData, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            setImportedExcelData(jsonData);
            setModalPage(1);
            setModalPageSize(10);
            setCurrentStep(1);
            setOpenModal(true);
            const sites = jsonData.map((item: any) => item.Site).filter(Boolean);
            const unique = Array.from(new Set(sites));
            setUniqueSites(unique);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };
    const renderProgressBar = () => (
        <div className="flex flex-row items-center gap-2 w-[400px] mx-auto justify-center">
            <div className="text-center text-lg font-semibold text-primary">{progressPercentage.toFixed(0)}%</div>
            <div className="w-full max-w-md relative">
                <div
                    className="animated-progress h-3 rounded-full bg-primary relative z-10"
                    style={{
                        width: `${progressPercentage}%`,
                        backgroundImage: 'linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)',
                        backgroundSize: '1rem 1rem',
                    }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full bg-primary opacity-50 z-0 rounded-full"></div>
            </div>
        </div>
    );
    const renderStepBar = () => {
        return (
            <div className="w-full mb-8">
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-[#E0E0E7] text-black'}`}>1</div>
                        <span className="text-sm absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-black dark:text-white">Import Excel</span>
                    </div>
                    <div className={`flex-1 max-w-40 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-[#E0E0E7]'}`}></div>
                    <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-[#E0E0E7] text-black'}`}>2</div>
                        <span className="text-sm absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-black dark:text-white">Chọn Prompt</span>
                    </div>
                </div>
            </div>
        );
    };
    const refreshData = async () => {
        if (!domainInfo) return;
        const apiUrl = `https://${domainInfo.domain}/wp-json/custom-api/v1/get-excel-data/`;
        try {
            const response = await axios.get(apiUrl, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const newData = response.data;
            if (newData) {
                const rowsIsDoing = newData.filter((row: any) => row.processing == 'is_doing');
                const total = rowsIsDoing.length;
                const completed = rowsIsDoing.filter((row: any) => row.is_done == 1).length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                setProgressPercentage(progress);

                if (progress >= 100 && refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                    refreshIntervalRef.current = null;
                }
                setData(newData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setImportedExcelData([]);
        }
        if (isServerRunning) {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/get-server-infors`, {
                    params: { limit: 100, offset: 0, byOder: 'ASC' },
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                });
                const servers = response.data.data || [];
                const serverStatusPromises = servers.map((server: any) => {
                    const serverUrl = server.domain_server;
                    const serverObj: ServerStatus = {
                        id: server.id,
                        url: serverUrl,
                        loading: true,
                        is_running: false,
                        has_temp: null,
                        timedOut: false,
                        domain_id: server.domain_id,
                    };
                    return axios
                        .get(`${serverUrl}/api/site/status`, {
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            timeout: 3000,
                        })
                        .then((res) => {
                            const status = res.data;
                            return { ...serverObj, is_running: status.is_running, loading: false };
                        })
                        .catch(() => {
                            return { ...serverObj, is_running: false, loading: false, timedOut: true };
                        });
                });
                Promise.all(serverStatusPromises).then((updatedServers) => {
                    setServerData(updatedServers);
                    const syncingServer = updatedServers.find((s) => s.is_running && Number(s.domain_id) === Number(domainInfo.id));
                    if (syncingServer) {
                        setActiveServer(syncingServer);
                        setIsServerRunning(true);
                        setIsSyncing(true);
                    } else {
                        setIsServerRunning(false);
                        setIsSyncing(false);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (uniqueSites.length > 0 && promptList.length > 0) {
            setSitePrompts((prev) => {
                const newSitePrompts = { ...prev };
                uniqueSites.forEach((site) => {
                    if (!newSitePrompts[site]) {
                        const promptsForSite = promptList.filter((p) => displayMapping[p.typeSite.trim().toLowerCase()] === site);
                        if (promptsForSite.length > 0) {
                            newSitePrompts[site] = promptsForSite[0].id;
                        }
                    }
                });
                return newSitePrompts;
            });
        }
    }, [uniqueSites, promptList]);

    const handleRun = async () => {
        if (!domainInfo || isSyncing) return;
        setOpenModal(false);
        setProgressPercentage(0);
        setIsServerRunning(true);
        setIsImported(true);
        const exportData = importedExcelData.map((row: any) => ({
            'Từ khoá chính': row['Từ khoá chính'] || '',
            'Name Uppercase': row['Name Uppercase'] || '',
            'Từ khóa phụ': row['Từ khóa phụ'] || '',
            url: row['url'] || '',
            Category: row['Category'] || '',
            Tags: row['Tags'] || '',
            Status: row['Status'] || '',
            'Home Keywords': row['Home Keywords'] || '',
            'Category Keywords': row['Category Keywords'] || '',
            'Category Name': row['Category Name'] || '',
            Giá: row['Giá'] || '',
            SKU: row['SKU'] || '',
            Source: row['Source'] || '',
            id_prompt: row['Site'] && sitePrompts[row['Site']] ? sitePrompts[row['Site']] : '',
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), 'Sheet1');
        const xlsxBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const file = new File([xlsxBlob], `export.xlsx`, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('region', 'en-US');
        const isCrawling = domainInfo.group_site === 'Hình ảnh' ? 'True' : 'True';
        formData.append('is_crawling', isCrawling);
        formData.append('url', 'https://' + domainInfo.domain);
        formData.append('max_workers', '4');
        formData.append('username', domainInfo.user_aplication);
        formData.append('password', domainInfo.password_aplication);
        const availableServer = activeServer
            ? serverData.find((item) => !item.is_running && !item.timedOut && item.id === activeServer.id)
            : serverData.find((item) => !item.is_running && !item.timedOut);
        if (!activeServer && availableServer) {
            setActiveServer(availableServer);
        }
        if (availableServer) {
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/create-server-infor-active`,
                    { serverId: availableServer.id, domainId: domainInfo.id },
                    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
                );
                formData.append('serverId', String(availableServer.id));
                formData.append('domainId', String(domainInfo.id));
                formData.append('currentAPI', process.env.NEXT_PUBLIC_URL_API || '');
                await axios.post(`${availableServer.url}/api/site`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Lỗi khi đồng bộ dữ liệu:', error);
            }
        }
        setIsSyncing(true);
        setImportedExcelData([]);
        setData([]);
        if (!isServerRunning) setProgressPercentage(0);
    };
    const handleRewrite = async (row: any) => {
        if (!domainInfo || isSyncing) return;
        setProgressPercentage(0);
        const typeSite = typeSiteMapping[domainInfo.group_site] || '';
        const availableServer = activeServer
            ? serverData.find((item) => !item.is_running && !item.timedOut && item.id === activeServer.id)
            : serverData.find((item) => !item.is_running && !item.timedOut);
        if (!activeServer && availableServer) {
            setActiveServer(availableServer);
        }
        const payload = {
            post_data: [{ post_id: row.post_id, primary_key: row.primary_key }],
            username: domainInfo.user_aplication,
            password: domainInfo.password_aplication,
            url: 'https://' + domainInfo.domain,
            max_workers: 4,
            type_site: typeSite,
            region: 'en-US',
            is_cloud: 'False',
            is_crawling: 'True',
            serverId: availableServer ? String(availableServer.id) : '',
            domainId: String(domainInfo.id),
            currentAPI: process.env.NEXT_PUBLIC_URL_API || '',
        };
        if (availableServer) {
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/create-server-infor-active`,
                    { serverId: availableServer.id, domainId: domainInfo.id },
                    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
                );
                await axios.post(`${availableServer.url}/api/site/rewrite`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
                setIsServerRunning(true);
                setIsSyncing(true);
            } catch (error) {
                console.error('Lỗi khi thực hiện rewrite:', error);
            }
        } else {
            ShowMessageError({ content: 'Không có server nào được chọn' });
        }
    };
    const handleRewriteSelected = async () => {
        if (!domainInfo || isSyncing || selectedRecords.length === 0) return;
        const total = selectedRecords.length;
        setProgressPercentage(0);
        let currentProg = 0;
        for (let i = 0; i < total; i++) {
            const row = selectedRecords[i];
            const typeSite = typeSiteMapping[domainInfo.group_site] || '';
            const availableServer = activeServer
                ? serverData.find((item) => !item.is_running && !item.timedOut && item.id === activeServer.id)
                : serverData.find((item) => !item.is_running && !item.timedOut);
            if (!activeServer && availableServer) {
                setActiveServer(availableServer);
            }
            const payload = {
                post_data: [{ post_id: row.post_id, primary_key: row.primary_key }],
                username: domainInfo.user_aplication,
                password: domainInfo.password_aplication,
                url: 'https://' + domainInfo.domain,
                max_workers: 4,
                type_site: typeSite,
                region: 'en-US',
                is_cloud: 'False',
                is_crawling: 'True',
                serverId: availableServer ? String(availableServer.id) : '',
                domainId: String(domainInfo.id),
                currentAPI: process.env.NEXT_PUBLIC_URL_API || '',
            };
            if (availableServer) {
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/create-server-infor-active`,
                        { serverId: availableServer.id, domainId: domainInfo.id },
                        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
                    );
                    await axios.post(`${availableServer.url}/api/site/rewrite`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
                } catch (error) {
                    console.error('Lỗi khi thực hiện rewrite:', error);
                }
                setIsSyncing(true);
                setIsServerRunning(true);
            } else {
                ShowMessageError({ content: 'Không có server nào được chọn' });
            }
        }
    };
    const handleDeleteTempData = async (serverUrl: string) => {
        if (!domainInfo?.domain || !token) return;
        if (!serverUrl) {
            ShowMessageError({ content: 'Không có server nào được chọn' });
            return;
        }
        const result = await MySwal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa dữ liệu không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
        });
        if (!result.isConfirmed) {
            return;
        }
        try {
            await axios.post(
                `${serverUrl}/api/site/delete`,
                {
                    url: `https://${domainInfo.domain}`,
                    username: domainInfo.user_aplication,
                    password: domainInfo.password_aplication,
                },
                {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                },
            );
            setServerData((prev) => prev.map((item) => (item.url === serverUrl ? { ...item, has_temp: undefined } : item)));
            setData([]);
            MySwal.fire({
                title: 'Thành công',
                text: 'Dữ liệu tạm đã được xóa.',
                icon: 'success',
                confirmButtonText: 'Đóng',
            });
        } catch (error) {
            console.error('Error deleting temp data:', error);
            MySwal.fire({
                title: 'Lỗi',
                text: 'Xảy ra lỗi khi xóa dữ liệu tạm.',
                icon: 'error',
                confirmButtonText: 'Đóng',
            });
        }
    };
    const handleSelectPrompt = (site: string, promptId: number) => {
        setSitePrompts((prev) => ({ ...prev, [site]: promptId }));
    };

    return (
        <div className="invoice-table">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row justify-between items-start">
                <div className="flex items-center gap-2 justify-between w-full mt-2">
                    <p className="text-lg font-semibold">Danh sách từ khoá đã viết bài</p>
                    <div className="flex gap-2">
                        <button
                            disabled={isServerRunning}
                            type="button"
                            className={`btn gap-2 flex items-center ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-danger'}`}
                            onClick={() => handleDeleteTempData(activeServer?.url || '')}
                        >
                            <p className="whitespace-nowrap flex items-center gap-2">
                                <IconTrash />
                                Xóa dữ liệu cũ
                            </p>
                        </button>
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-secondary dropdown-toggle"
                                button={
                                    <div className="flex items-center gap-2">
                                        <p className="whitespace-nowrap">Server chạy</p>
                                    </div>
                                }
                            >
                                <ul className="min-w-[200px]">
                                    {serverData.map((item) => (
                                        <li
                                            key={item.url}
                                            className={`p-2 ${!item.is_running ? 'hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed'} ${activeServer?.url === item.url && 'bg-gray-200 dark:bg-gray-700'}`}
                                            onClick={() => {
                                                if (!item.is_running) {
                                                    setActiveServer(item);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2 w-full whitespace-nowrap">
                                                <span>
                                                    {item.url}
                                                    {Number(item.domain_id) === Number(domainInfo?.id) ? ` | ${domainInfo?.domain}` : ''}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`size-2 rounded-full ${item.timedOut ? 'bg-danger' : item.loading ? 'bg-primary' : item.is_running ? 'bg-danger' : 'bg-success'}`}
                                                    ></span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                        <button
                            type="button"
                            className={`btn gap-2 flex items-center ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-success'}`}
                            onClick={handleImportFileExcel}
                            disabled={isServerRunning}
                        >
                            <p className="whitespace-nowrap flex items-center gap-2">
                                <IconUpload />
                                Import Excel
                            </p>
                        </button>
                    </div>
                </div>
            </div>
            {isServerRunning && <div className="flex items-center mb-6">{renderProgressBar()}</div>}
            <div className="panel border-white-light p-0 dark:border-[#1b2e4b] overflow-hidden">
                {!isImported ? (
                    <button className="flex flex-col items-center justify-center py-20 mx-auto" onClick={handleImportFileExcel} disabled={isServerRunning}>
                        <img src="/assets/images/upload.svg" alt="Upload Excel" className="mb-4" />
                        <p>Nhấn để tải lên file Excel</p>
                    </button>
                ) : (
                    <>
                        <div style={{ position: 'relative', height: '70vh', overflow: 'hidden' }} className="datatables pagination-padding">
                            <DataTable
                                className="table-hover whitespace-nowrap custom-datatable"
                                columns={[
                                    {
                                        accessor: 'primary_key',
                                        title: 'Từ khoá chính',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                    },
                                    {
                                        accessor: 'secondary_key',
                                        title: 'Từ khoá phụ',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                        render: (row: any) => (
                                            <Tooltip
                                                label={row.secondary_key}
                                                position="top"
                                                withArrow
                                                transition="fade"
                                                transitionDuration={100}
                                                className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                                            >
                                                <div>{row.secondary_key}</div>
                                            </Tooltip>
                                        ),
                                    },
                                    {
                                        accessor: 'h1',
                                        title: 'H1',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                        render: (row: any) => (
                                            <Tooltip
                                                label={row.h1}
                                                position="top"
                                                withArrow
                                                transition="fade"
                                                transitionDuration={100}
                                                className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                                            >
                                                <div>{row.h1}</div>
                                            </Tooltip>
                                        ),
                                    },
                                    {
                                        accessor: 'description',
                                        title: 'Description',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                        render: (row: any) => (
                                            <Tooltip
                                                label={row.description}
                                                position="top"
                                                withArrow
                                                transition="fade"
                                                transitionDuration={100}
                                                className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                                            >
                                                <div>{row.description}</div>
                                            </Tooltip>
                                        ),
                                    },
                                    {
                                        accessor: 'url',
                                        title: 'URL',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                        render: (row: any) => (
                                            <a href={row.url} target="_blank" rel="noreferrer">
                                                <Tooltip
                                                    label={row.url}
                                                    position="top"
                                                    withArrow
                                                    transition="fade"
                                                    transitionDuration={100}
                                                    className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                                                >
                                                    <div>{row.url}</div>
                                                </Tooltip>
                                            </a>
                                        ),
                                    },
                                    {
                                        accessor: 'is_done',
                                        title: 'Trạng thái',
                                        sortable: true,
                                        textAlignment: 'left' as DataTableColumnTextAlignment,
                                        render: (row: any) => {
                                            if (row.status_delete == 1) {
                                                return <span className="text-sm badge badge-outline-danger">Đã xóa</span>;
                                            } else {
                                                return (
                                                    <span className={`text-sm badge ${row.is_done != 0 ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                                        {row.is_done != 0 ? 'Đã viết' : 'Chưa viết'}
                                                    </span>
                                                );
                                            }
                                        },
                                    },
                                    {
                                        accessor: 'action',
                                        title: 'Hành động',
                                        textAlignment: 'center' as DataTableColumnTextAlignment,
                                        render: (row: any) => {
                                            if (row.status_delete == 1) {
                                                return null;
                                            }
                                            return row.is_done != 0 && !isServerRunning ? (
                                                <button className="flex items-center justify-center gap-2 hover:underline" onClick={() => handleRewrite(row)}>
                                                    Viết lại
                                                </button>
                                            ) : null;
                                        },
                                    },
                                ]}
                                records={paginatedRecords}
                                totalRecords={filteredAndSortedRecords.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPage(1);
                                    setPageSize(size);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={({ columnAccessor, direction }) => {
                                    setSortStatus({ columnAccessor: columnAccessor as string, direction });
                                    setPage(1);
                                }}
                                selectedRecords={selectedRecords}
                                onSelectedRecordsChange={setSelectedRecords}
                                paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                                highlightOnHover
                                rowClassName={(row) => (row.status_delete == 1 ? 'bg-gray-300 opacity-50' : '')}
                                isRecordSelectable={(row) => row.status_delete != 1}
                            />
                        </div>
                        {selectedRecords.length > 0 && (
                            <div className="flex items-center justify-end my-5 px-5 gap-2">
                                <div className="flex items-center gap-2">
                                    {selectedRecords.length} bài viết đã được chọn
                                    <button
                                        type="button"
                                        className={`btn gap-2 ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                                        onClick={handleRewriteSelected}
                                        disabled={isServerRunning}
                                    >
                                        Viết lại
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Modal
                opened={openModal}
                onClose={() => {
                    setOpenModal(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                size="90%"
            >
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[80%] z-10">{renderStepBar()}</div>

                {currentStep === 1 ? (
                    <>
                        <div className="flex items-center justify-between w-full mb-2">
                            <p className="text-lg font-semibold">Import Excel</p>
                            <button
                                type="button"
                                className={`btn border-primary shadow-none hover:btn-primary gap-2 flex items-center ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                                onClick={handleImportFileExcel}
                                disabled={isServerRunning}
                            >
                                <p className="whitespace-nowrap flex items-center gap-2 dark:text-white">
                                    <IconUpload />
                                    Chọn lại file Excel
                                </p>
                            </button>
                        </div>
                        <div className="panel border-white-light p-0 dark:border-[#1b2e4b]">
                            <div style={{ position: 'relative', height: '600px', overflow: 'hidden' }} className="datatables pagination-padding">
                                <DataTable
                                    className="table-hover whitespace-nowrap"
                                    columns={[
                                        { accessor: 'Từ khoá chính', title: 'Từ khoá chính', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Name Uppercase', title: 'Name Uppercase', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Từ khóa phụ', title: 'Từ khóa phụ', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        {
                                            accessor: 'url',
                                            title: 'URL',
                                            sortable: true,
                                            textAlignment: 'left' as DataTableColumnTextAlignment,
                                            render: (row: any) => (
                                                <a href={row.url} target="_blank" rel="noreferrer">
                                                    {row.url}
                                                </a>
                                            ),
                                        },
                                        { accessor: 'Category', title: 'Category', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Tags', title: 'Tags', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Status', title: 'Status', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Home Keywords', title: 'Home Keywords', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Category Keywords', title: 'Category Keywords', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Category Name', title: 'Category Name', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Giá', title: 'Giá', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'SKU', title: 'SKU', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'Source', title: 'Source', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                        { accessor: 'id_prompt', title: 'id_prompt', sortable: true, textAlignment: 'left' as DataTableColumnTextAlignment },
                                    ]}
                                    records={importedExcelData.slice((modalPage - 1) * modalPageSize, modalPage * modalPageSize)}
                                    totalRecords={importedExcelData.length}
                                    recordsPerPage={modalPageSize}
                                    page={modalPage}
                                    onPageChange={(p) => setModalPage(p)}
                                    recordsPerPageOptions={MODAL_PAGE_SIZES}
                                    onRecordsPerPageChange={(size) => {
                                        setModalPage(1);
                                        setModalPageSize(size);
                                    }}
                                    paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                                    highlightOnHover
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <p className="text-lg font-semibold mb-10">Chọn Prompt phù hợp</p>
                        {uniqueSites.map((site) => {
                            const promptsForSite = promptList.filter((p) => displayMapping[p.typeSite.trim().toLowerCase()] === site);
                            return (
                                <div key={site} className="mb-4">
                                    <p className="font-semibold mb-4">Chọn gói {site}</p>
                                    {promptsForSite.length > 0 ? (
                                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                                            {promptsForSite.map((prompt) => {
                                                const isSelected = sitePrompts[site] === prompt.id;
                                                const cardClasses = isSelected ? 'bg-primary/10 border-primary' : 'bg-none border-gray-200';
                                                return (
                                                    <div
                                                        key={prompt.id}
                                                        className={`${cardClasses} p-4 rounded-lg border w-full mb-2 cursor-pointer`}
                                                        onClick={() => handleSelectPrompt(site, prompt.id)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="relative border-2 w-5 h-5 rounded-full flex items-center justify-center"
                                                                style={{ borderColor: isSelected ? '#e06000' : '#d1d5db' }}
                                                            >
                                                                {isSelected && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                                            </div>
                                                            <p>{prompt.name}</p>
                                                        </div>
                                                        <ul className="list-disc ml-6">
                                                            {prompt.note.split('\n').map((line: string, index: number) => (
                                                                <li key={index}>{line}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p>Không có gói phù hợp cho {site}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="flex items-center justify-end mt-5 gap-2">
                    {currentStep === 2 ? (
                        <>
                            <button
                                type="button"
                                className={`btn gap-2 ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-outline'}`}
                                onClick={() => setCurrentStep(1)}
                                disabled={isServerRunning}
                            >
                                Quay lại
                            </button>
                            <button type="button" className={`btn gap-2 ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`} onClick={handleRun} disabled={isServerRunning}>
                                Xác nhận
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className={`btn gap-2 ${isServerRunning ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                            onClick={() => setCurrentStep(2)}
                            disabled={isServerRunning}
                        >
                            Tiếp tục
                        </button>
                    )}
                </div>
            </Modal>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={handleImportExcel} />
        </div>
    );
}
