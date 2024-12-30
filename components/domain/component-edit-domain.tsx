// app/components/domain/component-edit-domain.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from 'react-select';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import Cookies from 'js-cookie';
import logout from '@/utils/logout';

const typeSiteOptions = [
    { value: 'New', label: 'New' },
    { value: 'PBN - INET', label: 'PBN - INET' },
    { value: 'PBN - Global', label: 'PBN - Global' },
];

const groupSiteOptions = [
    { value: 'Hình Ảnh', label: 'Hình Ảnh' },
    { value: 'Hướng dẫn', label: 'Hướng dẫn' },
    { value: 'Tổng hợp', label: 'Tổng hợp' },
    { value: 'Học thuật', label: 'Học thuật' },
    { value: 'Toplist', label: 'Toplist' },
    { value: 'Bán hàng', label: 'Bán hàng' },
];

const personOptions = [
    { value: 'Dương', label: 'Dương' },
    { value: 'Linh', label: 'Linh' },
    { value: 'Nguyên', label: 'Nguyên' },
    { value: 'Khác', label: 'Khác' },
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
    status: boolean;
    totalLink: number;
    timeIndex: string;
    timeRegDomain: string;
    fileKeyword: string;
    description?: string | null;
    refreshTokenAds: string;
    clientSecretAds: ClientSecretAds;
    accountIdAds: string;
}

