import { Metadata } from 'next';
import React from 'react';
import ComponentViewDomain from '@/components/domain/component-list-domain';

export const metadata: Metadata = {
    title: 'Danh sách Domain',
};

const Domain = () => {
    return <ComponentViewDomain />;
};

export default Domain;
