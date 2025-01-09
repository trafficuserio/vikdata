// app/components/domain/component-list-domain.tsx

'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { sortBy as lodashSortBy } from 'lodash';
import { DataTable, DataTableColumn, DataTableSortStatus } from 'mantine-datatable';
import * as XLSX from 'xlsx';
import { Dialog, Transition } from '@headlessui/react';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import Dropdown from '@/components/dropdown';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

import 'flatpickr/dist/flatpickr.css';
import {
    ColummnDataSiteAuto,
    ExcelRowSiteImages,
    ExcelRowSiteHocthuatAndHuongdan,
    ExcelRowSiteToplist,
    mapRowToHocthuatAndHuongdan,
    mapRowToSiteImages,
    mapRowToToplist,
    mapRowToProduct,
    ExcelRowSiteProduct,
} from './excelRowInterface';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const PAGE_SIZES = [10, 20, 30, 50, 100];

const typeSiteOptions = [
    { value: 'Tất cả', label: 'Tất cả' },
    { value: 'New', label: 'New' },
    { value: 'PBN - INET', label: 'PBN - INET' },
    { value: 'PBN - Global', label: 'PBN - Global' },
];

const groupSiteOptions = [
    { value: 'Tất cả', label: 'Tất cả' },
    { value: 'Hình Ảnh', label: 'Hình Ảnh' },
    { value: 'Hướng dẫn', label: 'Hướng dẫn' },
    { value: 'Tổng hợp', label: 'Tổng hợp' },
    { value: 'Học thuật', label: 'Học thuật' },
    { value: 'Toplist', label: 'Toplist' },
    { value: 'Bán hàng', label: 'Bán hàng' },
];

const personOptions = [
    { value: 'Tất cả', label: 'Tất cả' },
    { value: 'Dương', label: 'Dương' },
    { value: 'Linh', label: 'Linh' },
    { value: 'Nguyên', label: 'Nguyên' },
    { value: 'Khác', label: 'Khác' },
];
type ExcelRow = ExcelRowSiteImages | ExcelRowSiteHocthuatAndHuongdan | ExcelRowSiteProduct | ExcelRowSiteToplist;

