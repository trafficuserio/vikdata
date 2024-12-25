import ComponentsAuthLoginForm from '@/components/auth/components-auth-login-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Đăng nhập',
};

const SignIn = () => {
    return <ComponentsAuthLoginForm />;
};

export default SignIn;
