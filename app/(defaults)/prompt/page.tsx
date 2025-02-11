import { Metadata } from 'next';
import React from 'react';
import ComponentPrompt from '@/components/prompt/component-prompt';

export const metadata: Metadata = {
    title: 'Prompt',
};

const Prompt = () => {
    return <ComponentPrompt />;
};

export default Prompt;
