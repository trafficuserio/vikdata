'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

interface RankKeyData {
    id: number;
    keyword: string;
    url_keyword: string;
    rank_keyword: number;
    day: string;
    domain_id: number;
}

interface ApiResponse {
    errorcode: number;
    message: string;
    data: {
        count: number;
        rows: RankKeyData[];
        totalPage: number;
    };
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const ComponentReadDomainRankKey: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const token = Cookies.get('token');

    const [rankKeyData, setRankKeyData] = useState<RankKeyData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [sortBy, setSortBy] = useState<keyof RankKeyData>('keyword');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>('');

    const [showModal, setShowModal] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState<string>('');
    const [urlKeyword, setUrlKeyword] = useState<string>('');
    const [geolocation, setGeolocation] = useState<string>('vn');
    const [hostLanguage, setHostLanguage] = useState<string>('vi');

    const geolocationOptions = [
        { value: 'af', label: 'af' },
        { value: 'al', label: 'al' },
        { value: 'dz', label: 'dz' },
        { value: 'as', label: 'as' },
        { value: 'ad', label: 'ad' },
        { value: 'ao', label: 'ao' },
        { value: 'ai', label: 'ai' },
        { value: 'aq', label: 'aq' },
        { value: 'ag', label: 'ag' },
        { value: 'ar', label: 'ar' },
        { value: 'am', label: 'am' },
        { value: 'aw', label: 'aw' },
        { value: 'au', label: 'au' },
        { value: 'at', label: 'at' },
        { value: 'az', label: 'az' },
        { value: 'bs', label: 'bs' },
        { value: 'bh', label: 'bh' },
        { value: 'bd', label: 'bd' },
        { value: 'bb', label: 'bb' },
        { value: 'by', label: 'by' },
        { value: 'be', label: 'be' },
        { value: 'bz', label: 'bz' },
        { value: 'bj', label: 'bj' },
        { value: 'bm', label: 'bm' },
        { value: 'bt', label: 'bt' },
        { value: 'bo', label: 'bo' },
        { value: 'ba', label: 'ba' },
        { value: 'bw', label: 'bw' },
        { value: 'bv', label: 'bv' },
        { value: 'br', label: 'br' },
        { value: 'io', label: 'io' },
        { value: 'bn', label: 'bn' },
        { value: 'bg', label: 'bg' },
        { value: 'bf', label: 'bf' },
        { value: 'bi', label: 'bi' },
        { value: 'kh', label: 'kh' },
        { value: 'cm', label: 'cm' },
        { value: 'ca', label: 'ca' },
        { value: 'cv', label: 'cv' },
        { value: 'ky', label: 'ky' },
        { value: 'cf', label: 'cf' },
        { value: 'td', label: 'td' },
        { value: 'cl', label: 'cl' },
        { value: 'cn', label: 'cn' },
        { value: 'cx', label: 'cx' },
        { value: 'cc', label: 'cc' },
        { value: 'co', label: 'co' },
        { value: 'km', label: 'km' },
        { value: 'cg', label: 'cg' },
        { value: 'cd', label: 'cd' },
        { value: 'ck', label: 'ck' },
        { value: 'cr', label: 'cr' },
        { value: 'ci', label: 'ci' },
        { value: 'hr', label: 'hr' },
        { value: 'cu', label: 'cu' },
        { value: 'cy', label: 'cy' },
        { value: 'cz', label: 'cz' },
        { value: 'dk', label: 'dk' },
        { value: 'dj', label: 'dj' },
        { value: 'dm', label: 'dm' },
        { value: 'do', label: 'do' },
        { value: 'ec', label: 'ec' },
        { value: 'eg', label: 'eg' },
        { value: 'sv', label: 'sv' },
        { value: 'gq', label: 'gq' },
        { value: 'er', label: 'er' },
        { value: 'ee', label: 'ee' },
        { value: 'et', label: 'et' },
        { value: 'fk', label: 'fk' },
        { value: 'fo', label: 'fo' },
        { value: 'fj', label: 'fj' },
        { value: 'fi', label: 'fi' },
        { value: 'fr', label: 'fr' },
        { value: 'gf', label: 'gf' },
        { value: 'pf', label: 'pf' },
        { value: 'tf', label: 'tf' },
        { value: 'ga', label: 'ga' },
        { value: 'gm', label: 'gm' },
        { value: 'ge', label: 'ge' },
        { value: 'de', label: 'de' },
        { value: 'gh', label: 'gh' },
        { value: 'gi', label: 'gi' },
        { value: 'gr', label: 'gr' },
        { value: 'gl', label: 'gl' },
        { value: 'gd', label: 'gd' },
        { value: 'gp', label: 'gp' },
        { value: 'gu', label: 'gu' },
        { value: 'gt', label: 'gt' },
        { value: 'gn', label: 'gn' },
        { value: 'gw', label: 'gw' },
        { value: 'gy', label: 'gy' },
        { value: 'ht', label: 'ht' },
        { value: 'hm', label: 'hm' },
        { value: 'va', label: 'va' },
        { value: 'hn', label: 'hn' },
        { value: 'hk', label: 'hk' },
        { value: 'hu', label: 'hu' },
        { value: 'is', label: 'is' },
        { value: 'in', label: 'in' },
        { value: 'id', label: 'id' },
        { value: 'ir', label: 'ir' },
        { value: 'iq', label: 'iq' },
        { value: 'ie', label: 'ie' },
        { value: 'il', label: 'il' },
        { value: 'it', label: 'it' },
        { value: 'jm', label: 'jm' },
        { value: 'jp', label: 'jp' },
        { value: 'jo', label: 'jo' },
        { value: 'kz', label: 'kz' },
        { value: 'ke', label: 'ke' },
        { value: 'ki', label: 'ki' },
        { value: 'kp', label: 'kp' },
        { value: 'kr', label: 'kr' },
        { value: 'kw', label: 'kw' },
        { value: 'kg', label: 'kg' },
        { value: 'la', label: 'la' },
        { value: 'lv', label: 'lv' },
        { value: 'lb', label: 'lb' },
        { value: 'ls', label: 'ls' },
        { value: 'lr', label: 'lr' },
        { value: 'ly', label: 'ly' },
        { value: 'li', label: 'li' },
        { value: 'lt', label: 'lt' },
        { value: 'lu', label: 'lu' },
        { value: 'mo', label: 'mo' },
        { value: 'mk', label: 'mk' },
        { value: 'mg', label: 'mg' },
        { value: 'mw', label: 'mw' },
        { value: 'my', label: 'my' },
        { value: 'mv', label: 'mv' },
        { value: 'ml', label: 'ml' },
        { value: 'mt', label: 'mt' },
        { value: 'mh', label: 'mh' },
        { value: 'mq', label: 'mq' },
        { value: 'mr', label: 'mr' },
        { value: 'mu', label: 'mu' },
        { value: 'yt', label: 'yt' },
        { value: 'mx', label: 'mx' },
        { value: 'fm', label: 'fm' },
        { value: 'md', label: 'md' },
        { value: 'mc', label: 'mc' },
        { value: 'mn', label: 'mn' },
        { value: 'ms', label: 'ms' },
        { value: 'ma', label: 'ma' },
        { value: 'mz', label: 'mz' },
        { value: 'mm', label: 'mm' },
        { value: 'na', label: 'na' },
        { value: 'nr', label: 'nr' },
        { value: 'np', label: 'np' },
        { value: 'nl', label: 'nl' },
        { value: 'an', label: 'an' },
        { value: 'nc', label: 'nc' },
        { value: 'nz', label: 'nz' },
        { value: 'ni', label: 'ni' },
        { value: 'ne', label: 'ne' },
        { value: 'ng', label: 'ng' },
        { value: 'nu', label: 'nu' },
        { value: 'nf', label: 'nf' },
        { value: 'mp', label: 'mp' },
        { value: 'no', label: 'no' },
        { value: 'om', label: 'om' },
        { value: 'pk', label: 'pk' },
        { value: 'pw', label: 'pw' },
        { value: 'ps', label: 'ps' },
        { value: 'pa', label: 'pa' },
        { value: 'pg', label: 'pg' },
        { value: 'py', label: 'py' },
        { value: 'pe', label: 'pe' },
        { value: 'ph', label: 'ph' },
        { value: 'pn', label: 'pn' },
        { value: 'pl', label: 'pl' },
        { value: 'pt', label: 'pt' },
        { value: 'pr', label: 'pr' },
        { value: 'qa', label: 'qa' },
        { value: 're', label: 're' },
        { value: 'ro', label: 'ro' },
        { value: 'ru', label: 'ru' },
        { value: 'rw', label: 'rw' },
        { value: 'sh', label: 'sh' },
        { value: 'kn', label: 'kn' },
        { value: 'lc', label: 'lc' },
        { value: 'pm', label: 'pm' },
        { value: 'vc', label: 'vc' },
        { value: 'ws', label: 'ws' },
        { value: 'sm', label: 'sm' },
        { value: 'st', label: 'st' },
        { value: 'sa', label: 'sa' },
        { value: 'sn', label: 'sn' },
        { value: 'cs', label: 'cs' },
        { value: 'sc', label: 'sc' },
        { value: 'sl', label: 'sl' },
        { value: 'sg', label: 'sg' },
        { value: 'sk', label: 'sk' },
        { value: 'si', label: 'si' },
        { value: 'sb', label: 'sb' },
        { value: 'so', label: 'so' },
        { value: 'za', label: 'za' },
        { value: 'gs', label: 'gs' },
        { value: 'es', label: 'es' },
        { value: 'lk', label: 'lk' },
        { value: 'sd', label: 'sd' },
        { value: 'sr', label: 'sr' },
        { value: 'sj', label: 'sj' },
        { value: 'sz', label: 'sz' },
        { value: 'se', label: 'se' },
        { value: 'ch', label: 'ch' },
        { value: 'sy', label: 'sy' },
        { value: 'tw', label: 'tw' },
        { value: 'tj', label: 'tj' },
        { value: 'tz', label: 'tz' },
        { value: 'th', label: 'th' },
        { value: 'tl', label: 'tl' },
        { value: 'tg', label: 'tg' },
        { value: 'tk', label: 'tk' },
        { value: 'to', label: 'to' },
        { value: 'tt', label: 'tt' },
        { value: 'tn', label: 'tn' },
        { value: 'tr', label: 'tr' },
        { value: 'tm', label: 'tm' },
        { value: 'tc', label: 'tc' },
        { value: 'tv', label: 'tv' },
        { value: 'ug', label: 'ug' },
        { value: 'ua', label: 'ua' },
        { value: 'ae', label: 'ae' },
        { value: 'uk', label: 'uk' },
        { value: 'us', label: 'us' },
        { value: 'um', label: 'um' },
        { value: 'uy', label: 'uy' },
        { value: 'uz', label: 'uz' },
        { value: 'vu', label: 'vu' },
        { value: 've', label: 've' },
        { value: 'vn', label: 'vn' },
        { value: 'vg', label: 'vg' },
        { value: 'vi', label: 'vi' },
        { value: 'wf', label: 'wf' },
        { value: 'eh', label: 'eh' },
        { value: 'ye', label: 'ye' },
        { value: 'zm', label: 'zm' },
        { value: 'zw', label: 'zw' },
    ];

