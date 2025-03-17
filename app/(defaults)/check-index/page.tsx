import { Metadata } from 'next';
import React from 'react';
import ComponentCheckIndex from '@/components/check-index/component-check-index';

export const metadata: Metadata = {
    title: 'Kiểm tra index',
};

const Domain = () => {
    return <ComponentCheckIndex />;
};

export default Domain;
