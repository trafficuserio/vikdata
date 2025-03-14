import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';

interface HistorySerperData {
    id: number;
    keyword: string;
    rank: number;
    createdAt: string;
    domainName: string;
    keyword_id: number;
    domain_id: number;
}

interface ApiResponse {
    errorcode: number;
    message: string;
    data: {
        limit: number;
        offset: number;
        totalPage: number;
        data: HistorySerperData[];
    };
}

const ComponentHistorySerper: React.FC<{ startDate: Date; endDate: Date }> = ({ startDate, endDate }) => {
    const [data, setData] = useState<HistorySerperData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    const searchParams = useSearchParams();
    const domainIdParam = searchParams.get('id');
    const domainId = domainIdParam ? parseInt(domainIdParam, 10) : null;

    const token = Cookies.get('token');

    const fetchData = async () => {
        if (!domainId) return;

        setLoading(true);

        const params = {
            domainId,
            startTime: dayjs(startDate).valueOf(),
            endTime: dayjs(endDate).valueOf(),
            limit,
            offset: (page - 1) * limit,
        };

        try {
            const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_URL_API}/api/check-rank/get-history-manual-check-rank-by-domain-id`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.errorcode === 200) {
                setData(response.data.data.data);
                setTotal(response.data.data.totalPage * limit);
            }
        } catch (err) {
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [domainId, startDate, endDate, page, limit]);

    const columns: DataTableColumn<HistorySerperData>[] = [
        { accessor: 'keyword', title: 'Từ khóa', sortable: false },
        { accessor: 'domainName', title: 'Domain', sortable: false },
        { accessor: 'rank', title: 'Thứ hạng', sortable: false },
        {
            accessor: 'createdAt',
            title: 'Ngày check',
            sortable: false,
            render: ({ createdAt }) => <span>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>,
        },
    ];

    return (
        <div className="panel mt-4 border-white-light p-0 dark:border-[#1b2e4b]  overflow-auto rounded-lg">
            <div className="datatables pagination-padding">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={data}
                    columns={columns}
                    totalRecords={total}
                    recordsPerPage={limit}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={[10, 20, 30, 50, 100]}
                    onRecordsPerPageChange={(size) => {
                        setLimit(size);
                        setPage(1);
                    }}
                    paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} trong tổng số ${totalRecords} mục`}
                    highlightOnHover
                    fetching={loading}
                />
            </div>
        </div>
    );
};

export default ComponentHistorySerper;
