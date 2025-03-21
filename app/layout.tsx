import ProviderComponent from '@/components/layouts/provider-component';
import '../styles/tailwind.css';
import '../styles/style.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';

export const metadata: Metadata = {
    title: {
        template: '%s | VIKDATA - Multipurpose Tailwind Dashboard Template',
        default: 'VIKDATA - Multipurpose Tailwind Dashboard Template',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <ProviderComponent>{children}</ProviderComponent>
            </body>
        </html>
    );
}
