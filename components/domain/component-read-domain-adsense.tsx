'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

interface ReportRow {
    cells: { value: string }[];
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const friendlyNames: Record<string, string> = {
    CLICKS: 'Số Lượt Click',
    ESTIMATED_EARNINGS: 'Doanh Thu Ước Tính',
    COST_PER_CLICK: 'Giá Mỗi Click',
    AD_REQUESTS_RPM: 'Thu Nhập 1000 Yêu Cầu',
};

const units: Record<string, string> = {
    CLICKS: '',
    ESTIMATED_EARNINGS: 'USD',
    COST_PER_CLICK: 'USD',
    AD_REQUESTS_RPM: 'USD',
};

const ComponentReadAdSenseAnalytics: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [error, setError] = useState<string | null>(null);
    const [clicksData, setClicksData] = useState<number[]>([]); // Cập nhật dữ liệu
    const [earningsData, setEarningsData] = useState<number[]>([]);
    const [costPerClickData, setCostPerClickData] = useState<number[]>([]);
    const [rpmData, setRpmData] = useState<number[]>([]);
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

            if (data.errorcode !== 200) {
                throw new Error(data.message || 'Error fetching domain information');
            }

            const parsedClientSecretAds = JSON.parse(data.data.client_secret_ads);

            const refreshToken = data.data.refresh_token_ads;
            const clientId = parsedClientSecretAds.installed.client_id;
            const clientSecret = parsedClientSecretAds.installed.client_secret;
            const accountId = data.data.account_id_ads;
            const fullClientSecret = data.data.client_secret_ads;

            const urls = [
                `/api/adsense/CLICKS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                `/api/adsense/ESTIMATED_EARNINGS?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                `/api/adsense/COST_PER_CLICK?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
                `/api/adsense/AD_REQUESTS_RPM?refreshToken=${refreshToken}&clientId=${clientId}&clientSecret=${clientSecret}&accountId=${accountId}&startDate=${start}&endDate=${end}&fullClientSecret=${fullClientSecret}&domainId=${domainId}`,
            ];

            try {
                const responses = await Promise.all(urls.map((url) => fetch(url)));
                const dataClicks = await responses[0].json();
                const dataEarnings = await responses[1].json();
                const dataCostPerClick = await responses[2].json();
                const dataRpm = await responses[3].json();

                const dateRange = [];
                let currentDate = dayjs(startDate);
                while (currentDate.isBefore(dayjs(endDate).add(1, 'day'))) {
                    dateRange.push(currentDate.format('YYYY-MM-DD'));
                    currentDate = currentDate.add(1, 'day');
                }

                const clicksMap = new Map<string, number>(dataClicks.data.rows.map((row: any) => [row.cells[0].value, Number(row.cells[1].value)]));
                const earningsMap = new Map<string, number>(dataEarnings.data.rows.map((row: any) => [row.cells[0].value, Number(row.cells[1].value)]));
                const costPerClickMap = new Map<string, number>(dataCostPerClick.data.rows.map((row: any) => [row.cells[0].value, Number(row.cells[1].value)]));
                const rpmMap = new Map<string, number>(dataRpm.data.rows.map((row: any) => [row.cells[0].value, Number(row.cells[1].value)]));

                const fillData = (map: Map<string, number>, dateRange: string[]): number[] => {
                    return dateRange.map((date) => map.get(date) || 0);
                };

                setClicksData(fillData(clicksMap, dateRange));
                setEarningsData(fillData(earningsMap, dateRange));
                setCostPerClickData(fillData(costPerClickMap, dateRange));
                setRpmData(fillData(rpmMap, dateRange));

                setError(null);
            } catch (err: any) {
                setError(err.message || 'Lỗi khi lấy dữ liệu AdSense');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdSenseData();
    }, [startDate, endDate, isDark]);

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

    const dates = [];
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(dayjs(endDate).add(1, 'day'))) {
        dates.push(currentDate.format('DD-MM'));
        currentDate = currentDate.add(1, 'day');
    }

    return (
        <div>
            {isLoading && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoading && (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Card for CLICKS */}
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-primary"></div>
                                <h3 className="text-lg font-semibold dark:text-white">{friendlyNames['CLICKS']}</h3>
                                <p>
                                    {formatNumber(clicksData.reduce((acc, val) => acc + val, 0))} {units['CLICKS'] || ''}
                                </p>
                            </div>
                        </div>

                        {/* Card for ESTIMATED EARNINGS */}
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-primary"></div>
                                <h3 className="text-lg font-semibold dark:text-white">{friendlyNames['ESTIMATED_EARNINGS']}</h3>
                                <p>
                                    {formatNumber(earningsData.reduce((acc, val) => acc + val, 0))} {units['ESTIMATED_EARNINGS'] || ''}
                                </p>
                            </div>
                        </div>

                        {/* Card for COST PER CLICK */}
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-primary"></div>
                                <h3 className="text-lg font-semibold dark:text-white">{friendlyNames['COST_PER_CLICK']}</h3>
                                <p>
                                    {formatNumber(costPerClickData.reduce((acc, val) => acc + val, 0))} {units['COST_PER_CLICK'] || ''}
                                </p>
                            </div>
                        </div>

                        {/* Card for AD REQUESTS RPM */}
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <div className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg bg-primary"></div>
                                <h3 className="text-lg font-semibold dark:text-white">{friendlyNames['AD_REQUESTS_RPM']}</h3>
                                <p>
                                    {formatNumber(rpmData.reduce((acc, val) => acc + val, 0))} {units['AD_REQUESTS_RPM'] || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        {/* CLICKS Chart */}
                        <div className="panel mt-4 h-full xl:col-span-2">
                            <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                                <h5 className="text-lg font-semibold">{friendlyNames['CLICKS']}</h5>
                            </div>
                            <ReactApexChart options={chartOptions('Clicks', clicksData, dates)} series={[{ name: friendlyNames['CLICKS'], data: clicksData }]} type="area" height={250} />
                        </div>

                        {/* ESTIMATED EARNINGS Chart */}
                        <div className="panel mt-4 h-full xl:col-span-2">
                            <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                                <h5 className="text-lg font-semibold">{friendlyNames['ESTIMATED_EARNINGS']}</h5>
                            </div>
                            <ReactApexChart
                                options={chartOptions('Earnings', earningsData, dates)}
                                series={[{ name: friendlyNames['ESTIMATED_EARNINGS'], data: earningsData }]}
                                type="area"
                                height={250}
                            />
                        </div>

                        {/* COST PER CLICK Chart */}
                        <div className="panel mt-4 h-full xl:col-span-2">
                            <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                                <h5 className="text-lg font-semibold">{friendlyNames['COST_PER_CLICK']}</h5>
                            </div>
                            <ReactApexChart
                                options={chartOptions('CostPerClick', costPerClickData, dates)}
                                series={[{ name: friendlyNames['COST_PER_CLICK'], data: costPerClickData }]}
                                type="area"
                                height={250}
                            />
                        </div>

                        {/* AD REQUESTS RPM Chart */}
                        <div className="panel mt-4 h-full xl:col-span-2">
                            <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                                <h5 className="text-lg font-semibold">{friendlyNames['AD_REQUESTS_RPM']}</h5>
                            </div>
                            <ReactApexChart options={chartOptions('Rpm', rpmData, dates)} series={[{ name: friendlyNames['AD_REQUESTS_RPM'], data: rpmData }]} type="area" height={250} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ComponentReadAdSenseAnalytics;
