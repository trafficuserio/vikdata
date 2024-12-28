import { FC } from 'react';

interface IconAnalyticsProps {
    className?: string;
    fill?: boolean;
}

const IconAnalytics: FC<IconAnalyticsProps> = ({ className, fill = false }) => {
    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 301112 333331"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                fillRule="evenodd"
                clipRule="evenodd"
                className={className}
            >
                <path
                    d="M301110 291619c124 22886-18333 41521-41206 41644-1700 14-3415-82-5101-288-21227-3140-36776-21611-36256-43057V43342c-507-21474 15084-39944 36324-43057 22721-2660 43304 13602 45964 36324 192 1673 288 3346 274 5032v249977z"
                    fill="#f9ab00"
                />
                <path
                    d="M41288 250756c22804 0 41288 18484 41288 41288s-18484 41288-41288 41288S0 314848 0 292044s18484-41288 41288-41288zm108630-125126c-22913 1261-40685 20472-40150 43413v110892c0 30099 13246 48364 32649 52258 22393 4539 44209-9928 48748-32320 562-2743 836-5526 822-8323V167124c41-22886-18470-41467-41356-41507-233 0-480 0-713 14z"
                    fill="#e37400"
                />
            </svg>
        </>
    );
};

export default IconAnalytics;
