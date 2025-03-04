'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { sortBy as lodashSortBy, set } from 'lodash';
import { DataTable, DataTableSortStatus, DataTableColumnTextAlignment } from 'mantine-datatable';
import * as XLSX from 'xlsx';
import { Dialog, Transition } from '@headlessui/react';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import { useSearchParams, useRouter } from 'next/navigation';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import Dropdown from '@/components/dropdown';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import Select from 'react-select';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import axios from 'axios';
import http from 'http';

const PAGE_SIZES = [10, 20, 30, 50, 100];

interface ExcelRow {
    id: string;
    crawl_keyword?: string;
    primary_key: string;
    secondary_key: string;
    name_uppercase?: string;
    h1: string;
    title: string;
    description: string;
    post_id: string;
    url: string;
    link_in: string;
    link_out: string;
    is_done: string;
    prompt_system?: string;
    prompt_keywords?: string;
    prompt_h1?: string;
    prompt_h1_type?: string;
    prompt_h1_model?: string;
    prompt_title?: string;
    prompt_title_type?: string;
    prompt_title_model?: string;
    prompt_meta?: string;
    prompt_meta_type?: string;
    prompt_meta_model?: string;
    prompt_sapo?: string;
    prompt_sapo_type?: string;
    prompt_sapo_model?: string;
    prompt_captions?: string;
    prompt_captions_type?: string;
    prompt_captions_model?: string;
    prompt_conclusion?: string;
    prompt_conclusion_type?: string;
    prompt_conclusion_model?: string;
    prompt_internal?: string;
    prompt_internal_type?: string;
    prompt_internal_model?: string;
    prompt_outline?: string;
    prompt_outline_type?: string;
    prompt_outline_model?: string;
    prompt_trienkhai?: string;
    prompt_trienkhai_type?: string;
    prompt_trienkhai_model?: string;
    gia?: string;
    sku?: string;
    category?: string;
    limit?: string;
    source?: string;
    tyle_internal?: string;
    soluong_internal?: string;
    tu_khoa_mobai?: string;
    home_keywords?: string;
    home_ratio?: string;
    category_keywords?: string;
    category_ratio?: string;
    category_internal_ratio?: string;
    tags?: string;
    tables?: string;
    prompt_programatic?: string;
    key_bat?: string;
    type?: string;
    model?: string;
    time_done?: string;
}

interface PromptFieldConfig {
    content: string;
    type: { value: number; label: string } | null;
    model: { value: number; label: string } | null;
}

interface ServerStatus {
    id: number;
    url: string;
    loading: boolean;
    is_running: boolean;
    has_temp: boolean | undefined | null;
    timedOut: boolean;
    domain_id?: number | null;
    is_delete?: boolean;
}

