'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
];

export default function ComponentEditDomain() {
    const router = useRouter();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const token = Cookies.get('token');

    const [domain, setDomain] = useState('');
    const [typeSite, setTypeSite] = useState('');
    const [groupSite, setGroupSite] = useState('');
    const [person, setPerson] = useState('');
    const [keyAnalytics, setKeyAnalytics] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [keySearchConsole, setKeySearchConsole] = useState('');
    const [keyWordpress, setKeyWordpress] = useState('');
    const [keyAdsense, setKeyAdsense] = useState('');
    const [status, setStatus] = useState(false);
    const [totalLink, setTotalLink] = useState(0);
    const [timeIndex, setTimeIndex] = useState('');
    const [timeRegDomain, setTimeRegDomain] = useState('');
    const [fileKeyword, setFileKeyword] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchDomainData(Array.isArray(id) ? id[0] : id);
    }, [id]);

    async function fetchDomainData(id: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-list-infor-domain?page=1&limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }

            if (data.success) {
                const found = data.data.find((item: any) => item.id === Number(id));
                if (found) {
                    setDomain(found || '');
                    setTypeSite(found.typeSite || '');
                    setGroupSite(found.groupSite || '');
                    setPerson(found.person || '');
                    setKeyAnalytics(found.keyAnalytics || '');
                    setPropertyId(found.propertyId || '');
                    setKeySearchConsole(found.keySearchConsole || '');
                    setKeyWordpress(found.keyWordpress || '');
                    setKeyAdsense(found.keyAdsense || '');
                    setStatus(found.status || false);
                    setTotalLink(found.totalLink || 0);
                    setTimeIndex(found.timeIndex ? found.timeIndex.split('T')[0] : '');
                    setTimeRegDomain(found.timeRegDomain ? found.timeRegDomain.split('T')[0] : '');
                    setFileKeyword(found.fileKeyword || '');
                    setDescription(found.description || '');
                }
            } else {
                ShowMessageError({ content: 'Không tìm thấy dữ liệu' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu' });
        }
    }

    async function handleSubmit() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/update-infor-domain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: Number(id),
                domain,
                typeSite,
                groupSite,
                person,
                keyAnalytics,
                propertyId,
                keySearchConsole,
                keyWordpress,
                keyAdsense,
                status,
                totalLink: Number(totalLink),
                timeIndex,
                timeRegDomain,
                fileKeyword,
                description,
            }),
        });

        const result = await response.json();
        if (result?.errorcode === 10) {
            ShowMessageError({ content: 'Dữ liệu không được để trống' });
        } else if (result?.errorcode === 300) {
            ShowMessageError({ content: 'Tên miền đã tồn tại' });
        } else if ([401, 403].includes(result?.errorcode)) {
            ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
            logout(router);
        } else if (result?.errorcode === 102) {
            ShowMessageError({ content: 'Lỗi khi thêm dữ liệu' });
            logout(router);
        } else if (result?.errorcode === 311) {
            ShowMessageError({ content: 'Dữ liệu không hợp lệ' });
        } else if (result?.errorcode === 200) {
            ShowMessageSuccess({ content: 'Cập nhật dữ liệu thành công' });
            router.push('/domain');
        } else {
            ShowMessageError({ content: 'Lỗi không xác định' });
        }
    }

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="custom-select px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block mb-1">Tên miền</label>
                    <input placeholder="Nhập tên miền..." value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Loại site</label>
                    <Select placeholder="Chọn loại site..." options={typeSiteOptions} value={typeSiteOptions.find((op) => op.value === typeSite)} onChange={(val) => setTypeSite(val?.value || '')} />
                </div>
                <div>
                    <label className="block mb-1">Nhóm site</label>
                    <Select
                        placeholder="Chọn nhóm site..."
                        options={groupSiteOptions}
                        value={groupSiteOptions.find((op) => op.value === groupSite)}
                        onChange={(val) => setGroupSite(val?.value || '')}
                    />
                </div>
                <div>
                    <label className="block mb-1">Người phụ trách</label>
                    <Select placeholder="Chọn người phụ trách..." options={personOptions} value={personOptions.find((op) => op.value === person)} onChange={(val) => setPerson(val?.value || '')} />
                </div>
                <div>
                    <label className="block mb-1">Key Analytics</label>
                    <input placeholder="Nhập Key Analytics..." value={keyAnalytics} onChange={(e) => setKeyAnalytics(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Property ID</label>
                    <input placeholder="Nhập Property ID..." value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Search Console</label>
                    <input placeholder="Nhập Key Search Console..." value={keySearchConsole} onChange={(e) => setKeySearchConsole(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Key Wordpress</label>
                    <input placeholder="Nhập Key Wordpress..." value={keyWordpress} onChange={(e) => setKeyWordpress(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Key Adsense</label>
                    <input placeholder="Nhập Key Adsense..." value={keyAdsense} onChange={(e) => setKeyAdsense(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Tổng link</label>
                    <input placeholder="Nhập tổng link..." type="number" value={totalLink} onChange={(e) => setTotalLink(Number(e.target.value))} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Ngày Index</label>
                    <input placeholder="Chọn ngày Index..." type="date" value={timeIndex} onChange={(e) => setTimeIndex(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1">Ngày Reg Domain</label>
                    <input
                        placeholder="Chọn ngày đăng ký domain..."
                        type="date"
                        value={timeRegDomain}
                        onChange={(e) => setTimeRegDomain(e.target.value)}
                        className="w-full border p-2 rounded form-input"
                    />
                </div>
                <div>
                    <label className="block mb-1">File Keyword</label>
                    <input placeholder="Nhập url file keyword..." value={fileKeyword} onChange={(e) => setFileKeyword(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div className="flex items-start">
                    <label className="block mr-2 mb-0">Trạng thái</label>
                    <input className="form-checkbox" type="checkbox" checked={status} onChange={() => setStatus(!status)} />
                </div>
            </div>
            <div className="custom-select px-4 mt-4">
                <div>
                    <label className="block mb-1">Mô tả</label>
                    <textarea
                        placeholder="Thêm mô tả..."
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded form-textarea"
                        rows={4}
                    ></textarea>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => router.push('/domain')} className="btn btn-secondary">
                        Hủy
                    </button>
                    <button onClick={handleSubmit} className="btn btn-primary">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
