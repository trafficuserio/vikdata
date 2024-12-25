import { Metadata } from 'next';
import React from 'react';
import ComponentListGoogleSearchApi from '@/components/google-search-api/component-list-google-search-api';

export const metadata: Metadata = {
    title: 'Google Search API',
};

const Domain = () => {
    return <ComponentListGoogleSearchApi />;
};

export default Domain;
