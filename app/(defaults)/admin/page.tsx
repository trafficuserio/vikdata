import { Metadata } from 'next';
import React from 'react';
import ComponentsFullAccount from '@/components/admin/component-full-account';

export const metadata: Metadata = {
    title: 'Danh sách tài khoản',
};

const Domain = () => {
    return <ComponentsFullAccount />;
};

export default Domain;
