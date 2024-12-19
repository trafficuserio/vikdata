import { Metadata } from 'next';
import React from 'react';
import ComponentViewDomain from '@/components/domain/component-view-domain';

export const metadata: Metadata = {
    title: 'Thông tin Domain',
};

const Domain = () => {
    return <ComponentViewDomain />;
};

export default Domain;
