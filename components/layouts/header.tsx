'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { IRootState } from '@/store';
import { toggleTheme, toggleSidebar, toggleRTL } from '@/store/themeConfigSlice';
import Dropdown from '@/components/dropdown';
import IconMenu from '@/components/icon/icon-menu';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';
import IconLogout from '@/components/icon/icon-logout';
import IconUser from '@/components/icon/icon-user';
import { usePathname, useRouter } from 'next/navigation';
import logout from '@/utils/logout';
import Cookies from 'js-cookie';
import axios from 'axios';
import { ShowMessageError } from '@/components/component-show-message';
import { fetchMoney } from '@/utils/fetchMoney';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconMenuDomain from '@/components/icon/menu/icon-menu-domain';
import IconSearchGoogle from '@/components/icon/icon-search-google';
import IconRecharge from '@/components/icon/icon-recharge';
import IconServer from '@/components/icon/icon-server';
import IconModelAI from '@/components/icon/icon-model-ai';
import IconPrompt from '@/components/icon/icon-prompt';
import IconCheckIndex from '@/components/icon/icon-check-index';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const Header = () => {
    const router = useRouter();
    const token = Cookies.get('token');
    const username = Cookies.get('username');
    const role = Cookies.get('role');
    if (!token) {
        router.push('/auth/login');
    }
    const pathname = usePathname();
    const dispatch = useDispatch();

    const handleLogout = () => {
        logout(router);
    };

    const [myMoney, setMyMoney] = useState(0);

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    useEffect(() => {
        if (token) {
            fetchMoney(token, setMyMoney);
        }
    }, []);

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/logo.svg" alt="logo" />
                            <span className="hidden align-middle text-2xl font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">VIKDATA</span>
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconMenu className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2 justify-end">
                        <span className="text-sm badge bg-primary px-4 py-1">{formatNumber(myMoney) + ' Vik'}</span>
                        <div>
                            {themeConfig.theme === 'light' && (
                                <button
                                    className="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                                    onClick={() => dispatch(toggleTheme('dark'))}
                                >
                                    <IconSun />
                                </button>
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                                    onClick={() => dispatch(toggleTheme('system'))}
                                >
                                    <IconMoon />
                                </button>
                            )}
                            {themeConfig.theme === 'system' && (
                                <button
                                    className="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconLaptop />
                                </button>
                            )}
                        </div>
                        <div className="dropdown flex shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement="bottom-end"
                                btnClassName="relative group block"
                                button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/avt-default.png" alt="userProfile" />}
                            >
                                <ul className="w-[300px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/avt-default.png" alt="userProfile" />
                                            <div className="truncate ltr:pl-4 rtl:pr-4">
                                                <h4 className="text-base">{role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</h4>
                                                <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                    {username}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <Link href="/users/profile" className="dark:hover:text-white">
                                            <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Thông tin
                                        </Link>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button className="!py-3 text-danger" onClick={handleLogout}>
                                            <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                <ul className="horizontal-menu hidden bg-white border-t border-[#ebedf2] px-6 py-1.5 font-semibold text-black rtl:space-x-reverse dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8">
                    <li className="menu nav-item relative">
                        <Link href="/" className="nav-link group">
                            <div className="flex items-center">
                                <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Trang chủ</span>
                            </div>
                        </Link>
                    </li>
                    <li className="menu nav-item relative">
                        <Link href="/domain" className="nav-link group">
                            <div className="flex items-center">
                                <IconMenuDomain className="shrink-0 group-hover:!text-primary" />
                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Domain</span>
                            </div>
                        </Link>
                    </li>
                    <li className="menu nav-item relative">
                        <Link href="/check-index" className="nav-link group">
                            <div className="flex items-center">
                                <IconCheckIndex className="shrink-0 group-hover:!text-primary" />
                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Kiểm tra index</span>
                            </div>
                        </Link>
                    </li>
                    <li className="menu nav-item relative">
                        <Link href="/google-search-api" className="nav-link group">
                            <div className="flex items-center">
                                <IconSearchGoogle className="shrink-0 group-hover:!text-primary" />
                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Google Search API</span>
                            </div>
                        </Link>
                    </li>
                    <li className="menu nav-item relative">
                        <Link href="/recharge" className="nav-link group">
                            <div className="flex items-center">
                                <IconRecharge className="shrink-0 group-hover:!text-primary" />
                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Nạp tiền</span>
                            </div>
                        </Link>
                    </li>
                    {role === 'admin' && (
                        <>
                            <li className="menu nav-item relative">
                                <Link href="/admin" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconUser className="shrink-0 group-hover:!text-primary" fill />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Quản lý tài khoản</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item relative">
                                <Link href="/server" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconServer className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Server</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item relative">
                                <Link href="/ai-model" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconModelAI className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">AI Model</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item relative">
                                <Link href="/prompt" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconPrompt className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Prompt</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item relative">
                                <Link href="/serper" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconMenuDocumentation className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Serper</span>
                                    </div>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Header;
