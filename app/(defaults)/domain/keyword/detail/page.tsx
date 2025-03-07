import { Metadata } from 'next';
import React from 'react';
import ComponentDetailDomainRankKey from '@/components/domain/keyword/component-detail-keyword';
export const metadata: Metadata = {
    title: 'Chi tiết Từ khóa',
};

const Domain = () => {
    return <ComponentDetailDomainRankKey />;
};

export default Domain;
