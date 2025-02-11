import { Metadata } from 'next';
import React from 'react';
import ComponentServer from '@/components/server/component-server';

export const metadata: Metadata = {
    title: 'Server',
};

const Server = () => {
    return <ComponentServer />;
};

export default Server;