    const hostLanguageOptions = [
        { value: 'af', label: 'af' },
        { value: 'sq', label: 'sq' },
        { value: 'sm', label: 'sm' },
        { value: 'ar', label: 'ar' },
        { value: 'az', label: 'az' },
        { value: 'eu', label: 'eu' },
        { value: 'be', label: 'be' },
        { value: 'bn', label: 'bn' },
        { value: 'bh', label: 'bh' },
        { value: 'bs', label: 'bs' },
        { value: 'bg', label: 'bg' },
        { value: 'ca', label: 'ca' },
        { value: 'zh-CN', label: 'zh-CN' },
        { value: 'zh-TW', label: 'zh-TW' },
        { value: 'hr', label: 'hr' },
        { value: 'cs', label: 'cs' },
        { value: 'da', label: 'da' },
        { value: 'nl', label: 'nl' },
        { value: 'en', label: 'en' },
        { value: 'eo', label: 'eo' },
        { value: 'et', label: 'et' },
        { value: 'fo', label: 'fo' },
        { value: 'fi', label: 'fi' },
        { value: 'fr', label: 'fr' },
        { value: 'fy', label: 'fy' },
        { value: 'gl', label: 'gl' },
        { value: 'ka', label: 'ka' },
        { value: 'de', label: 'de' },
        { value: 'el', label: 'el' },
        { value: 'gu', label: 'gu' },
        { value: 'iw', label: 'iw' },
        { value: 'hi', label: 'hi' },
        { value: 'hu', label: 'hu' },
        { value: 'is', label: 'is' },
        { value: 'id', label: 'id' },
        { value: 'ia', label: 'ia' },
        { value: 'ga', label: 'ga' },
        { value: 'it', label: 'it' },
        { value: 'ja', label: 'ja' },
        { value: 'jw', label: 'jw' },
        { value: 'kn', label: 'kn' },
        { value: 'ko', label: 'ko' },
        { value: 'la', label: 'la' },
        { value: 'lv', label: 'lv' },
        { value: 'lt', label: 'lt' },
        { value: 'mk', label: 'mk' },
        { value: 'ms', label: 'ms' },
        { value: 'ml', label: 'ml' },
        { value: 'mt', label: 'mt' },
        { value: 'mr', label: 'mr' },
        { value: 'ne', label: 'ne' },
        { value: 'no', label: 'no' },
        { value: 'nn', label: 'nn' },
        { value: 'oc', label: 'oc' },
        { value: 'fa', label: 'fa' },
        { value: 'pl', label: 'pl' },
        { value: 'pt-BR', label: 'pt-BR' },
        { value: 'pt-PT', label: 'pt-PT' },
        { value: 'pa', label: 'pa' },
        { value: 'ro', label: 'ro' },
        { value: 'ru', label: 'ru' },
        { value: 'gd', label: 'gd' },
        { value: 'sr', label: 'sr' },
        { value: 'si', label: 'si' },
        { value: 'sk', label: 'sk' },
        { value: 'sl', label: 'sl' },
        { value: 'es', label: 'es' },
        { value: 'su', label: 'su' },
        { value: 'sw', label: 'sw' },
        { value: 'sv', label: 'sv' },
        { value: 'tl', label: 'tl' },
        { value: 'ta', label: 'ta' },
        { value: 'te', label: 'te' },
        { value: 'th', label: 'th' },
        { value: 'ti', label: 'ti' },
        { value: 'tr', label: 'tr' },
        { value: 'uk', label: 'uk' },
        { value: 'ur', label: 'ur' },
        { value: 'uz', label: 'uz' },
        { value: 'vi', label: 'vi' },
        { value: 'cy', label: 'cy' },
        { value: 'xh', label: 'xh' },
        { value: 'zu', label: 'zu' },
    ];

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const fetchRankKeyData = async () => {
        if (!domainId || !startDate || !endDate) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                domainId: domainId.toString(),
                startTime: dayjs(startDate).format('YYYY-MM-DD'),
                endTime: dayjs(endDate).format('YYYY-MM-DD'),
                page: page.toString(),
                limit: limit.toString(),
            });
            const url = `${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/get-data-rank-keyword-by-domain-id?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu từ API');
            }
            const result: ApiResponse = await response.json();
            if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            } else if (result.errorcode !== 200) {
                throw new Error(result.message || 'Lỗi không xác định');
            }
            let data = result.data.rows;
            if (search.trim() !== '') {
                const searchLower = search.toLowerCase();
                data = data.filter((item) => item.keyword.toLowerCase().includes(searchLower));
            }
            data.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                if (sortBy === 'day') {
                    const aDate = dayjs(aValue).unix();
                    const bDate = dayjs(bValue).unix();
                    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
                }
                return 0;
            });
            setRankKeyData(data);
            setTotal(result.data.count);
        } catch (err: any) {
            console.error('Error fetching rank key data:', err);
            setError(err.message || 'Lỗi khi lấy dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const searchParams = useSearchParams();
    const domainIdParam = searchParams.get('id');
    const domainId = domainIdParam ? parseInt(domainIdParam, 10) : null;
    const router = useRouter();

    async function insertInforKeyword() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/insert-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dataKeyword: [
                        {
                            keyword,
                            urlKeyword,
                            geolocation,
                            hostLanguage,
                        },
                    ],
                    domainId: domainId,
                }),
            });
            const result = await response.json();
            if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm dữ liệu thành công' });
            } else if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
            } else {
                ShowMessageError({ content: result.message || 'Lỗi khi thêm dữ liệu' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi gọi API thêm dữ liệu' });
        }
    }

    async function updateInforKeyword() {
        if (!keyword.trim() || !urlKeyword.trim() || !currentId) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            return;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/update-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: currentId,
                    keyword,
                    urlKeyword,
                }),
            });
            const result = await response.json();
            if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Cập nhật dữ liệu thành công' });
            } else if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
            } else {
                ShowMessageError({ content: result.message || 'Lỗi khi cập nhật dữ liệu' });
            }
        } catch {
            ShowMessageError({ content: 'Lỗi khi gọi API cập nhật dữ liệu' });
        }
    }

    const handleSubmit = async () => {
        if (isEdit) {
            await updateInforKeyword();
        } else {
            await insertInforKeyword();
        }
        setShowModal(false);
        fetchRankKeyData();
    };

    useEffect(() => {
        fetchRankKeyData();
    }, [domainId, startDate, endDate, page, limit, sortBy, sortOrder, search]);

    const columns: DataTableColumn<RankKeyData>[] = [
        { accessor: 'keyword', title: 'Từ khóa', sortable: true },
        {
            accessor: 'url_keyword',
            title: 'URL',
            sortable: false,
            render: ({ url_keyword }) => (
                <a href={url_keyword} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {url_keyword}
                </a>
            ),
        },
        { accessor: 'day', title: 'Ngày', sortable: true, render: ({ day }) => dayjs(day).format('DD/MM/YYYY') },
        // { accessor: 'geolocation', title: 'Geolocation', sortable: true, render: ({ geolocation }) => formatNumber(geolocation) },
        // { accessor: 'host_lang', title: 'Host Lang', sortable: true, render: ({ host_lang }) => formatNumber(host_lang) },
        { accessor: 'rank_keyword', title: 'Thứ hạng', sortable: true, render: ({ rank_keyword }) => formatNumber(rank_keyword) },

        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center',
            render: (record) => (
                <div className="justify-center flex flex-col gap-1">
                    <button
                        onClick={() => {
                            setIsEdit(true);
                            setCurrentId(record.id);
                            setKeyword(record.keyword);
                            setUrlKeyword(record.url_keyword);
                            setShowModal(true);
                        }}
                        className="hover:underline"
                    >
                        Chỉnh sửa
                    </button>
                    <button onClick={() => handleDeleteSingle(record.id)} className="hover:underline">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    async function handleDeleteSingle(id: number) {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/delete-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: [id] }),
            });
            const json = await res.json();
            if ([401, 403].includes(json.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout();
                return;
            } else if (json?.errorcode === 200) {
                ShowMessageSuccess({ content: 'Xóa thành công!' });
                fetchRankKeyData();
            } else {
                ShowMessageError({ content: 'Xóa thất bại!' });
            }
        } catch {
            ShowMessageError({ content: 'Lỗi khi xóa' });
        }
    }

    return (
        <div>
            {isLoading && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}
            {error && <div className="text-red-500 mt-4">{error}</div>}
            <div className="panel mt-4 border-white-light px-0 dark:border-[#1b2e4b]">
                {!isLoading && !error && (
                    <>
                        <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                            <h5 className="text-lg font-semibold dark:text-white">Google Rank Keyword - Chi tiết từ khóa</h5>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Tìm kiếm từ khóa..."
                                    className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        setIsEdit(false);
                                        setKeyword('');
                                        setUrlKeyword('');
                                        setGeolocation('vn');
                                        setHostLanguage('vi');
                                        setShowModal(true);
                                    }}
                                    className="btn btn-primary"
                                >
                                    Thêm mới
                                </button>
                            </div>
                        </div>
                        <div className="datatables pagination-padding overflow-auto">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={rankKeyData}
                                columns={columns}
                                totalRecords={total}
                                recordsPerPage={limit}
                                page={page}
                                onPageChange={setPage}
                                recordsPerPageOptions={[10, 20, 30, 50, 100]}
                                onRecordsPerPageChange={(size) => {
                                    setLimit(size);
                                    setPage(1);
                                }}
                                sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
                                onSortStatusChange={({ columnAccessor, direction }) => {
                                    setSortBy(columnAccessor as keyof RankKeyData);
                                    setSortOrder(direction as 'asc' | 'desc');
                                    setPage(1);
                                }}
                                paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                                highlightOnHover
                            />
                        </div>
                    </>
                )}
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="panel border-white-light px-0 dark:border-[#1b2e4b] p-4 bg-white dark:bg-black w-full max-w-3xl">
                        <p className="text-lg font-semibold dark:text-white px-4 mb-4">Thêm từ khoá</p>
                        <div className="grid grid-cols-1 gap-4 mb-4 px-4">
                            <div>
                                <label className="block mb-1">Keyword</label>
                                <input className="border p-2 rounded w-full form-input" placeholder="Nhập keyword..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                            </div>
                            <div>
                                <label className="block mb-1">URL Keyword</label>
                                <input className="border p-2 rounded w-full form-input" placeholder="Nhập URL..." value={urlKeyword} onChange={(e) => setUrlKeyword(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 px-4">
                            <div className="custom-select">
                                <label className="block mb-1">Geolocation</label>
                                <Select
                                    options={geolocationOptions}
                                    value={geolocationOptions.find((option) => option.value === geolocation)}
                                    onChange={(val) => setGeolocation(val?.value || 'vn')}
                                    placeholder="Chọn geolocation..."
                                />
                            </div>
                            <div className="custom-select">
                                <label className="block mb-1">Host Language</label>
                                <Select
                                    options={hostLanguageOptions}
                                    value={hostLanguageOptions.find((option) => option.value === hostLanguage)}
                                    onChange={(val) => setHostLanguage(val?.value || 'vi')}
                                    placeholder="Chọn host language..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-4 px-4">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline-danger">
                                Hủy
                            </button>
                            <button onClick={handleSubmit} className="btn btn-primary">
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentReadDomainRankKey;
