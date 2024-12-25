// app/components/domain/component-read-domain-analytics.tsx

'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
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

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
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

const ComponentReadDomainAnalytics: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [errorGA, setErrorGA] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingGA, setIsLoadingGA] = useState(false);

    const metrics = Object.keys(friendlyNames);

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;
        setIsLoadingGA(true);
        const start = dayjs(startDate).format('YYYY-MM-DD');
        const end = dayjs(endDate).format('YYYY-MM-DD');

        Promise.all(
            metrics.map((metric) =>
                fetch(`/api/analytics/${metric}?start=${start}&end=${end}&propertyId=${'properties/468431477'}`).then((r) => {
                    if (!r.ok) throw new Error('GA fetch error');
                    return r.json();
                }),
            ),
        )
            .then((results) => {
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

                setChartData({
                    series: [
                        { name: 'Tổng số người dùng', data: totalUsersArray },
                        { name: 'Người dùng mới', data: newUsersArray },
                        { name: 'Số người dùng đang hoạt động', data: activeUsersArray },
                        { name: 'Tổng số phiên', data: sessionsArray },
                        { name: 'Tỷ lệ tương tác', data: engagementRateArray },
                        { name: 'Tỷ lệ thoát', data: bounceRateArray },
                        { name: 'Tổng thời gian tương tác', data: userEngagementDurationArray },
                        { name: 'Số phiên trên mỗi người dùng', data: sessionsPerUserArray },
                        { name: 'Lượt xem trang/màn hình', data: screenPageViewsArray },
                        { name: 'Lượt xem trang/màn hình mỗi phiên', data: screenPageViewsPerSession },
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
                        labels: generatedDates.map((date) => dayjs(date).format('DD/MM')),
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
                    totals: sums,
                });
                setErrorGA(null);
            })
            .catch(() => {
                setErrorGA('Lỗi khi lấy dữ liệu GA');
            })
            .finally(() => {
                setIsLoadingGA(false);
            });
    }, [startDate, endDate]);

    if (errorGA) return <div>{errorGA}</div>;

    return (
        <div>
            {isLoadingGA && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoadingGA && chartData && (
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
                            <h5 className="text-lg font-semibold">Biểu đồ Analytics</h5>
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
                </>
            )}
        </div>
    );
};

export default ComponentReadDomainAnalytics;
