import { Metadata } from 'next';
import React from 'react';
import ComponentCreateGoogleSearchApi from '@/components/google-search-api/component-create-google-search-api';

export const metadata: Metadata = {
    title: 'Thêm Google Search API',
};

const Domain = () => {
    return <ComponentCreateGoogleSearchApi />;
};

export default Domain;
