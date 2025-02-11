'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import IconError from '@/components/icon/icon-error';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Link from 'next/link';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm_password, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const checkToken = Cookies.get('token');
    if (checkToken) {
        router.push('/');
    }

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password: string) => {
        const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
        return re.test(password);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !password || !confirm_password) {
            setError('Tài khoản, mật khẩu và xác nhận mật khẩu không được để trống');
            return;
        } else if (!validateEmail(username)) {
            setError('Email không hợp lệ');
            return;
        } else if (password !== confirm_password) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        } else if (!validatePassword(password)) {
            setError('Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ cái và số và ký tự đặc biệt');
            return;
        } else {
            try {
                const response = await axios.post(process.env.NEXT_PUBLIC_URL_API + '/api/auth-route/register-with-mail', {
                    userName: username,
                    password,
                });

                if (response.data.errorcode === 205) {
                    setError('Tài khoản đã tồn tại');
                } else if (response.data.errorcode === 200) {
                    setSuccess('Đăng kí thành công, liên hệ Admin để kích hoạt tài khoản');
                } else {
                    setError('Đã có lỗi xảy ra');
                }
            } catch (err) {
                setError('Đã có lỗi xảy ra');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.id === 'password') {
            handleRegister(e as any);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <div className="relative w-full max-w-[650px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center overflow-hidden rounded-md bg-white/60 px-6 backdrop-blur-lg dark:bg-black/50 lg:min-h-[558px]">
                        <div className="mx-auto w-full max-w-[460px]"></div>
                        <div className="text-center text-success">
                            <p>{success}</p>
                        </div>
                        <Link href="/auth/login" className="block text-center btn btn-primary mt-4">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
            <div className="relative w-full max-w-[650px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                <div className="relative flex flex-col justify-center overflow-hidden rounded-md bg-white/60 px-6 backdrop-blur-lg dark:bg-black/50 min-h-[558px]">
                    <div className="mx-auto w-full max-w-[460px]">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">ĐĂNG KÝ</h1>
                            <p className="text-base font-bold leading-normal text-white-dark">Nhập email hoặc số điện thoại và mật khẩu để đăng ký</p>
                        </div>
                        <form className="space-y-5 dark:text-white" onSubmit={handleRegister}>
                            <div>
                                <label htmlFor="Account">Tài khoản</label>
                                <div className="relative text-white-dark">
                                    <input
                                        id="Account"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUserName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập tài khoản"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <IconUser fill={true} />
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password">Mật khẩu</label>
                                <div className="relative text-white-dark">
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập mật khẩu"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                        <IconLockDots fill={true} />
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
                                <div className="relative text-white-dark">
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        value={confirm_password}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập lại mật khẩu"
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

                            <button type="submit" className="btn btn-primary !mt-6 w-full border-0 uppercase">
                                Đăng ký
                            </button>
                        </form>
                        <div className="text-center dark:text-white mt-10">
                            Bạn đã có tài khoản?{' '}
                            <Link href="/auth/login" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsAuthRegisterForm;
