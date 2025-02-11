import { Metadata } from 'next';
import React from 'react';
import ComponentDetailDomain from '@/components/domain/component-detail-domain';

export const metadata: Metadata = {
    title: 'Chi tiết Domain',
};

const Domain = () => {
    return <ComponentDetailDomain />;
};

export default Domain;
