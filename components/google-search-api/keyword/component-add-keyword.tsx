// app/components/keyword/component-add-keyword.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';
import logout from '@/utils/logout';
import Select from 'react-select';

const geolocationOptions = [
    { value: 'af', label: 'af' },
    { value: 'al', label: 'al' },
    { value: 'dz', label: 'dz' },
    { value: 'as', label: 'as' },
    { value: 'ad', label: 'ad' },
    { value: 'ao', label: 'ao' },
    { value: 'ai', label: 'ai' },
    { value: 'aq', label: 'aq' },
    { value: 'ag', label: 'ag' },
    { value: 'ar', label: 'ar' },
    { value: 'am', label: 'am' },
    { value: 'aw', label: 'aw' },
    { value: 'au', label: 'au' },
    { value: 'at', label: 'at' },
    { value: 'az', label: 'az' },
    { value: 'bs', label: 'bs' },
    { value: 'bh', label: 'bh' },
    { value: 'bd', label: 'bd' },
    { value: 'bb', label: 'bb' },
    { value: 'by', label: 'by' },
    { value: 'be', label: 'be' },
    { value: 'bz', label: 'bz' },
    { value: 'bj', label: 'bj' },
    { value: 'bm', label: 'bm' },
    { value: 'bt', label: 'bt' },
    { value: 'bo', label: 'bo' },
    { value: 'ba', label: 'ba' },
    { value: 'bw', label: 'bw' },
    { value: 'bv', label: 'bv' },
    { value: 'br', label: 'br' },
    { value: 'io', label: 'io' },
    { value: 'bn', label: 'bn' },
    { value: 'bg', label: 'bg' },
    { value: 'bf', label: 'bf' },
    { value: 'bi', label: 'bi' },
    { value: 'kh', label: 'kh' },
    { value: 'cm', label: 'cm' },
    { value: 'ca', label: 'ca' },
    { value: 'cv', label: 'cv' },
    { value: 'ky', label: 'ky' },
    { value: 'cf', label: 'cf' },
    { value: 'td', label: 'td' },
    { value: 'cl', label: 'cl' },
    { value: 'cn', label: 'cn' },
    { value: 'cx', label: 'cx' },
    { value: 'cc', label: 'cc' },
    { value: 'co', label: 'co' },
    { value: 'km', label: 'km' },
    { value: 'cg', label: 'cg' },
    { value: 'cd', label: 'cd' },
    { value: 'ck', label: 'ck' },
    { value: 'cr', label: 'cr' },
    { value: 'ci', label: 'ci' },
    { value: 'hr', label: 'hr' },
    { value: 'cu', label: 'cu' },
    { value: 'cy', label: 'cy' },
    { value: 'cz', label: 'cz' },
    { value: 'dk', label: 'dk' },
    { value: 'dj', label: 'dj' },
    { value: 'dm', label: 'dm' },
    { value: 'do', label: 'do' },
    { value: 'ec', label: 'ec' },
    { value: 'eg', label: 'eg' },
    { value: 'sv', label: 'sv' },
    { value: 'gq', label: 'gq' },
    { value: 'er', label: 'er' },
    { value: 'ee', label: 'ee' },
    { value: 'et', label: 'et' },
    { value: 'fk', label: 'fk' },
    { value: 'fo', label: 'fo' },
    { value: 'fj', label: 'fj' },
    { value: 'fi', label: 'fi' },
    { value: 'fr', label: 'fr' },
    { value: 'gf', label: 'gf' },
    { value: 'pf', label: 'pf' },
    { value: 'tf', label: 'tf' },
    { value: 'ga', label: 'ga' },
    { value: 'gm', label: 'gm' },
    { value: 'ge', label: 'ge' },
    { value: 'de', label: 'de' },
    { value: 'gh', label: 'gh' },
    { value: 'gi', label: 'gi' },
    { value: 'gr', label: 'gr' },
    { value: 'gl', label: 'gl' },
    { value: 'gd', label: 'gd' },
    { value: 'gp', label: 'gp' },
    { value: 'gu', label: 'gu' },
    { value: 'gt', label: 'gt' },
    { value: 'gn', label: 'gn' },
    { value: 'gw', label: 'gw' },
    { value: 'gy', label: 'gy' },
    { value: 'ht', label: 'ht' },
    { value: 'hm', label: 'hm' },
    { value: 'va', label: 'va' },
    { value: 'hn', label: 'hn' },
    { value: 'hk', label: 'hk' },
    { value: 'hu', label: 'hu' },
    { value: 'is', label: 'is' },
    { value: 'in', label: 'in' },
    { value: 'id', label: 'id' },
    { value: 'ir', label: 'ir' },
    { value: 'iq', label: 'iq' },
    { value: 'ie', label: 'ie' },
    { value: 'il', label: 'il' },
    { value: 'it', label: 'it' },
    { value: 'jm', label: 'jm' },
    { value: 'jp', label: 'jp' },
    { value: 'jo', label: 'jo' },
    { value: 'kz', label: 'kz' },
    { value: 'ke', label: 'ke' },
    { value: 'ki', label: 'ki' },
    { value: 'kp', label: 'kp' },
    { value: 'kr', label: 'kr' },
    { value: 'kw', label: 'kw' },
    { value: 'kg', label: 'kg' },
    { value: 'la', label: 'la' },
    { value: 'lv', label: 'lv' },
    { value: 'lb', label: 'lb' },
    { value: 'ls', label: 'ls' },
    { value: 'lr', label: 'lr' },
    { value: 'ly', label: 'ly' },
    { value: 'li', label: 'li' },
    { value: 'lt', label: 'lt' },
    { value: 'lu', label: 'lu' },
    { value: 'mo', label: 'mo' },
    { value: 'mk', label: 'mk' },
    { value: 'mg', label: 'mg' },
    { value: 'mw', label: 'mw' },
    { value: 'my', label: 'my' },
    { value: 'mv', label: 'mv' },
    { value: 'ml', label: 'ml' },
    { value: 'mt', label: 'mt' },
    { value: 'mh', label: 'mh' },
    { value: 'mq', label: 'mq' },
    { value: 'mr', label: 'mr' },
    { value: 'mu', label: 'mu' },
    { value: 'yt', label: 'yt' },
    { value: 'mx', label: 'mx' },
    { value: 'fm', label: 'fm' },
    { value: 'md', label: 'md' },
    { value: 'mc', label: 'mc' },
    { value: 'mn', label: 'mn' },
    { value: 'ms', label: 'ms' },
    { value: 'ma', label: 'ma' },
    { value: 'mz', label: 'mz' },
    { value: 'mm', label: 'mm' },
    { value: 'na', label: 'na' },
    { value: 'nr', label: 'nr' },
    { value: 'np', label: 'np' },
    { value: 'nl', label: 'nl' },
    { value: 'an', label: 'an' },
    { value: 'nc', label: 'nc' },
    { value: 'nz', label: 'nz' },
    { value: 'ni', label: 'ni' },
    { value: 'ne', label: 'ne' },
    { value: 'ng', label: 'ng' },
    { value: 'nu', label: 'nu' },
    { value: 'nf', label: 'nf' },
    { value: 'mp', label: 'mp' },
    { value: 'no', label: 'no' },
    { value: 'om', label: 'om' },
    { value: 'pk', label: 'pk' },
    { value: 'pw', label: 'pw' },
    { value: 'ps', label: 'ps' },
    { value: 'pa', label: 'pa' },
    { value: 'pg', label: 'pg' },
    { value: 'py', label: 'py' },
    { value: 'pe', label: 'pe' },
    { value: 'ph', label: 'ph' },
    { value: 'pn', label: 'pn' },
    { value: 'pl', label: 'pl' },
    { value: 'pt', label: 'pt' },
    { value: 'pr', label: 'pr' },
    { value: 'qa', label: 'qa' },
    { value: 're', label: 're' },
    { value: 'ro', label: 'ro' },
    { value: 'ru', label: 'ru' },
    { value: 'rw', label: 'rw' },
    { value: 'sh', label: 'sh' },
    { value: 'kn', label: 'kn' },
    { value: 'lc', label: 'lc' },
    { value: 'pm', label: 'pm' },
    { value: 'vc', label: 'vc' },
    { value: 'ws', label: 'ws' },
    { value: 'sm', label: 'sm' },
    { value: 'st', label: 'st' },
    { value: 'sa', label: 'sa' },
    { value: 'sn', label: 'sn' },
    { value: 'cs', label: 'cs' },
    { value: 'sc', label: 'sc' },
    { value: 'sl', label: 'sl' },
    { value: 'sg', label: 'sg' },
    { value: 'sk', label: 'sk' },
    { value: 'si', label: 'si' },
    { value: 'sb', label: 'sb' },
    { value: 'so', label: 'so' },
    { value: 'za', label: 'za' },
    { value: 'gs', label: 'gs' },
    { value: 'es', label: 'es' },
    { value: 'lk', label: 'lk' },
    { value: 'sd', label: 'sd' },
    { value: 'sr', label: 'sr' },
    { value: 'sj', label: 'sj' },
    { value: 'sz', label: 'sz' },
    { value: 'se', label: 'se' },
    { value: 'ch', label: 'ch' },
    { value: 'sy', label: 'sy' },
    { value: 'tw', label: 'tw' },
    { value: 'tj', label: 'tj' },
    { value: 'tz', label: 'tz' },
    { value: 'th', label: 'th' },
    { value: 'tl', label: 'tl' },
    { value: 'tg', label: 'tg' },
    { value: 'tk', label: 'tk' },
    { value: 'to', label: 'to' },
    { value: 'tt', label: 'tt' },
    { value: 'tn', label: 'tn' },
    { value: 'tr', label: 'tr' },
    { value: 'tm', label: 'tm' },
    { value: 'tc', label: 'tc' },
    { value: 'tv', label: 'tv' },
    { value: 'ug', label: 'ug' },
    { value: 'ua', label: 'ua' },
    { value: 'ae', label: 'ae' },
    { value: 'uk', label: 'uk' },
    { value: 'us', label: 'us' },
    { value: 'um', label: 'um' },
    { value: 'uy', label: 'uy' },
    { value: 'uz', label: 'uz' },
    { value: 'vu', label: 'vu' },
    { value: 've', label: 've' },
    { value: 'vn', label: 'vn' },
    { value: 'vg', label: 'vg' },
    { value: 'vi', label: 'vi' },
    { value: 'wf', label: 'wf' },
    { value: 'eh', label: 'eh' },
    { value: 'ye', label: 'ye' },
    { value: 'zm', label: 'zm' },
    { value: 'zw', label: 'zw' },
];

