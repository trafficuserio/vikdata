import { Metadata } from 'next';
import React from 'react';
import ComponentEditDomain from '@/components/domain/component-edit-domain';

export const metadata: Metadata = {
    title: 'Chỉnh sửa Domain',
};

const Domain = () => {
    return <ComponentEditDomain />;
};

export default Domain;
