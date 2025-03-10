'use client';
import { Tab } from '@headlessui/react';
import React, { useEffect, useState, Fragment, useRef } from 'react';
import IconAnalytics from '@/components/icon/icon-analytics';
import IconGoogleSearchConsole from '@/components/icon/icon-google-search-console';
import ComponentListAccount from '@/components/admin/component-list-account';
import ComponentListRecharge from '@/components/admin/component-list-recharge';
import IconUser from '@/components/icon/icon-user';
import IconRecharge from '@/components/icon/icon-recharge';

const ComponentsFullAccount = () => {
    return (
        <>
            <Tab.Group>
                <Tab.List className="mt-3 flex justify-between border-b-[1px] !border-b-white !outline-none dark:!border-[#191e3a] dark:!border-b-black">
                    <div className="flex w-full flex-1">
                        <Tab as={Fragment}>
                            {(tabProps) => (
                                <button
                                    className={`${
                                        tabProps.selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    } -mb-[1px] flex items-center whitespace-nowrap border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                >
                                    <IconUser className="w-5 h-5" fill={true} />
                                    <p className="ml-2 hidden md:block">Tài khoản</p>
                                </button>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {(tabProps) => (
                                <button
                                    className={`${
                                        tabProps.selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    } -mb-[1px] flex items-center whitespace-nowrap border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                                >
                                    <IconRecharge className="w-5 h-5" />
                                    <p className="ml-2 hidden md:block">Nạp tiền</p>
                                </button>
                            )}
                        </Tab>
                    </div>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <ComponentListAccount />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentListRecharge />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </>
    );
};

export default ComponentsFullAccount;
