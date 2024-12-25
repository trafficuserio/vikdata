import { Metadata } from 'next';
import React from 'react';
import ComponentsAuthRegisterForm from '@/components/auth/components-auth-register-form';

export const metadata: Metadata = {
    title: 'Sign Up',
};

const SignUp = () => {
    return <ComponentsAuthRegisterForm />;
};

export default SignUp;
