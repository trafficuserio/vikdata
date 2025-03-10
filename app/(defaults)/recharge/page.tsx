import { Metadata } from 'next';
import React from 'react';
import ComponentRecharge from '@/components/recharge/component-recharge';

export const metadata: Metadata = {
    title: 'Nạp tiền',
};

const Recharge = () => {
    return <ComponentRecharge />;
};

export default Recharge;
