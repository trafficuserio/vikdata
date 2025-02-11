import { Metadata } from 'next';
import React from 'react';
import ComponentAIModel from '@/components/ai-model/component-ai-model';

export const metadata: Metadata = {
    title: 'AI Model',
};

const AI = () => {
    return <ComponentAIModel />;
};

export default AI;
