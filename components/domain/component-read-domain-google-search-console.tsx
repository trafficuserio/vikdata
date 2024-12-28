'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useSearchParams } from 'next/navigation';

interface GSCData {
    query?: string;
    date?: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

interface ComponentProps {
    startDate: Date | null;
    endDate: Date | null;
}

const friendlyNames: Record<string, string> = {
    clicks: 'Clicks',
    impressions: 'Impressions',
    ctr: 'CTR',
    position: 'Position',
    date: 'Date',
    query: 'Từ khóa',
};

const units: Record<string, string> = {
    clicks: '',
    impressions: '',
    ctr: '%',
    position: '',
};

const seriesNameToMetricKey: Record<string, string> = {
    Clicks: 'clicks',
    Impressions: 'impressions',
    'CTR (%)': 'ctr',
    Position: 'position',
};

const ComponentReadDomainGoogleSearchConsole: React.FC<ComponentProps> = ({ startDate, endDate }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const [errorGSC, setErrorGSC] = useState<string | null>(null);
    const [isLoadingGSC, setIsLoadingGSC] = useState(false);

    const [gscData, setGscData] = useState<GSCData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [sortBy, setSortBy] = useState<keyof GSCData>('query');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>('');

    // States for Chart
    const [chartData, setChartData] = useState<{
        series: {
            name: string;
            data: number[];
        }[];
        options: any;
        totals: {
            [key: string]: number;
        };
    } | null>(null);

    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');

    const formatNumber = (value: number | string) => {
        return new Intl.NumberFormat('vi-VN').format(Number(value));
    };

    const fetchTableData = async () => {
        try {
            const start = dayjs(startDate).format('YYYY-MM-DD');
            const endFormatted = dayjs(endDate).format('YYYY-MM-DD');
            const response = await fetch(
                `/api/gsc/queries?start=${start}&end=${endFormatted}&domainId=${domainId}&limit=${limit}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}&dimensions=query`,
            );
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu GSC FETCH');
            }
            const result = await response.json();
            setGscData(result.data);
            setTotal(result.total);
            setErrorGSC(null);
        } catch (error: any) {
            console.error('Error fetching GSC data:', error);
            setErrorGSC('Lỗi khi lấy dữ liệu GSC UI');
        }
    };

