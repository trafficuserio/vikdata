import { Metadata } from 'next';
import React from 'react';
import ComponentAddDomain from '@/components/domain/component-add-domain';

export const metadata: Metadata = {
    title: 'Thêm Domain',
};

const Domain = () => {
    return <ComponentAddDomain />;
};

export default Domain;
