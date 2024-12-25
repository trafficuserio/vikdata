'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import IconError from '@/components/icon/icon-error';
import Link from 'next/link';

interface DecodedToken {
    sub: {
        full_name: string;
        user_name?: string;
        avatar?: string;
        role: string;
    };
    [key: string]: any;
}

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    useEffect(() => {
        const checkToken = Cookies.get('token');
        if (checkToken) {
            router.push('/');
        }
    }, [router]);

    const saveData = (token: string) => {
        const decodedToken: DecodedToken = jwtDecode(token);
        const { user_name } = decodedToken.sub;

        Cookies.set('token', token, { expires: 1 });
        Cookies.set('username', user_name || '', { expires: 1 });
        Cookies.set('loginTime', Date.now().toString(), { expires: 1 });
        Cookies.set('role', decodedToken.sub.role, { expires: 1 });
    };

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !password) {
            setError('Tài khoản và mật khẩu không được để trống');
            return;
        }

        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_URL_API + '/api/auth-route/login-with-mail', {
                userName: username,
                password,
            });
            if (response.data.errorcode === 101 || response.data.errorcode === 103) {
                setError('Tài khoản không tồn tại');
            } else if (response.data.errorcode === 100) {
                setError('Tài khoản hết hạn, vui lòng liên hệ Admin');
            } else if (response.data.errorcode === 202) {
                setError('Mật khẩu không chính xác');
            } else if (response.data.errorcode === 200) {
                saveData(response.data.data.token);
                router.push('/');
            }
        } catch (error) {
            setError('Đã có lỗi xảy ra');
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
            <div className="relative w-full max-w-[650px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 backdrop-blur-lg dark:bg-black/50 min-h-[558px]">
                    <div className="mx-auto w-full max-w-[460px]">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Đăng nhập</h1>
                            <p className="text-base font-bold leading-normal text-white-dark">Nhập email hoặc số điện thoại và mật khẩu để đăng nhập</p>
                        </div>
                        <form className="space-y-5 dark:text-white" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="Account">Tài khoản</label>
                                <div className="relative text-white-dark">
                                    <input
                                        id="Account"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Nhập tài khoản"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <IconUser fill={true} />
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="Password">Mật khẩu</label>
                                <div className="relative text-white-dark">
                                    <input
                                        id="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <IconLockDots fill={true} />
                                    </span>
                                </div>
                            </div>
                            {error && (
                                <div className="flex flex-row items-center justify-center gap-2 text-center align-middle text-danger">
                                    <IconError />
                                    <p>{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="text-center text-success">
                                    <p>{success}</p>
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary !mt-6 w-full border-0 uppercase">
                                Đăng nhập
                            </button>
                        </form>

                        <div className="text-center dark:text-white mt-10">
                            Bạn chưa có tài khoản?{' '}
                            <Link href="/auth/register" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                Đăng ký
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsAuthLoginForm;
