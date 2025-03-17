'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DataTable } from 'mantine-datatable';
import Cookies from 'js-cookie';

interface CheckResult {
    url: string;
    status: string;
    message: string;
}

const CheckUrlsComponent: React.FC = () => {
    const [textareaValue, setTextareaValue] = useState<string>('');
    const [results, setResults] = useState<CheckResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const token = Cookies.get('token');
    const MySwal = withReactContent(Swal);

    const handleSubmit = async () => {
        const urls = textareaValue
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url !== '');
        if (urls.length === 0) {
            Swal.fire('Thông báo', 'Vui lòng nhập ít nhất một URL', 'warning');
            return;
        }

        setResults([]);
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/check-index/check-index-urls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ urls }),
            });
            if (!response.body) throw new Error('Response body không khả dụng');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const normalized = buffer.replace(/}{/g, '}\n{');
                const lines = normalized.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message === 'Check index success' && parsed.data === null) continue;
                        setResults((prev) => [
                            ...prev,
                            {
                                url: urls[prev.length] || 'N/A',
                                status: parsed.data ? 'Đã Index' : 'Chưa Index',
                                message: parsed.message,
                            },
                        ]);
                    } catch (err) {
                        console.error('Lỗi parse JSON:', err);
                    }
                }
            }
            if (buffer.trim()) {
                try {
                    const parsed = JSON.parse(buffer);
                    if (!(parsed.message === 'Check index success' && parsed.data === null)) {
                        setResults((prev) => [
                            ...prev,
                            {
                                url: urls[prev.length] || 'N/A',
                                status: parsed.data ? 'Đã Index' : 'Chưa Index',
                                message: parsed.message,
                            },
                        ]);
                    }
                } catch (err) {
                    console.error('Lỗi parse JSON cuối:', err);
                }
            }
            Swal.fire('Thành công', 'Check Index hoàn tất', 'success');
        } catch (error) {
            Swal.fire('Lỗi', 'Có lỗi xảy ra', 'error');
        }
        setLoading(false);
    };

    const columns = [
        { accessor: 'url', title: 'URL' },
        { accessor: 'status', title: 'Trạng thái' },
        {
            accessor: 'message',
            title: 'Thông báo',
            render: (row: CheckResult) => (
                <span className={row.message === 'Your url is indexed' ? 'text-success' : row.message === 'Your url is not indexed' ? 'text-danger' : 'text-gray-500'}>
                    {row.message === 'Your url is indexed' ? 'Url này đã Index' : row.message === 'Your url is not indexed' ? 'Url này chưa Index' : row.message}
                </span>
            ),
        },
    ];

    return (
        <>
            <div className="p-4 mx-auto panel border-[#e4e9f0] dark:border-[#1b2e4b] rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Check Index</h2>
                <textarea
                    className="w-full h-40 p-2 border border-gray-300 rounded-md mb-4 form-input"
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    placeholder="Mỗi dòng là 1 URL"
                ></textarea>
                <button onClick={handleSubmit} className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Check Index'}
                </button>
            </div>
            <div className="panel p-0 overflow-hidden mt-4">
                <div className="invoice-table">
                    <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                        <DataTable
                            columns={columns}
                            records={results || []}
                            totalRecords={results?.length || 0}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPage={results?.length > 0 ? results.length : 5}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckUrlsComponent;
