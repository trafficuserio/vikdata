export interface ColummnDataSiteAuto {
    id: number;
    primay_key: string;
    secondary_key: string;
    status: string;
    heading: string;
    title: string;
    meta: string;
    slug: string;
    index: string;
    category: string;
    date_publish: string;
    date_edit: number;
    link_in: number;
    link_out: number;
    create_at: string;
}

export interface ExcelRowSiteImages {
    crawling_key: string;
    primary_key: string;
    secondary_key: string | null;
    prompt_system: string;
    prompt_keywords: string;
    name_uppercase: string | '';
    prompt_h1: string;
    prompt_h1_type: string;
    prompt_h1_model: string;
    prompt_title: string;
    prompt_title_type: string;
    prompt_title_model: string;
    prompt_meta: string;
    prompt_meta_type: string;
    prompt_meta_model: string;
    prompt_sapo: string;
    prompt_sapo_type: string;
    prompt_sapo_model: string;
    prompt_conclustion: string;
    prompt_conclustion_type: string;
    prompt_conclustion_model: string;
    prompt_captions: string;
    prompt_captions_type: string;
    prompt_captions_model: string;
    prompt_internal: string;
    prompt_internal_type: string;
    prompt_internal_model: string;
    category: string | null;
    status: string;
    limit: string;
    source: string;
    tyle_internal: string;
    soluong_internal: string;
    notebook_internal: string;
    random_tukhoa_mobai: string | null;
    tukhoa_home: string;
    tyle_home_internal: string;
    tukhoa_caterogy: string;
    tyle_category_internal: string;
    category_internal: string;
}

export interface ExcelRowSiteHocthuatAndHuongdan {
    primary_key: string;
    secondary_key: string | null;
    prompt_system: string;
    prompt_keywords: string;
    prompt_h1: string;
    prompt_h1_type: string;
    prompt_h1_model: string;
    prompt_title: string;
    prompt_title_type: string;
    prompt_title_model: string;
    prompt_meta: string;
    prompt_meta_type: string;
    prompt_meta_model: string;
    prompt_sapo: string;
    prompt_sapo_type: string;
    prompt_sapo_model: string;
    prompt_conclustion: string;
    prompt_conclustion_type: string;
    prompt_conclustion_model: string;
    prompt_outline: string;
    prompt_outline_type: string;
    prompt_outline_model: string;
    prompt_trienkhai: string;
    prompt_trienkhai_type: string;
    prompt_trienkhai_model: string;
    category: string | null;
    status: string;
    tyle_internal: string;
    soluong_internal: string;
    random_tukhoa_mobai: string | null;
    tukhoa_home: string;
    tyle_home_internal: string;
    tukhoa_caterogy: string;
    tyle_category_internal: string;
    category_internal: string;
}
export interface ExcelRowSiteProduct {
    primary_key: string;
    secondary_key: string | null;
    prompt_system: string;
    prompt_keywords: string;
    prompt_title: string;
    prompt_meta: string;
    prompt_trienkhai: string;
    category: string | null;
    status: string;
    price: string;
    SKU: string;
    random_tukhoa_mobai: string | null;
}
export interface ExcelRowSiteToplist {
    primary_key: string;
    secondary_key: string | null;
    prompt_system: string;
    prompt_keywords: string;
    prompt_h1: string;
    prompt_h1_type: string;
    prompt_h1_model: string;
    prompt_title: string;
    prompt_title_type: string;
    prompt_title_model: string;
    prompt_meta: string;
    prompt_meta_type: string;
    prompt_meta_model: string;
    prompt_sapo: string;
    prompt_sapo_type: string;
    prompt_sapo_model: string;
    prompt_conclustion: string;
    prompt_conclustion_type: string;
    prompt_conclustion_model: string;
    prompt_outline: string;
    prompt_outline_type: string;
    prompt_outline_model: string;
    prompt_trienkhai: string;
    prompt_trienkhai_type: string;
    prompt_trienkhai_model: string;
    prompt_internal: string;
    prompt_internal_type: string;
    prompt_internal_model: string;
    category: string | null;
    status: string;
    tyle_internal: string;
    soluong_internal: string;
    random_tukhoa_mobai: string | null;
    tukhoa_home: string;
    tyle_home_internal: string;
    tukhoa_caterogy: string;
    tyle_category_internal: string;
    category_internal: string;
}

export const mapRowToSiteImages = (row: any[]): ExcelRowSiteImages => {
    return {
        crawling_key: row[0] || '',
        primary_key: row[1] || '',
        secondary_key: row[2] || null,
        prompt_system: row[3] || '',
        prompt_keywords: row[4] || '',
        name_uppercase: row[5] || '',
        prompt_h1: row[6] || '',
        prompt_h1_type: row[7] || 'chatgpt',
        prompt_h1_model: row[8] || 'gpt-4o-mini',
        prompt_title: row[9] || '',
        prompt_title_type: row[10] || 'chatgpt',
        prompt_title_model: row[11] || 'gpt-4o-mini',
        prompt_meta: row[12] || '',
        prompt_meta_type: row[13] || 'chatgpt',
        prompt_meta_model: row[14] || 'gpt-4o-mini',
        prompt_sapo: row[15] || '',
        prompt_sapo_type: row[16] || 'chatgpt',
        prompt_sapo_model: row[17] || 'gpt-4o-mini',
        prompt_captions: row[18] || '',
        prompt_captions_type: row[19] || 'chatgpt',
        prompt_captions_model: row[20] || 'gpt-4o-mini',
        prompt_conclustion: row[21] || '',
        prompt_conclustion_type: row[22] || 'chatgpt',
        prompt_conclustion_model: row[23] || 'gpt-4o-mini',
        prompt_internal: row[24] || '',
        prompt_internal_type: row[25] || 'chatgpt',
        prompt_internal_model: row[26] || 'gpt-4o-mini',
        category: row[27] || null,
        status: row[28] || 'publish',
        limit: row[29] || '10',
        source: row[30] || '',
        tyle_internal: row[31] || '',
        soluong_internal: row[32] || '',
        notebook_internal: row[33] || '',
        random_tukhoa_mobai: row[34] || null,
        tukhoa_home: row[35] || '',
        tyle_home_internal: row[36] || '40',
        tukhoa_caterogy: row[37] || '',
        tyle_category_internal: row[38] || '40',
        category_internal: row[39] || '',

    };
};
export const mapRowToHocthuatAndHuongdan = (row: any[]): ExcelRowSiteHocthuatAndHuongdan => {
    return {
        primary_key: row[0] || '',
        secondary_key: row[1] || null,
        prompt_keywords: row[2] || '',
        prompt_system: row[3] || '',
        prompt_h1: row[4] || '',
        prompt_h1_type: row[5] || 'chatgpt',
        prompt_h1_model: row[6] || 'gpt-4o-mini',
        prompt_title: row[7] || '',
        prompt_title_type: row[8] || 'chatgpt',
        prompt_title_model: row[9] || 'gpt-4o-mini',
        prompt_meta: row[10] || '',
        prompt_meta_type: row[11] || 'chatgpt',
        prompt_meta_model: row[12] || 'gpt-4o-mini',
        prompt_sapo: row[13] || '',
        prompt_sapo_type: row[14] || 'chatgpt',
        prompt_sapo_model: row[15] || 'gpt-4o-mini',
        prompt_conclustion: row[16] || '',
        prompt_conclustion_type: row[17] || 'chatgpt',
        prompt_conclustion_model: row[18] || 'gpt-4o-mini',
        prompt_outline: row[19] || '',
        prompt_outline_type: row[20] || 'chatgpt',
        prompt_outline_model: row[21] || 'gpt-4o-mini',
        prompt_trienkhai: row[22] || '',
        prompt_trienkhai_type: row[23] || 'chatgpt',
        prompt_trienkhai_model: row[24] || 'gpt-4o-mini',
        category: row[25] || null,
        status: row[26] || 'publish',
        tyle_internal: row[27] || '',
        soluong_internal: row[28] || '',
        random_tukhoa_mobai: row[29] || null,
        tukhoa_home: row[30] || '',
        tyle_home_internal: row[31] || '40',
        tukhoa_caterogy: row[32] || '',
        tyle_category_internal: row[33] || '40',
        category_internal: row[34] || '',
    };
};
export const mapRowToProduct = (row: any[]): ExcelRowSiteProduct => {
    return {
        primary_key: row[0] || '', // Cột A
        secondary_key: row[1] || null, // Cột B
        prompt_system: row[2] || '', // Cột C
        prompt_keywords: row[3] || '', // Cột D
        prompt_title: row[4] || '', // Cột E
        prompt_meta: row[5] || '', // Cột F
        prompt_trienkhai: row[6] || '', // Cột G
        category: row[7] || null, // Cột H
        status: row[8] || 'publish', // Cột I
        price: row[9] || '0', // Cột J
        SKU: row[10] || '', // Cột K
        random_tukhoa_mobai: row[11] || null, // Cột L
    };
};
export const mapRowToToplist = (row: any[]): ExcelRowSiteToplist => {
    return {
        primary_key: row[0] || '',
        secondary_key: row[1] || null,
        prompt_system: row[2] || '',
        prompt_keywords: row[3] || '',
        prompt_h1: row[4] || '',
        prompt_h1_type: row[5] || 'chatgpt',
        prompt_h1_model: row[6] || 'gpt-4o-mini',
        prompt_title: row[7] || '',
        prompt_title_type: row[8] || 'chatgpt',
        prompt_title_model: row[9] || 'gpt-4o-mini',
        prompt_meta: row[10] || '',
        prompt_meta_type: row[11] || 'chatgpt',
        prompt_meta_model: row[12] || 'gpt-4o-mini',
        prompt_sapo: row[13] || '',
        prompt_sapo_type: row[14] || 'chatgpt',
        prompt_sapo_model: row[15] || 'gpt-4o-mini',
        prompt_conclustion: row[16] || '',
        prompt_conclustion_type: row[17] || 'chatgpt',
        prompt_conclustion_model: row[18] || 'gpt-4o-mini',
        prompt_outline: row[19] || '',
        prompt_outline_type: row[20] || 'chatgpt',
        prompt_outline_model: row[21] || 'gpt-4o-mini',
        prompt_trienkhai: row[22] || '',
        prompt_trienkhai_type: row[23] || 'chatgpt',
        prompt_trienkhai_model: row[24] || 'gpt-4o-mini',
        prompt_internal: row[25] || '',
        prompt_internal_type: row[26] || 'chatgpt',
        prompt_internal_model: row[27] || 'gpt-4o-mini',
        category: row[28] || null,
        status: row[29] || 'publish',
        tyle_internal: row[30] || '',
        soluong_internal: row[31] || '',
        random_tukhoa_mobai: row[32] || null,
        tukhoa_home: row[33] || '',
        tyle_home_internal: row[34] || '40',
        tukhoa_caterogy: row[35] || '',
        tyle_category_internal: row[36] || '40',
        category_internal: row[37] || '',
    };
};


