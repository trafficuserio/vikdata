// app/components/admin/component-add-account.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';

export default function ComponentAddAccount() {
    const router = useRouter();
    const token = Cookies.get('token');

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit() {
        if (!userName || !password) {
            ShowMessageError({ content: 'Vui lòng nhập đủ userName và password' });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/admin/insert-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userName, password }),
            });
            const data = await res.json();

            if ([401, 403].includes(data?.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
                return;
            }

            if (data?.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm tài khoản thành công' });
                router.push('/admin');
            } else {
                ShowMessageError({ content: data?.message || 'Không thể thêm tài khoản' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi thêm tài khoản' });
        }
    }

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="custom-select px-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="mb-4">
                    <label className="block mb-1">Tên đăng nhập</label>
                    <input className="border p-2 rounded w-full form-input" placeholder="Nhập tài khoản..." value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Mật khẩu</label>
                    <input className="border p-2 rounded w-full form-input" type="password" placeholder="Nhập mật khẩu..." value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>
            <div className="flex gap-2 justify-end px-4">
                <button onClick={() => router.push('/admin')} className="btn btn-secondary">
                    Hủy
                </button>
                <button onClick={handleSubmit} className="btn btn-primary">
                    Tạo
                </button>
            </div>
        </div>
    );
}
