import { Metadata } from 'next';
import React from 'react';
import ComponentsSerper from '@/components/serper/component-serper';

export const metadata: Metadata = {
    title: 'Serper',
};

const Domain = () => {
    return <ComponentsSerper />;
};

export default Domain;