const hostLanguageOptions = [
    { value: 'af', label: 'af' },
    { value: 'sq', label: 'sq' },
    { value: 'sm', label: 'sm' },
    { value: 'ar', label: 'ar' },
    { value: 'az', label: 'az' },
    { value: 'eu', label: 'eu' },
    { value: 'be', label: 'be' },
    { value: 'bn', label: 'bn' },
    { value: 'bh', label: 'bh' },
    { value: 'bs', label: 'bs' },
    { value: 'bg', label: 'bg' },
    { value: 'ca', label: 'ca' },
    { value: 'zh-CN', label: 'zh-CN' },
    { value: 'zh-TW', label: 'zh-TW' },
    { value: 'hr', label: 'hr' },
    { value: 'cs', label: 'cs' },
    { value: 'da', label: 'da' },
    { value: 'nl', label: 'nl' },
    { value: 'en', label: 'en' },
    { value: 'eo', label: 'eo' },
    { value: 'et', label: 'et' },
    { value: 'fo', label: 'fo' },
    { value: 'fi', label: 'fi' },
    { value: 'fr', label: 'fr' },
    { value: 'fy', label: 'fy' },
    { value: 'gl', label: 'gl' },
    { value: 'ka', label: 'ka' },
    { value: 'de', label: 'de' },
    { value: 'el', label: 'el' },
    { value: 'gu', label: 'gu' },
    { value: 'iw', label: 'iw' },
    { value: 'hi', label: 'hi' },
    { value: 'hu', label: 'hu' },
    { value: 'is', label: 'is' },
    { value: 'id', label: 'id' },
    { value: 'ia', label: 'ia' },
    { value: 'ga', label: 'ga' },
    { value: 'it', label: 'it' },
    { value: 'ja', label: 'ja' },
    { value: 'jw', label: 'jw' },
    { value: 'kn', label: 'kn' },
    { value: 'ko', label: 'ko' },
    { value: 'la', label: 'la' },
    { value: 'lv', label: 'lv' },
    { value: 'lt', label: 'lt' },
    { value: 'mk', label: 'mk' },
    { value: 'ms', label: 'ms' },
    { value: 'ml', label: 'ml' },
    { value: 'mt', label: 'mt' },
    { value: 'mr', label: 'mr' },
    { value: 'ne', label: 'ne' },
    { value: 'no', label: 'no' },
    { value: 'nn', label: 'nn' },
    { value: 'oc', label: 'oc' },
    { value: 'fa', label: 'fa' },
    { value: 'pl', label: 'pl' },
    { value: 'pt-BR', label: 'pt-BR' },
    { value: 'pt-PT', label: 'pt-PT' },
    { value: 'pa', label: 'pa' },
    { value: 'ro', label: 'ro' },
    { value: 'ru', label: 'ru' },
    { value: 'gd', label: 'gd' },
    { value: 'sr', label: 'sr' },
    { value: 'si', label: 'si' },
    { value: 'sk', label: 'sk' },
    { value: 'sl', label: 'sl' },
    { value: 'es', label: 'es' },
    { value: 'su', label: 'su' },
    { value: 'sw', label: 'sw' },
    { value: 'sv', label: 'sv' },
    { value: 'tl', label: 'tl' },
    { value: 'ta', label: 'ta' },
    { value: 'te', label: 'te' },
    { value: 'th', label: 'th' },
    { value: 'ti', label: 'ti' },
    { value: 'tr', label: 'tr' },
    { value: 'uk', label: 'uk' },
    { value: 'ur', label: 'ur' },
    { value: 'uz', label: 'uz' },
    { value: 'vi', label: 'vi' },
    { value: 'cy', label: 'cy' },
    { value: 'xh', label: 'xh' },
    { value: 'zu', label: 'zu' },
];

