// app/components/google-search-api/component-create-google-search-api.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

export default function ComponentCreateGoogleSearchApi() {
    const router = useRouter();
    const token = Cookies.get('token');

    const [apiKey, setApiKey] = useState('');
    const [cx, setCx] = useState('');

    async function handleSubmit() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-google-search-api/insert-google-search-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                dataGoogleSearchApi: [
                    {
                        apiKey,
                        cx,
                    },
                ],
            }),
        });
        const result = await res.json();
        if (result.errorcode === 200) {
            ShowMessageSuccess({ content: 'Thêm thành công!' });
            router.push('/google-search-api');
        } else {
            ShowMessageError({ content: 'Thêm thất bại!' });
        }
    }

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="custom-select px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block mb-1">API Key</label>
                    <input className="border p-2 rounded w-full form-input" placeholder="Nhập API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">CX</label>
                    <input className="border p-2 rounded w-full form-input" placeholder="Nhập CX" value={cx} onChange={(e) => setCx(e.target.value)} />
                </div>
            </div>
            <div className="custom-select px-4">
                <div className="flex gap-2 justify-end w-full">
                    <button onClick={() => router.push('/google-search-api/list')} className="btn btn-secondary">
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
