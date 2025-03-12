'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';

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
    activeUsers: 'Người dùng đang hoạt động',
    totalUsers: 'Tổng người dùng',
    newUsers: 'Người dùng mới',
    bounceRate: 'Tỷ lệ thoát',
    sessions: 'Số phiên',
    averageSessionDuration: 'Thời lượng phiên trung bình',
    screenPageViews: 'Lượt xem trang',
    screenPageViewsPerSession: 'Lượt xem trang mỗi phiên',
    engagementRate: 'Tỷ lệ tương tác',
    userEngagementDuration: 'Tổng thời gian tương tác',
};

const units: Record<string, string> = {
    averageSessionDuration: 'giây',
    engagementRate: '%',
    bounceRate: '%',
    userEngagementDuration: 'giây',
};

const seriesNameToMetricKey: Record<string, string> = {
    'Người dùng đang hoạt động': 'activeUsers',
    'Tổng người dùng': 'totalUsers',
    'Người dùng mới': 'newUsers',
    'Tỷ lệ thoát': 'bounceRate',
    'Số phiên': 'sessions',
    'Thời lượng phiên trung bình': 'averageSessionDuration',
    'Lượt xem trang': 'screenPageViews',
    'Lượt xem trang mỗi phiên': 'screenPageViewsPerSession',
    'Tỷ lệ tương tác': 'engagementRate',
    'Tổng thời gian tương tác': 'userEngagementDuration',
};

const ComponentReadDomainAnalytics: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [errorGA, setErrorGA] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingGA, setIsLoadingGA] = useState(false);
    const [propertyId, setPropertyId] = useState<string>('');

    const [realtimeActiveUsers30, setRealtimeActiveUsers30] = useState<number>(0);
    const [realtimeActiveUsers5, setRealtimeActiveUsers5] = useState<number>(0);

    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');

    const metrics = Object.keys(friendlyNames);
    const token = Cookies.get('token');

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!domainId) {
            setErrorGA('Domain ID is not provided');
            return;
        }

        const fetchDomainInfo = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id?id=${domainId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch domain information');
                }

                const data = await res.json();

                if ([401, 403].includes(data.errorcode)) {
                    ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                    logout();
                    return;
                } else if (data.errorcode !== 200) {
                    throw new Error(data.message || 'Error fetching domain information');
                }

                setPropertyId(data.data.property_id);
            } catch (error: any) {
                console.error('Error fetching domain info:', error);
                setErrorGA(error.message || 'Lỗi khi lấy thông tin domain');
            }
        };

        fetchDomainInfo();
    }, [domainId, token]);

    useEffect(() => {
        if (!startDate || !endDate || !propertyId) return;
        setIsLoadingGA(true);
        const start = dayjs(startDate).format('YYYY-MM-DD');
        const end = dayjs(endDate).format('YYYY-MM-DD');

        Promise.all(
            metrics.map((metric) =>
                fetch(`/api/analytics/${metric}?start=${start}&end=${end}&domainId=${domainId}`).then((r) => {
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

                const activeUsersArray = sortedData.map((d) => Number(d.metrics.activeUsers || 0));
                const totalUsersArray = sortedData.map((d) => Number(d.metrics.totalUsers || 0));
                const newUsersArray = sortedData.map((d) => Number(d.metrics.newUsers || 0));
                const bounceRateArray = sortedData.map((d) => Number(d.metrics.bounceRate || 0));
                const sessionsArray = sortedData.map((d) => Number(d.metrics.sessions || 0));
                const averageSessionDurationArray = sortedData.map((d) => Number(d.metrics.averageSessionDuration || 0));
                const screenPageViewsArray = sortedData.map((d) => Number(d.metrics.screenPageViews || 0));
                const screenPageViewsPerSessionArray = sortedData.map((d) => Number(d.metrics.screenPageViewsPerSession || 0));
                const engagementRateArray = sortedData.map((d) => Number(d.metrics.engagementRate || 0));
                const userEngagementDurationArray = sortedData.map((d) => Number(d.metrics.userEngagementDuration || 0));

                const sums: Record<string, number> = {};
                metrics.forEach((m) => {
                    sums[m] = sortedData.reduce((acc, val) => acc + Number(val.metrics[m] || 0), 0);
                });

                setChartData({
                    series: [
                        { name: friendlyNames['activeUsers'], data: activeUsersArray },
                        { name: friendlyNames['totalUsers'], data: totalUsersArray },
                        { name: friendlyNames['newUsers'], data: newUsersArray },
                        { name: friendlyNames['bounceRate'], data: bounceRateArray },
                        { name: friendlyNames['sessions'], data: sessionsArray },
                        { name: friendlyNames['averageSessionDuration'], data: averageSessionDurationArray },
                        { name: friendlyNames['screenPageViews'], data: screenPageViewsArray },
                        { name: friendlyNames['screenPageViewsPerSession'], data: screenPageViewsPerSessionArray },
                        { name: friendlyNames['engagementRate'], data: engagementRateArray },
                        { name: friendlyNames['userEngagementDuration'], data: userEngagementDurationArray },
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
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['sessions']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['engagementRate']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['bounceRate']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['userEngagementDuration']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['averageSessionDuration']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['screenPageViews']);
                                    ApexCharts.exec('myChart', 'hideSeries', friendlyNames['screenPageViewsPerSession']);
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
                                formatter: (value: number) => formatNumber(value),
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
            .catch((error) => {
                console.error('Error fetching analytics data:', error);
                setErrorGA('Lỗi khi lấy dữ liệu GA');
            })
            .finally(() => {
                setIsLoadingGA(false);
            });
    }, [startDate, endDate, propertyId, domainId]);

    useEffect(() => {
        if (!domainId) return;
        const token = Cookies.get('token');
        const fetchRealtimeData = async () => {
            try {
                const res30 = await fetch(`/api/analytics/activeUsers/realtime-active-users?minutes=30&domainId=${domainId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res30.ok) {
                    const data30 = await res30.json();
                    setRealtimeActiveUsers30(Number(data30.activeUsers) || 0);
                }

                const res5 = await fetch(`/api/analytics/activeUsers/realtime-active-users?minutes=5&domainId=${domainId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res5.ok) {
                    const data5 = await res5.json();
                    setRealtimeActiveUsers5(Number(data5.activeUsers) || 0);
                }
            } catch (error) {
                console.error('Error fetching realtime data:', error);
            }
        };

        fetchRealtimeData();
        const interval = setInterval(fetchRealtimeData, 60000);
        return () => clearInterval(interval);
    }, [domainId, token]);

    if (errorGA) return <div className="text-red-500">{errorGA}</div>;

    return (
        <div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-white"></div>
                    <h3 className="text-lg font-semibold dark:text-white">Người dùng đang hoạt động 30 phút qua</h3>
                    <p>{formatNumber(realtimeActiveUsers30)}</p>
                </div>
                <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-white"></div>
                    <h3 className="text-lg font-semibold dark:text-white">Người dùng đang hoạt động 5 phút qua</h3>
                    <p>{formatNumber(realtimeActiveUsers5)}</p>
                </div>
            </div>
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
