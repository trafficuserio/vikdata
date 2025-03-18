'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ShowMessageError, ShowMessageSuccess } from '@/components/component-show-message';

const token = Cookies.get('token');
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
};

const typeSiteMapping: { [key: string]: string } = {
    'Tất cả': 'tatca',
    'Hình ảnh': 'images',
    'Hướng dẫn': 'huongdan',
    'Tổng hợp': 'tonghop',
    'Học thuật': 'hocthuat',
    Toplist: 'toplist',
    'Bán hàng': 'product',
};

interface PromptFieldConfig {
    content: string;
    type: { value: string; label: string } | null;
    model: { value: string; label: string } | null;
}

interface PromptContent {
    prompt_system: string;
    prompt_keywords: string;
    h1: PromptFieldConfig;
    title: PromptFieldConfig;
    meta: PromptFieldConfig;
    prompt_sapo: PromptFieldConfig;
    prompt_captions: PromptFieldConfig;
    prompt_conclude: PromptFieldConfig;
    outline: PromptFieldConfig;
    trien_khai: PromptFieldConfig;
    internal: PromptFieldConfig;
}

interface FlattenedPromptContent {
    prompt_system: string;
    prompt_keywords: string;
    h1: string;
    h1_type: string;
    h1_model: string;
    title: string;
    title_type: string;
    title_model: string;
    meta: string;
    meta_type: string;
    meta_model: string;
    prompt_sapo: string;
    prompt_sapo_type: string;
    prompt_sapo_model: string;
    prompt_captions: string;
    prompt_captions_type: string;
    prompt_captions_model: string;
    prompt_conclude: string;
    prompt_conclude_type: string;
    prompt_conclude_model: string;
    outline: string;
    outline_type: string;
    outline_model: string;
    trien_khai: string;
    trien_khai_type: string;
    trien_khai_model: string;
    internal: string;
    internal_type: string;
    internal_model: string;
}

interface PromptForm {
    level: number;
    name: string;
    money: number;
    note: string;
    typeSite: string;
    randomKeyOpening: string;
    content: PromptContent;
}

const initialPromptContent: PromptContent = {
    prompt_system: '',
    prompt_keywords: '',
    h1: { content: '', type: null, model: null },
    title: { content: '', type: null, model: null },
    meta: { content: '', type: null, model: null },
    prompt_sapo: { content: '', type: null, model: null },
    prompt_captions: { content: '', type: null, model: null },
    prompt_conclude: { content: '', type: null, model: null },
    outline: { content: '', type: null, model: null },
    trien_khai: { content: '', type: null, model: null },
    internal: { content: '', type: null, model: null },
};

const initialPromptForm: PromptForm = {
    level: 1,
    name: '',
    money: 0,
    note: '',
    typeSite: '',
    randomKeyOpening: '',
    content: initialPromptContent,
};

const groupSiteOptions = [
    { value: 'Hình ảnh', label: 'Hình ảnh' },
    { value: 'Hướng dẫn', label: 'Hướng dẫn' },
    { value: 'Tổng hợp', label: 'Tổng hợp' },
    { value: 'Học thuật', label: 'Học thuật' },
    { value: 'Toplist', label: 'Toplist' },
    { value: 'Bán hàng', label: 'Bán hàng' },
];