export default function DomainDetail() {
    const columns: DataTableColumn<ExcelRow>[] = [
        {
            accessor: 'primary_key',
            title: 'Khóa chính',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'secondary_key',
            title: 'Khóa phụ',
            sortable: true,
            textAlignment: 'left',
            render: ({ secondary_key }: any) => {
                const formattedKey = secondary_key?.replace(/\n/g, ', ') || '';
                return (
                    <Tippy content={formattedKey}>
                        <span
                            style={{
                                display: 'inline-block',
                                maxWidth: '200px', // Chiều rộng tối đa
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {formattedKey}
                        </span>
                    </Tippy>
                );
            },
        },
        {
            accessor: 'status',
            title: 'Trạng thái',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'heading',
            title: 'Heading 1',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'title',
            title: 'Meta Title',
            sortable: true,
            textAlignment: 'left',
        },

        {
            accessor: 'meta',
            title: 'Meta Description',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'slug',
            title: 'URL',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'index',
            title: 'index',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'category',
            title: 'Category',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'date_publish',
            title: 'Ngày đăng',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'date_edit',
            title: 'Ngày sữa lần cuối',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'link',
            title: 'Link IN/OUT',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'create_at',
            title: 'Người tạo',
            sortable: true,
            textAlignment: 'left',
        },
    ];
    const [data, setData] = useState<ExcelRow[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'domain', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<ExcelRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [typeSite, setTypeSite] = useState('Tất cả');
    const [groupSite, setGroupSite] = useState('Tất cả');
    const [person, setPerson] = useState('Tất cả');

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [modalDanhnuc, setModalDanhmuc] = useState(false);
    const [modalConfigPrompt, setModalConfigPrompt] = useState(false);

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = data.filter((item: ExcelRow) => {
            const s = search.toLowerCase();
            const matchesSearch = item.primary_key.toLowerCase().includes(s);
            return matchesSearch;
        });
        if (sortStatus) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [data, search, sortStatus, groupSite, person, startDate, endDate]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredAndSortedRecords.slice(from, to).map((record, index) => ({
            ...record,
            id: record.primary_key || index, // Sử dụng primary_key hoặc index làm id
        }));
    }, [filteredAndSortedRecords, page, pageSize]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedRecords.length / pageSize);
    }, [filteredAndSortedRecords.length, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages > 0 ? totalPages : 1);
        }
    }, [totalPages, page]);

    const handleButtonClick = () => {
        fileInputRef.current?.click(); // Kích hoạt input file
    };

    const mapRawDataToObjects = (rawData: any[][], type: 'siteImages' | 'hocthuat' | 'product' | 'toplist'): ExcelRow[] => {
        return rawData
            .slice(1) // Bỏ dòng tiêu đề (header)
            .filter((row) => row.length > 0) // Bỏ qua dòng trống
            .map((row) => {
                switch (type) {
                    case 'siteImages':
                        return mapRowToSiteImages(row) as ExcelRowSiteImages;
                    case 'hocthuat':
                        return mapRowToHocthuatAndHuongdan(row) as ExcelRowSiteHocthuatAndHuongdan;
                    case 'product':
                        return mapRowToProduct(row) as ExcelRowSiteProduct;
                    case 'toplist':
                        return mapRowToToplist(row) as ExcelRowSiteToplist;
                    default:
                        throw new Error('Invalid type');
                }
            });
    };
    const handleExport = (type: 'siteImages' | 'hocthuat' | 'product' | 'toplist', data: any[]) => {
        let csvData:any[] = [];

        // Ánh xạ dữ liệu dựa trên type
        switch (type) {
            case 'siteImages':
                csvData = data.map((row) => ({
                    "Crawling Key": row.crawling_key,
                    "Primary Key": row.primary_key,
                    "Secondary Key": row.secondary_key,
                    "Prompt System": row.prompt_system,
                    "Prompt Keywords": row.prompt_keywords,
                    "Name Uppercase": row.name_uppercase,
                    "Prompt H1": row.prompt_h1,
                    "Prompt H1 Type": row.prompt_h1_type,
                    "Prompt H1 Model": row.prompt_h1_model,
                    "Prompt Title": row.prompt_title,
                    "Prompt Title Type": row.prompt_title_type,
                    "Prompt Title Model": row.prompt_title_model,
                    "Prompt Meta": row.prompt_meta,
                    "Prompt Meta Type": row.prompt_meta_type,
                    "Prompt Meta Model": row.prompt_meta_model,
                    "Prompt Sapo": row.prompt_sapo,
                    "Prompt Sapo Type": row.prompt_sapo_type,
                    "Prompt Sapo Model": row.prompt_sapo_model,
                    "Prompt Captions": row.prompt_captions,
                    "Prompt Captions Type": row.prompt_captions_type,
                    "Prompt Captions Model": row.prompt_captions_model,
                    "Prompt Conclusion": row.prompt_conclustion,
                    "Prompt Conclusion Type": row.prompt_conclustion_type,
                    "Prompt Conclusion Model": row.prompt_conclustion_model,
                    "Prompt Internal": row.prompt_internal,
                    "Prompt Internal Type": row.prompt_internal_type,
                    "Prompt Internal Model": row.prompt_internal_model,
                    "Category": row.category,
                    "Status": row.status,
                    "Limit": row.limit,
                    "Source": row.source,
                    "Internal Ratio": row.tyle_internal,
                    "Internal Links": row.soluong_internal,
                    "Notebook Internal": row.notebook_internal,
                    "Random Keyword": row.random_tukhoa_mobai,
                    "Home Keywords": row.tukhoa_home,
                    "Home Internal Ratio": row.tyle_home_internal,
                    "Category Keywords": row.tukhoa_caterogy,
                    "Category Internal Ratio": row.tyle_category_internal,
                    "Internal Category": row.category_internal,
                }));
                break;
            case 'hocthuat':
                csvData = data.map((row) => ({
                    "Primary Key": row.primary_key,
                    "Secondary Key": row.secondary_key || '',
                    "Prompt System": row.prompt_system,
                    "Prompt Keywords": row.prompt_keywords,
                    "Prompt H1": row.prompt_h1,
                    "Prompt H1 Type": row.prompt_h1_type,
                    "Prompt H1 Model": row.prompt_h1_model,
                    "Prompt Title": row.prompt_title,
                    "Prompt Title Type": row.prompt_title_type,
                    "Prompt Title Model": row.prompt_title_model,
                    "Prompt Meta": row.prompt_meta,
                    "Prompt Meta Type": row.prompt_meta_type,
                    "Prompt Meta Model": row.prompt_meta_model,
                    "Prompt Sapo": row.prompt_sapo,
                    "Prompt Sapo Type": row.prompt_sapo_type,
                    "Prompt Sapo Model": row.prompt_sapo_model,
                    "Prompt Conclusion": row.prompt_conclustion,
                    "Prompt Conclusion Type": row.prompt_conclustion_type,
                    "Prompt Conclusion Model": row.prompt_conclustion_model,
                    "Prompt Outline": row.prompt_outline || '',
                    "Prompt Outline Type": row.prompt_outline_type,
                    "Prompt Outline Model": row.prompt_outline_model,
                    "Prompt Triển Khai": row.prompt_trienkhai,
                    "Prompt Triển Khai Type": row.prompt_trienkhai_type,
                    "Prompt Triển Khai Model": row.prompt_trienkhai_model,
                    "Category": row.category || '',
                    "Status": row.status,
                    "Internal Ratio": row.tyle_internal,
                    "Internal Links": row.soluong_internal,
                    "Random Keywords": row.random_tukhoa_mobai || '',
                    "Home Keywords": row.tukhoa_home,
                    "Home Ratio": row.tyle_home_internal,
                    "Category Keywords": row.tukhoa_caterogy,
                    "Category Ratio": row.tyle_category_internal,
                    "Internal Category": row.category_internal,
                }));
                break;
            case 'product':
                csvData = data.map((row) => ({
                    "Primary Key": row.primary_key,
                    "Secondary Key": row.secondary_key || '',
                    "Prompt System": row.prompt_system,
                    "Prompt Keywords": row.prompt_keywords,
                    "Prompt Title": row.prompt_title,
                    "Prompt Meta": row.prompt_meta,
                    "Prompt Triển Khai": row.prompt_trienkhai,
                    "Category": row.category || '',
                    "Status": row.status,
                    "Price": row.price,
                    "SKU": row.SKU,
                    "Random Keywords": row.random_tukhoa_mobai || '',
                }));
                break;
            case 'toplist':
                csvData = data.map((row) => ({
                    "Primary Key": row.primary_key,
                    "Secondary Key": row.secondary_key || '',
                    "Prompt System": row.prompt_system,
                    "Prompt Keywords": row.prompt_keywords,
                    "Prompt H1": row.prompt_h1,
                    "Prompt H1 Type": row.prompt_h1_type,
                    "Prompt H1 Model": row.prompt_h1_model,
                    "Prompt Title": row.prompt_title,
                    "Prompt Title Type": row.prompt_title_type,
                    "Prompt Title Model": row.prompt_title_model,
                    "Prompt Meta": row.prompt_meta,
                    "Prompt Meta Type": row.prompt_meta_type,
                    "Prompt Meta Model": row.prompt_meta_model,
                    "Prompt Sapo": row.prompt_sapo,
                    "Prompt Sapo Type": row.prompt_sapo_type,
                    "Prompt Sapo Model": row.prompt_sapo_model,
                    "Prompt Conclusion": row.prompt_conclustion,
                    "Prompt Conclusion Type": row.prompt_conclustion_type,
                    "Prompt Conclusion Model": row.prompt_conclustion_model,
                    "Prompt Outline": row.prompt_outline || '',
                    "Prompt Outline Type": row.prompt_outline_type,
                    "Prompt Outline Model": row.prompt_outline_model,
                    "Prompt Triển Khai": row.prompt_trienkhai,
                    "Prompt Triển Khai Type": row.prompt_trienkhai_type,
                    "Prompt Triển Khai Model": row.prompt_trienkhai_model,
                    "Prompt Internal": row.prompt_internal,
                    "Prompt Internal Type": row.prompt_internal_type,
                    "Prompt Internal Model": row.prompt_internal_model,
                    "Category": row.category || '',
                    "Status": row.status,
                    "Internal Ratio": row.tyle_internal,
                    "Internal Links": row.soluong_internal,
                    "Random Keywords": row.random_tukhoa_mobai || '',
                    "Home Keywords": row.tukhoa_home,
                    "Home Ratio": row.tyle_home_internal,
                    "Category Keywords": row.tukhoa_caterogy,
                    "Category Ratio": row.tyle_category_internal,
                    "Internal Category": row.category_internal,
                }));
                break;
            default:
                console.error('Invalid type');
                return;
        }
    
        let csv = Papa.unparse(csvData);
        const bom = '\ufeff';  // BOM ký tự UTF-8
        csv = bom + csv;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${type}-export.csv`);
    };

    const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>, type: 'siteImages' | 'hocthuat' | 'product' | 'toplist') => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    const rawData: any[][] = XLSX.utils.sheet_to_json(
                        XLSX.read(new Uint8Array(e.target.result as ArrayBuffer), { type: 'array' }).Sheets[XLSX.read(new Uint8Array(e.target.result as ArrayBuffer), { type: 'array' }).SheetNames[0]],
                        { header: 1 },
                    );
                    const structuredData = mapRawDataToObjects(rawData, type);
                    setData(structuredData);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const isDomainExpired = (timeRegDomain: string | null): boolean => {
        if (!timeRegDomain) return false;
        const regDate = new Date(timeRegDomain);
        const today = new Date();
        const elevenMonthsAgo = new Date(today.setMonth(today.getMonth() - 11));
        return regDate < elevenMonthsAgo;
    };

    return (
        <>
            <div className="p-4">
                <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                    <div className="invoice-table">
                        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button type="button" className="btn btn-success gap-2 flex items-center" onClick={handleButtonClick}>
                                    <IconPlus />
                                    <p className="hidden md:block">Import Excel</p>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={(e) => handleImportExcel(e, 'siteImages')} />
                                </button>
                                <button type="button" className="btn btn-info gap-2 flex items-center" onClick={(e) => handleExport('siteImages', data)}>
                                    <IconPlus />
                                    <p className="hidden md:block">Export Excel</p>
                                </button>
                                <button type="button" className="btn btn-primary gap-2 flex items-center" onClick={() => setModalConfigPrompt(true)}>
                                    <IconPlus />
                                    <p className="hidden md:block">Cấu hình Prompt Auto</p>
                                </button>
                                <button type="button" className="btn btn-secondary gap-2 flex items-center">
                                    <IconPlus />
                                    <p className="hidden md:block">Server chạy</p>
                                </button>
                            </div>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm kiếm..."
                                    className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white w-full4"
                                />
                                <button type="button" className="btn btn-success gap-2 flex items-center">
                                    <IconPlus />
                                    <p className="hidden md:block">Sync Data</p>
                                </button>
                            </div>
                        </div>
                        <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                columns={columns}
                                records={paginatedRecords}
                                totalRecords={filteredAndSortedRecords.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p: number) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size: number) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={({ columnAccessor, direction }: any) => {
                                    setSortStatus({
                                        columnAccessor: columnAccessor as string,
                                        direction: direction as 'asc' | 'desc',
                                    });
                                    setPage(1);
                                }}
                                selectedRecords={selectedRecords}
                                onSelectedRecordsChange={setSelectedRecords}
                                paginationText={({ from, to, totalRecords }: any) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                                highlightOnHover
                                rowClassName={(record: any) => (isDomainExpired(record.timeRegDomain) ? '!bg-red-300 hover:!bg-red-200 text-black' : '')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Transition appear show={modalDanhnuc}>
                <Dialog as="div" open={modalDanhnuc} onClose={() => setModalDanhmuc(false)}>
                    <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <Transition.Child
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg  text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">Danh mục</h5>
                                    </div>
                                    <div className="p-5">
                                        <p></p>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModalDanhmuc(false)}>
                                                Discard
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setModalDanhmuc(false)}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={modalConfigPrompt}>
                <Dialog as="div" open={modalConfigPrompt} onClose={() => setModalConfigPrompt(false)}>
                    <Transition.Child enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 ">
                            <Transition.Child
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-auto  max-w-lg  text-black dark:text-white-dark w-full min-w-[70vw] max-h-[80vh]">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">Cấu hình Prompt Auto</h5>
                                        <div className="flex items-cennter space-x-2">
                                            <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                    btnClassName="btn btn-secondary dropdown-toggle"
                                                    button={
                                                        <div className="flex items-center space-x-2">
                                                            <IconPlus />

                                                            <p className="hidden md:block">Mẫu Prompt Auto</p>
                                                        </div>
                                                    }
                                                >
                                                    <ul className="!min-w-[170px]">
                                                        <li>
                                                            <button type="button">Mẫu Prompt 1</button>
                                                        </li>
                                                        <li>
                                                            <button type="button">Mẫu Prompt 1</button>
                                                        </li>
                                                        <li>
                                                            <button type="button">Mẫu Prompt 1</button>
                                                        </li>
                                                        <li>
                                                            <button type="button">Mẫu Prompt 1</button>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                            <button type="button" className="btn btn-info gap-2 flex items-center">
                                                <IconPlus />
                                                <p className="hidden md:block">Thêm Prompt</p>
                                            </button>
                                            <button type="button" className="btn btn-primary gap-2 flex items-center">
                                                <IconEdit />
                                                <p className="hidden md:block">Setting AI</p>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="grid grid-cols-2  gap-4">
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Heading 1 <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Heading 1" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Title" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Meta Description<span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Meta Description" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Sapo <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Sapo" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Captions <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Captions" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                                <div className="">
                                                    <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                                                        Prompt Conclustion<span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea placeholder="Prompt Conclustion" className="w-full border p-2 rounded form-textarea" rows={6}></textarea>
                                                </div>
                                            </div>
                                        </form>

                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModalConfigPrompt(false)}>
                                                Discard
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setModalConfigPrompt(false)}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