export default function ComponentEditDomain() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = Cookies.get('token');

    const domainId = searchParams.get('id');

    const [domain, setDomain] = useState('');
    const [typeSite, setTypeSite] = useState('');
    const [groupSite, setGroupSite] = useState('');
    const [person, setPerson] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [keyWordpress, setKeyWordpress] = useState('');
    const [accountIdAds, setAccountIdAds] = useState('');
    const [status, setStatus] = useState(false);
    const [totalLink, setTotalLink] = useState(0);
    const [timeIndex, setTimeIndex] = useState('');
    const [timeRegDomain, setTimeRegDomain] = useState('');
    const [fileKeyword, setFileKeyword] = useState('');
    const [description, setDescription] = useState('');

    const [keyAnalyticsJSON, setKeyAnalyticsJSON] = useState('');
    const [keySearchConsoleJSON, setKeySearchConsoleJSON] = useState('');
    const [clientSecretAdsJSON, setClientSecretAdsJSON] = useState('');

    const [refreshTokenAds, setRefreshTokenAds] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!domainId) {
            ShowMessageError({ content: 'ID tên miền không hợp lệ.' });
            router.push('/domain');
            return;
        }

        async function fetchDomainData() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id?id=${domainId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if ([401, 403].includes(data.errorcode)) {
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                    logout(router);
                    return;
                }

                if (data.errorcode === 200) {
                    const item: DomainData = {
                        id: data.data.id,
                        domain: data.data.domain,
                        typeSite: data.data.type_site,
                        groupSite: data.data.group_site,
                        person: data.data.person,
                        keyAnalytics: JSON.parse(data.data.key_analytics),
                        propertyId: data.data.property_id,
                        keySearchConsole: JSON.parse(data.data.key_search_console),
                        keyWordpress: data.data.key_wordpress,
                        refreshTokenAds: data.data.refresh_token_ads,
                        clientSecretAds: JSON.parse(data.data.client_secret_ads),
                        accountIdAds: data.data.account_id_ads || '',
                        status: data.data.status,
                        totalLink: Number(data.data.total_link) || 0,
                        timeIndex: data.data.time_index ? data.data.time_index.substring(0, 10) : '',
                        timeRegDomain: data.data.time_reg_domain ? data.data.time_reg_domain.substring(0, 10) : '',
                        fileKeyword: data.data.file_key_word || '',
                        description: data.data.description || '',
                    };

                    setDomain(item.domain);
                    setTypeSite(item.typeSite);
                    setGroupSite(item.groupSite);
                    setPerson(item.person);
                    setPropertyId(item.propertyId);
                    setKeyWordpress(item.keyWordpress);
                    setAccountIdAds(item.accountIdAds);
                    setStatus(item.status);
                    setTotalLink(item.totalLink);
                    setTimeIndex(item.timeIndex);
                    setTimeRegDomain(item.timeRegDomain);
                    setFileKeyword(item.fileKeyword);
                    setDescription(item.description || '');

                    setKeyAnalyticsJSON(JSON.stringify(item.keyAnalytics, null, 2));
                    setKeySearchConsoleJSON(JSON.stringify(item.keySearchConsole, null, 2));
                    setClientSecretAdsJSON(JSON.stringify(item.clientSecretAds, null, 2));
                    setRefreshTokenAds(item.refreshTokenAds);
                } else {
                    ShowMessageError({ content: data.message || 'Không thể tải thông tin tên miền.' });
                }
            } catch (error) {
                ShowMessageError({ content: 'Lỗi khi tải dữ liệu.' });
                console.error('Fetch domain data error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDomainData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domainId]);

    async function handleSubmit() {
        if (submitting) return;

        if (!domain.trim() || !typeSite.trim() || !groupSite.trim() || !person.trim() || !propertyId.trim() || !keyWordpress.trim() || !fileKeyword.trim()) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            return;
        }

        let keyAnalytics, keySearchConsole, clientSecretAds;
        try {
            keyAnalytics = JSON.parse(keyAnalyticsJSON);
        } catch (error) {
            ShowMessageError({ content: 'Key Analytics không phải là JSON hợp lệ.' });
            return;
        }

        try {
            keySearchConsole = JSON.parse(keySearchConsoleJSON);
        } catch (error) {
            ShowMessageError({ content: 'Key Search Console không phải là JSON hợp lệ.' });
            return;
        }

        try {
            clientSecretAds = JSON.parse(clientSecretAdsJSON);
        } catch (error) {
            ShowMessageError({ content: 'Client Secret Ads không phải là JSON hợp lệ.' });
            return;
        }

        const payload = {
            id: Number(domainId),
            domain,
            typeSite,
            groupSite,
            person,
            keyAnalytics,
            propertyId,
            keySearchConsole,
            keyWordpress,
            refreshTokenAds,
            clientSecretAds: clientSecretAds || {},
            accountIdAds,
            status,
            totalLink,
            timeIndex,
            timeRegDomain,
            fileKeyword,
            description,
        };

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/update-infor-domain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Cập nhật dữ liệu thành công' });
                router.push('/domain');
            } else if (result.errorcode === 10) {
                ShowMessageError({ content: 'Dữ liệu không được để trống' });
            } else if (result.errorcode === 300) {
                ShowMessageError({ content: 'Tên miền đã tồn tại' });
            } else if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
            } else if (result.errorcode === 102) {
                ShowMessageError({ content: 'Lỗi khi cập nhật dữ liệu' });
            } else if (result.errorcode === 311) {
                ShowMessageError({ content: 'Dữ liệu không hợp lệ' });
            } else {
                ShowMessageError({ content: 'Lỗi không xác định' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi gửi dữ liệu' });
            console.error('Handle submit error:', error);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="panel border-white-light px-4 py-6 dark:border-[#1b2e4b] custom-select">
            <h2 className="text-2xl font-semibold mb-6">Chỉnh Sửa Tên Miền</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="domain" className="block mb-1 font-medium">
                            Tên miền <span className="text-red-500">*</span>
                        </label>
                        <input id="domain" type="text" placeholder="Nhập tên miền..." value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full border p-2 rounded form-input" />
                    </div>
                    <div>
                        <label htmlFor="typeSite" className="block mb-1 font-medium">
                            Loại site <span className="text-red-500">*</span>
                        </label>
                        <Select
                            id="typeSite"
                            placeholder="Chọn loại site..."
                            options={typeSiteOptions}
                            value={typeSiteOptions.find((op) => op.value === typeSite)}
                            onChange={(val) => setTypeSite(val?.value || '')}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="groupSite" className="block mb-1 font-medium">
                            Nhóm site <span className="text-red-500">*</span>
                        </label>
                        <Select
                            id="groupSite"
                            placeholder="Chọn nhóm site..."
                            options={groupSiteOptions}
                            value={groupSiteOptions.find((op) => op.value === groupSite)}
                            onChange={(val) => setGroupSite(val?.value || '')}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="person" className="block mb-1 font-medium">
                            Người phụ trách <span className="text-red-500">*</span>
                        </label>
                        <Select
                            id="person"
                            placeholder="Chọn người phụ trách..."
                            options={personOptions}
                            value={personOptions.find((op) => op.value === person)}
                            onChange={(val) => setPerson(val?.value || '')}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="propertyId" className="block mb-1 font-medium">
                            Property ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="propertyId"
                            type="text"
                            placeholder="Nhập Property ID..."
                            value={propertyId}
                            onChange={(e) => setPropertyId(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="keyWordpress" className="block mb-1 font-medium">
                            Key Wordpress <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="keyWordpress"
                            type="text"
                            placeholder="Nhập Key Wordpress..."
                            value={keyWordpress}
                            onChange={(e) => setKeyWordpress(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="accountIdAds" className="block mb-1 font-medium">
                            Account ID Ads <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="accountIdAds"
                            type="text"
                            placeholder="Nhập Account ID Ads..."
                            value={accountIdAds}
                            onChange={(e) => setAccountIdAds(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="totalLink" className="block mb-1 font-medium">
                            Tổng link <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="totalLink"
                            type="number"
                            placeholder="Nhập tổng link..."
                            value={totalLink}
                            onChange={(e) => setTotalLink(Number(e.target.value))}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="timeIndex" className="block mb-1 font-medium">
                            Ngày Index <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="timeIndex"
                            type="date"
                            placeholder="Chọn ngày Index..."
                            value={timeIndex}
                            onChange={(e) => setTimeIndex(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="timeRegDomain" className="block mb-1 font-medium">
                            Ngày Reg Domain <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="timeRegDomain"
                            type="date"
                            placeholder="Chọn ngày đăng ký domain..."
                            value={timeRegDomain}
                            onChange={(e) => setTimeRegDomain(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div>
                        <label htmlFor="fileKeyword" className="block mb-1 font-medium">
                            File Keyword <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fileKeyword"
                            type="text"
                            placeholder="Nhập URL file keyword..."
                            value={fileKeyword}
                            onChange={(e) => setFileKeyword(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
                    <div className="flex items-center">
                        <input id="status" type="checkbox" checked={status} onChange={() => setStatus(!status)} className="form-checkbox h-5 w-5 text-blue-600" />
                        <label htmlFor="status" className="ml-2 font-medium mb-0">
                            Trạng thái
                        </label>
                    </div>

                    {/* JSON Fields */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label htmlFor="keyAnalyticsJSON" className="block mb-1 font-medium">
                            Key Analytics (JSON) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="keyAnalyticsJSON"
                            placeholder="Nhập Key Analytics dưới dạng JSON"
                            value={keyAnalyticsJSON}
                            onChange={(e) => setKeyAnalyticsJSON(e.target.value)}
                            className="w-full border p-2 rounded form-textarea"
                            rows={6}
                        ></textarea>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label htmlFor="keySearchConsoleJSON" className="block mb-1 font-medium">
                            Key Search Console (JSON) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="keySearchConsoleJSON"
                            placeholder="Nhập Key Search Console dưới dạng JSON"
                            value={keySearchConsoleJSON}
                            onChange={(e) => setKeySearchConsoleJSON(e.target.value)}
                            className="w-full border p-2 rounded form-textarea"
                            rows={6}
                        ></textarea>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label htmlFor="clientSecretAdsJSON" className="block mb-1 font-medium">
                            Client Secret Ads (JSON) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="clientSecretAdsJSON"
                            placeholder="Nhập Client Secret Ads dưới dạng JSON"
                            value={clientSecretAdsJSON}
                            onChange={(e) => setClientSecretAdsJSON(e.target.value)}
                            className="w-full border p-2 rounded form-textarea"
                            rows={6}
                        ></textarea>
                    </div>
                </div>
                <div className="mt-6">
                    <label htmlFor="refreshTokenAds" className="block mb-1 font-medium">
                        Refesh Token <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="refreshTokenAds"
                        type="text"
                        placeholder="Nhập refesh token Adsense ..."
                        value={refreshTokenAds}
                        onChange={(e) => setRefreshTokenAds(e.target.value)}
                        className="w-full border p-2 rounded form-input"
                    />
                </div>
                <div className="mt-8">
                    <label htmlFor="description" className="block mb-2 font-medium">
                        Mô tả
                    </label>
                    <textarea
                        id="description"
                        placeholder="Thêm mô tả..."
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded form-textarea"
                        rows={4}
                    ></textarea>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={() => router.push('/domain')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition" disabled={submitting}>
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
}
