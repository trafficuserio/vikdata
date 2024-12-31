'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';

interface ReportRow {
    cells: { value: string }[];
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const friendlyNames: Record<string, string> = {
    ESTIMATED_EARNINGS: 'Estimated Earnings (Doanh Thu Ước Tính)',
    PAGE_VIEWS: 'Page Views (Lượt Xem Trang)',
    CLICKS: 'Clicks (Lượt Click)',
    PAGE_VIEWS_CTR: 'Page Views CTR (CTR Lượt Xem Trang)',
    TOTAL_IMPRESSIONS: 'Total Impressions (Tổng Lượt Hiển Thị)',
    PAGE_VIEWS_RPM: 'Page Views RPM (RPM Lượt Xem Trang)',
    MATCHED_AD_REQUESTS: 'Matched Ad Requests (Lượt view có quảng cáo)',
    ADS_PER_IMPRESSION: 'Ads per Impression (Số quảng cáo được xem trên trang)',
};

const units: Record<string, string> = {
    ESTIMATED_EARNINGS: 'USD',
    PAGE_VIEWS: '',
    CLICKS: '',
    PAGE_VIEWS_CTR: '%',
    TOTAL_IMPRESSIONS: '',
    PAGE_VIEWS_RPM: 'USD',
    MATCHED_AD_REQUESTS: '',
    ADS_PER_IMPRESSION: '',
};

const ComponentReadAdSenseAnalytics: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [error, setError] = useState<string | null>(null);
    const [earningsData, setEarningsData] = useState<number[]>([]);
    const [pageViewsData, setPageViewsData] = useState<number[]>([]);
    const [clicksData, setClicksData] = useState<number[]>([]);
    const [pageViewsCtrData, setPageViewsCtrData] = useState<number[]>([]);
    const [totalImpressionsData, setTotalImpressionsData] = useState<number[]>([]);
    const [pageViewsRpmData, setPageViewsRpmData] = useState<number[]>([]);
    const [matchedAdRequestsData, setMatchedAdRequestsData] = useState<number[]>([]);
    const [adsPerImpressionData, setAdsPerImpressionData] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    useEffect(() => {
        if (!startDate || !endDate) return;

        const start = dayjs(startDate).format('YYYY-MM-DD');
        const end = dayjs(endDate).format('YYYY-MM-DD');

        const fetchAdSenseData = async () => {
            setIsLoading(true);

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

                const parsedClientSecretAds = JSON.parse(data.data.client_secret_ads);

                const refreshToken = data.data.refresh_token_ads;
                const clientId = parsedClientSecretAds.installed.client_id;
                const clientSecret = parsedClientSecretAds.installed.client_secret;
                const accountId = data.data.account_id_ads;
                const fullClientSecret = data.data.client_secret_ads;

                const urls = [
                    `/api/adsense/ESTIMATED_EARNINGS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/PAGE_VIEWS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/CLICKS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/PAGE_VIEWS_CTR?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/TOTAL_IMPRESSIONS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/PAGE_VIEWS_RPM?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/MATCHED_AD_REQUESTS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                    `/api/adsense/ADS_PER_IMPRESSION?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                ];

                const responses = await Promise.all(urls.map((url) => fetch(url)));
                const dataEarnings = await responses[0].json();
                const dataPageViews = await responses[1].json();
                const dataClicks = await responses[2].json();
                const dataPageViewsCtr = await responses[3].json();
                const dataTotalImpressions = await responses[4].json();
                const dataPageViewsRpm = await responses[5].json();
                const dataMatchedAdRequests = await responses[6].json();
                const dataAdsPerImpression = await responses[7].json();

                const dateRange: string[] = [];
                let currentDate = dayjs(startDate);
                while (currentDate.isBefore(dayjs(endDate).add(1, 'day'))) {
                    dateRange.push(currentDate.format('YYYY-MM-DD'));
                    currentDate = currentDate.add(1, 'day');
                }

                const mapData = (data: any) => {
                    return data.data.rows ? new Map<string, number>(data.data.rows.map((row: any) => [row.cells[0].value, Number(row.cells[1].value)])) : new Map<string, number>();
                };

                const fillData = (map: Map<string, number>, dateRange: string[]): number[] => {
                    return dateRange.map((date) => map.get(date) || 0);
                };

                setEarningsData(fillData(mapData(dataEarnings), dateRange));
                setPageViewsData(fillData(mapData(dataPageViews), dateRange));
                setClicksData(fillData(mapData(dataClicks), dateRange));
                setPageViewsCtrData(fillData(mapData(dataPageViewsCtr), dateRange));
                setTotalImpressionsData(fillData(mapData(dataTotalImpressions), dateRange));
                setPageViewsRpmData(fillData(mapData(dataPageViewsRpm), dateRange));
                setMatchedAdRequestsData(fillData(mapData(dataMatchedAdRequests), dateRange));
                setAdsPerImpressionData(fillData(mapData(dataAdsPerImpression), dateRange));

                setError(null);
            } catch (err: any) {
                setError(err.message || 'Lỗi khi lấy dữ liệu AdSense');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdSenseData();
    }, [startDate, endDate, isDark, domainId, token]);

    if (error) return <div>Lỗi: {error}</div>;

    const chartOptions = (title: string, data: number[], labels: string[]): ApexCharts.ApexOptions => ({
        chart: {
            id: `${title}-chart`,
            height: 250,
            type: 'area',
            fontFamily: 'Nunito, sans-serif',
            zoom: { enabled: false },
            toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, curve: 'smooth', width: 2, lineCap: 'square' },
        grid: {
            borderColor: isDark ? '#191E3A' : '#E0E6ED',
            strokeDashArray: 5,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        colors: ['#1f77b4'],
        labels,
        xaxis: { labels: { style: { fontSize: '12px' } } },
        yaxis: {
            labels: { formatter: (value: number) => formatNumber(value) },
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
    });

    const dates: string[] = [];
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(dayjs(endDate).add(1, 'day'))) {
        dates.push(currentDate.format('DD-MM'));
        currentDate = currentDate.add(1, 'day');
    }

    return (
        <div className='mt-4'>
            {isLoading && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoading && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {Object.keys(friendlyNames).map((key) => {
                            let value = 0;
                            switch (key) {
                                case 'ESTIMATED_EARNINGS':
                                    value = earningsData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'PAGE_VIEWS':
                                    value = pageViewsData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'CLICKS':
                                    value = clicksData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'PAGE_VIEWS_CTR':
                                    value = pageViewsCtrData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'TOTAL_IMPRESSIONS':
                                    value = totalImpressionsData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'PAGE_VIEWS_RPM':
                                    value = pageViewsRpmData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'MATCHED_AD_REQUESTS':
                                    value = matchedAdRequestsData.reduce((acc, val) => acc + val, 0);
                                    break;
                                case 'ADS_PER_IMPRESSION':
                                    value = adsPerImpressionData.reduce((acc, val) => acc + val, 0);
                                    break;
                                default:
                                    return null;
                            }
                            return (
                                <div key={key} className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                    <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-primary"></div>
                                    <h3 className="text-lg font-semibold dark:text-white">
                                        {friendlyNames[key].split('(')[0].trim()}
                                        <span className="block text-sm">({friendlyNames[key].split('(')[1].replace(')', '')})</span>
                                    </h3>
                                    <p>
                                        {formatNumber(value)} {units[key] || ''}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {Object.keys(friendlyNames).map((key) => {
                            let data: number[] = [];
                            switch (key) {
                                case 'ESTIMATED_EARNINGS':
                                    data = earningsData;
                                    break;
                                case 'PAGE_VIEWS':
                                    data = pageViewsData;
                                    break;
                                case 'CLICKS':
                                    data = clicksData;
                                    break;
                                case 'PAGE_VIEWS_CTR':
                                    data = pageViewsCtrData;
                                    break;
                                case 'TOTAL_IMPRESSIONS':
                                    data = totalImpressionsData;
                                    break;
                                case 'PAGE_VIEWS_RPM':
                                    data = pageViewsRpmData;
                                    break;
                                case 'MATCHED_AD_REQUESTS':
                                    data = matchedAdRequestsData;
                                    break;
                                case 'ADS_PER_IMPRESSION':
                                    data = adsPerImpressionData;
                                    break;
                                default:
                                    return null;
                            }
                            return (
                                <div key={key} className="panel mt-4 h-full">
                                    <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                                        <h5 className="text-lg font-semibold">
                                            {friendlyNames[key].split('(')[0].trim()}
                                            <span className="block text-sm">({friendlyNames[key].split('(')[1].replace(')', '')})</span>
                                        </h5>
                                    </div>
                                    <ReactApexChart options={chartOptions(key, data, dates)} series={[{ name: friendlyNames[key].split('(')[0].trim(), data }]} type="area" height={250} />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ComponentReadAdSenseAnalytics;