export default function DomainDetailKeyword() {
    const router = useRouter();
    const [data, setData] = useState<ExcelRow[]>([]);
    const [importedExcelData, setImportedExcelData] = useState<ExcelRow[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'primary_key',
        direction: 'asc',
    });
    const [selectedRecords, setSelectedRecords] = useState<ExcelRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [modalPromptConfig, setModalPromptConfig] = useState(false);
    const [modalDanhmuc, setModalDanhmuc] = useState(false);
    const [domainInfo, setDomainInfo] = useState<any>(null);
    const [promptConfig, setPromptConfig] = useState<{ [key: string]: PromptFieldConfig }>({
        prompt_system: { content: '', type: null, model: null },
        prompt_keywords: { content: '', type: null, model: null },
        prompt_h1: { content: '', type: null, model: null },
        prompt_title: { content: '', type: null, model: null },
        prompt_meta: { content: '', type: null, model: null },
        prompt_sapo: { content: '', type: null, model: null },
        prompt_captions: { content: '', type: null, model: null },
        prompt_conclusion: { content: '', type: null, model: null },
        prompt_internal: { content: '', type: null, model: null },
        prompt_outline: { content: '', type: null, model: null },
        prompt_trienkhai: { content: '', type: null, model: null },
    });
    const [tempPromptConfig, setTempPromptConfig] = useState<{ [key: string]: PromptFieldConfig } | null>(null);
    const [autoPrompts, setAutoPrompts] = useState<any[]>([]);
    const [aiTypes, setAiTypes] = useState<Array<{ value: number; label: string }>>([]);
    const [aiModels, setAiModels] = useState<Array<{ value: number; label: string; typeAIId: number }>>([]);
    const [serverData, setServerData] = useState<ServerStatus[]>([]);
    const [activeServer, setActiveServer] = useState<ServerStatus | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null);

    const promptFields = [
        { key: 'prompt_system', label: 'Prompt System' },
        { key: 'prompt_keywords', label: 'Prompt Keywords' },
        { key: 'prompt_h1', label: 'Prompt H1' },
        { key: 'prompt_title', label: 'Prompt Title' },
        { key: 'prompt_meta', label: 'Prompt Meta' },
        { key: 'prompt_sapo', label: 'Prompt Sapo' },
        { key: 'prompt_captions', label: 'Prompt Captions' },
        { key: 'prompt_conclusion', label: 'Prompt Conclusion' },
        { key: 'prompt_internal', label: 'Prompt Internal' },
        { key: 'prompt_outline', label: 'Prompt Outline' },
        { key: 'prompt_trienkhai', label: 'Prompt Triển Khai' },
    ];
    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');
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
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [domainInfo?.domain, importedExcelData]);
    const isImported = importedExcelData.length > 0;
    const recordsSource = isImported ? importedExcelData : data;
    const filteredAndSortedRecords = useMemo(() => {
        let filtered = recordsSource.filter((item) => (item.primary_key || '').toLowerCase().includes(search.toLowerCase()));
        if (!isImported && sortStatus) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') filtered = filtered.reverse();
        }
        return filtered;
    }, [recordsSource, search, sortStatus, isImported]);

    const paginatedRecords = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return filteredAndSortedRecords.slice(from, to);
    }, [filteredAndSortedRecords, page, pageSize]);
    const totalPages = useMemo(() => Math.ceil(filteredAndSortedRecords.length / pageSize), [filteredAndSortedRecords.length, pageSize]);
    useEffect(() => {
        if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1);
    }, [totalPages, page]);
    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-type-ai`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const types = response.data.data || [];
                setAiTypes(types.map((type: any) => ({ value: type.id, label: type.name })));
            })
            .catch((err) => console.error(err));
    }, []);
    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-ai-models`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const models = response.data.data || [];
                setAiModels(
                    models.map((model: any) => ({
                        value: model.id,
                        label: model.name,
                        typeAIId: model.type_ai_id,
                    })),
                );
            })
            .catch((err) => console.error(err));
    }, []);
    const getModelOptions = (typeOption: { value: number; label: string } | null) => {
        if (!typeOption) return [];
        return aiModels.filter((model) => model.typeAIId === typeOption.value).map((model) => ({ value: model.value, label: model.label }));
    };
    const [isServerRunning, setIsServerRunning] = useState(false);
    const [timeNowSync, setTimeNowSync] = useState(new Date());
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
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
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
    }, [domainInfo]);
    useEffect(() => {
        if (modalPromptConfig) {
            axios
                .get(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/get-prompts`, {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const list = response.data.data || [];
                    setAutoPrompts(list);
                })
                .catch(() => setAutoPrompts([]));
        }
    }, [modalPromptConfig]);
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    const mapRawDataToObjects = (rawData: any[][]): ExcelRow[] => {
        if (!rawData || rawData.length < 2) return [];
        const headers = rawData[0];
        const headerMap: { [key: string]: number } = {};
        headers.forEach((h: string, i: number) => {
            headerMap[h.trim()] = i;
        });
        return rawData
            .slice(1)
            .filter((row) => row.length > 0)
            .map((row) => ({
                id: row[headerMap['id']] || '',
                crawl_keyword: row[headerMap['Từ khóa crawl']] || '',
                primary_key: row[headerMap['Từ khoá chính']] || '',
                secondary_key: row[headerMap['Từ khoá phụ']] || '',
                name_uppercase: row[headerMap['Name Uppercase']] || '',
                h1: row[headerMap['H1']] || '',
                title: row[headerMap['Title']] || '',
                description: row[headerMap['Description']] || '',
                prompt_system: row[headerMap['Prompt System']] || '',
                prompt_keywords: row[headerMap['Prompt Keywords']] || '',
                prompt_h1: row[headerMap['Prompt H1']] || '',
                prompt_h1_type: row[headerMap['Prompt H1 Type']] || '',
                prompt_h1_model: row[headerMap['Prompt H1 Model']] || '',
                prompt_title: row[headerMap['Prompt Title']] || '',
                prompt_title_type: row[headerMap['Prompt Title Type']] || '',
                prompt_title_model: row[headerMap['Prompt Title Model']] || '',
                prompt_meta: row[headerMap['Prompt Meta']] || '',
                prompt_meta_type: row[headerMap['Prompt Meta Type']] || '',
                prompt_meta_model: row[headerMap['Prompt Meta Model']] || '',
                prompt_sapo: row[headerMap['Prompt Sapo']] || '',
                prompt_sapo_type: row[headerMap['Prompt Sapo Type']] || '',
                prompt_sapo_model: row[headerMap['Prompt Sapo Model']] || '',
                prompt_captions: row[headerMap['Prompt Captions']] || '',
                prompt_captions_type: row[headerMap['Prompt Captions Type']] || '',
                prompt_captions_model: row[headerMap['Prompt Captions Model']] || '',
                prompt_conclusion: row[headerMap['Prompt Conclusion']] || '',
                prompt_conclusion_type: row[headerMap['Prompt Conclusion Type']] || '',
                prompt_conclusion_model: row[headerMap['Prompt Conclusion Model']] || '',
                prompt_internal: row[headerMap['Prompt Internal']] || '',
                prompt_internal_type: row[headerMap['Prompt Internal Type']] || '',
                prompt_internal_model: row[headerMap['Prompt Internal Model']] || '',
                prompt_outline: row[headerMap['Prompt Outline']] || '',
                prompt_outline_type: row[headerMap['Prompt Outline Type']] || '',
                prompt_outline_model: row[headerMap['Prompt Outline Model']] || '',
                prompt_trienkhai: row[headerMap['Prompt Triển Khai']] || '',
                prompt_trienkhai_type: row[headerMap['Prompt Triển Khai Type']] || '',
                prompt_trienkhai_model: row[headerMap['Prompt Triển Khai Model']] || '',
                gia: row[headerMap['Giá']] || '',
                sku: row[headerMap['SKU']] || '',
                category: row[headerMap['Category']] || '',
                is_done: row[headerMap['Status']] || row[headerMap['Trạng thái']] || '',
                number_of_words: row[headerMap['Số từ']] || '',
                time_done: row[headerMap['Thời gian hoàn thành']] || '',
                post_id: row[headerMap['post_id']] || '',
                url: row[headerMap['url']] || '',
                link_in: row[headerMap['link_in']] || '',
                link_out: row[headerMap['link_out']] || '',
                limit: row[headerMap['Limit']] || '',
                source: row[headerMap['Source']] || '',
                tyle_internal: row[headerMap['Tỷ lệ đi Internal']] || '',
                soluong_internal: row[headerMap['Số link đi Internal']] || '',
                tu_khoa_mobai: row[headerMap['Từ khóa mở bài']] || '',
                home_keywords: row[headerMap['Home Keywords']] || '',
                home_ratio: row[headerMap['Home Ratio']] || '',
                category_keywords: row[headerMap['Category Keywords']] || '',
                category_ratio: row[headerMap['Category Ratio']] || '',
                category_internal_ratio: row[headerMap['Category Internal Ratio']] || '',
                tags: row[headerMap['Tags']] || '',
                tables: row[headerMap['Tables']] || '',
                prompt_programatic: row[headerMap['Prompt Programatic']] || '',
                key_bat: row[headerMap['Key Bắt']] || '',
                type: row[headerMap['Type']] || '',
                model: row[headerMap['Model']] || '',
            }));
    };
    const handleExport = () => {
        const exportHeaders = [
            'Từ khóa crawl',
            'Từ khoá chính',
            'Từ khoá phụ',
            'Name Uppercase',
            'Prompt System',
            'Prompt Keywords',
            'Prompt H1',
            'Prompt H1 Type',
            'Prompt H1 Model',
            'Prompt Title',
            'Prompt Title Type',
            'Prompt Title Model',
            'Prompt Meta',
            'Prompt Meta Type',
            'Prompt Meta Model',
            'Prompt Sapo',
            'Prompt Sapo Type',
            'Prompt Sapo Model',
            'Prompt Captions',
            'Prompt Captions Type',
            'Prompt Captions Model',
            'Prompt Conclusion',
            'Prompt Conclusion Type',
            'Prompt Conclusion Model',
            'Prompt Internal',
            'Prompt Internal Type',
            'Prompt Internal Model',
            'Prompt Outline',
            'Prompt Outline Type',
            'Prompt Outline Model',
            'Prompt Triển Khai',
            'Prompt Triển Khai Type',
            'Prompt Triển Khai Model',
            'Giá',
            'SKU',
            'Category',
            'Status',
            'Limit',
            'Source',
            'Tỷ lệ đi Internal',
            'Số link đi Internal',
            'Từ khóa mở bài',
            'Home Keywords',
            'Home Ratio',
            'Category Keywords',
            'Category Ratio',
            'Category Internal Ratio',
            'Tags',
            'Tables',
            'Prompt Programatic',
            'Key Bắt',
            'Type',
            'Model',
        ];
        const updatedData = importedExcelData.map((row, index) => ({
            'Từ khóa crawl': row.crawl_keyword || '',
            'Từ khoá chính': row.primary_key || '',
            'Từ khoá phụ': row.secondary_key || '',
            'Name Uppercase': row.name_uppercase || '',
            'Prompt System': index === 0 ? promptConfig.prompt_system.content || row.prompt_system || '' : '',
            'Prompt Keywords': index === 0 ? promptConfig.prompt_keywords.content || row.prompt_keywords || '' : '',
            'Prompt H1': index === 0 ? promptConfig.prompt_h1.content || row.prompt_h1 || '' : '',
            'Prompt H1 Type': index === 0 ? (promptConfig.prompt_h1.type ? promptConfig.prompt_h1.type.label : row.prompt_h1_type || '') : '',
            'Prompt H1 Model': index === 0 ? (promptConfig.prompt_h1.model ? promptConfig.prompt_h1.model.label : row.prompt_h1_model || '') : '',
            'Prompt Title': index === 0 ? promptConfig.prompt_title.content || row.prompt_title || '' : '',
            'Prompt Title Type': index === 0 ? (promptConfig.prompt_title.type ? promptConfig.prompt_title.type.label : row.prompt_title_type || '') : '',
            'Prompt Title Model': index === 0 ? (promptConfig.prompt_title.model ? promptConfig.prompt_title.model.label : row.prompt_title_model || '') : '',
            'Prompt Meta': index === 0 ? promptConfig.prompt_meta.content || row.prompt_meta || '' : '',
            'Prompt Meta Type': index === 0 ? (promptConfig.prompt_meta.type ? promptConfig.prompt_meta.type.label : row.prompt_meta_type || '') : '',
            'Prompt Meta Model': index === 0 ? (promptConfig.prompt_meta.model ? promptConfig.prompt_meta.model.label : row.prompt_meta_model || '') : '',
            'Prompt Sapo': index === 0 ? promptConfig.prompt_sapo.content || row.prompt_sapo || '' : '',
            'Prompt Sapo Type': index === 0 ? (promptConfig.prompt_sapo.type ? promptConfig.prompt_sapo.type.label : row.prompt_sapo_type || '') : '',
            'Prompt Sapo Model': index === 0 ? (promptConfig.prompt_sapo.model ? promptConfig.prompt_sapo.model.label : row.prompt_sapo_model || '') : '',
            'Prompt Captions': index === 0 ? promptConfig.prompt_captions.content || row.prompt_captions || '' : '',
            'Prompt Captions Type': index === 0 ? (promptConfig.prompt_captions.type ? promptConfig.prompt_captions.type.label : row.prompt_captions_type || '') : '',
            'Prompt Captions Model': index === 0 ? (promptConfig.prompt_captions.model ? promptConfig.prompt_captions.model.label : row.prompt_captions_model || '') : '',
            'Prompt Conclusion': index === 0 ? promptConfig.prompt_conclusion.content || row.prompt_conclusion || '' : '',
            'Prompt Conclusion Type': index === 0 ? (promptConfig.prompt_conclusion.type ? promptConfig.prompt_conclusion.type.label : row.prompt_conclusion_type || '') : '',
            'Prompt Conclusion Model': index === 0 ? (promptConfig.prompt_conclusion.model ? promptConfig.prompt_conclusion.model.label : row.prompt_conclusion_model || '') : '',
            'Prompt Internal': index === 0 ? promptConfig.prompt_internal.content || row.prompt_internal || '' : '',
            'Prompt Internal Type': index === 0 ? (promptConfig.prompt_internal.type ? promptConfig.prompt_internal.type.label : row.prompt_internal_type || '') : '',
            'Prompt Internal Model': index === 0 ? (promptConfig.prompt_internal.model ? promptConfig.prompt_internal.model.label : row.prompt_internal_model || '') : '',
            'Prompt Outline': index === 0 ? promptConfig.prompt_outline.content || row.prompt_outline || '' : '',
            'Prompt Outline Type': index === 0 ? (promptConfig.prompt_outline.type ? promptConfig.prompt_outline.type.label : row.prompt_outline_type || '') : '',
            'Prompt Outline Model': index === 0 ? (promptConfig.prompt_outline.model ? promptConfig.prompt_outline.model.label : row.prompt_outline_model || '') : '',
            'Prompt Triển Khai': index === 0 ? promptConfig.prompt_trienkhai.content || row.prompt_trienkhai || '' : '',
            'Prompt Triển Khai Type': index === 0 ? (promptConfig.prompt_trienkhai.type ? promptConfig.prompt_trienkhai.type.label : row.prompt_trienkhai_type || '') : '',
            'Prompt Triển Khai Model': index === 0 ? (promptConfig.prompt_trienkhai.model ? promptConfig.prompt_trienkhai.model.label : row.prompt_trienkhai_model || '') : '',
            Giá: row.gia || '',
            SKU: row.sku || '',
            Category: row.category || '',
            Status: row.is_done || '',
            Limit: row.limit || '',
            Source: row.source || '',
            'Tỷ lệ đi Internal': row.tyle_internal || '',
            'Số link đi Internal': row.soluong_internal || '',
            'Từ khóa mở bài': row.tu_khoa_mobai || '',
            'Home Keywords': row.home_keywords || '',
            'Home Ratio': row.home_ratio || '',
            'Category Keywords': row.category_keywords || '',
            'Category Ratio': row.category_ratio || '',
            'Category Internal Ratio': row.category_internal_ratio || '',
            Tags: row.tags || '',
            Tables: row.tables || '',
            'Prompt Programatic': index === 0 ? row.prompt_programatic || '' : '',
            'Key Bắt': row.key_bat || '',
            Type: row.type || '',
            Model: row.model || '',
        }));
        const csvRows = [exportHeaders, ...updatedData.map((row: { [key: string]: string }) => exportHeaders.map((col) => row[col] || ''))];
        const csv = Papa.unparse(csvRows);
        const bom = '\ufeff';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'export.csv');
    };
    const generateXLSXBlob = (): Blob | null => {
        if (!importedExcelData.length) return null;
        const exportHeaders = [
            'Từ khóa crawl',
            'Từ khoá chính',
            'Từ khoá phụ',
            'Name Uppercase',
            'Prompt System',
            'Prompt Keywords',
            'Prompt H1',
            'Prompt H1 Type',
            'Prompt H1 Model',
            'Prompt Title',
            'Prompt Title Type',
            'Prompt Title Model',
            'Prompt Meta',
            'Prompt Meta Type',
            'Prompt Meta Model',
            'Prompt Sapo',
            'Prompt Sapo Type',
            'Prompt Sapo Model',
            'Prompt Captions',
            'Prompt Captions Type',
            'Prompt Captions Model',
            'Prompt Conclusion',
            'Prompt Conclusion Type',
            'Prompt Conclusion Model',
            'Prompt Internal',
            'Prompt Internal Type',
            'Prompt Internal Model',
            'Prompt Outline',
            'Prompt Outline Type',
            'Prompt Outline Model',
            'Prompt Triển Khai',
            'Prompt Triển Khai Type',
            'Prompt Triển Khai Model',
            'Giá',
            'SKU',
            'Category',
            'Status',
            'Limit',
            'Source',
            'Tỷ lệ đi Internal',
            'Số link đi Internal',
            'Từ khóa mở bài',
            'Home Keywords',
            'Home Ratio',
            'Category Keywords',
            'Category Ratio',
            'Category Internal Ratio',
            'Tags',
            'Tables',
            'Prompt Programatic',
            'Key Bắt',
            'Type',
            'Model',
        ];
        const updatedData = importedExcelData.map((row, index) => ({
            'Từ khóa crawl': row.crawl_keyword || '',
            'Từ khoá chính': row.primary_key || '',
            'Từ khoá phụ': row.secondary_key || '',
            'Name Uppercase': row.name_uppercase || '',
            'Prompt System': index === 0 ? promptConfig.prompt_system.content || row.prompt_system || '' : '',
            'Prompt Keywords': index === 0 ? promptConfig.prompt_keywords.content || row.prompt_keywords || '' : '',
            'Prompt H1': index === 0 ? promptConfig.prompt_h1.content || row.prompt_h1 || '' : '',
            'Prompt H1 Type': index === 0 ? (promptConfig.prompt_h1.type ? promptConfig.prompt_h1.type.label : row.prompt_h1_type || '') : '',
            'Prompt H1 Model': index === 0 ? (promptConfig.prompt_h1.model ? promptConfig.prompt_h1.model.label : row.prompt_h1_model || '') : '',
            'Prompt Title': index === 0 ? promptConfig.prompt_title.content || row.prompt_title || '' : '',
            'Prompt Title Type': index === 0 ? (promptConfig.prompt_title.type ? promptConfig.prompt_title.type.label : row.prompt_title_type || '') : '',
            'Prompt Title Model': index === 0 ? (promptConfig.prompt_title.model ? promptConfig.prompt_title.model.label : row.prompt_title_model || '') : '',
            'Prompt Meta': index === 0 ? promptConfig.prompt_meta.content || row.prompt_meta || '' : '',
            'Prompt Meta Type': index === 0 ? (promptConfig.prompt_meta.type ? promptConfig.prompt_meta.type.label : row.prompt_meta_type || '') : '',
            'Prompt Meta Model': index === 0 ? (promptConfig.prompt_meta.model ? promptConfig.prompt_meta.model.label : row.prompt_meta_model || '') : '',
            'Prompt Sapo': index === 0 ? promptConfig.prompt_sapo.content || row.prompt_sapo || '' : '',
            'Prompt Sapo Type': index === 0 ? (promptConfig.prompt_sapo.type ? promptConfig.prompt_sapo.type.label : row.prompt_sapo_type || '') : '',
            'Prompt Sapo Model': index === 0 ? (promptConfig.prompt_sapo.model ? promptConfig.prompt_sapo.model.label : row.prompt_sapo_model || '') : '',
            'Prompt Captions': index === 0 ? promptConfig.prompt_captions.content || row.prompt_captions || '' : '',
            'Prompt Captions Type': index === 0 ? (promptConfig.prompt_captions.type ? promptConfig.prompt_captions.type.label : row.prompt_captions_type || '') : '',
            'Prompt Captions Model': index === 0 ? (promptConfig.prompt_captions.model ? promptConfig.prompt_captions.model.label : row.prompt_captions_model || '') : '',
            'Prompt Conclusion': index === 0 ? promptConfig.prompt_conclusion.content || row.prompt_conclusion || '' : '',
            'Prompt Conclusion Type': index === 0 ? (promptConfig.prompt_conclusion.type ? promptConfig.prompt_conclusion.type.label : row.prompt_conclusion_type || '') : '',
            'Prompt Conclusion Model': index === 0 ? (promptConfig.prompt_conclusion.model ? promptConfig.prompt_conclusion.model.label : row.prompt_conclusion_model || '') : '',
            'Prompt Internal': index === 0 ? promptConfig.prompt_internal.content || row.prompt_internal || '' : '',
            'Prompt Internal Type': index === 0 ? (promptConfig.prompt_internal.type ? promptConfig.prompt_internal.type.label : row.prompt_internal_type || '') : '',
            'Prompt Internal Model': index === 0 ? (promptConfig.prompt_internal.model ? promptConfig.prompt_internal.model.label : row.prompt_internal_model || '') : '',
            'Prompt Outline': index === 0 ? promptConfig.prompt_outline.content || row.prompt_outline || '' : '',
            'Prompt Outline Type': index === 0 ? (promptConfig.prompt_outline.type ? promptConfig.prompt_outline.type.label : row.prompt_outline_type || '') : '',
            'Prompt Outline Model': index === 0 ? (promptConfig.prompt_outline.model ? promptConfig.prompt_outline.model.label : row.prompt_outline_model || '') : '',
            'Prompt Triển Khai': index === 0 ? promptConfig.prompt_trienkhai.content || row.prompt_trienkhai || '' : '',
            'Prompt Triển Khai Type': index === 0 ? (promptConfig.prompt_trienkhai.type ? promptConfig.prompt_trienkhai.type.label : row.prompt_trienkhai_type || '') : '',
            'Prompt Triển Khai Model': index === 0 ? (promptConfig.prompt_trienkhai.model ? promptConfig.prompt_trienkhai.model.label : row.prompt_trienkhai_model || '') : '',
            Giá: row.gia || '',
            SKU: row.sku || '',
            Category: row.category || '',
            Status: row.is_done || '',
            Limit: row.limit || '',
            Source: row.source || '',
            'Tỷ lệ đi Internal': row.tyle_internal || '',
            'Số link đi Internal': row.soluong_internal || '',
            'Từ khóa mở bài': row.tu_khoa_mobai || '',
            'Home Keywords': row.home_keywords || '',
            'Home Ratio': row.home_ratio || '',
            'Category Keywords': row.category_keywords || '',
            'Category Ratio': row.category_ratio || '',
            'Category Internal Ratio': row.category_internal_ratio || '',
            Tags: row.tags || '',
            Tables: row.tables || '',
            'Prompt Programatic': index === 0 ? row.prompt_programatic || '' : '',
            'Key Bắt': row.key_bat || '',
            Type: row.type || '',
            Model: row.model || '',
        }));
        const wsData = [exportHeaders, ...updatedData.map((row: { [key: string]: string }) => exportHeaders.map((col) => row[col] || ''))];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    };
    const refreshData = async () => {
        if (domainInfo?.domain) {
            const apiUrl = `https://${domainInfo.domain}/wp-json/custom-api/v1/get-excel-data/`;
            await axios
                .get(apiUrl, {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    setData(response.data);

                    const validRows = response.data.filter((row: ExcelRow) => Number(row.time_done) > 0);

                    if (validRows.length > 0) {
                        const maxTime = Math.max(...validRows.map((row: ExcelRow) => Number(row.time_done)));
                        const numRows = validRows.length >= 4 ? 4 : validRows.length;

                        const estimatedTotalTime = (maxTime / numRows) * paginatedRecords.length;

                        const now = timeNowSync;
                        const completionTime = new Date(now.getTime() + estimatedTotalTime * 1000);

                        const completionHours = completionTime.getHours().toString().padStart(2, '0');
                        const completionMinutes = completionTime.getMinutes().toString().padStart(2, '0');
                        const completionSeconds = completionTime.getSeconds().toString().padStart(2, '0');

                        setEstimatedTimeRemaining(`Hoàn thành vào ${completionHours}:${completionMinutes}:${completionSeconds}`);
                    } else {
                        setEstimatedTimeRemaining(null);
                    }
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
                        const currentDomainId = Number(domainInfo?.id);
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
        }
    };
    const handleSyncData = async () => {
        if (!isSyncing) {
            const xlsxBlob = generateXLSXBlob();
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
            const typeSite = typeSiteMapping[domainInfo?.group_site] || '';
            formData.append('type_site', typeSite);
            const isCrawling = domainInfo?.group_site === 'Hình Ảnh' ? 'True' : 'True';
            formData.append('is_crawling', isCrawling);
            formData.append('url', 'https://' + domainInfo?.domain);
            formData.append('max_workers', '4');
            formData.append('username', domainInfo?.user_aplication);
            formData.append('password', domainInfo?.password_aplication);
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
                    const response = await axios.post(`http://${availableServer.url}/api/site`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
                    });
                    setIsSyncing(true);
                    setIsServerRunning(true);
                    console.log('Dữ liệu nhận được:', response.data);
                    setImportedExcelData([]);
                    setData([]);
                    setTimeNowSync(new Date());
                    await refreshData();
                } catch (error) {
                    console.error('Lỗi khi đồng bộ dữ liệu:', error);
                }
            }
        } else {
            if (activeServer) {
                try {
                    const response = await axios.post(`http://${activeServer.url}/api/site/stop`, null, {
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        httpAgent: new http.Agent({ keepAlive: true }),
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
                    console.log('Đã dừng đồng bộ, dữ liệu nhận được:', response.data);
                    await refreshData();
                } catch (error) {
                    console.error('Lỗi khi dừng đồng bộ:', error);
                }
            }
        }
    };
    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev: ProgressEvent<FileReader>) => {
            if (!ev.target?.result) return;
            const workbook = XLSX.read(new Uint8Array(ev.target.result as ArrayBuffer), { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            let structuredData = mapRawDataToObjects(rawData);

            if (structuredData.length > 0) {
                const r = structuredData[0];
                setImportedExcelData(structuredData);
                setPromptConfig({
                    prompt_system: { content: r.prompt_system || '', type: null, model: null },
                    prompt_keywords: { content: r.prompt_keywords || '', type: null, model: null },
                    prompt_h1: {
                        content: r.prompt_h1 || '',
                        type: r.prompt_h1_type ? { value: Number(r.prompt_h1_type), label: r.prompt_h1_type } : null,
                        model: r.prompt_h1_model ? { value: Number(r.prompt_h1_model), label: r.prompt_h1_model } : null,
                    },
                    prompt_title: {
                        content: r.prompt_title || '',
                        type: r.prompt_title_type ? { value: Number(r.prompt_title_type), label: r.prompt_title_type } : null,
                        model: r.prompt_title_model ? { value: Number(r.prompt_title_model), label: r.prompt_title_model } : null,
                    },
                    prompt_meta: {
                        content: r.prompt_meta || '',
                        type: r.prompt_meta_type ? { value: Number(r.prompt_meta_type), label: r.prompt_meta_type } : null,
                        model: r.prompt_meta_model ? { value: Number(r.prompt_meta_model), label: r.prompt_meta_model } : null,
                    },
                    prompt_sapo: {
                        content: r.prompt_sapo || '',
                        type: r.prompt_sapo_type ? { value: Number(r.prompt_sapo_type), label: r.prompt_sapo_type } : null,
                        model: r.prompt_sapo_model ? { value: Number(r.prompt_sapo_model), label: r.prompt_sapo_model } : null,
                    },
                    prompt_captions: {
                        content: r.prompt_captions || '',
                        type: r.prompt_captions_type ? { value: Number(r.prompt_captions_type), label: r.prompt_captions_type } : null,
                        model: r.prompt_captions_model ? { value: Number(r.prompt_captions_model), label: r.prompt_captions_model } : null,
                    },
                    prompt_conclusion: {
                        content: r.prompt_conclusion || '',
                        type: r.prompt_conclusion_type ? { value: Number(r.prompt_conclusion_type), label: r.prompt_conclusion_type } : null,
                        model: r.prompt_conclusion_model ? { value: Number(r.prompt_conclusion_model), label: r.prompt_conclusion_model } : null,
                    },
                    prompt_internal: {
                        content: r.prompt_internal || '',
                        type: r.prompt_internal_type ? { value: Number(r.prompt_internal_type), label: r.prompt_internal_type } : null,
                        model: r.prompt_internal_model ? { value: Number(r.prompt_internal_model), label: r.prompt_internal_model } : null,
                    },
                    prompt_outline: {
                        content: r.prompt_outline || '',
                        type: r.prompt_outline_type ? { value: Number(r.prompt_outline_type), label: r.prompt_outline_type } : null,
                        model: r.prompt_outline_model ? { value: Number(r.prompt_outline_model), label: r.prompt_outline_model } : null,
                    },
                    prompt_trienkhai: {
                        content: r.prompt_trienkhai || '',
                        type: r.prompt_trienkhai_type ? { value: Number(r.prompt_trienkhai_type), label: r.prompt_trienkhai_type } : null,
                        model: r.prompt_trienkhai_model ? { value: Number(r.prompt_trienkhai_model), label: r.prompt_trienkhai_model } : null,
                    },
                });
                const temp = {
                    prompt_system: r.prompt_system && typeof r.prompt_system === 'object' ? r.prompt_system : { content: r.prompt_system || '', type: null, model: null },
                    prompt_keywords: r.prompt_keywords && typeof r.prompt_keywords === 'object' ? r.prompt_keywords : { content: r.prompt_keywords || '', type: null, model: null },
                    prompt_h1: {
                        content: r.prompt_h1 || '',
                        type: r.prompt_h1_type ? { value: Number(r.prompt_h1_type), label: r.prompt_h1_type } : null,
                        model: r.prompt_h1_model ? { value: Number(r.prompt_h1_model), label: r.prompt_h1_model } : null,
                    },
                    prompt_title: {
                        content: r.prompt_title || '',
                        type: r.prompt_title_type ? { value: Number(r.prompt_title_type), label: r.prompt_title_type } : null,
                        model: r.prompt_title_model ? { value: Number(r.prompt_title_model), label: r.prompt_title_model } : null,
                    },
                    prompt_meta: {
                        content: r.prompt_meta || '',
                        type: r.prompt_meta_type ? { value: Number(r.prompt_meta_type), label: r.prompt_meta_type } : null,
                        model: r.prompt_meta_model ? { value: Number(r.prompt_meta_model), label: r.prompt_meta_model } : null,
                    },
                    prompt_sapo: {
                        content: r.prompt_sapo || '',
                        type: r.prompt_sapo_type ? { value: Number(r.prompt_sapo_type), label: r.prompt_sapo_type } : null,
                        model: r.prompt_sapo_model ? { value: Number(r.prompt_sapo_model), label: r.prompt_sapo_model } : null,
                    },
                    prompt_captions: {
                        content: r.prompt_captions || '',
                        type: r.prompt_captions_type ? { value: Number(r.prompt_captions_type), label: r.prompt_captions_type } : null,
                        model: r.prompt_captions_model ? { value: Number(r.prompt_captions_model), label: r.prompt_captions_model } : null,
                    },
                    prompt_conclusion: {
                        content: r.prompt_conclusion || '',
                        type: r.prompt_conclusion_type ? { value: Number(r.prompt_conclusion_type), label: r.prompt_conclusion_type } : null,
                        model: r.prompt_conclusion_model ? { value: Number(r.prompt_conclusion_model), label: r.prompt_conclusion_model } : null,
                    },
                    prompt_internal: {
                        content: r.prompt_internal || '',
                        type: r.prompt_internal_type ? { value: Number(r.prompt_internal_type), label: r.prompt_internal_type } : null,
                        model: r.prompt_internal_model ? { value: Number(r.prompt_internal_model), label: r.prompt_internal_model } : null,
                    },
                    prompt_outline: {
                        content: r.prompt_outline || '',
                        type: r.prompt_outline_type ? { value: Number(r.prompt_outline_type), label: r.prompt_outline_type } : null,
                        model: r.prompt_outline_model ? { value: Number(r.prompt_outline_model), label: r.prompt_outline_model } : null,
                    },
                    prompt_trienkhai: {
                        content: r.prompt_trienkhai || '',
                        type: r.prompt_trienkhai_type ? { value: Number(r.prompt_trienkhai_type), label: r.prompt_trienkhai_type } : null,
                        model: r.prompt_trienkhai_model ? { value: Number(r.prompt_trienkhai_model), label: r.prompt_trienkhai_model } : null,
                    },
                };
                setTempPromptConfig(temp);
                setModalPromptConfig(true);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    const isDomainExpired = (timeRegDomain: string | null) => {
        if (!timeRegDomain) return false;
        const regDate = new Date(timeRegDomain);
        const today = new Date();
        const elevenMonthsAgo = new Date(today.setMonth(today.getMonth() - 11));
        return regDate < elevenMonthsAgo;
    };

    const handleDeleteTempData = async (serverUrl: string) => {
        if (!domainInfo?.domain || !token) return;
        try {
            await axios.post(
                `http://${serverUrl}/api/site/delete`,
                {
                    url: `https://${domainInfo.domain}`,
                    username: domainInfo.user_aplication,
                    password: domainInfo.password_aplication,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setServerData((prev) => prev.map((item) => (item.url === serverUrl ? { ...item, has_temp: undefined } : item)));
        } catch (error) {
            console.error('Error deleting temp data:', error);
        }
    };
    const handleDelete = async (record: { post_id: string; primary_key: string; url: string }) => {
        if (!domainInfo?.domain) return;
        const serverUrl = activeServer ? activeServer.url : '';
        try {
            const response = await axios.post(
                `http://${serverUrl}/api/site/delete_posts`,
                {
                    post_data: [
                        {
                            post_id: parseInt(record.post_id),
                            primary_key: record.primary_key,
                        },
                    ],
                    username: domainInfo.user_aplication,
                    password: domainInfo.password_aplication,
                    url: 'https://' + domainInfo.domain,
                },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
            );
            if (response.status === 200) {
                setData((prev) => prev.filter((item) => item.post_id !== record.post_id));
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleDeleteSelected = async () => {
        const serverUrl = activeServer ? activeServer.url : '';
        try {
            const payload = {
                post_data: selectedRecords.map((record) => ({
                    post_id: parseInt(record.post_id),
                    primary_key: record.primary_key,
                })),
                username: domainInfo.user_aplication,
                password: domainInfo.password_aplication,
                url: 'https://' + domainInfo.domain,
            };
            const response = await axios.post(`http://${serverUrl}/api/site/delete_posts`, payload, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setData((prev) => prev.filter((item) => !selectedRecords.some((selected) => selected.post_id === item.post_id)));
                setSelectedRecords([]);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const allServerDomainNull = serverData.length > 0 ? serverData.every((item) => item.domain_id == null) : true;
    const currentServerForDelete = serverData.find((item) => item.url === (activeServer ? activeServer.url : domainInfo?.domain));
    const columns = isImported
        ? [
              {
                  accessor: 'crawl_keyword',
                  title: 'Từ khóa crawl',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
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
              },
              {
                  accessor: 'name_uppercase',
                  title: 'Name Uppercase',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'url',
                  title: 'URL',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
                  render: (row: ExcelRow) => (
                      <a href={row.url} target="_blank" rel="noreferrer">
                          {row.url}
                      </a>
                  ),
              },
          ]
        : [
              {
                  accessor: 'id',
                  title: 'ID',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
                  render: (row: ExcelRow) => <span>{row.id}</span>,
              },
              {
                  accessor: 'url',
                  title: 'URL',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
                  render: (row: ExcelRow) => (
                      <a href={row.url} target="_blank" rel="noreferrer">
                          {row.url}
                      </a>
                  ),
              },
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
                  render: (row: ExcelRow) => {
                      const formatted = row.secondary_key?.replace(/\n/g, ', ') || '';
                      return (
                          <Tippy content={formatted}>
                              <span
                                  style={{
                                      display: 'inline-block',
                                      maxWidth: '200px',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                      textOverflow: 'ellipsis',
                                  }}
                              >
                                  {formatted}
                              </span>
                          </Tippy>
                      );
                  },
              },
              {
                  accessor: 'h1',
                  title: 'H1',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'title',
                  title: 'Title',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'description',
                  title: 'Description',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'post_id',
                  title: 'Post ID',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'link_in',
                  title: 'Link IN',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'link_out',
                  title: 'Link OUT',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'is_done',
                  title: 'Trạng thái',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'number_of_words',
                  title: 'Số từ',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
              },
              {
                  accessor: 'time_done',
                  title: 'Thời gian hoàn thành',
                  sortable: true,
                  textAlignment: 'left' as DataTableColumnTextAlignment,
                  render: (row: ExcelRow) => {
                      const time_done = Number(row.time_done);
                      const hours = Math.floor(time_done / 3600);
                      const minutes = Math.floor((time_done % 3600) / 60);
                      const seconds = Math.floor(time_done % 60);

                      const formattedTime = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

                      return <div>{formattedTime}</div>;
                  },
              },

              {
                  accessor: 'action',
                  title: 'Hành động',
                  textAlignment: 'center' as DataTableColumnTextAlignment,
                  render: (row: ExcelRow) => (
                      <div className="flex items-center justify-center gap-2">
                          {row.post_id != null && (
                              <>
                                  <a
                                      href={
                                          'https://' +
                                          domainInfo.domain +
                                          '/auto-login-page?user=' +
                                          domainInfo.user_admin +
                                          '&pass=' +
                                          domainInfo.password_admin +
                                          '&redirect=' +
                                          domainInfo.domain +
                                          '/wp-admin/post.php?post=' +
                                          row.post_id +
                                          '&action=edit'
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                  >
                                      <IconEdit className="text-warning" />
                                  </a>
                                  <button onClick={() => handleDelete({ url: row.url, post_id: row.post_id, primary_key: row.primary_key })}>
                                      <IconTrash className="text-danger" />
                                  </button>
                              </>
                          )}
                      </div>
                  ),
              },
          ];
    return (
        <>
            <div>
                <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                    <div>
                        {isServerRunning && (
                            <div className="flex flex-col items-center gap-2 w-full mb-4 mx-auto">
                                <span className="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-transparent border-l-primary align-middle"></span>
                                <div className="whitespace-nowrap text-center text-lg text-primary">Đang tạo bài viết...</div>
                                {estimatedTimeRemaining && (
                                    <div className="text-center text-sm text-gray-500">
                                        Thời gian dự kiến hoàn thành: <span className="font-bold">{estimatedTimeRemaining}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="invoice-table">
                        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row justify-between items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                                <button type="button" className="btn btn-success gap-2 flex items-center" onClick={handleButtonClick}>
                                    <p className="whitespace-nowrap">Import Excel</p>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" onChange={handleImportExcel} />
                                </button>
                                <button type="button" disabled={importedExcelData.length === 0} className="btn btn-info gap-2 flex items-center" onClick={handleExport}>
                                    <p className="whitespace-nowrap">Export Excel</p>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary gap-2 flex items-center"
                                    onClick={() => {
                                        setTempPromptConfig(promptConfig);
                                        setModalPromptConfig(true);
                                    }}
                                    disabled={importedExcelData.length === 0}
                                >
                                    <p className="whitespace-nowrap">Cấu hình Prompt Auto</p>
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
                                                            {item.domain_id === domainInfo?.id ? ` | ${domainInfo?.domain}` : ''}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`size-2 rounded-full ${
                                                                    item.timedOut ? 'bg-danger' : item.loading ? 'bg-primary' : item.is_running ? 'bg-danger' : 'bg-success'
                                                                }`}
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
                                    className="btn btn-danger gap-2 flex items-center"
                                    onClick={() => handleDeleteTempData(activeServer ? activeServer.url : '')}
                                    disabled={currentServerForDelete?.is_delete}
                                >
                                    Xóa
                                </button>
                                <button type="button" className="btn btn-danger gap-2 flex items-center" onClick={handleDeleteSelected} disabled={selectedRecords.length === 0}>
                                    Xóa bài viết đã chọn
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
                                    className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white w-full min-w-60"
                                />
                                <button type="button" className="btn btn-secondary gap-2 flex items-center" onClick={refreshData}>
                                    <p className="whitespace-nowrap">Làm mới</p>
                                </button>
                                <button
                                    type="button"
                                    className={`btn gap-2 flex items-center ${
                                        isServerRunning ? 'btn-primary' : importedExcelData.length === 0 || !allServerDomainNull ? 'btn-disabled' : 'btn-success'
                                    }`}
                                    onClick={handleSyncData}
                                    disabled={isServerRunning ? false : importedExcelData.length === 0 || !allServerDomainNull}
                                >
                                    <p className="whitespace-nowrap">{isServerRunning ? 'Tạm dừng' : 'Đồng bộ dữ liệu'}</p>
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
                                rowClassName={(record: ExcelRow) => (isDomainExpired((record as any).timeRegDomain) ? '!bg-red-300 hover:!bg-red-200 text-black' : '')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Transition appear show={modalDanhmuc}>
                <Dialog as="div" open={modalDanhmuc} onClose={() => setModalDanhmuc(false)}>
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">Danh mục</h5>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModalDanhmuc(false)}>
                                                Hủy
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setModalDanhmuc(false)}>
                                                Lưu
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={modalPromptConfig}>
                <Dialog as="div" open={modalPromptConfig} onClose={() => {}} static>
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-auto max-w-3xl text-black dark:text-white-dark w-full min-w-[70vw] max-h-[80vh]">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">Cấu hình Prompt Auto</h5>
                                        <div className="flex items-center space-x-2">
                                            <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                    btnClassName="btn btn-secondary dropdown-toggle"
                                                    button={
                                                        <div className="flex items-center space-x-2">
                                                            <p className="whitespace-nowrap">Mẫu Prompt Auto</p>
                                                        </div>
                                                    }
                                                >
                                                    <ul className="min-w-[170px]">
                                                        {autoPrompts.map((p: any) => (
                                                            <li key={p.id}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const fields = JSON.parse(p.content);
                                                                        ['prompt_system', 'prompt_keywords'].forEach((key) => {
                                                                            if (typeof fields[key] === 'string') {
                                                                                fields[key] = { content: fields[key], type: null, model: null };
                                                                            }
                                                                        });
                                                                        setTempPromptConfig(fields);
                                                                    }}
                                                                >
                                                                    {p.name}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                            <button type="button" className="btn btn-info gap-2 flex items-center" onClick={() => router.push('/prompt')}>
                                                <p className="whitespace-nowrap">Thêm Prompt</p>
                                            </button>
                                            <button type="button" className="btn btn-primary gap-2 flex items-center" onClick={() => router.push('/ai-model')}>
                                                <p className="whitespace-nowrap">Setting AI</p>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-2 custom-select">
                                        {tempPromptConfig &&
                                            promptFields.map((field) => (
                                                <div key={field.key} className="mb-4">
                                                    <div className="font-medium text-start w-full">{field.label}</div>
                                                    <div className="flex gap-2 items-start">
                                                        <textarea
                                                            className="w-full border p-2 rounded form-textarea"
                                                            rows={6}
                                                            value={tempPromptConfig[field.key]?.content || ''}
                                                            onChange={(e) => setTempPromptConfig((prev) => (prev ? { ...prev, [field.key]: { ...prev[field.key], content: e.target.value } } : prev))}
                                                        ></textarea>
                                                        {field.key !== 'prompt_system' && field.key !== 'prompt_keywords' && (
                                                            <div className="flex gap-2 flex-col">
                                                                <Select
                                                                    options={aiTypes}
                                                                    value={tempPromptConfig[field.key]?.type}
                                                                    onChange={(option) =>
                                                                        setTempPromptConfig((prev) => (prev ? { ...prev, [field.key]: { ...prev[field.key], type: option, model: null } } : prev))
                                                                    }
                                                                    placeholder="Prompt Type"
                                                                    className="whitespace-nowrap w-60"
                                                                />
                                                                <Select
                                                                    options={getModelOptions(tempPromptConfig[field.key]?.type)}
                                                                    value={tempPromptConfig[field.key]?.model}
                                                                    onChange={(option) =>
                                                                        setTempPromptConfig((prev) => (prev ? { ...prev, [field.key]: { ...prev[field.key], model: option } } : prev))
                                                                    }
                                                                    placeholder="Prompt Model"
                                                                    isDisabled={!tempPromptConfig[field.key]?.type}
                                                                    className="whitespace-nowrap w-60"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <hr className="mt-2" />
                                                </div>
                                            ))}
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setModalPromptConfig(false)}>
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                onClick={() => {
                                                    if (tempPromptConfig) {
                                                        setPromptConfig(tempPromptConfig);
                                                    }
                                                    setModalPromptConfig(false);
                                                }}
                                            >
                                                Lưu
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
