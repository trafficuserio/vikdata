// app/adsense/page.tsx
import React from 'react';
import { refreshAccessToken, getAdSenseAccounts, getAdSenseReport, AdSenseAccount, AdSenseReportRow } from '@/lib/adsense';

// Giúp Next.js hiểu rằng chúng ta muốn cho phép "SSR" & gọi server-side DB/API
// => cho page này luôn động, không bị đóng băng static
export const dynamic = 'force-dynamic';

interface AccountReport {
    account: AdSenseAccount;
    reportData: any; // bạn có thể khai báo interface chi tiết hơn thay vì 'any'
}

// Hàm server-side để xử lý logic lấy dữ liệu
async function getAdsenseData() {
    try {
        // 1. Lấy refresh token từ biến môi trường
        const refreshToken = process.env.ADSENSE_REFRESH_TOKEN;
        if (!refreshToken) {
            throw new Error('Chưa cấu hình ADSENSE_REFRESH_TOKEN trong .env');
        }

        // 2. Làm mới access token
        const accessToken = await refreshAccessToken(refreshToken);
        if (!accessToken) {
            throw new Error('Không làm mới được Access Token');
        }

        // 3. Lấy danh sách tài khoản AdSense
        const accountsData = await getAdSenseAccounts(accessToken);
        if (!accountsData?.accounts || accountsData.accounts.length === 0) {
            return { accounts: null };
        }

        // 4. Lấy báo cáo cho từng tài khoản
        const accounts: AccountReport[] = [];
        for (const acc of accountsData.accounts) {
            const report = await getAdSenseReport(accessToken, acc.name);
            accounts.push({
                account: acc,
                reportData: report,
            });
        }

        // Trả kết quả
        return { accounts };
    } catch (err: any) {
        return { error: err.message || 'Đã có lỗi xảy ra' };
    }
}

// Đây là **Server Component**.
export default async function AdsensePage() {
    const { accounts, error } = await getAdsenseData();

    // Xử lý lỗi
    if (error) {
        return <div className="p-4 text-red-500">Lỗi: {error}</div>;
    }

    // Không có dữ liệu
    if (!accounts) {
        return <div className="p-4">Không có dữ liệu tài khoản AdSense</div>;
    }

    // Render bảng
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Google AdSense Data</h1>
            {accounts.map((item) => {
                const { account, reportData } = item;
                return (
                    <div key={account.name} className="mb-6 border p-4 rounded">
                        <h2 className="font-semibold">
                            Tài khoản: {account.name} - {account.displayName}
                        </h2>

                        {reportData?.rows?.length > 0 ? (
                            <table className="min-w-full text-left mt-2 border">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-2 py-1">Date</th>
                                        <th className="px-2 py-1">Clicks</th>
                                        <th className="px-2 py-1">Impressions</th>
                                        <th className="px-2 py-1">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.rows.map((row: AdSenseReportRow, i: number) => {
                                        const date = row.dimensionValues?.['DATE'] || '';
                                        const [clicks, impressions, earnings] = row.metricValues ?? [];

                                        return (
                                            <tr key={i} className="border-b hover:bg-gray-50">
                                                <td className="px-2 py-1">{date}</td>
                                                <td className="px-2 py-1">{clicks?.value || '0'}</td>
                                                <td className="px-2 py-1">{impressions?.value || '0'}</td>
                                                <td className="px-2 py-1">{earnings?.value || '0'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">Không có dữ liệu báo cáo.</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
