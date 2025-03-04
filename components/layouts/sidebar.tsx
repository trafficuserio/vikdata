'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconUser from '@/components/icon/icon-user';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconModelAI from '@/components/icon/icon-model-ai';
import IconPrompt from '@/components/icon/icon-prompt';
import IconServer from '@/components/icon/icon-server';
import IconMenuDomain from '@/components/icon/menu/icon-menu-domain';
import IconSearchGoogle from '@/components/icon/icon-search-google';

import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import Cookies from 'js-cookie';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    const role = Cookies.get('role');

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">VIKDATA</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li className="menu nav-item">
                                <Link href="/" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Trang chủ</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/domain" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconMenuDomain className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Domain</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/google-search-api" className="nav-link group">
                                    <div className="flex items-center">
                                        <IconSearchGoogle className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Google Search API</span>
                                    </div>
                                </Link>
                            </li>
                            {role === 'admin' && (
                                <>
                                    <li className="menu nav-item">
                                        <Link href="/admin" className="nav-link group">
                                            <div className="flex items-center">
                                                <IconUser className="shrink-0 group-hover:!text-primary" fill={true} />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Quản lý tài khoản</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/server" className="nav-link group">
                                            <div className="flex items-center">
                                                <IconServer className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Server</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/ai-model" className="nav-link group">
                                            <div className="flex items-center">
                                                <IconModelAI className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">AI Model</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/prompt" className="nav-link group">
                                            <div className="flex items-center">
                                                <IconPrompt className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Prompt</span>
                                            </div>
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