    const fetchChartData = async () => {
        try {
            const start = dayjs(startDate).format('YYYY-MM-DD');
            const endFormatted = dayjs(endDate).format('YYYY-MM-DD');
            const response = await fetch(`/api/gsc/queries?start=${start}&end=${endFormatted}&domainId=${domainId}&dimensions=date`);
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu biểu đồ GSC');
            }
            const result = await response.json();
            const data: GSCData[] = result.data;

            // Sort data by date
            const sortedData = data.sort((a, b) => dayjs(a.date!).diff(dayjs(b.date!)));

            const generatedDates = sortedData.map((d) => dayjs(d.date!).format('DD/MM'));

            const clicksArray = sortedData.map((d) => d.clicks);
            const impressionsArray = sortedData.map((d) => d.impressions);
            const ctrArray = sortedData.map((d) => d.ctr * 100); // Convert to percentage
            const positionArray = sortedData.map((d) => d.position);

            const totals = {
                clicks: sortedData.reduce((acc, val) => acc + val.clicks, 0),
                impressions: sortedData.reduce((acc, val) => acc + val.impressions, 0),
                ctr: sortedData.length > 0 ? sortedData.reduce((acc, val) => acc + val.ctr, 0) / sortedData.length : 0,
                position: sortedData.length > 0 ? sortedData.reduce((acc, val) => acc + val.position, 0) / sortedData.length : 0,
            };

            setChartData({
                series: [
                    { name: 'Clicks', data: clicksArray },
                    { name: 'Impressions', data: impressionsArray },
                    { name: 'CTR (%)', data: ctrArray },
                    { name: 'Position', data: positionArray },
                ],
                options: {
                    chart: {
                        id: 'gscChart',
                        height: 325,
                        type: 'area',
                        fontFamily: 'Nunito, sans-serif',
                        zoom: { enabled: false },
                        toolbar: { show: false },
                        events: {
                            mounted: function (chartContext: any, config: any) {},
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
                    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
                    labels: generatedDates,
                    xaxis: {
                        type: 'category',
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
                    yaxis: [
                        {
                            title: { text: 'Counts' },
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
                        },
                    ],
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
                totals: totals,
            });

            setErrorGSC(null);
        } catch (error: any) {
            console.error('Error fetching GSC chart data:', error);
            setErrorGSC('Lỗi khi lấy dữ liệu biểu đồ GSC');
        }
    };

    useEffect(() => {
        if (!startDate || !endDate || !domainId) return;
        setIsLoadingGSC(true);
        // Fetch both table and chart data concurrently
        Promise.all([fetchTableData(), fetchChartData()]).finally(() => {
            setIsLoadingGSC(false);
        });
    }, [startDate, endDate, domainId, page, limit, sortBy, sortOrder, search]);

    if (errorGSC) return <div className="text-red-500">{errorGSC}</div>;

    const columns: DataTableColumn<GSCData>[] = [
        { accessor: 'query', title: 'Từ khóa', sortable: true },
        { accessor: 'clicks', title: 'Clicks', sortable: true, render: ({ clicks }) => formatNumber(clicks) },
        { accessor: 'impressions', title: 'Impressions', sortable: true, render: ({ impressions }) => formatNumber(impressions) },
        { accessor: 'ctr', title: 'CTR', sortable: true, render: ({ ctr }) => `${(ctr * 100).toFixed(2)}%` },
        { accessor: 'position', title: 'Position', sortable: true, render: ({ position }) => position.toFixed(2) },
    ];

    return (
        <div>
            {isLoadingGSC && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoadingGSC && chartData && (
                <>
                    {/* Totals Cards */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        {['clicks', 'impressions', 'ctr', 'position'].map((metric, index) => (
                            <div key={metric} className="relative flex-grow overflow-hidden rounded-lg bg-white px-6 py-4 dark:bg-black">
                                <div className="absolute -left-1 top-1/2 h-14 w-2 -translate-y-1/2 rounded-lg" style={{ backgroundColor: chartData.options.colors[index] || '#008FFB' }}></div>
                                <h3 className="text-lg font-semibold dark:text-white">{friendlyNames[metric] || metric}</h3>
                                <p>{['ctr', 'position'].includes(metric) ? `${chartData.totals[metric].toFixed(2)}${units[metric]}` : formatNumber(chartData.totals[metric])} </p>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="panel mt-4 h-full xl:col-span-2">
                        <div className="flex flex-col justify-between dark:text-white-light md:flex-row">
                            <h5 className="text-lg font-semibold">Biểu đồ Google Search Console</h5>
                        </div>
                        <div className="relative">
                            <div className="rounded-lg bg-white dark:bg-black">
                                <ReactApexChart options={chartData.options} series={chartData.series} type="area" height={325} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Data Table */}
            {!isLoadingGSC && (
                <div className="panel mt-4 border-white-light px-0 dark:border-[#1b2e4b]">
                    <div className="mb-4 flex-col md:flex-row items-center justify-between gap-4 flex px-4">
                        <h5 className="text-lg font-semibold mb-2 dark:text-white">Google Search Console - Chi tiết từ khóa</h5>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Tìm kiếm..."
                            className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="datatables pagination-padding overflow-auto h-[70dvh]">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={gscData}
                            columns={columns}
                            totalRecords={total}
                            recordsPerPage={limit}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPageOptions={[10, 20, 30, 50, 100, 200, 500, 1000, 2000, 5000]}
                            onRecordsPerPageChange={(size) => {
                                setLimit(size);
                                setPage(1);
                            }}
                            sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
                            onSortStatusChange={({ columnAccessor, direction }) => {
                                setSortBy(columnAccessor as keyof GSCData);
                                setSortOrder(direction as 'asc' | 'desc');
                                setPage(1);
                            }}
                            paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                            highlightOnHover
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentReadDomainGoogleSearchConsole;
