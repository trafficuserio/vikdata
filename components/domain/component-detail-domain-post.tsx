'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable, DataTableColumnTextAlignment } from 'mantine-datatable';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';
import IconEdit from '@/components/icon/icon-edit';
import he from 'he';

interface Post {
    id: number;
    h1: string;
    yoast_title: string;
    description: string;
    number_of_words: number;
    action: string;
}

interface DomainInfo {
    domain: string;
    user_admin: string;
    password_admin: string;
}

const PostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);

    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');
    const router = useRouter();

    useEffect(() => {
        if (domainId && token) {
            axios
                .get(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-domain/get-infor-domain-by-id`, {
                    params: { id: domainId },
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    const json = response.data;
                    if ([401, 403].includes(json.errorcode)) {
                        ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                        logout();
                        return;
                    } else if (json.errorcode === 200) {
                        setDomainInfo(json.data);
                    }
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy thông tin domain:', error);
                });
        }
    }, [domainId, token]);

    useEffect(() => {
        if (domainInfo && domainInfo.domain) {
            axios
                .get<Post[]>(`https://${domainInfo.domain}/wp-json/custom/v1/get-posts`)
                .then((response) => {
                    const decodedPosts = response.data.map((post) => ({
                        ...post,
                        h1: he.decode(post.h1),
                        yoast_title: he.decode(post.yoast_title),
                        description: he.decode(post.description),
                    }));
                    setPosts(decodedPosts);
                })
                .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu bài viết:', error);
                });
        }
    }, [domainInfo]);

    const columns = [
        {
            accessor: 'h1',
            title: 'H1',
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'yoast_title',
            title: 'Tiêu đề',
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'description',
            title: 'Mô tả',
            textAlignment: 'left' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'id',
            title: 'Post ID',
            textAlignment: 'center' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'number_of_words',
            title: 'Số từ',
            textAlignment: 'center' as DataTableColumnTextAlignment,
        },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center' as DataTableColumnTextAlignment,
            render: (post: Post) => (
                <a
                    href={
                        'https://' +
                        domainInfo?.domain +
                        '/auto-login-page?user=' +
                        domainInfo?.user_admin +
                        '&pass=' +
                        domainInfo?.password_admin +
                        '&redirect=' +
                        domainInfo?.domain +
                        '/wp-admin/post.php?post=' +
                        post.id +
                        '&action=edit'
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    <IconEdit className="text-warning" />
                </a>
            ),
        },
    ];

    return (
        <div className="panel p-0 overflow-hidden">
            <div className="invoice-table">
                <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                    <DataTable columns={columns} records={posts} className="table-hover whitespace-nowrap" highlightOnHover />
                </div>
            </div>
        </div>
    );
};

export default PostList;
