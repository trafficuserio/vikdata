import { Metadata } from 'next';
import React from 'react';
import ComponentReadDomain from '@/components/domain/component-read-domain';

export const metadata: Metadata = {
    title: 'Thông tin Domain',
};

const Domain = () => {
    return <ComponentReadDomain />;
};

export default Domain;
