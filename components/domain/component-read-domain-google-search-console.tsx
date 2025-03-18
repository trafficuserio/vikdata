// component-read-domain-google-search-console.tsx
'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useSearchParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import countries from 'i18n-iso-countries';
// Import ngôn ngữ bạn muốn sử dụng
import 'i18n-iso-countries/langs/vi.json';
import 'i18n-iso-countries/langs/en.json';

interface GSCData {
    query?: string;
    page?: string;
    country?: string;
    device?: string;
    search_appearance?: string;
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
    page: 'Trang',
    country: 'Quốc gia',
    device: 'Thiết bị',
    search_appearance: 'Hiển thị tìm kiếm',
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

// 1. Định nghĩa mô tả tiếng Việt cho các metric
const metricDescriptions: Record<string, string> = {
    clicks: 'Nhấp chuột',
    impressions: 'Hiển thị',
    ctr: 'Tỷ lệ nhấp chuột',
    position: 'Vị trí trung bình',
};

// Define table dimensions
type Dimension = 'query' | 'page' | 'country' | 'device' | 'search_appearance' | 'date';

// Thêm mapping cho tên quốc gia
const countryNames: Record<string, string> = {
    'VN': 'Vietnam',
    'US': 'United States',
    'GB': 'United Kingdom',
    'FR': 'France',
    'DE': 'Germany',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'TW': 'Taiwan',
    'HK': 'Hong Kong',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    // Thêm các quốc gia khác nếu cần
};

// Khởi tạo với ngôn ngữ
countries.registerLocale(require('i18n-iso-countries/langs/vi.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

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
    const [currentDimension, setCurrentDimension] = useState<Dimension>('query');

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
                `/api/gsc/queries?start=${start}&end=${endFormatted}&domainId=${domainId}&limit=${limit}&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}&dimensions=${currentDimension}`,
            );
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error fetching table data: ${errorText}`);
            }
            const result = await response.json();
            console.log('Table Data:', result);
            setGscData(result.data);
            setTotal(result.total);
            setErrorGSC(null);
        } catch (error: any) {
            console.error('Error fetching GSC data:', error);
            setErrorGSC(`Lỗi khi lấy dữ liệu GSC: ${error.message}`);
        }
    };

    const fetchChartData = async () => {
        try {
            const start = dayjs(startDate).format('YYYY-MM-DD');
            const endFormatted = dayjs(endDate).format('YYYY-MM-DD');
            const response = await fetch(`/api/gsc/queries?start=${start}&end=${endFormatted}&domainId=${domainId}&dimensions=date`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error fetching chart data: ${errorText}`);
            }
            const result = await response.json();
            console.log('Chart Data:', result);
            const data: GSCData[] = result.data;

            const sortedData = data.sort((a, b) => dayjs(a.date!).diff(dayjs(b.date!)));

            const generatedDates = sortedData.map((d) => dayjs(d.date!).format('DD/MM'));

            const clicksArray = sortedData.map((d) => d.clicks);
            const impressionsArray = sortedData.map((d) => d.impressions);
            const ctrArray = sortedData.map((d) => d.ctr * 100);
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
                        type: 'line',
                        fontFamily: 'Nunito, sans-serif',
                        zoom: { enabled: false },
                        toolbar: {
                            show: false
                        },
                        events: {
                            mounted: function (chartContext: any, config: any) {},
                        },
                    },
                    dataLabels: { enabled: false },
                    stroke: {
                        show: true,
                        curve: 'straight', // Google Search Console uses straight lines
                        width: 2,
                        lineCap: 'square',
                    },
                    dropShadow: {
                        enabled: false, // GSC doesn't use drop shadows
                    },
                    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'], // Google colors
                    labels: generatedDates,
                    xaxis: {
                        type: 'category',
                        axisBorder: { show: true },
                        axisTicks: { show: true },
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
                        fontSize: '14px',
                        markers: { width: 8, height: 8, offsetX: -2 },
                        itemMargin: { horizontal: 10, vertical: 5 },
                    },
                    tooltip: {
                        marker: { show: true },
                        x: { show: true },
                        y: {
                            formatter: (val: number, opts: any) => {
                                const seriesName = opts.w.globals.seriesNames[opts.seriesIndex];
                                const metricKey = seriesNameToMetricKey[seriesName] || '';
                                const unit = units[metricKey] ? ' ' + units[metricKey] : '';
                                return formatNumber(val) + unit;
                            },
                        },
                        theme: isDark ? 'dark' : 'light',
                    },
                    fill: {
                        type: 'solid', // GSC uses solid lines, not gradients
                        opacity: 1,
                    },
                    states: {
                        hover: {
                            filter: {
                                type: 'lighten',
                                value: 0.05,
                            }
                        },
                        active: {
                            allowMultipleDataPointsSelection: false,
                            filter: {
                                type: 'darken',
                                value: 0.35,
                            }
                        }
                    },
                },
                totals: totals,
            });

            setErrorGSC(null);
        } catch (error: any) {
            console.error('Error fetching GSC chart data:', error);
            setErrorGSC(`Lỗi khi lấy dữ liệu biểu đồ GSC: ${error.message}`);
        }
    };

    useEffect(() => {
        if (!startDate || !endDate || !domainId) return;
        setIsLoadingGSC(true);
        // Fetch both table and chart data concurrently
        Promise.all([fetchTableData(), fetchChartData()]).finally(() => {
            setIsLoadingGSC(false);
        });
    }, [startDate, endDate, domainId, page, limit, sortBy, sortOrder, search, currentDimension]);

    const handleDimensionChange = (dimension: Dimension) => {
        setCurrentDimension(dimension);
        setPage(1);
        
        // Update sortBy based on the new dimension
        if (dimension === 'date') {
            setSortBy('date');
        } else if (dimension === 'query') {
            setSortBy('query');
        } else if (dimension === 'page') {
            setSortBy('page');
        } else if (dimension === 'country') {
            setSortBy('country');
        } else if (dimension === 'device') {
            setSortBy('device');
        } else if (dimension === 'search_appearance') {
            setSortBy('search_appearance');
        }
    };

    if (errorGSC) return <div className="text-red-500">{errorGSC}</div>;

    // Dynamic columns based on current dimension
    const getDynamicColumns = (): DataTableColumn<GSCData>[] => {
        const dimensionColumn: DataTableColumn<GSCData> = {
            accessor: currentDimension as string,
            title: friendlyNames[currentDimension] || currentDimension,
            sortable: true,
            render: currentDimension === 'country' 
                ? ({ country }) => {
                    if (!country) return '';
                    let countryName = countries.getName(country, 'vi', {select: 'official'});
                    if (!countryName && country.length === 3) {
                        const alpha2 = countries.alpha3ToAlpha2(country.toUpperCase());
                        if (alpha2) {
                            countryName = countries.getName(alpha2, 'vi', {select: 'official'});
                        }
                    }
                    return countryName || (country === 'zzz' ? 'Vùng không xác định' : country);
                }
                : undefined
        };

        const commonColumns: DataTableColumn<GSCData>[] = [
            { accessor: 'clicks', title: 'Clicks', sortable: true, render: ({ clicks }) => formatNumber(clicks) },
            { accessor: 'impressions', title: 'Impressions', sortable: true, render: ({ impressions }) => formatNumber(impressions) },
            { accessor: 'ctr', title: 'CTR', sortable: true, render: ({ ctr }) => `${(ctr * 100).toFixed(2)}%` },
            { accessor: 'position', title: 'Position', sortable: true, render: ({ position }) => position.toFixed(2) },
        ];

        return [dimensionColumn, ...commonColumns];
    };

    return (
        <div>
            {isLoadingGSC && (
                <div className="mt-4 flex justify-center">
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
                </div>
            )}

            {!isLoadingGSC && chartData && (
                <>
                    {/* Chart Header with Metrics Selection - Google GSC Style */}
                    <div className="mt-4 panel p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold dark:text-white mb-2 md:mb-0">Google Search Console Performance</h5>
                            <div className="flex space-x-2">
                                {['clicks', 'impressions', 'ctr', 'position'].map((metric, index) => (
                                    <div 
                                        key={metric} 
                                        className="px-3 py-1 rounded-full cursor-pointer flex items-center text-sm"
                                        style={{ 
                                            backgroundColor: `${chartData.options.colors[index]}22`, 
                                            color: chartData.options.colors[index],
                                            border: `1px solid ${chartData.options.colors[index]}`
                                        }}
                                    >
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: chartData.options.colors[index] }}></span>
                                        {friendlyNames[metric] || metric}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Cards - Google GSC Style */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {['clicks', 'impressions', 'ctr', 'position'].map((metric, index) => (
                                <div key={metric} className="bg-white dark:bg-black p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-start">
                                        <div className="w-3 h-3 mt-1 rounded-full mr-2" style={{ backgroundColor: chartData.options.colors[index] }}></div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{friendlyNames[metric] || metric}</p>
                                            <h3 className="text-xl font-semibold mt-1">
                                                {['ctr'].includes(metric) 
                                                    ? `${(chartData.totals[metric] * 100).toFixed(2)}${units[metric]}` 
                                                    : metric === 'position' 
                                                        ? chartData.totals[metric].toFixed(2)
                                                        : formatNumber(chartData.totals[metric])}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart - Google GSC Style */}
                        <div className="relative">
                            <div className="rounded-lg bg-white dark:bg-black">
                                <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={325} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Data Table with Tabs - Google GSC Style */}
            {!isLoadingGSC && (
                <div className="panel mt-4 border-white-light px-0 dark:border-[#1b2e4b]">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="text-lg font-semibold dark:text-white">Search results</h5>
                    </div>
                    
                    {/* GSC Dimension Tabs */}
                    <Tab.Group selectedIndex={['query', 'page', 'country', 'device', 'search_appearance', 'date'].indexOf(currentDimension)} onChange={(index) => {
                        const dimensions: Dimension[] = ['query', 'page', 'country', 'device', 'search_appearance', 'date'];
                        handleDimensionChange(dimensions[index]);
                    }}>
                        <Tab.List className="flex p-1 space-x-1 border-b border-gray-200 dark:border-gray-700 px-4">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Queries
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Pages
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Countries
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Devices
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Search appearance
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={`${
                                            selected ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        } px-4 py-2 text-sm font-medium focus:outline-none`}
                                    >
                                        Dates
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                    </Tab.Group>

                    <div className="px-4 py-2 flex justify-between items-center">
                        <div></div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Filter items..."
                            className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white w-full max-w-xs"
                        />
                    </div>
                    
                    <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={gscData}
                            columns={getDynamicColumns()}
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
                            paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                            highlightOnHover
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentReadDomainGoogleSearchConsole;
