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
import { Modal, Tooltip } from '@mantine/core';
import Dropdown from '@/components/dropdown';
import 'tippy.js/dist/tippy.css';
import 'flatpickr/dist/flatpickr.css';

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
    const [sitePrompts, setSitePrompts] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const PAGE_SIZES = [10, 20, 50, 100];
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: '', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [modalPage, setModalPage] = useState<number>(1);
    const [modalPageSize, setModalPageSize] = useState<number>(10);
    const MODAL_PAGE_SIZES = [10, 20, 50, 100];
    const PROMPT_OPTIONS = ['1', '2', '3', '4'];
    const [serverData, setServerData] = useState<ServerStatus[]>([]);
    const [activeServer, setActiveServer] = useState<ServerStatus | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const isRtl = false;
    const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
    const [progressPercentage, setProgressPercentage] = useState<number>(0);

    const isDomainExpired = (timeRegDomain: any) => false;

    const filteredAndSortedRecords = data;
    const paginatedRecords = filteredAndSortedRecords.slice((page - 1) * pageSize, page * pageSize);

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
        if (domainInfo?.domain && importedExcelData.length === 0) {
            const apiUrl = `https://${domainInfo.domain}/wp-json/custom-api/v1/get-excel-data/`;
            axios
                .get(apiUrl, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
                .then((response) => {
                    setData(response.data);
                    setImportedExcelData(response.data);
                    setIsImported(true);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [domainInfo?.domain, importedExcelData, token]);

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
                            .get(`http://${serverUrl}/api/site/status`, {
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
                        const syncingServer = updatedServers.find((s) => s.is_running && s.domain_id === Number(domainId));
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
    }, [domainInfo, domainId, token]);

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
            setIsImported(true);
            setModalPage(1);
            setModalPageSize(10);
            setCurrentStep(1);
            setOpenModal(true);
            const sites = jsonData.map((item: any) => item.Site).filter(Boolean);
            const unique = Array.from(new Set(sites));
            setUniqueSites(unique);
            const initialPrompts: { [key: string]: string } = {};
            unique.forEach((site) => {
                initialPrompts[site] = PROMPT_OPTIONS[0];
            });
            setSitePrompts(initialPrompts);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const mainColumns = isImported
        ? [
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
                      <Tooltip label={row.h1} position="top" withArrow transition="fade" transitionDuration={100} className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
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
                      <Tooltip label={row.description} position="top" withArrow transition="fade" transitionDuration={100} className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
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
                          <Tooltip label={row.url} position="top" withArrow transition="fade" transitionDuration={100} className="w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
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
                  render: (row: any) => <span className={`text-sm badge ${row.is_done != 0 ? 'badge-outline-success' : 'badge-outline-warning'}`}>{row.is_done != 0 ? 'Đã viết' : 'Chưa viết'}</span>,
              },
              {
                  accessor: 'action',
                  title: 'Hành động',
                  textAlignment: 'center' as DataTableColumnTextAlignment,
                  render: (row: any) =>
                      row.is_done != 0 ? (
                          <div className="flex items-center justify-center gap-2">
                              <p className="text-primary hover:underline cursor-pointer">Viết lại</p>
                          </div>
                      ) : null,
              },
          ]
        : null;

    const excelColumns = [
        {
            accessor: 'Từ khoá chính',
            title: 'Từ khoá chính',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Name Uppercase',
            title: 'Name Uppercase',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Từ khóa phụ',
            title: 'Từ khóa phụ',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
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
        {
            accessor: 'Category',
            title: 'Category',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Tags',
            title: 'Tags',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Status',
            title: 'Status',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Home Keywords',
            title: 'Home Keywords',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Category Keywords',
            title: 'Category Keywords',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Category Name',
            title: 'Category Name',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Giá',
            title: 'Giá',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'SKU',
            title: 'SKU',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'Source',
            title: 'Source',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'id_prompt',
            title: 'id_prompt',
            sortable: true,
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
    ];

    const handleNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else {
            setOpenModal(false);
        }
    };

    const handleBackStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            setOpenModal(false);
        }
    };

    const handlePromptChange = (site: string, value: string) => {
        setSitePrompts((prev) => ({ ...prev, [site]: value }));
    };

    const renderProgressBar = () => (
        <div className="flex flex-row items-center gap-2 w-[400px] max-auto justify-center">
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

    const refreshData = async () => {
        if (!domainInfo) return;
        const apiUrl = `https://${domainInfo.domain}/wp-json/custom-api/v1/get-excel-data/`;
        await axios
            .get(apiUrl, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setData(response.data);
                const total = response.data.length;
                const done = response.data.filter((row: any) => row.is_done != 0).length;
                const progress = total ? (done / total) * 100 : 0;
                setProgressPercentage(progress);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        await axios
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
                        .get(`http://${serverUrl}/api/site/status`, {
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
                    const currentDomainId = Number(domainInfo.id);
                    const syncingServer = updatedServers.find((s) => s.is_running && s.domain_id !== null && s.domain_id === currentDomainId);
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
    };

    const handleRun = async () => {
        if (!domainInfo || isSyncing) return;
        setOpenModal(false);
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
            id_prompt: sitePrompts[row['Site']] || '',
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), 'Sheet1');
        const xlsxBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        if (!xlsxBlob) return;
        const file = new File([xlsxBlob], 'export.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('region', 'en-US');
        const typeSiteMapping: { [key: string]: string } = {
            'Tất cả': 'tatca',
            'Hình Ảnh': 'images',
            'Hướng dẫn': 'huongdan',
            'Tổng hợp': 'tonghop',
            'Học thuật': 'hocthuat',
            Toplist: 'toplist',
            'Bán hàng': 'product',
        };
        const typeSite = typeSiteMapping[domainInfo.group_site] || '';
        formData.append('type_site', typeSite);
        const isCrawling = domainInfo.group_site === 'Hình Ảnh' ? 'True' : 'True';
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
                    {
                        serverId: availableServer.id,
                        domainId: domainInfo.id,
                    },
                    {
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    },
                );
                formData.append('serverId', String(availableServer.id));
                formData.append('domainId', String(domainInfo.id));
                formData.append('currentAPI', process.env.NEXT_PUBLIC_URL_API || '');
                await axios.post(`http://${availableServer.url}/api/site`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
                });
                setIsSyncing(true);
                setIsServerRunning(true);
                setImportedExcelData([]);
                setData([]);
                await refreshData();
            } catch (error) {
                console.error('Lỗi khi đồng bộ dữ liệu:', error);
            }
        }
    };

    const handleStop = async () => {
        if (!activeServer || !domainInfo) return;
        try {
            await axios.post(`http://${activeServer.url}/api/site/stop`, null, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                timeout: 3000,
            });
            await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/create-server-infor-unactive`,
                {
                    serverId: activeServer.id,
                    domainId: domainInfo.id,
                },
                {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                },
            );
            setIsSyncing(false);
            setIsServerRunning(false);
            await refreshData();
        } catch (error) {
            console.error('Lỗi khi dừng đồng bộ:', error);
        }
    };

    return (
        <div className="invoice-table">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row justify-between items-start">
                <div className="flex items-center gap-2 justify-between w-full mt-2">
                    <p className="text-lg font-semibold">Danh sách từ khoá đã viết bài</p>
                    <div className="flex gap-2">
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
                                                    {item.domain_id === domainInfo?.id ? ` | ${domainInfo?.domain}` : ''}
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
                        <button type="button" className="btn btn-success gap-2 flex items-center" onClick={handleImportFileExcel}>
                            <p className="whitespace-nowrap flex items-center gap-2">
                                <IconUpload />
                                Import Excel
                            </p>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex items-center mb-6">
                {isServerRunning && (
                    <div className="flex flex-row items-center gap-4 mx-auto">
                        {renderProgressBar()}
                        <button type="button" className="btn shadow-none whitespace-nowrap" onClick={handleStop}>
                            Dừng đồng bộ
                        </button>
                    </div>
                )}
            </div>
            <div className="panel border-white-light p-0 dark:border-[#1b2e4b] overflow-hidden ">
                {!mainColumns ? (
                    <button className="flex flex-col items-center justify-center py-20 mx-auto" onClick={handleImportFileExcel}>
                        <img src="/assets/images/upload.svg" alt="Upload Excel" className="mb-4" />
                        <p>Nhấn để tải lên file Excel</p>
                    </button>
                ) : (
                    <div style={{ position: 'relative', height: '70vh', overflow: 'hidden' }} className="datatables pagination-padding">
                        <DataTable
                            className="table-hover whitespace-nowrap custom-datatable"
                            columns={mainColumns}
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
                            rowClassName={(record: any) => (isDomainExpired(record.timeRegDomain) ? '!bg-red-300 hover:!bg-red-200 text-black' : '')}
                        />
                    </div>
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
                {currentStep === 1 ? (
                    <>
                        <div className="flex items-center justify-between w-full mt-10 mb-2">
                            <p className="text-lg font-semibold">Import Excel</p>
                            <button type="button" className="btn border-primary shadow-none hover:btn-primary gap-2 flex items-center" onClick={handleImportFileExcel}>
                                <p className="whitespace-nowrap flex items-center gap-2 dark:text-white">
                                    <IconUpload />
                                    Chọn lại file Excel
                                </p>
                            </button>
                        </div>
                        <div className="panel border-white-light p-0 dark:border-[#1b2e4b]">
                            <div style={{ position: 'relative', height: '600px', overflow: 'hidden' }} className="datatables pagination-padding">
                                <DataTable
                                    className="table-hover whitespace-nowrap "
                                    columns={excelColumns}
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
                    <div className="mt-10">
                        <p className="text-lg font-semibold">Chọn Prompt phù hợp</p>
                        {uniqueSites.map((site) => (
                            <div key={site} className="mb-4">
                                <p className="font-semibold">{site}</p>
                                <select value={sitePrompts[site]} onChange={(e) => handlePromptChange(site, e.target.value)} className="mt-2 p-2 border rounded">
                                    {PROMPT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            Chọn {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-end mt-5 gap-2">
                    {currentStep === 2 ? (
                        <button type="button" className="btn btn-outline gap-2" onClick={handleBackStep}>
                            Quay lại
                        </button>
                    ) : null}
                    {currentStep === 1 ? (
                        <button type="button" className="btn btn-primary gap-2" onClick={handleNextStep}>
                            Tiếp tục
                        </button>
                    ) : null}
                    {currentStep === 2 ? (
                        <button type="button" className="btn btn-primary gap-2" onClick={handleRun}>
                            Xác nhận
                        </button>
                    ) : null}
                </div>
            </Modal>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={handleImportExcel} />
        </div>
    );
}
