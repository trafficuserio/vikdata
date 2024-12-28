import { Metadata } from 'next';
import React from 'react';
import ComponentEditKeyword from '@/components/domain/keyword/component-edit-keyword';

export const metadata: Metadata = {
    title: 'Sửa từ khóa',
};

const Domain = () => {
    return <ComponentEditKeyword />;
};

export default Domain;
