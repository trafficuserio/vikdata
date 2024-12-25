import Cookies from 'js-cookie';

const logout = (router) => {
    const allCookies = document.cookie.split(';');

    allCookies.forEach((cookie) => {
        const cookieName = cookie.split('=')[0].trim();
        Cookies.remove(cookieName);
    });
    router.push('/auth/login');
};

export default logout;
