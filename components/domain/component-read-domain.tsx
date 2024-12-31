'use client';
import { Tab } from '@headlessui/react';
import React, { useEffect, useState, Fragment, useRef } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconCalendar from '@/components/icon/icon-calendar';
import IconAnalytics from '@/components/icon/icon-analytics';
import IconGoogleSearchConsole from '@/components/icon/icon-google-search-console';
import IconAdSense from '@/components/icon/icon-adsense';
import IconInfo from '@/components/icon/icon-info';
import IconKeyword from '@/components/icon/icon-keyword';
import IconRank from '@/components/icon/icon-rank';
import ComponentReadDomainAnalytics from '@/components/domain/component-read-domain-analytics';
import ComponentReadDomainGoogleSearchConsole from '@/components/domain/component-read-domain-google-search-console';
import ComponentReadDomainAdsense from '@/components/domain/component-read-domain-adsense';
import ComponentReadDomainInfo from '@/components/domain/component-read-domain-info';
import ComponentReadDomainRankKey from '@/components/domain/component-read-domain-rank-key';
import ComponentListKeyword from '@/components/domain/keyword/component-list-keyword';
import dayjs from 'dayjs';

const shortcutsItems = [
    {
        label: 'Hôm nay',
        getValue: () => {
            const today = dayjs();
            return [today.startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: 'Hôm qua',
        getValue: () => {
            const yesterday = dayjs().subtract(1, 'day');
            return [yesterday.startOf('day').toDate(), yesterday.endOf('day').toDate()];
        },
    },
    {
        label: '7 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(7, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '30 ngày trước',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(30, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
];

const ComponentsStatistical = () => {
    const [startDate, setStartDate] = useState<Date | null>(() => dayjs().subtract(7, 'day').toDate());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    const datePickerRef = useRef<HTMLDivElement>(null);

    const handleStartDateChange = (selectedDates: Date[]) => {
        const date = selectedDates[0] || null;
        setTempStartDate(date);
    };

    const handleEndDateChange = (selectedDates: Date[]) => {
        const date = selectedDates[0] || null;
        setTempEndDate(date);
    };

    const toggleDatePicker = () => {
        setIsDatePickerVisible((prev) => !prev);
        if (!isDatePickerVisible) {
            setTempStartDate(startDate);
            setTempEndDate(endDate);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current) {
            const flatpickrCalendars = document.querySelectorAll('.flatpickr-calendar');
            let clickInside = datePickerRef.current.contains(event.target as Node);
            flatpickrCalendars.forEach((calendar) => {
                if (calendar.contains(event.target as Node)) {
                    clickInside = true;
                }
            });
            if (!clickInside) {
                setIsDatePickerVisible(false);
            }
        }
    };

    useEffect(() => {
        if (isDatePickerVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerVisible]);

    const displayDateRange = () => {
        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'day').startOf('day');

        if (startDate && endDate) {
            const start = dayjs(startDate).startOf('day');
            const end = dayjs(endDate).startOf('day');

            const isSameDay = start.isSame(end, 'day');
            const isToday = end.isSame(today, 'day');
            const isYesterday = end.isSame(yesterday, 'day');

            if (isSameDay) {
                if (isToday) {
                    return 'Hôm nay ' + end.format('DD/MM/YYYY');
                } else if (isYesterday) {
                    return 'Hôm qua ' + end.format('DD/MM/YYYY');
                } else {
                    return end.format('DD/MM/YYYY');
                }
            } else {
                const formattedStart = start.format('DD/MM/YYYY');
                if (isToday) {
                    return `Từ ${formattedStart} đến Hôm nay`;
                } else if (isYesterday) {
                    return `Từ ${formattedStart} đến Hôm qua`;
                } else {
                    const formattedEnd = end.format('DD/MM/YYYY');
                    return `Từ ${formattedStart} đến ${formattedEnd}`;
                }
            }
        } else {
            return 'Hôm nay ' + today.format('DD/MM/YYYY');
        }
    };

    const applyDateRange = () => {
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setIsDatePickerVisible(false);
    };

    const handleShortcutClick = (shortcut: (typeof shortcutsItems)[0]) => {
        const [start, end] = shortcut.getValue();
        setTempStartDate(start);
        setTempEndDate(end);
        setStartDate(start);
        setEndDate(end);
        setIsDatePickerVisible(false);
    };

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
                                    <IconInfo className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Thông tin</p>
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
                                    <IconKeyword className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Danh sách từ khóa</p>
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
                                    <IconRank className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Xếp hạng từ khóa</p>
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
                                    <IconGoogleSearchConsole className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Search Console</p>
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
                                    <IconAnalytics className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Analytics</p>
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
                                    <IconAdSense className="h-5 w-5" />
                                    <p className="ml-2 hidden md:block">Adsense</p>
                                </button>
                            )}
                        </Tab>
                    </div>
                    <div className="relative flex w-full justify-end" ref={datePickerRef}>
                        <button className="btn btn-primary w-max whitespace-nowrap rounded px-3 py-1" onClick={toggleDatePicker}>
                            <p className="ml-2 hidden md:block">{displayDateRange()}</p>
                            <IconCalendar className="block h-5 w-5 md:hidden" />
                        </button>
                        {isDatePickerVisible && (
                            <div className="absolute right-0 top-full z-10 mt-2 flex flex-col gap-2 rounded-lg border-[1px] !border-white bg-white px-6 py-4 !outline-none dark:!border-[#191e3a] dark:bg-black md:w-auto md:min-w-[400px] md:flex-row">
                                <div className="flex flex-col gap-2">
                                    {shortcutsItems.map((shortcut, index) => (
                                        <button key={index} onClick={() => handleShortcutClick(shortcut)} className="btn btn-primary flex-1 whitespace-nowrap rounded px-3 py-1">
                                            {shortcut.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex w-full flex-col justify-between gap-2">
                                    <div className="flex flex-1 flex-col gap-2">
                                        <p className="hidden md:block">Chọn ngày</p>
                                        <div>
                                            <Flatpickr
                                                value={tempStartDate || undefined}
                                                options={{
                                                    dateFormat: 'd-m-Y',
                                                }}
                                                className="form-input"
                                                placeholder="Chọn ngày bắt đầu"
                                                onChange={handleStartDateChange}
                                            />
                                        </div>
                                        <div>
                                            <Flatpickr
                                                value={tempEndDate || undefined}
                                                options={{
                                                    dateFormat: 'd-m-Y',
                                                }}
                                                className="form-input"
                                                placeholder="Chọn ngày kết thúc"
                                                onChange={handleEndDateChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-0 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setTempStartDate(startDate);
                                                setTempEndDate(endDate);
                                                setIsDatePickerVisible(false);
                                            }}
                                            className="btn btn-secondary flex-1 whitespace-nowrap rounded px-4 py-2"
                                        >
                                            Hủy
                                        </button>
                                        <button onClick={applyDateRange} className="btn btn-success flex-1 whitespace-nowrap rounded px-4 py-2">
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <ComponentReadDomainInfo />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentListKeyword />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentReadDomainRankKey startDate={startDate} endDate={endDate} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentReadDomainGoogleSearchConsole startDate={startDate} endDate={endDate} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentReadDomainAnalytics startDate={startDate} endDate={endDate} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ComponentReadDomainAdsense startDate={startDate} endDate={endDate} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </>
    );
};

export default ComponentsStatistical;
