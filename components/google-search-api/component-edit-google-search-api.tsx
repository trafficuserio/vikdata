// app/components/google-search-api/component-edit-google-search-api.tsx

'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

export default function ComponentEditGoogleSearchApi() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = Cookies.get('token');

    // Retrieve 'id' from query parameters
    const idParam = searchParams.get('id');
    const id = idParam ? Number(idParam) : null;

    // State variables
    const [apiKey, setApiKey] = useState('');
    const [cx, setCx] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Fetch existing data on component mount
    useEffect(() => {
        if (!id) {
            ShowMessageError({ content: 'ID không hợp lệ hoặc không được cung cấp.' });
            router.push('/google-search-api');
            return;
        }
        fetchExistingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function fetchExistingData() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/get-google-search-api-by-id?id=${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();

            if (!json) {
                ShowMessageError({ content: 'Dữ liệu trả về không đúng cấu trúc' });
                setFetchError('Dữ liệu không hợp lệ.');
                return;
            }

            if ([401, 403].includes(json.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }

            if (json.errorcode === 200) {
                const row = json.data;
                if (!row) {
                    ShowMessageError({ content: 'Không tìm thấy dữ liệu với ID này.' });
                    setFetchError('Không tìm thấy dữ liệu.');
                    return;
                }
                setApiKey(row.api_google_search || '');
                setCx(row.custom_search_engine_id || '');
            } else {
                ShowMessageError({ content: json.message || 'Không thể tải dữ liệu.' });
                setFetchError(json.message || 'Lỗi khi tải dữ liệu.');
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi tải dữ liệu.' });
            setFetchError('Lỗi khi tải dữ liệu.');
            console.error('Fetch existing data error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!id) {
            ShowMessageError({ content: 'ID không hợp lệ hoặc không được cung cấp.' });
            return;
        }

        // Basic Frontend Validation
        if (!apiKey.trim() || !cx.trim()) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/update-google-search-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id,
                    apiKey,
                    cx,
                }),
            });
            const result = await res.json();

            switch (result.errorcode) {
                case 200:
                    ShowMessageSuccess({ content: 'Cập nhật thành công!' });
                    router.push('/google-search-api');
                    break;
                case 10:
                    ShowMessageError({ content: 'Dữ liệu không được để trống.' });
                    break;
                case 300:
                    ShowMessageError({ content: 'Tên miền đã tồn tại.' });
                    break;
                case 401:
                case 403:
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn.' });
                    logout(router);
                    break;
                case 102:
                    ShowMessageError({ content: 'Lỗi khi cập nhật dữ liệu.' });
                    break;
                case 311:
                    ShowMessageError({ content: 'Dữ liệu không hợp lệ.' });
                    break;
                default:
                    ShowMessageError({ content: 'Lỗi không xác định.' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi cập nhật dữ liệu.' });
            console.error('Handle submit error:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-500 text-xl mb-4">{fetchError}</p>
                <button onClick={() => router.push('/google-search-api')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="panel border-white-light px-4 py-6 dark:border-[#1b2e4b]">
            <h2 className="text-2xl font-semibold mb-6">Chỉnh Sửa Google Search API</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-1 font-medium">
                        API Key <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Nhập API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">
                        CX <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Nhập CX" value={cx} onChange={(e) => setCx(e.target.value)} className="w-full border p-2 rounded form-input" />
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => router.push('/google-search-api')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
                    Hủy
                </button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Lưu
                </button>
            </div>
        </div>
    );
}