export default function ComponentAddKeyword() {
    const router = useRouter();
    const token = Cookies.get('token');

    const [keyword, setKeyword] = useState('');
    const [urlKeyword, setUrlKeyword] = useState('');
    const [geolocation, setGeolocation] = useState('vn');
    const [hostLanguage, setHostLanguage] = useState('vi');
    const [domainId, setDomainId] = useState<number>(0);

    async function handleSubmit() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/manage-keyword/insert-infor-keyword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dataKeyword: [
                        {
                            keyword,
                            urlKeyword,
                            geolocation,
                            hostLanguage,
                        },
                    ],
                    domainId,
                }),
            });
            const result = await response.json();

            if (result.errorcode === 200) {
                ShowMessageSuccess({ content: 'Thêm dữ liệu thành công' });
                router.push('/google-search-api/keyword');
            } else if ([401, 403].includes(result.errorcode)) {
                ShowMessageError({ content: 'Phiên đăng nhập hết hạn' });
                logout(router);
            } else {
                ShowMessageError({ content: result.message || 'Lỗi khi thêm dữ liệu' });
            }
        } catch (error) {
            ShowMessageError({ content: 'Lỗi khi gọi API thêm dữ liệu' });
        }
    }

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b] p-4">
            <div className="custom-select grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 px-4">
                <div>
                    <label className="block mb-1">Keyword</label>
                    <input className="border p-2 rounded w-full form-input" placeholder="Nhập keyword..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>

                <div>
                    <label className="block mb-1">URL Keyword</label>
                    <input className="border p-2 rounded w-full form-input" placeholder="Nhập URL..." value={urlKeyword} onChange={(e) => setUrlKeyword(e.target.value)} />
                </div>

                <div>
                    <label className="block mb-1">Geolocation</label>
                    <Select
                        options={geolocationOptions}
                        value={geolocationOptions.find((op) => op.value === geolocation)}
                        onChange={(val) => setGeolocation(val?.value || 'vn')}
                        placeholder="Chọn geolocation..."
                    />
                </div>

                <div>
                    <label className="block mb-1">Host Language</label>
                    <Select
                        options={hostLanguageOptions}
                        value={hostLanguageOptions.find((op) => op.value === hostLanguage)}
                        onChange={(val) => setHostLanguage(val?.value || 'vi')}
                        placeholder="Chọn hostLanguage..."
                    />
                </div>

                <div>
                    <label className="block mb-1">Domain ID</label>
                    <input type="number" className="border p-2 rounded w-full form-input" placeholder="Nhập domainId..." value={domainId} onChange={(e) => setDomainId(Number(e.target.value))} />
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 px-4">
                <button onClick={() => router.push('/google-search-api/keyword')} className="btn btn-secondary">
                    Hủy
                </button>
                <button onClick={handleSubmit} className="btn btn-primary">
                    Lưu
                </button>
            </div>
        </div>
    );
}
