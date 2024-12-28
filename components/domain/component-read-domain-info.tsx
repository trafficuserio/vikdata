'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

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
                if (data.errorcode === 200) {
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
        <div className="mt-8 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold">Thông tin miền</h2>
            <ul className="space-y-3">
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Tên miền:</strong>
                    <span className="text-base">{domainInfo.domain}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Người dùng:</strong>
                    <span className="text-base">{domainInfo.person}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Loại trang web:</strong>
                    <span className="text-base">{domainInfo.type_site}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Nhóm trang web:</strong>
                    <span className="text-base">{domainInfo.group_site}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Trạng thái:</strong>
                    <span className={`text-base ${domainInfo.status ? 'text-green-600' : 'text-red-600'}`}>{domainInfo.status ? 'Hoạt động' : 'Không hoạt động'}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Thời gian đăng ký:</strong>
                    <span className="text-base">{new Date(domainInfo.time_reg_domain).toLocaleDateString()}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Thời gian cập nhật:</strong>
                    <span className="text-base">{new Date(domainInfo.time_index).toLocaleDateString()}</span>
                </li>
                <li className="flex gap-2">
                    <strong className="font-medium text-base">Mô tả:</strong>
                    <span className="text-base">{domainInfo.description}</span>
                </li>
            </ul>
        </div>
    );
};

export default ComponentReadInfo;