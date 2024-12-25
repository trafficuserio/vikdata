import { Metadata } from 'next';
import React from 'react';
import ComponentListAccount from '@/components/admin/component-list-account';

export const metadata: Metadata = {
    title: 'Danh sách tài khoản',
};

const Domain = () => {
    return <ComponentListAccount />;
};

export default Domain;
