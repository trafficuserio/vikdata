import { Metadata } from 'next';
import React from 'react';
import ComponentAddAccount from '@/components/admin/component-add-account';

export const metadata: Metadata = {
    title: 'Thêm tài khoản',
};

const AddAccount = () => {
    return <ComponentAddAccount />;
};

export default AddAccount;
