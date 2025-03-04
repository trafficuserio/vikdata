'use client';
import React, { Fragment, useState } from 'react';
import { Tab } from '@headlessui/react';
import ComponentDetailDomainKeyword from '@/components/domain/component-detail-domain-keyword';
import ComponentDetailDomainPost from '@/components/domain/component-detail-domain-post';

export default function AIModel() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="p-4">
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="mt-3 flex flex-wrap">
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button
                                className={`${
                                    selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                            >
                                Tổng bài viết
                            </button>
                        )}
                    </Tab>
                    <Tab as={Fragment}>
                        {({ selected }) => (
                            <button
                                className={`${
                                    selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                            >
                                Từ khóa
                            </button>
                        )}
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <ComponentDetailDomainPost />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentDetailDomainKeyword />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
