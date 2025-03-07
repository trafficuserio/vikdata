'use client';
import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import Cookies from 'js-cookie';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ReactApexChart from 'react-apexcharts';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';

interface HistoryRankData {
    id: number;
    domain_id: number;
    keyword: string;
    url_keyword: string;
    rank_keyword: number;
    day: string;
    geolocation: string;
    host_language: string;
}

interface HistoryApiResponse {
    errorcode: number;
    message: string;
    data: {
        count: number;
        rows: HistoryRankData[];
        totalPage: number;
        currentPage: number;
    };
}

const shortcutsItems = [
    {
        label: '3 ngày',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(3, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '7 ngày',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(7, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '15 ngày',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(15, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
    {
        label: '30 ngày',
        getValue: () => {
            const today = dayjs();
            return [today.subtract(30, 'day').startOf('day').toDate(), today.endOf('day').toDate()];
        },
    },
];

const ComponentDetailDomainRankKey = () => {
    // Khởi tạo state cho ngày
    const [startDate, setStartDate] = useState<Date | null>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    });
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    // State cho dữ liệu lịch sử và biểu đồ
    const [historyData, setHistoryData] = useState<HistoryRankData[]>([]);
    const [historyPage, setHistoryPage] = useState<number>(1);
    const [historyLimit, setHistoryLimit] = useState<number>(10);
    const [historyTotal, setHistoryTotal] = useState<number>(0);
    const [chartData, setChartData] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Lấy theme từ Redux để cấu hình biểu đồ cho dark/light mode
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const datePickerRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const keywordIdParam = searchParams.get('id');
    const keywordId = keywordIdParam ? parseInt(keywordIdParam, 10) : null;
    const token = Cookies.get('token');

    // Xử lý thay đổi ngày từ Flatpickr
    const handleStartDateChange = (selectedDates: Date[]) => {
        setTempStartDate(selectedDates[0] || null);
    };

    const handleEndDateChange = (selectedDates: Date[]) => {
        setTempEndDate(selectedDates[0] || null);
    };

    const toggleDatePicker = () => {
        setIsDatePickerVisible((prev) => !prev);
        if (!isDatePickerVisible) {
            setTempStartDate(startDate);
            setTempEndDate(endDate);
        }
    };

    // Ẩn datepicker khi click bên ngoài
    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setIsDatePickerVisible(false);
        }
    };

    useEffect(() => {
        if (isDatePickerVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePickerVisible]);

    const displayDateRange = () => {
        if (startDate && endDate) {
            const start = dayjs(startDate).startOf('day');
            const end = dayjs(endDate).startOf('day');
            if (start.isSame(end, 'day')) {
                return start.format('DD/MM/YYYY');
            } else {
                return `Từ ${start.format('DD/MM/YYYY')} đến ${end.format('DD/MM/YYYY')}`;
            }
        }
        return '';
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

    const fetchHistoryData = async () => {
        if (!keywordId || !startDate || !endDate) return;
        try {
            const params = new URLSearchParams({
                keywordId: keywordId.toString(),
                startTime: dayjs(startDate).format('YYYY-MM-DD'),
                endTime: dayjs(endDate).format('YYYY-MM-DD'),
                page: historyPage.toString(),
                limit: historyLimit.toString(),
            });
            const url = `${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/get-infor-history-rank-keyword?${params.toString()}`;
            const response = await axios.get<HistoryApiResponse>(url, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (response.data.errorcode === 200) {
                setHistoryData(response.data.data.rows);
                setHistoryTotal(response.data.data.count);

                let seriesData = response.data.data.rows
                    .filter((item) => item.rank_keyword !== null && item.rank_keyword !== undefined)
                    .map((item) => ({
                        x: dayjs(item.day).format('DD/MM/YYYY'),
                        y: item.rank_keyword,
                    }));

                seriesData = seriesData.sort((a, b) => dayjs(a.x, 'DD/MM/YYYY').unix() - dayjs(b.x, 'DD/MM/YYYY').unix());

                setChartData({
                    series: [
                        {
                            name: 'Rank',
                            data: seriesData,
                        },
                    ],
                    options: {
                        chart: {
                            height: 325,
                            type: 'area',
                            fontFamily: 'Nunito, sans-serif',
                            zoom: { enabled: false },
                            toolbar: { show: false },
                        },
                        dataLabels: { enabled: false },
                        stroke: {
                            curve: 'straight',
                            width: 2,
                        },
                        dropShadow: {
                            enabled: true,
                            opacity: 0.2,
                            blur: 10,
                            left: -7,
                            top: 22,
                        },
                        colors: ['#e06000'],
                        xaxis: {
                            type: 'category',
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                            crosshairs: { show: true },
                            labels: {
                                style: {
                                    fontSize: '12px',
                                    cssClass: 'apexcharts-xaxis-title',
                                },
                            },
                        },
                        yaxis: {
                            min: 0,
                            max: 100,
                            reversed: true,
                            tickAmount: 7,
                            labels: {
                                style: {
                                    fontSize: '12px',
                                    cssClass: 'apexcharts-yaxis-title',
                                },
                                formatter: (value: any) => Math.round(value),
                            },
                        },
                        grid: {
                            borderColor: isDark ? '#191E3A' : '#E0E6ED',
                            strokeDashArray: 5,
                            xaxis: { lines: { show: false } },
                            yaxis: { lines: { show: true } },
                            padding: { top: 0, right: 0, bottom: 0, left: 0 },
                        },
                        legend: {
                            position: 'top',
                            horizontalAlign: 'right',
                            fontSize: '16px',
                            markers: { width: 10, height: 10, offsetX: -2 },
                            itemMargin: { horizontal: 10, vertical: 5 },
                        },
                        tooltip: { marker: { show: true }, x: { show: false } },
                        fill: {
                            type: 'gradient',
                            gradient: {
                                shadeIntensity: 1,
                                inverseColors: false,
                                opacityTo: 0.05,
                                stops: isDark ? [100, 100] : [45, 100],
                            },
                        },
                    },
                });
            } else {
                ShowMessageError({ content: response.data.message || 'Lỗi khi lấy dữ liệu lịch sử' });
            }
        } catch (err: any) {
            ShowMessageError({ content: err.message || 'Lỗi khi gọi API lịch sử' });
        }
    };

    useEffect(() => {
        setIsMounted(true);
        fetchHistoryData();
    }, [keywordId, startDate, endDate, historyPage, historyLimit]);

    return (
        <>
            <div className="mt-4 flex h-full flex-col justify-between gap-4 md:flex-row">
                <div className="relative flex-grow overflow-hidden bg-white px-6 py-4 dark:bg-black rounded">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 bg-primary"></div>
                    <div className="flex flex-col items-start justify-between gap-2">
                        <p>Keyword</p>
                        <h3 className="text-lg font-semibold dark:text-white">{historyData[0]?.keyword || 'N/A'}</h3>
                    </div>
                </div>
                <div className="relative flex-grow overflow-hidden bg-white px-6 py-4 dark:bg-black rounded">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 bg-primary"></div>
                    <div className="flex flex-col items-start justify-between gap-2">
                        <p>URL Keyword</p>
                        <h3 className="text-lg font-semibold dark:text-white">{historyData[0]?.url_keyword || 'N/A'}</h3>
                    </div>
                </div>
                <div className="relative flex-grow overflow-hidden bg-white px-6 py-4 dark:bg-black rounded">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 bg-primary"></div>
                    <div className="flex flex-col items-start justify-between gap-2">
                        <p>Geolocation</p>
                        <h3 className="text-lg font-semibold dark:text-white">{historyData[0]?.geolocation || 'N/A'}</h3>
                    </div>
                </div>
                <div className="relative flex-grow overflow-hidden bg-white px-6 py-4 dark:bg-black rounded">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 bg-primary"></div>
                    <div className="flex flex-col items-start justify-between gap-2">
                        <p>Host Lang</p>
                        <h3 className="text-lg font-semibold dark:text-white">{historyData[0]?.host_language || 'N/A'}</h3>
                    </div>
                </div>
            </div>

            <div className="panel mt-4 h-full xl:col-span-2">
                <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                    <h5 className="text-lg font-semibold">Biểu đồ thống kê</h5>
                    <div className="relative" ref={datePickerRef}>
                        <button onClick={toggleDatePicker} className="btn btn-primary">
                            {displayDateRange()}
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
                                                value={tempStartDate ? dayjs(tempStartDate).toDate() : undefined}
                                                options={{ dateFormat: 'd-m-Y' }}
                                                className="form-input"
                                                placeholder="Chọn ngày bắt đầu"
                                                onChange={handleStartDateChange}
                                            />
                                        </div>
                                        <div>
                                            <Flatpickr
                                                value={tempEndDate ? dayjs(tempEndDate).toDate() : undefined}
                                                options={{ dateFormat: 'd-m-Y' }}
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
                </div>

                <div className="relative mt-4">
                    <div className="bg-white dark:bg-black rounded">
                        {isMounted && chartData ? (
                            <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={325} />
                        ) : (
                            <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                                <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComponentDetailDomainRankKey;
