// app/components/domain/component-list-domain.tsx

'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sortBy as lodashSortBy } from 'lodash';
import { DataTable, DataTableColumn, DataTableSortStatus } from 'mantine-datatable';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconRefresh from '@/components/icon/icon-refresh';
import IconKeyword from '@/components/icon/icon-keyword';
import IconCalendar from '@/components/icon/icon-calendar';

import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import dayjs from 'dayjs';

const shortcutsItems = [
    {
        label: '7 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(7, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '14 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(14, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '30 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(30, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '60 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(60, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
];

interface KeyAnalytics {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}

interface KeySearchConsole {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}

interface ClientSecretAds {
    installed: {
        client_id: string;
        project_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}

interface DomainGoogleConsole {
    user_id: string;
    traffic_day: number;
    total_impressions_day: number;
    total_index: number;
    day: string;
}

interface DomainGoogleAnalytics {
    user_id: string;
    traffic_day: number;
    day: string;
}

interface DomainInforWebsiteWordpress {
    user_id: string;
    total_post_publish: number;
    total_post: number;
    total_page_publish: number;
    total_page: number;
    day: string;
}

interface InforWebDataGoogleAdsense {
    total_click: number;
    total_view: number;
    total_cpc: number;
    day: string;
}

interface DomainData {
    id: number;
    domain: string;
    typeSite: string;
    groupSite: string;
    person: string;
    keyAnalytics: KeyAnalytics;
    propertyId: string;
    keySearchConsole: KeySearchConsole;
    keyWordpress: string;
    keyAdsense: string;
    status: boolean;
    totalLink: number;
    timeIndex: string | null;
    timeRegDomain: string | null;
    fileKeyword: string;
    description?: string | null;
    refreshTokenAds: string;
    clientIdAds: string;
    clientSecretAds: ClientSecretAds;
    accountIdAds: string;
    domainGoogleConsoles: DomainGoogleConsole[];
    domainGoogleAnalytics: DomainGoogleAnalytics[];
    domainInforWebsiteWordpresses: DomainInforWebsiteWordpress[];
    inforWeb_dataGoogleAdsenses: InforWebDataGoogleAdsense[];
    totalPostPublish: number;
    totalPost: number;
    totalPagePublish: number;
    totalPage: number;
    total_key_ahrerf: number;
    traffic_ahrerf: number;
}

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

export default function ComponentListDomain() {
    const [domains, setDomains] = useState<DomainData[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'domain', direction: 'asc' });
    const [selectedRecords, setSelectedRecords] = useState<DomainData[]>([]);
    const token = Cookies.get('token');

    const [typeSite, setTypeSite] = useState('Tất cả');
    const [groupSite, setGroupSite] = useState('Tất cả');
    const [person, setPerson] = useState('Tất cả');

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-list-infor-domain?page=1&limit=100&byOrder=ASC&byField=domain`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            if (!data) {
                ShowMessageError({ content: 'Dữ liệu trả về không đúng cấu trúc' });
                return;
            }
            if ([401, 403].includes(data.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            }

            if (data.errorcode === 200) {
                const rows = data.data.rows || [];
                const mapped: DomainData[] = rows.map((item: any) => {
                    let totalPostPublish = 0;
                    let totalPost = 0;
                    let totalPagePublish = 0;
                    let totalPage = 0;

                    if (item.domain_inforWebsiteWordpresses && item.domain_inforWebsiteWordpresses.length > 0) {
                        const sortedWordpress = item.domain_inforWebsiteWordpresses.sort(
                            (a: DomainInforWebsiteWordpress, b: DomainInforWebsiteWordpress) => new Date(b.day).getTime() - new Date(a.day).getTime(),
                        );
                        const latestWordpress = sortedWordpress[0];
                        totalPostPublish = latestWordpress.total_post_publish;
                        totalPost = latestWordpress.total_post;
                        totalPagePublish = latestWordpress.total_page_publish;
                        totalPage = latestWordpress.total_page;
                    }

                    return {
                        id: item.id,
                        domain: item.domain || '',
                        typeSite: item.type_site || '',
                        groupSite: item.group_site || '',
                        person: item.person || '',
                        keyAnalytics: JSON.parse(item.key_analytics) || {},
                        propertyId: item.property_id || '',
                        keySearchConsole: JSON.parse(item.key_search_console) || {},
                        keyWordpress: item.key_wordpress || '',
                        keyAdsense: item.client_secret_ads || '',
                        status: item.status || null,
                        totalLink: item.total_link ? Number(item.total_link) : 0,
                        timeIndex: item.time_index || null,
                        timeRegDomain: item.time_reg_domain,
                        fileKeyword: item.file_key_word || '',
                        description: item.description || '',
                        refreshTokenAds: item.refresh_token_ads || '',
                        clientIdAds: item.client_id_ads || '',
                        clientSecretAds: JSON.parse(item.client_secret_ads) || {},
                        accountIdAds: item.account_id_ads || '',
                        domainGoogleConsoles: item.domain_googleConsoles || [],
                        domainGoogleAnalytics: item.domain_googleAnalytics || [],
                        domainInforWebsiteWordpresses: item.domain_inforWebsiteWordpresses || [],
                        inforWeb_dataGoogleAdsenses: item.inforWeb_dataGoogleAdsenses || [],
                        totalPostPublish: totalPostPublish || 0,
                        totalPost: totalPost || 0,
                        totalPagePublish: totalPagePublish || 0,
                        totalPage: totalPage || 0,
                        total_key_ahrerf: item.total_key_ahrerf || 0,
                        traffic_ahrerf: item.traffic_ahrerf || 0,
                    };
                });
                setDomains(mapped);
            } else {
                ShowMessageError({ content: data.message || 'Không thể tải danh sách tên miền' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
            console.error('Fetch data error:', error);
        }
    }

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = domains.filter((item) => {
            const s = search.toLowerCase();
            const matchesSearch =
                item.domain.toLowerCase().includes(s) ||
                item.typeSite.toLowerCase().includes(s) ||
                item.groupSite.toLowerCase().includes(s) ||
                item.person.toLowerCase().includes(s) ||
                (item.description || '').toLowerCase().includes(s);

            const matchesTypeSite = typeSite === 'Tất cả' || item.typeSite === typeSite;
            const matchesGroupSite = groupSite === 'Tất cả' || item.groupSite === groupSite;
            const matchesPerson = person === 'Tất cả' || item.person === person;

            const withinDateRange = !startDate || !endDate || (item.timeIndex && new Date(item.timeIndex) >= startDate && new Date(item.timeIndex) <= endDate);

            return matchesSearch && matchesTypeSite && matchesGroupSite && matchesPerson && withinDateRange;
        });
        if (sortStatus) {
            filtered = lodashSortBy(filtered, sortStatus.columnAccessor);
            if (sortStatus.direction === 'desc') {
                filtered = filtered.reverse();
            }
        }
        return filtered;
    }, [domains, search, sortStatus, typeSite, groupSite, person, startDate, endDate]);

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
    }, [totalPages, page]);

    const refreshData = (): void => {
        fetchData();
        ShowMessageSuccess({ content: 'Dữ liệu đã được làm mới' });
    };

    async function handleDelete(id: number | null = null) {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;

        try {
            if (id !== null) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/delete-infor-domain`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: [id] }),
                });
                const data = await res.json();
                if ([401, 403].includes(data.errorcode)) {
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                    logout();
                    return;
                } else if (data && data.errorcode === 200) {
                    ShowMessageSuccess({ content: 'Xóa thành công' });
                    fetchData();
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    ShowMessageError({ content: 'Xóa không thành công' });
                }
            } else {
                const ids = selectedRecords.map((item) => item.id);
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/delete-infor-domain`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: ids }),
                });
                const data = await res.json();
                if ([401, 403].includes(data.errorcode)) {
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                    logout();
                    return;
                } else if (data && data.errorcode === 200) {
                    ShowMessageSuccess({ content: 'Xóa thành công' });
                    fetchData();
                    setSelectedRecords([]);
                    setSearch('');
                    setPage(1);
                } else {
                    ShowMessageError({ content: 'Xóa không thành công' });
                }
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi xóa' });
            console.error('Handle delete error:', error);
        }
    }

    const columns: DataTableColumn<DomainData>[] = [
        {
            accessor: 'domain',
            title: 'Tên miền',
            sortable: true,
            textAlignment: 'left',
            render: ({ domain, id }) => (
                <Link href={`/domain/read?id=${id}`} className="text-blue-500 hover:text-blue-700">
                    {domain}
                </Link>
            ),
        },
        // {
        //     accessor: 'typeSite',
        //     title: 'Loại site',
        //     sortable: true,
        //     textAlignment: 'left',
        // },
        // {
        //     accessor: 'groupSite',
        //     title: 'Nhóm site',
        //     sortable: true,
        //     textAlignment: 'left',
        // },
        {
            accessor: 'person',
            title: 'Người phụ trách',
            sortable: true,
            textAlignment: 'left',
        },
        {
            accessor: 'timeIndex',
            title: 'Ngày Index',
            sortable: true,
            textAlignment: 'left',
            render: ({ timeIndex }) => (timeIndex ? new Date(timeIndex).toLocaleDateString() : ''),
        },
        // {
        //     accessor: 'status',
        //     title: 'Trạng thái',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ status }) => (
        //         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        //             {status ? 'Hoạt động' : 'Không hoạt động'}
        //         </span>
        //     ),
        // },
        {
            accessor: 'fileKeyword',
            title: 'Tập tin từ khóa',
            sortable: true,
            textAlignment: 'left',
            render: ({ fileKeyword }) => (
                <a href={fileKeyword} target="_blank" rel="noreferrer" className="block text-blue-500 hover:text-blue-700 max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
                    {fileKeyword}
                </a>
            ),
        },
        {
            accessor: 'totalLink',
            title: 'Tổng url',
            sortable: true,
            textAlignment: 'left',
            render: ({ totalLink }) => totalLink.toLocaleString(),
        },
        // {
        //     accessor: 'timeRegDomain',
        //     title: 'Ngày Reg Domain',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ timeRegDomain }) => (timeRegDomain ? new Date(timeRegDomain).toLocaleDateString() : ''),
        // },

        {
            accessor: 'totalPost',
            title: 'Tổng bài viết',
            sortable: true,
            textAlignment: 'left',
            render: ({ totalPost }) => totalPost.toLocaleString(),
        },
        {
            accessor: 'totalPostPublish',
            title: 'Bài viết đã đăng',
            sortable: true,
            textAlignment: 'left',
            render: ({ totalPostPublish }) => totalPostPublish.toLocaleString(),
        },
        // {
        //     accessor: 'totalPage',
        //     title: 'Tổng bài nháp',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ totalPage, totalPagePublish }) => (totalPage - totalPagePublish).toLocaleString(),
        // },
        // {
        //     accessor: 'totalPagePublish',
        //     title: 'Tổng trang đã xuất bản',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ totalPagePublish }) => totalPagePublish.toLocaleString(),
        // },
        // {
        //     accessor: 'totalPage',
        //     title: 'Tổng trang',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ totalPage }) => totalPage.toLocaleString(),
        // },
        // {
        //     accessor: 'totalPage',
        //     title: 'Tổng trang nháp',
        //     sortable: true,
        //     textAlignment: 'left',
        //     render: ({ totalPage, totalPagePublish }) => (totalPage - totalPagePublish).toLocaleString(),
        // },
        {
            accessor: 'traffic_day',
            title: 'Traffic Analytics',
            sortable: true,
            textAlignment: 'left',
            render: ({ domainGoogleAnalytics }) => {
                if (domainGoogleAnalytics && domainGoogleAnalytics.length > 0) {
                    return domainGoogleAnalytics[0].traffic_day.toLocaleString();
                }
                return '0';
            },
        },
        {
            accessor: 'traffic_day_gsc',
            title: 'Traffic GSC',
            sortable: true,
            textAlignment: 'left',
            render: ({ domainGoogleConsoles }) => {
                if (domainGoogleConsoles && domainGoogleConsoles.length > 0) {
                    return domainGoogleConsoles[0].traffic_day.toLocaleString();
                }
                return '0';
            },
        },
        {
            accessor: 'total_impressions_day',
            title: 'Lượt hiển thị GSC',
            sortable: true,
            textAlignment: 'left',
            render: ({ domainGoogleConsoles }) => {
                if (domainGoogleConsoles && domainGoogleConsoles.length > 0) {
                    return domainGoogleConsoles[0].total_impressions_day.toLocaleString();
                }
                return '0';
            },
        },
        {
            accessor: 'total_key_ahrerf',
            title: 'Từ khóa Ahrefs',
            sortable: true,
            textAlignment: 'left',
            render: ({ total_key_ahrerf }) => total_key_ahrerf.toLocaleString(),
        },
        {
            accessor: 'traffic_ahrerf',
            title: 'Traffic Ahrefs',
            sortable: true,
            textAlignment: 'left',
            render: ({ traffic_ahrerf }) => traffic_ahrerf.toLocaleString(),
        },
        {
            accessor: 'total_view',
            title: 'Virew Adsense',
            sortable: true,
            textAlignment: 'left',
            render: ({ inforWeb_dataGoogleAdsenses }) => {
                if (inforWeb_dataGoogleAdsenses && inforWeb_dataGoogleAdsenses.length > 0) {
                    return inforWeb_dataGoogleAdsenses[0].total_view.toLocaleString();
                }
                return '0';
            },
        },
        {
            accessor: 'total_click',
            title: 'Click Adsense',
            sortable: true,
            textAlignment: 'left',
            render: ({ inforWeb_dataGoogleAdsenses }) => {
                if (inforWeb_dataGoogleAdsenses && inforWeb_dataGoogleAdsenses.length > 0) {
                    return inforWeb_dataGoogleAdsenses[0].total_click.toLocaleString();
                }
                return '0';
            },
        },

        {
            accessor: 'total_cpc',
            title: 'CPC',
            sortable: true,
            textAlignment: 'left',
            render: ({ inforWeb_dataGoogleAdsenses }) => {
                if (inforWeb_dataGoogleAdsenses && inforWeb_dataGoogleAdsenses.length > 0) {
                    return inforWeb_dataGoogleAdsenses[0].total_cpc.toLocaleString();
                }
                return '0';
            },
        },
        {
            accessor: 'ctr',
            title: 'CTR',
            sortable: true,
            textAlignment: 'left',
            render: ({ inforWeb_dataGoogleAdsenses }) => {
                if (inforWeb_dataGoogleAdsenses && inforWeb_dataGoogleAdsenses.length > 0) {
                    const { total_click, total_view } = inforWeb_dataGoogleAdsenses[0];
                    const ctr = total_view > 0 ? ((total_click / total_view) * 100).toFixed(2) : '0.00';
                    return `${ctr}%`;
                }
                return '0.00%';
            },
        },
        {
            accessor: 'action',
            title: 'Hành động',
            sortable: false,
            textAlignment: 'center',
            render: (item) => (
                <div className="flex justify-center gap-4">
                    <Link href={`/domain/edit?id=${item.id}`} className="text-yellow-500 hover:text-yellow-700">
                        <IconEdit />
                    </Link>
                    <Link href={`/domain/keyword?id=${item.id}`} className="text-primary hover:text-primary-dark">
                        <IconKeyword />
                    </Link>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                        <IconTrash />
                    </button>
                </div>
            ),
        },
    ];

    const isDomainExpired = (timeRegDomain: string | null): boolean => {
        if (!timeRegDomain) return false;
        const regDate = new Date(timeRegDomain);
        const today = new Date();
        const elevenMonthsAgo = new Date(today.setMonth(today.getMonth() - 11));
        return regDate < elevenMonthsAgo;
    };

    const handleStartDateChange = (selectedDates: Date[]) => {
        const date = selectedDates[0] || null;
        setTempStartDate(date);
    };

    const handleEndDateChange = (selectedDates: Date[]) => {
        const date = selectedDates[0] || null;
        setTempEndDate(date);
    };

    const toggleDatePicker = () => {
        setIsDatePickerVisible((prev) => !prev);
        if (!isDatePickerVisible) {
            setTempStartDate(startDate);
            setTempEndDate(endDate);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current) {
            const flatpickrCalendars = document.querySelectorAll('.flatpickr-calendar');
            let clickInside = datePickerRef.current.contains(event.target as Node);
            flatpickrCalendars.forEach((calendar) => {
                if (calendar.contains(event.target as Node)) {
                    clickInside = true;
                }
            });
            if (!clickInside) {
                setIsDatePickerVisible(false);
            }
        }
    };

    useEffect(() => {
        if (isDatePickerVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerVisible]);

    const displayDateRange = () => {
        if (!startDate || !endDate) {
            return 'Tìm theo ngày Index';
        }
        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'day').startOf('day');

        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).startOf('day');

        const isSameDay = start.isSame(end, 'day');
        const isToday = end.isSame(today, 'day');
        const isYesterday = end.isSame(yesterday, 'day');

        if (isSameDay) {
            if (isToday) {
                return 'Hôm nay ' + end.format('DD/MM/YYYY');
            } else if (isYesterday) {
                return 'Hôm qua ' + end.format('DD/MM/YYYY');
            } else {
                return end.format('DD/MM/YYYY');
            }
        } else {
            const formattedStart = start.format('DD/MM/YYYY');
            if (isToday) {
                return `Từ ${formattedStart} đến Hôm nay`;
            } else if (isYesterday) {
                return `Từ ${formattedStart} đến Hôm qua`;
            } else {
                const formattedEnd = end.format('DD/MM/YYYY');
                return `Từ ${formattedStart} đến ${formattedEnd}`;
            }
        }
    };

    const applyDateRange = () => {
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setIsDatePickerVisible(false);
    };

    const handleShortcutClick = (shortcut: (typeof shortcutsItems)[0]) => {
        const [start, end] = shortcut.getValue();
        setTempStartDate(start);
        setTempEndDate(end);
        setStartDate(start);
        setEndDate(end);
        setIsDatePickerVisible(false);
    };

    return (
        <div className="p-4">
            <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/domain/add" className="btn btn-primary gap-2 flex items-center">
                                <IconPlus />
                                <p className="hidden md:block">Thêm Mới</p>
                            </Link>
                            <button type="button" className="btn btn-warning gap-2 flex items-center" onClick={() => refreshData()}>
                                <IconRefresh />
                                <p className="hidden md:block">Làm mới</p>
                            </button>
                            <button type="button" className="btn btn-danger gap-2 flex items-center" onClick={() => handleDelete()} disabled={selectedRecords.length === 0}>
                                <IconTrash />
                                <p className="hidden md:block">Xóa</p>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex w-full justify-end" ref={datePickerRef}>
                                <button className="btn btn-primary w-max whitespace-nowrap rounded px-3 py-1" onClick={toggleDatePicker}>
                                    <IconCalendar className="block h-5 w-5" />
                                    <p className="ml-2 hidden md:block">{!startDate && !endDate ? 'Tìm theo ngày Index' : displayDateRange()}</p>
                                </button>
                                {isDatePickerVisible && (
                                    <div className="absolute right-0 top-full z-10 mt-2 flex flex-col gap-2 rounded-lg border-[1px] !border-white bg-white px-6 py-4 !outline-none dark:!border-[#191e3a] dark:bg-black md:w-auto md:min-w-[400px] md:flex-row">
                                        <div className="flex flex-col gap-2">
                                            {shortcutsItems.map((shortcut, index) => (
                                                <button key={index} onClick={() => handleShortcutClick(shortcut)} className="btn btn-primary flex-1 whitespace-nowrap rounded px-3 py-1">
                                                    {shortcut.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex w-full flex-col justify-between gap-2">
                                            <div className="flex flex-1 flex-col gap-2">
                                                <p className="hidden md:block">Chọn ngày</p>
                                                <div>
                                                    <Flatpickr
                                                        value={tempStartDate || undefined}
                                                        options={{
                                                            dateFormat: 'd-m-Y',
                                                        }}
                                                        className="form-input"
                                                        placeholder="Chọn ngày bắt đầu"
                                                        onChange={handleStartDateChange}
                                                    />
                                                </div>
                                                <div>
                                                    <Flatpickr
                                                        value={tempEndDate || undefined}
                                                        options={{
                                                            dateFormat: 'd-m-Y',
                                                        }}
                                                        className="form-input"
                                                        placeholder="Chọn ngày kết thúc"
                                                        onChange={handleEndDateChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-0 flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setTempStartDate(startDate);
                                                        setTempEndDate(endDate);
                                                        setIsDatePickerVisible(false);
                                                    }}
                                                    className="btn btn-secondary flex-1 whitespace-nowrap rounded px-4 py-2"
                                                >
                                                    Hủy
                                                </button>
                                                <button onClick={applyDateRange} className="btn btn-success flex-1 whitespace-nowrap rounded px-4 py-2">
                                                    Áp dụng
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        </div>
                    </div>
                    <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={paginatedRecords}
                            columns={columns}
                            totalRecords={filteredAndSortedRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            sortStatus={sortStatus}
                            onSortStatusChange={({ columnAccessor, direction }) => {
                                setSortStatus({
                                    columnAccessor: columnAccessor as string,
                                    direction: direction as 'asc' | 'desc',
                                });
                                setPage(1);
                            }}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                            rowClassName={(record) => (isDomainExpired(record.timeRegDomain) ? '!bg-red-300 hover:!bg-red-200 text-black' : '')}
                        />
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center custom-select px-4">
                        <div>
                            <label>Loại site</label>
                            <Select
                                id="typeSite"
                                placeholder="Chọn loại site..."
                                options={typeSiteOptions}
                                value={typeSiteOptions.find((op) => op.value === typeSite)}
                                onChange={(val) => setTypeSite(val?.value || 'Tất cả')}
                                className="w-full md:w-[200px]"
                            />
                        </div>
                        <div>
                            <label>Nhóm site</label>
                            <Select
                                id="groupSite"
                                placeholder="Chọn nhóm site..."
                                options={groupSiteOptions}
                                value={groupSiteOptions.find((op) => op.value === groupSite)}
                                onChange={(val) => setGroupSite(val?.value || 'Tất cả')}
                                className="w-full md:w-[200px]"
                            />
                        </div>
                        <div>
                            <label>Người phụ trách</label>
                            <Select
                                id="person"
                                placeholder="Chọn người phụ trách..."
                                options={personOptions}
                                value={personOptions.find((op) => op.value === person)}
                                onChange={(val) => setPerson(val?.value || 'Tất cả')}
                                className="w-full md:w-[200px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
