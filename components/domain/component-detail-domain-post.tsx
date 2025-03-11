'use client';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { DataTable, DataTableColumnTextAlignment } from 'mantine-datatable';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';
import IconEdit from '@/components/icon/icon-edit';
import he from 'he';
import { Modal, Tooltip, Button } from '@mantine/core';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Select from 'react-select';
interface Post {
    id: number;
    h1: string;
    yoast_title: string;
    description: string;
    number_of_words: number;
    categories: string[];
    action: string;
    primary_key?: string | null;
}
interface DomainInfo {
    domain: string;
    user_admin: string;
    password_admin: string;
    user_aplication: string;
    password_aplication: string;
}
interface Option {
    value: string;
    label: string;
}
const PostList: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
    const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Option>({ value: '', label: 'Tất cả danh mục' });
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const domainId = searchParams.get('id');
    const token = Cookies.get('token');
    const router = useRouter();
    const MySwal = withReactContent(Swal);
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
            setIsLoading(true);
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
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error('Lỗi khi lấy dữ liệu bài viết:', error);
                });
        }
    }, [domainInfo]);
    const showDeletingModal = () => {
        Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    };
    const handleDelete = async (post: Post) => {
        if (!domainInfo) {
            console.error('Không có thông tin domain');
            return;
        }
        try {
            showDeletingModal();
            const token = Cookies.get('token');
            const serverResponse = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/get-server-infors`, {
                params: { limit: 100, offset: 0, byOder: 'ASC' },
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const servers = serverResponse.data.data || [];
            let availableServer = null;
            for (let server of servers) {
                try {
                    const statusResponse = await axios.get(`${server.domain_server}/api/site/status`);
                    if (statusResponse.status === 200 && statusResponse.data.is_running === false) {
                        availableServer = server;
                        break;
                    }
                } catch (e) {}
            }
            if (!availableServer) {
                console.error('Không có server khả dụng');
                Swal.close();
                return;
            }
            const deleteUrl = `${availableServer.domain_server}/api/site/delete_posts`;
            const payload = {
                post_data: [
                    {
                        post_id: post.id,
                        primary_key: post.primary_key || null,
                    },
                ],
                username: domainInfo.user_aplication,
                password: domainInfo.password_aplication,
                url: 'https://' + domainInfo.domain,
            };
            const deleteResponse = await axios.post(deleteUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Delete response:', deleteResponse.data);
            setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
        } finally {
            Swal.close();
        }
    };
    const handleMultiDelete = async () => {
        if (!domainInfo || selectedPosts.length === 0) {
            console.error('Không có thông tin domain hoặc không có bài nào được chọn');
            return;
        }
        try {
            showDeletingModal();
            const token = Cookies.get('token');
            const serverResponse = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/server-infor/get-server-infors`, {
                params: { limit: 100, offset: 0, byOder: 'ASC' },
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const servers = serverResponse.data.data || [];
            let availableServer = null;
            for (let server of servers) {
                try {
                    const statusResponse = await axios.get(`${server.domain_server}/api/site/status`);
                    if (statusResponse.status === 200 && statusResponse.data.is_running === false) {
                        availableServer = server;
                        break;
                    }
                } catch (e) {}
            }
            if (!availableServer) {
                console.error('Không có server khả dụng');
                Swal.close();
                return;
            }
            const deleteUrl = `${availableServer.domain_server}/api/site/delete_posts`;
            const payload = {
                post_data: selectedPosts.map((post) => ({
                    post_id: post.id,
                    primary_key: post.primary_key || null,
                })),
                username: domainInfo.user_aplication,
                password: domainInfo.password_aplication,
                url: 'https://' + domainInfo.domain,
            };
            const deleteResponse = await axios.post(deleteUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Multi delete response:', deleteResponse.data);
            const deletedIds = selectedPosts.map((post) => post.id);
            setPosts((prevPosts) => prevPosts.filter((p) => !deletedIds.includes(p.id)));
            setSelectedPosts([]);
        } catch (error) {
            console.error('Lỗi khi xóa nhiều bài viết:', error);
        } finally {
            Swal.close();
        }
    };
    const confirmDelete = (post: Post) => {
        MySwal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa bài viết này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, xóa nó!',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(post);
            }
        });
    };
    const confirmMultiDelete = () => {
        MySwal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa các bài viết đã chọn không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, xóa chúng!',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                handleMultiDelete();
            }
        });
    };
    const allCategories = useMemo(() => {
        return Array.from(new Set(posts.flatMap((post) => post.categories)));
    }, [posts]);
    const categoryOptions: Option[] = useMemo(() => {
        const options = allCategories.map((cat) => ({ value: cat, label: cat }));
        return [{ value: '', label: 'Tất cả danh mục' }, ...options];
    }, [allCategories]);
    const filteredPosts = useMemo(() => {
        const query = search.toLowerCase();
        return posts.filter((post) => {
            const matchSearch =
                post.h1.toLowerCase().includes(query) ||
                post.yoast_title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                post.categories.some((cat) => cat.toLowerCase().includes(query)) ||
                String(post.id).toLowerCase().includes(query) ||
                String(post.number_of_words).toLowerCase().includes(query);
            const matchCategory = selectedCategory.value === '' || post.categories.includes(selectedCategory.value);
            return matchSearch && matchCategory;
        });
    }, [posts, search, selectedCategory]);
    const columns = [
        {
            accessor: 'h1',
            title: 'H1',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: any) => (
                <Tooltip label={row.h1} position="top" withArrow transition="fade" transitionDuration={100} className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
                    <div>{row.h1}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'yoast_title',
            title: 'Tiêu đề',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: any) => (
                <Tooltip label={row.yoast_title} position="top" withArrow transition="fade" transitionDuration={100} className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
                    <div>{row.yoast_title}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'description',
            title: 'Mô tả',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: any) => (
                <Tooltip label={row.description} position="top" withArrow transition="fade" transitionDuration={100} className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
                    <div>{row.description}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'categories',
            title: 'Danh mục',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: Post) => (
                <Tooltip
                    label={row.categories.join(', ')}
                    position="top"
                    withArrow
                    transition="fade"
                    transitionDuration={100}
                    className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                >
                    <div>{row.categories.join(', ')}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'id',
            title: 'Post ID',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: any) => (
                <Tooltip label={row.id} position="top" withArrow transition="fade" transitionDuration={100} className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start">
                    <div>{row.id}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'number_of_words',
            title: 'Số từ',
            textAlignment: 'left' as DataTableColumnTextAlignment,
            render: (row: any) => (
                <Tooltip
                    label={row.number_of_words}
                    position="top"
                    withArrow
                    transition="fade"
                    transitionDuration={100}
                    className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                >
                    <div>{row.number_of_words}</div>
                </Tooltip>
            ),
        },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center' as DataTableColumnTextAlignment,
            render: (post: Post) => (
                <div className="justify-center flex flex-col gap-1">
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
                        className="hover:underline"
                    >
                        Chỉnh sửa
                    </a>
                    <button onClick={() => confirmDelete(post)} className="hover:underline">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];
    return (
        <>
            <div className="flex gap-4 my-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="px-4 py-2 border rounded-md dark:bg-black dark:border-gray-700 dark:text-white flex-1 max-w-[300px]"
                />
                <div className="custom-select" style={{ width: 200 }}>
                    <Select options={categoryOptions} value={selectedCategory} onChange={(option) => option && setSelectedCategory(option)} isClearable={false} placeholder="Chọn danh mục" />
                </div>
                {selectedPosts.length > 0 && (
                    <Button color="red" onClick={confirmMultiDelete}>
                        Xóa các bài viết đã chọn ({selectedPosts.length})
                    </Button>
                )}
            </div>
            <div className="panel p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <span className="inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-transparent border-l-primary"></span>
                    </div>
                ) : (
                    <div className="invoice-table">
                        <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                            <div style={{ position: 'relative', height: '70vh', overflow: 'hidden' }} className="datatables pagination-padding">
                                <DataTable
                                    className="table-hover whitespace-nowrap custom-datatable"
                                    columns={columns}
                                    records={filteredPosts}
                                    highlightOnHover
                                    selectedRecords={selectedPosts}
                                    onSelectedRecordsChange={setSelectedPosts}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
export default PostList;
