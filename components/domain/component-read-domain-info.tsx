'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';
const ComponentReadInfo = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [domainInfo, setDomainInfo] = useState<any>(null);
    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');
    useEffect(() => {
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
                } else if (data.errorcode === 200) {
                    setDomainInfo(data.data);
                } else {
                    console.error('Error fetching domain info:', data.message);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (domainId && token) {
            fetchAdSenseData();
        }
    }, [domainId, token]);
    if (isLoading) {
        return (
            <div className="mt-4 flex justify-center">
                <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
            </div>
        );
    }
    if (!domainInfo) {
        return <div>No domain data available.</div>;
    }
    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold">Thông tin miền</h2>
            <ul className="space-y-3">
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Tên miền:</strong>
                    <span className="text-base">{domainInfo.domain}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Người phụ trách:</strong>
                    <span className="text-base">{domainInfo.person}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Loại site:</strong>
                    <span className="text-base">{domainInfo.type_site}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Nhóm site:</strong>
                    <span className="text-base">{domainInfo.group_site}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Tổng link:</strong>
                    <span className="text-base">{domainInfo.total_link}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Trạng thái:</strong>
                    <span className={`text-base ${domainInfo.status ? 'text-green-600' : 'text-red-600'}`}>{domainInfo.status ? 'Hoạt động' : 'Không hoạt động'}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Ngày Reg Domain:</strong>
                    <span className="text-base">{new Date(domainInfo.time_reg_domain).toLocaleDateString()}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Ngày Index:</strong>
                    <span className="text-base">{new Date(domainInfo.time_index).toLocaleDateString()}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Tổng từ khóa:</strong>
                    <span className="text-base">{domainInfo.total_key_ahrerf}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Traffic khóa:</strong>
                    <span className="text-base">{domainInfo.traffic_ahrerf}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Mô tả:</strong>
                    <span className="text-base">{domainInfo.description}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">User Admin:</strong>
                    <span className="text-base">{domainInfo.user_admin}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Password Admin:</strong>
                    <span className="text-base">{domainInfo.password_admin}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">User Aplication:</strong>
                    <span className="text-base">{domainInfo.user_aplication}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Password Aplication:</strong>
                    <span className="text-base">{domainInfo.password_aplication}</span>
                </li>
            </ul>
        </div>
    );
};
export default ComponentReadInfo;