export default function Prompt() {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
    const [promptForm, setPromptForm] = useState<PromptForm>(initialPromptForm);
    const [selectStates, setSelectStates] = useState<{
        [key in keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>]: {
            type: { value: string; label: string } | null;
            model: { value: string; label: string } | null;
        };
    }>({
        h1: { type: null, model: null },
        title: { type: null, model: null },
        meta: { type: null, model: null },
        prompt_sapo: { type: null, model: null },
        prompt_captions: { type: null, model: null },
        prompt_conclude: { type: null, model: null },
        outline: { type: null, model: null },
        trien_khai: { type: null, model: null },
        internal: { type: null, model: null },
    });
    const [typeOptions, setTypeOptions] = useState<any[]>([]);
    const [modelOptions, setModelOptions] = useState<any[]>([]);

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const unflattenContent = (content: any): PromptContent => {
        return {
            prompt_system: content.prompt_system,
            prompt_keywords: content.prompt_keywords,
            h1: {
                content: content.h1,
                type: typeOptions.find((opt: any) => opt.label === content.h1_type) || (content.h1_type ? { value: content.h1_type, label: content.h1_type } : null),
                model: modelOptions.find((opt: any) => opt.label === content.h1_model) || (content.h1_model ? { value: content.h1_model, label: content.h1_model } : null),
            },
            title: {
                content: content.title,
                type: typeOptions.find((opt: any) => opt.label === content.title_type) || (content.title_type ? { value: content.title_type, label: content.title_type } : null),
                model: modelOptions.find((opt: any) => opt.label === content.title_model) || (content.title_model ? { value: content.title_model, label: content.title_model } : null),
            },
            meta: {
                content: content.meta,
                type: typeOptions.find((opt: any) => opt.label === content.meta_type) || (content.meta_type ? { value: content.meta_type, label: content.meta_type } : null),
                model: modelOptions.find((opt: any) => opt.label === content.meta_model) || (content.meta_model ? { value: content.meta_model, label: content.meta_model } : null),
            },
            prompt_sapo: {
                content: content.prompt_sapo,
                type:
                    typeOptions.find((opt: any) => opt.label === content.prompt_sapo_type) || (content.prompt_sapo_type ? { value: content.prompt_sapo_type, label: content.prompt_sapo_type } : null),
                model:
                    modelOptions.find((opt: any) => opt.label === content.prompt_sapo_model) ||
                    (content.prompt_sapo_model ? { value: content.prompt_sapo_model, label: content.prompt_sapo_model } : null),
            },
            prompt_captions: {
                content: content.prompt_captions,
                type:
                    typeOptions.find((opt: any) => opt.label === content.prompt_captions_type) ||
                    (content.prompt_captions_type ? { value: content.prompt_captions_type, label: content.prompt_captions_type } : null),
                model:
                    modelOptions.find((opt: any) => opt.label === content.prompt_captions_model) ||
                    (content.prompt_captions_model ? { value: content.prompt_captions_model, label: content.prompt_captions_model } : null),
            },
            prompt_conclude: {
                content: content.prompt_conclude,
                type:
                    typeOptions.find((opt: any) => opt.label === content.prompt_conclude_type) ||
                    (content.prompt_conclude_type ? { value: content.prompt_conclude_type, label: content.prompt_conclude_type } : null),
                model:
                    modelOptions.find((opt: any) => opt.label === content.prompt_conclude_model) ||
                    (content.prompt_conclude_model ? { value: content.prompt_conclude_model, label: content.prompt_conclude_model } : null),
            },
            outline: {
                content: content.outline,
                type: typeOptions.find((opt: any) => opt.label === content.outline_type) || (content.outline_type ? { value: content.outline_type, label: content.outline_type } : null),
                model: modelOptions.find((opt: any) => opt.label === content.outline_model) || (content.outline_model ? { value: content.outline_model, label: content.outline_model } : null),
            },
            trien_khai: {
                content: content.trien_khai,
                type: typeOptions.find((opt: any) => opt.label === content.trien_khai_type) || (content.trien_khai_type ? { value: content.trien_khai_type, label: content.trien_khai_type } : null),
                model:
                    modelOptions.find((opt: any) => opt.label === content.trien_khai_model) || (content.trien_khai_model ? { value: content.trien_khai_model, label: content.trien_khai_model } : null),
            },
            internal: {
                content: content.internal,
                type: typeOptions.find((opt: any) => opt.label === content.internal_type) || (content.internal_type ? { value: content.internal_type, label: content.internal_type } : null),
                model: modelOptions.find((opt: any) => opt.label === content.internal_model) || (content.internal_model ? { value: content.internal_model, label: content.internal_model } : null),
            },
        };
    };

    const flattenContent = (content: PromptContent): FlattenedPromptContent => {
        return {
            prompt_system: content.prompt_system,
            prompt_keywords: content.prompt_keywords,
            h1: content.h1.content,
            h1_type: content.h1.type ? content.h1.type.label : '',
            h1_model: content.h1.model ? content.h1.model.label : '',
            title: content.title.content,
            title_type: content.title.type ? content.title.type.label : '',
            title_model: content.title.model ? content.title.model.label : '',
            meta: content.meta.content,
            meta_type: content.meta.type ? content.meta.type.label : '',
            meta_model: content.meta.model ? content.meta.model.label : '',
            prompt_sapo: content.prompt_sapo.content,
            prompt_sapo_type: content.prompt_sapo.type ? content.prompt_sapo.type.label : '',
            prompt_sapo_model: content.prompt_sapo.model ? content.prompt_sapo.model.label : '',
            prompt_captions: content.prompt_captions.content,
            prompt_captions_type: content.prompt_captions.type ? content.prompt_captions.type.label : '',
            prompt_captions_model: content.prompt_captions.model ? content.prompt_captions.model.label : '',
            prompt_conclude: content.prompt_conclude.content,
            prompt_conclude_type: content.prompt_conclude.type ? content.prompt_conclude.type.label : '',
            prompt_conclude_model: content.prompt_conclude.model ? content.prompt_conclude.model.label : '',
            outline: content.outline.content,
            outline_type: content.outline.type ? content.outline.type.label : '',
            outline_model: content.outline.model ? content.outline.model.label : '',
            trien_khai: content.trien_khai.content,
            trien_khai_type: content.trien_khai.type ? content.trien_khai.type.label : '',
            trien_khai_model: content.trien_khai.model ? content.trien_khai.model.label : '',
            internal: content.internal.content,
            internal_type: content.internal.type ? content.internal.type.label : '',
            internal_model: content.internal.model ? content.internal.model.label : '',
        };
    };

    const fetchPrompts = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/get-prompts`, axiosConfig);
            const data = res.data;
            const list = Array.isArray(data) ? data : data.data ? data.data : [];
            setPrompts(list);
        } catch (error) {
            console.error('Lỗi fetch prompts:', error);
        }
    };

    const fetchTypeOptions = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-type-ai`, axiosConfig);
            const data = res.data;
            const list = Array.isArray(data) ? data : data.data ? data.data : [];
            setTypeOptions(list.map((t: any) => ({ value: t.id.toString(), label: t.name })));
        } catch (error) {
            console.error('Lỗi fetch type options:', error);
        }
    };

    const fetchModelOptions = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-ai-models`, axiosConfig);
            const data = res.data;
            const list = Array.isArray(data) ? data : data.data ? data.data : [];
            setModelOptions(
                list.map((m: any) => ({
                    value: m.id.toString(),
                    label: m.name,
                    typeAIId: m.type_ai_id ? m.type_ai_id.toString() : '',
                })),
            );
        } catch (error) {
            console.error('Lỗi fetch model options:', error);
        }
    };

    const validateForm = () => {
        if (!promptForm.name.trim() || promptForm.level === null || promptForm.money === null || !promptForm.typeSite.trim() || !promptForm.randomKeyOpening.trim()) {
            ShowMessageError({ content: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            return false;
        }
        return true;
    };

    useEffect(() => {
        fetchPrompts();
        fetchTypeOptions();
        fetchModelOptions();
    }, []);

    const handleChange = (key: keyof PromptContent, value: string) => {
        if (key === 'prompt_system' || key === 'prompt_keywords') {
            setPromptForm((prev) => ({ ...prev, content: { ...prev.content, [key]: value } }));
        } else {
            setPromptForm((prev) => ({
                ...prev,
                content: { ...prev.content, [key]: { ...prev.content[key], content: value } },
            }));
        }
    };

    const handleSelectChange = (field: keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>, optionType: 'type' | 'model', option: { value: string; label: string } | null) => {
        setSelectStates((prev) => ({ ...prev, [field]: { ...prev[field], [optionType]: option } }));
        setPromptForm((prev) => ({
            ...prev,
            content: { ...prev.content, [field]: { ...prev.content[field], [optionType]: option } },
        }));
    };

    const getModelOptionsForField = (field: keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>) => {
        const selectedType = selectStates[field].type;
        if (!selectedType) return [];
        return modelOptions.filter((m) => m.typeAIId === selectedType.value);
    };

    const createPrompt = async () => {
        if (!validateForm()) return;
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/prompt/create-prompt`,
                {
                    level: promptForm.level,
                    name: promptForm.name,
                    money: promptForm.money,
                    note: promptForm.note,
                    typeSite: typeSiteMapping[promptForm.typeSite] || '',
                    randomKeyOpening: promptForm.randomKeyOpening,
                    content: JSON.stringify(flattenContent(promptForm.content)),
                },
                axiosConfig,
            );
            ShowMessageSuccess({ content: 'Tạo prompt thành công.' });
            fetchPrompts();
            setIsPromptModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Lỗi tạo prompt:', error);
            ShowMessageError({ content: 'Có lỗi xảy ra khi tạo prompt.' });
        }
    };

    const updatePrompt = async () => {
        if (!validateForm() || !editingPromptId) return;
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_URL_API}/api/prompt/update-prompt`,
                {
                    id: editingPromptId,
                    level: promptForm.level,
                    name: promptForm.name,
                    money: promptForm.money,
                    note: promptForm.note,
                    typeSite: typeSiteMapping[promptForm.typeSite] || '',
                    randomKeyOpening: promptForm.randomKeyOpening,
                    content: JSON.stringify(flattenContent(promptForm.content)),
                },
                axiosConfig,
            );
            ShowMessageSuccess({ content: 'Cập nhật prompt thành công.' });
            fetchPrompts();
            setIsPromptModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Lỗi cập nhật prompt:', error);
            ShowMessageError({ content: 'Có lỗi xảy ra khi cập nhật prompt.' });
        }
    };

    const deletePrompt = async (id: number) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/delete-prompt`, { id: [id] }, axiosConfig);
            ShowMessageSuccess({ content: 'Xóa prompt thành công.' });
            fetchPrompts();
        } catch (error) {
            console.error('Lỗi xóa prompt:', error);
            ShowMessageError({ content: 'Có lỗi xảy ra khi xóa prompt.' });
        }
    };

    const resetForm = () => {
        setPromptForm(initialPromptForm);
        setSelectStates({
            h1: { type: null, model: null },
            title: { type: null, model: null },
            meta: { type: null, model: null },
            prompt_sapo: { type: null, model: null },
            prompt_captions: { type: null, model: null },
            prompt_conclude: { type: null, model: null },
            outline: { type: null, model: null },
            trien_khai: { type: null, model: null },
            internal: { type: null, model: null },
        });
        setEditingPromptId(null);
    };

    const handleEditPrompt = (p: any) => {
        const parsedContent = typeof p.content === 'string' ? JSON.parse(p.content) : p.content;
        const contentObj = unflattenContent(parsedContent);
        const displayType = Object.entries(typeSiteMapping).find(([key, value]) => value === p.type_site)?.[0] || '';
        setPromptForm({
            level: p.level,
            name: p.name,
            money: p.money,
            note: p.note,
            typeSite: displayType,
            randomKeyOpening: p.random_key_opening,
            content: contentObj,
        });
        const newSelectStates = { ...selectStates };
        (
            ['h1', 'title', 'meta', 'prompt_sapo', 'prompt_captions', 'prompt_conclude', 'outline', 'trien_khai', 'internal'] as (keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>)[]
        ).forEach((field) => {
            newSelectStates[field] = { type: contentObj[field]?.type || null, model: contentObj[field]?.model || null };
        });
        setSelectStates(newSelectStates);
        setEditingPromptId(p.id);
        setIsPromptModalOpen(true);
    };

    const promptColumns: DataTableColumn<any>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        {
            accessor: 'level',
            title: 'Cấp',
            sortable: true,
            render: (p: any) => <span className="text-sm badge badge-outline-primary">Cấp {p.level}</span>,
        },
        { accessor: 'name', title: 'Tên', sortable: true },
        { accessor: 'money', title: 'Giá', sortable: true, render: (p: any) => <span className="text-sm badge badge-outline-primary">{formatNumber(p.money)} VNĐ</span> },
        {
            accessor: 'action',
            title: 'Hành động',
            textAlignment: 'center',
            render: (p: any) => (
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleEditPrompt(p)} className="hover:underline">
                        Cập nhật
                    </button>
                    <button onClick={() => deletePrompt(p.id)} className="hover:underline">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        setIsPromptModalOpen(true);
                        resetForm();
                    }}
                    className="btn btn-success"
                >
                    Tạo Prompt
                </button>
            </div>
            <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                <DataTable columns={promptColumns} records={prompts} />
            </div>
            <Transition appear show={isPromptModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClose={() => {
                        setIsPromptModalOpen(false);
                        resetForm();
                    }}
                >
                    <div className="min-h-screen px-4 text-center custom-select">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black opacity-30" />
                        </Transition.Child>
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block overflow-y-auto relative w-full h-[80dvh] max-w-[90%] my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white p-6 ">
                                    {editingPromptId ? 'Cập nhật Prompt' : 'Tạo Prompt'}
                                </Dialog.Title>
                                <div className="mt-4 space-y-4 p-6 ">
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-gray-900 dark:text-white">Name</label>
                                            <input
                                                type="text"
                                                value={promptForm.name}
                                                onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                                                className="border p-2 w-full form-input"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-gray-900 dark:text-white">Level</label>
                                            <input
                                                type="number"
                                                value={promptForm.level}
                                                onChange={(e) => setPromptForm({ ...promptForm, level: Number(e.target.value) })}
                                                className="border p-2 w-full form-input"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-gray-900 dark:text-white">Money</label>
                                            <input
                                                type="number"
                                                value={promptForm.money}
                                                onChange={(e) => setPromptForm({ ...promptForm, money: Number(e.target.value) })}
                                                className="border p-2 w-full form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <label className="block text-gray-900 dark:text-white">TypeSite</label>
                                            <Select
                                                options={groupSiteOptions}
                                                value={groupSiteOptions.find((option) => option.value === promptForm.typeSite) || null}
                                                onChange={(option) => setPromptForm({ ...promptForm, typeSite: option ? option.value : '' })}
                                                placeholder="Select TypeSite"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-gray-900 dark:text-white">RandomKeyOpening</label>
                                            <input
                                                type="text"
                                                value={promptForm.randomKeyOpening}
                                                onChange={(e) => setPromptForm({ ...promptForm, randomKeyOpening: e.target.value })}
                                                className="border p-2 w-full form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-gray-900 dark:text-white">Note</label>
                                        <textarea rows={3} value={promptForm.note} onChange={(e) => setPromptForm({ ...promptForm, note: e.target.value })} className="border p-2 w-full form-input" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['prompt_system', 'prompt_keywords'] as (keyof Pick<PromptContent, 'prompt_system' | 'prompt_keywords'>)[]).map((key) => (
                                            <div key={key} className="flex flex-col">
                                                <label className="capitalize text-gray-900 dark:text-white">{key.replace('_', ' ')}</label>
                                                <textarea
                                                    value={promptForm.content[key] as string}
                                                    onChange={(e) => handleChange(key, e.target.value)}
                                                    className="border p-2 w-full form-input"
                                                    rows={3}
                                                ></textarea>
                                            </div>
                                        ))}
                                        {(
                                            ['h1', 'title', 'meta', 'prompt_sapo', 'prompt_captions', 'prompt_conclude', 'outline', 'trien_khai', 'internal'] as (keyof Omit<
                                                PromptContent,
                                                'prompt_system' | 'prompt_keywords'
                                            >)[]
                                        ).map((field) => (
                                            <div key={field} className="space-y-2 border p-4 rounded border-gray-200 dark:border-gray-700">
                                                <label className="capitalize text-gray-900 dark:text-white">{field === 'internal' ? 'Prompt Internal' : field.replace('_', ' ')}</label>
                                                <textarea
                                                    value={promptForm.content[field]?.content || ''}
                                                    onChange={(e) => handleChange(field, e.target.value)}
                                                    className="border p-2 w-full form-input"
                                                    rows={3}
                                                ></textarea>
                                                <div className="flex space-x-4">
                                                    <div className="flex-1">
                                                        <Select
                                                            options={typeOptions}
                                                            value={selectStates[field].type}
                                                            onChange={(option) => handleSelectChange(field, 'type', option)}
                                                            placeholder="Type"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Select
                                                            options={getModelOptionsForField(field)}
                                                            value={selectStates[field].model}
                                                            onChange={(option) => handleSelectChange(field, 'model', option)}
                                                            placeholder="Model"
                                                            isDisabled={!selectStates[field].type}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 sticky bottom-0 bg-white dark:bg-[#121c2c] p-6 ">
                                    <button
                                        onClick={() => {
                                            setIsPromptModalOpen(false);
                                            resetForm();
                                        }}
                                        className="btn btn-outline-danger"
                                    >
                                        Hủy
                                    </button>
                                    <button onClick={editingPromptId ? updatePrompt : createPrompt} className="btn btn-success">
                                        {editingPromptId ? 'Cập nhật' : 'Tạo'}
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
