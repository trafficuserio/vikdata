import { Metadata } from 'next';
import React from 'react';
import ComponentEditGoogleSearchApi from '@/components/google-search-api/component-edit-google-search-api';

export const metadata: Metadata = {
    title: 'Sửa Google Search API',
};

const Domain = () => {
    return <ComponentEditGoogleSearchApi />;
};

export default Domain;
