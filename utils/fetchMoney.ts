// utils/fetchMoney.ts
import axios from 'axios';
import { ShowMessageError } from '@/components/component-show-message';
import logout from '@/utils/logout';

export const fetchMoney = async (token: string, setMyMoney: (money: number) => void) => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/user/get-money`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        const json = response.data;
        if ([401, 403].includes(json.errorcode)) {
            ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
            logout();
            return;
        } else if (json.errorcode === 200) {
            setMyMoney(json.data.money);
        }
    } catch (error) {
        console.error(error);
    }
};
