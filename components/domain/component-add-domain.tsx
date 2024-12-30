// app/components/domain/component-add-domain.tsx

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ComponentAddDomain() {
    const router = useRouter();
    const token = Cookies.get('token');

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
    const [totalKeyAhrerf, setTotalKeyAhrerf] = useState(0);
    const [trafficAhrerf, setTrafficAhrerf] = useState(0);

    const [keyAnalyticsJSON, setKeyAnalyticsJSON] = useState('');
    const [keySearchConsoleJSON, setKeySearchConsoleJSON] = useState('');
    const [clientSecretAdsJSON, setClientSecretAdsJSON] = useState('');

    const [refreshTokenAds, setRefreshTokenAds] = useState('');

    async function handleSubmit() {
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
            dataDomain: [
                {
                    domain,
                    typeSite,
                    groupSite,
                    person,
                    keyAnalytics,
                    propertyId,
                    keySearchConsole,
                    keyWordpress,
                    status,
                    totalLink: Number(totalLink),
                    timeIndex,
                    timeRegDomain,
                    fileKeyword,
                    description,
                    refreshTokenAds,
                    clientSecretAds: clientSecretAds || {},
                    accountIdAds,
                    totalKeyAhrerf,
                    trafficAhrerf: Number(trafficAhrerf),
                },
            ],
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/insert-infor-domain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm dữ liệu thành công' });
                router.push('/domain');
            } else if (result.errorcode === 10) {
                ShowMessageError({ content: 'Dữ liệu không được để trống' });
            } else if (result.errorcode === 300) {
                ShowMessageError({ content: 'Tên miền đã tồn tại' });
            } else if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
            } else if (result.errorcode === 102) {
                ShowMessageError({ content: 'Lỗi khi thêm dữ liệu' });
            } else if (result.errorcode === 311) {
                ShowMessageError({ content: 'Dữ liệu không hợp lệ' });
            } else {
                ShowMessageError({ content: 'Lỗi không xác định' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi gửi dữ liệu' });
            console.error('Handle submit error:', error);
        }
    }

    return (
        <div className="panel border-white-light px-4 py-6 dark:border-[#1b2e4b] custom-select">
            <h2 className="text-2xl font-semibold mb-6">Thêm Tên Miền</h2>
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

                    <div>
                        <label htmlFor="" className="block mb-1 font-medium">
                            Tổng từ khóa Ahref <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="totalKeyAhrerf"
                            type="text"
                            placeholder="Nhập tổng từ khóa Ahref..."
                            value={totalKeyAhrerf}
                            onChange={(e) => setTotalKeyAhrerf(Number(e.target.value))}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="" className="block mb-1 font-medium">
                            Traffic Ahref <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="trafficAhrerf"
                            type="number"
                            placeholder="Nhập traffic Ahref..."
                            value={trafficAhrerf}
                            onChange={(e) => setTrafficAhrerf(Number(e.target.value))}
                            className="w-full border p-2 rounded form-input"
                        />
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

                    {/* Missing Required Fields */}
                    <div>
                        <label htmlFor="refreshTokenAds" className="block mb-1 font-medium">
                            Refresh Token Ads <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="refreshTokenAds"
                            type="text"
                            placeholder="Nhập Refresh Token Ads..."
                            value={refreshTokenAds}
                            onChange={(e) => setRefreshTokenAds(e.target.value)}
                            className="w-full border p-2 rounded form-input"
                        />
                    </div>
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
                    <button type="button" onClick={() => router.push('/domain')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
                        Hủy
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
}
