'use client';
import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconCalendar from '@/components/icon/icon-calendar';
import ReactApexChart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

interface MetricsData {
    [key: string]: string;
}

interface ReportData {
    period: string;
    metrics: MetricsData;
}

interface ChartData {
    series: {
        name: string;
        data: number[];
    }[];
    options: any;
    totals: {
        [key: string]: number;
    };
}

interface GSCData {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

const friendlyNames: Record<string, string> = {
    totalUsers: 'Tổng số người dùng',
    newUsers: 'Số người dùng mới',
    activeUsers: 'Số người dùng đang hoạt động',
    sessions: 'Tổng số phiên',
    engagementRate: 'Tỷ lệ tương tác',
    bounceRate: 'Tỷ lệ thoát',
    userEngagementDuration: 'Tổng thời gian tương tác',
    sessionsPerUser: 'Số phiên trên mỗi người dùng',
    screenPageViews: 'Lượt xem trang hoặc màn hình',
    screenPageViewsPerSession: 'Lượt xem trang/màn hình mỗi phiên',
};

const units: Record<string, string> = {
    averageSessionDuration: 'giây',
    engagementRate: '%',
    bounceRate: '%',
    userEngagementDuration: 'giây',
    eventValue: 'đ',
};

const seriesNameToMetricKey: Record<string, string> = {
    'Tổng số người dùng': 'totalUsers',
    'Người dùng mới': 'newUsers',
    'Số người dùng đang hoạt động': 'activeUsers',
    'Tổng số phiên': 'sessions',
    'Tỷ lệ tương tác': 'engagementRate',
    'Tỷ lệ thoát': 'bounceRate',
    'Tổng thời gian tương tác': 'userEngagementDuration',
    'Số phiên trên mỗi người dùng': 'sessionsPerUser',
    'Lượt xem trang/màn hình': 'screenPageViews',
    'Lượt xem trang/màn hình mỗi phiên': 'screenPageViewsPerSession',
};

export default function ComponentReadDomain() {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [startDate, setStartDate] = useState<Date | null>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    });
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [gscData, setGscData] = useState<GSCData[]>([]);

    const metrics = Object.keys(friendlyNames);

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

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;
        setIsLoading(true);
        const start = dayjs(startDate).format('YYYY-MM-DD');
        const end = dayjs(endDate).format('YYYY-MM-DD');

        // Fetch GA data
        const gaFetch = Promise.all(metrics.map((metric) => fetch(`/api/analytics/${metric}?start=${start}&end=${end}`).then((r) => r.json()))).then((results) => {
            const merged: Record<string, MetricsData> = {};
            results.forEach((res: any) => {
                res.data.forEach((item: ReportData) => {
                    if (!merged[item.period]) {
                        merged[item.period] = {};
                    }
                    Object.assign(merged[item.period], item.metrics);
                });
            });
            const sortedData: ReportData[] = Object.keys(merged)
                .sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return a.localeCompare(b);
                })
                .map((period) => ({
                    period,
                    metrics: merged[period],
                }));
            const generatedDates = sortedData.map((d) => d.period);

            const totalUsersArray = sortedData.map((d) => Number(d.metrics.totalUsers || 0));
            const newUsersArray = sortedData.map((d) => Number(d.metrics.newUsers || 0));
            const activeUsersArray = sortedData.map((d) => Number(d.metrics.activeUsers || 0));
            const sessionsArray = sortedData.map((d) => Number(d.metrics.sessions || 0));
            const engagementRateArray = sortedData.map((d) => Number(d.metrics.engagementRate || 0));
            const bounceRateArray = sortedData.map((d) => Number(d.metrics.bounceRate || 0));
            const userEngagementDurationArray = sortedData.map((d) => Number(d.metrics.userEngagementDuration || 0));
            const sessionsPerUserArray = sortedData.map((d) => Number(d.metrics.sessionsPerUser || 0));
            const screenPageViewsArray = sortedData.map((d) => Number(d.metrics.screenPageViews || 0));
            const screenPageViewsPerSession = sortedData.map((d) => Number(d.metrics.screenPageViewsPerSession || 0));

            const sums: Record<string, number> = {};
            metrics.forEach((m) => {
                sums[m] = sortedData.reduce((acc, val) => acc + Number(val.metrics[m] || 0), 0);
            });

            return {
                sortedData,
                generatedDates,
                seriesData: {
                    totalUsersArray,
                    newUsersArray,
                    activeUsersArray,
                    sessionsArray,
                    engagementRateArray,
                    bounceRateArray,
                    userEngagementDurationArray,
                    sessionsPerUserArray,
                    screenPageViewsArray,
                    screenPageViewsPerSession,
                },
                sums,
            };
        });

        // Fetch GSC data
        const gscFetch = fetch(`/api/gsc/queries?start=${start}&end=${end}`)
            .then((r) => r.json())
            .then((res) => res.data || []);

        Promise.all([gaFetch, gscFetch])
            .then(([gaResult, gscResult]) => {
                setGscData(gscResult);

                setChartData({
                    series: [
                        { name: 'Tổng số người dùng', data: gaResult.seriesData.totalUsersArray },
                        { name: 'Người dùng mới', data: gaResult.seriesData.newUsersArray },
                        { name: 'Số người dùng đang hoạt động', data: gaResult.seriesData.activeUsersArray },
                        { name: 'Tổng số phiên', data: gaResult.seriesData.sessionsArray },
                        { name: 'Tỷ lệ tương tác', data: gaResult.seriesData.engagementRateArray },
                        { name: 'Tỷ lệ thoát', data: gaResult.seriesData.bounceRateArray },
                        { name: 'Tổng thời gian tương tác', data: gaResult.seriesData.userEngagementDurationArray },
                        { name: 'Số phiên trên mỗi người dùng', data: gaResult.seriesData.sessionsPerUserArray },
                        { name: 'Lượt xem trang/màn hình', data: gaResult.seriesData.screenPageViewsArray },
                        { name: 'Lượt xem trang/màn hình mỗi phiên', data: gaResult.seriesData.screenPageViewsPerSession },
                    ],
                    options: {
                        chart: {
                            id: 'myChart',
                            height: 325,
                            type: 'area',
                            fontFamily: 'Nunito, sans-serif',
                            zoom: { enabled: false },
                            toolbar: { show: false },
                            events: {
                                mounted: function (chartContext: any, config: any) {
                                    ApexCharts.exec('myChart', 'hideSeries', 'Tổng số phiên');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Tỷ lệ tương tác');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Tỷ lệ thoát');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Tổng thời gian tương tác');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Số phiên trên mỗi người dùng');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Lượt xem trang/màn hình');
                                    ApexCharts.exec('myChart', 'hideSeries', 'Lượt xem trang/màn hình mỗi phiên');
                                },
                            },
                        },
                        dataLabels: { enabled: false },
                        stroke: {
                            show: true,
                            curve: 'smooth',
                            width: 2,
                            lineCap: 'square',
                        },
                        dropShadow: {
                            enabled: true,
                            opacity: 0.2,
                            blur: 10,
                            left: -7,
                            top: 22,
                        },
                        colors: ['#9e0142', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
                        labels: gaResult.generatedDates.map((date) => dayjs(date).format('DD/MM')),
                        xaxis: {
                            axisBorder: { show: false },
                            axisTicks: { show: false },
                            crosshairs: { show: true },
                            labels: {
                                offsetX: 0,
                                offsetY: 5,
                                style: {
                                    fontSize: '12px',
                                    cssClass: 'apexcharts-xaxis-title',
                                },
                            },
                        },
                        yaxis: {
                            min: 0,
                            tickAmount: 7,
                            labels: {
                                formatter: (value: number) => {
                                    return formatNumber(value);
                                },
                                offsetX: -10,
                                offsetY: 0,
                                style: {
                                    fontSize: '12px',
                                    cssClass: 'apexcharts-yaxis-title',
                                },
                            },
                            opposite: false,
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
                        tooltip: {
                            marker: { show: true },
                            x: { show: false },
                            y: {
                                formatter: (val: number, opts: any) => {
                                    const seriesName = opts.w.globals.seriesNames[opts.seriesIndex];
                                    const metricKey = seriesNameToMetricKey[seriesName] || '';
                                    const unit = units[metricKey] ? ' ' + units[metricKey] : '';
                                    return formatNumber(val) + unit;
                                },
                            },
                        },
                        fill: {
                            type: 'gradient',
                            gradient: {
                                shadeIntensity: 1,
                                inverseColors: false,
                                opacityFrom: isDark ? 0.19 : 0.28,
                                opacityTo: 0.05,
                                stops: isDark ? [100, 100] : [45, 100],
                            },
                        },
                        states: {
                            inactive: {
                                opacity: 0.3,
                            },
                        },
                    },
                    totals: gaResult.sums,
                });
            })
            .catch(() => setError('Lỗi khi lấy dữ liệu'))
            .finally(() => setIsLoading(false));
    }, [startDate, endDate]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <div className="relative flex w-full justify-end" ref={datePickerRef}>
                <button className="btn btn-primary w-max whitespace-nowrap rounded px-3 py-1" onClick={toggleDatePicker}>
                    <p className="ml-2 hidden md:block">{displayDateRange()}</p>
                    <IconCalendar className="block h-5 w-5 md:hidden" />
                </button>
                {isDatePickerVisible && (
                    <div className="absolute right-0 top-full z-10 mt-2 flex flex-col gap-2 rounded-lg border-[1px] !border-white bg-white px-6 py-4 !outline-none dark:!border-[#191e3a] dark:bg-black md:w-auto md:min-w-[400px] md:flex-row">
                        <div className="flex flex-col gap-2">
                            {shortcutsItems.map((shortcut, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const [start, end] = shortcut.getValue();
                                        setTempStartDate(start);
                                        setTempEndDate(end);
                                        setStartDate(start);
                                        setEndDate(end);
                                        setIsDatePickerVisible(false);
                                    }}
                                    className="btn btn-primary flex-1 whitespace-nowrap rounded px-3 py-1"
                                >
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
                                    className="btn btn-danger flex-1 whitespace-nowrap rounded px-4 py-2"
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

            {isLoading && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoading && chartData && (
                <>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
                        {metrics.map((metric, index) => {
                            const bgColor = chartData.options.colors[index] || '#9e0142';
                            return (
                                <div key={metric} className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg" style={{ backgroundColor: bgColor }}></div>
                                    <h3 className="text-lg font-semibold dark:text-white">{friendlyNames[metric] || metric}</h3>
                                    <p>
                                        {formatNumber(chartData.totals[metric])} {units[metric] ? units[metric] : ''}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="panel mt-4 h-full xl:col-span-2">
                        <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                            <h5 className="text-lg font-semibold">Biểu đồ thống kê</h5>
                        </div>
                        <div className="relative">
                            <div className="rounded-lg bg-white dark:bg-black">
                                {isMounted && chartData ? (
                                    <ReactApexChart options={chartData.options} series={chartData.series} type="area" height={325} />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hiển thị dữ liệu GSC */}
                    {gscData.length > 0 && (
                        <div className="panel mt-4">
                            <h5 className="text-lg font-semibold mb-2 dark:text-white">Google Search Console</h5>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">Từ khóa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">Clicks</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">Impressions</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">CTR</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-white">Position</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                                        {gscData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 whitespace-nowrap dark:text-white">{row.query}</td>
                                                <td className="px-6 py-4 whitespace-nowrap dark:text-white">{formatNumber(row.clicks)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap dark:text-white">{formatNumber(row.impressions)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap dark:text-white">{(row.ctr * 100).toFixed(2)}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap dark:text-white">{row.position.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
