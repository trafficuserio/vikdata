import { Metadata } from 'next';
import React from 'react';
import ComponentListKeyword from '@/components/google-search-api/keyword/component-list-keyword';

export const metadata: Metadata = {
    title: 'Danh sách từ khóa',
};

const Domain = () => {
    return <ComponentListKeyword />;
};

export default Domain;