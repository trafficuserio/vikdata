import { Metadata } from 'next';
import React from 'react';
import ComponentAddKeyword from '@/components/google-search-api/keyword/component-add-keyword';

export const metadata: Metadata = {
    title: 'Thêm từ khóa',
};

const Domain = () => {
    return <ComponentAddKeyword />;
};

export default Domain;
