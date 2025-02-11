'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
const token = Cookies.get('token');

interface PromptFieldConfig {
    content: string;
    type: { value: string; label: string } | null;
    model: { value: string; label: string } | null;
}

interface PromptContent {
    prompt_system: string;
    prompt_keywords: string;
    prompt_h1: PromptFieldConfig;
    prompt_title: PromptFieldConfig;
    prompt_meta: PromptFieldConfig;
    prompt_sapo: PromptFieldConfig;
    prompt_captions: PromptFieldConfig;
    prompt_conclusion: PromptFieldConfig;
    prompt_internal: PromptFieldConfig;
    prompt_outline: PromptFieldConfig;
    prompt_trienkhai: PromptFieldConfig;
}

interface PromptForm {
    level: number;
    name: string;
    money: number;
    content: PromptContent;
}

const initialPromptContent: PromptContent = {
    prompt_system: '',
    prompt_keywords: '',
    prompt_h1: { content: '', type: null, model: null },
    prompt_title: { content: '', type: null, model: null },
    prompt_meta: { content: '', type: null, model: null },
    prompt_sapo: { content: '', type: null, model: null },
    prompt_captions: { content: '', type: null, model: null },
    prompt_conclusion: { content: '', type: null, model: null },
    prompt_internal: { content: '', type: null, model: null },
    prompt_outline: { content: '', type: null, model: null },
    prompt_trienkhai: { content: '', type: null, model: null },
};

const promptTypeSelectOptions = [
    { value: 'tatca', label: 'Tất cả' },
    { value: 'images', label: 'Hình Ảnh' },
    { value: 'huongdan', label: 'Hướng dẫn' },
    { value: 'tonghop', label: 'Tổng hợp' },
    { value: 'hocthuat', label: 'Học thuật' },
    { value: 'toplist', label: 'Toplist' },
    { value: 'product', label: 'Bán hàng' },
];

export default function Prompt() {
    const [autoPrompts, setAutoPrompts] = useState<any[]>([]);
    const [prompts, setPrompts] = useState<any[]>([]);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    // State để xác định nếu đang cập nhật (sẽ chứa id của prompt cần cập nhật)
    const [editingPromptId, setEditingPromptId] = useState<number | null>(null);

    const [promptForm, setPromptForm] = useState<PromptForm>({
        level: 1,
        name: '',
        money: 0,
        content: initialPromptContent,
    });
    const [selectStates, setSelectStates] = useState<{
        [key in keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>]: {
            type: { value: string; label: string } | null;
            model: { value: string; label: string } | null;
        };
    }>({
        prompt_h1: { type: null, model: null },
        prompt_title: { type: null, model: null },
        prompt_meta: { type: null, model: null },
        prompt_sapo: { type: null, model: null },
        prompt_captions: { type: null, model: null },
        prompt_conclusion: { type: null, model: null },
        prompt_internal: { type: null, model: null },
        prompt_outline: { type: null, model: null },
        prompt_trienkhai: { type: null, model: null },
    });
    const [typeOptions, setTypeOptions] = useState<any[]>([]);
    const [modelOptions, setModelOptions] = useState<any[]>([]);

    const fetchAutoPrompts = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/get-prompts`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setAutoPrompts(list);
    };

    const fetchPrompts = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/get-prompts`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setPrompts(list);
    };

    const fetchTypeOptions = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-type-ai`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setTypeOptions(list.map((t: any) => ({ value: t.id.toString(), label: t.name })));
    };

    const fetchModelOptions = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-ai-models`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setModelOptions(list.map((m: any) => ({ value: m.id.toString(), label: m.name, typeAIId: m.type_ai_id?.toString() || '' })));
    };

    useEffect(() => {
        fetchAutoPrompts();
        fetchPrompts();
        fetchTypeOptions();
        fetchModelOptions();
    }, []);

    const handleChange = (key: keyof PromptContent, value: string) => {
        if (key === 'prompt_system' || key === 'prompt_keywords') {
            setPromptForm((prev) => ({ ...prev, content: { ...prev.content, [key]: value } }));
        } else {
            setPromptForm((prev) => ({ ...prev, content: { ...prev.content, [key]: { ...prev.content[key], content: value } } }));
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

    // Hàm tạo mới Prompt
    const createPrompt = async () => {
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/prompt/create-prompt`,
            {
                level: promptForm.level,
                name: promptForm.name,
                money: promptForm.money,
                content: JSON.stringify(promptForm.content),
            },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        fetchPrompts();
        setIsPromptModalOpen(false);
        resetForm();
    };

    // Hàm cập nhật Prompt (dùng endpoint: /api/prompt/update-prompt)
    const updatePrompt = async () => {
        if (!editingPromptId) return;
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/prompt/update-prompt`,
            {
                id: editingPromptId,
                level: promptForm.level,
                name: promptForm.name,
                money: promptForm.money,
                content: JSON.stringify(promptForm.content),
            },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        fetchPrompts();
        setIsPromptModalOpen(false);
        resetForm();
    };

    const deletePrompt = async (id: number) => {
        await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/prompt/delete-prompt`, { id: [id] }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        fetchPrompts();
    };

    // Hàm reset form sau khi tạo hoặc cập nhật
    const resetForm = () => {
        setPromptForm({
            level: 1,
            name: '',
            money: 0,
            content: initialPromptContent,
        });
        setSelectStates({
            prompt_h1: { type: null, model: null },
            prompt_title: { type: null, model: null },
            prompt_meta: { type: null, model: null },
            prompt_sapo: { type: null, model: null },
            prompt_captions: { type: null, model: null },
            prompt_conclusion: { type: null, model: null },
            prompt_internal: { type: null, model: null },
            prompt_outline: { type: null, model: null },
            prompt_trienkhai: { type: null, model: null },
        });
        setEditingPromptId(null);
    };

    // Hàm xử lý khi nhấn nút “Cập nhật” trên một prompt trong bảng
    const handleEditPrompt = (p: any) => {
        // Giả sử p.content là chuỗi JSON (nếu không, hãy điều chỉnh lại)
        const parsedContent = typeof p.content === 'string' ? JSON.parse(p.content) : p.content;
        setPromptForm({
            level: p.level,
            name: p.name,
            money: p.money,
            content: parsedContent,
        });
        // Cập nhật lại selectStates dựa trên dữ liệu đã có
        const newSelectStates = { ...selectStates };
        (
            ['prompt_h1', 'prompt_title', 'prompt_meta', 'prompt_sapo', 'prompt_captions', 'prompt_conclusion', 'prompt_internal', 'prompt_outline', 'prompt_trienkhai'] as (keyof Omit<
                PromptContent,
                'prompt_system' | 'prompt_keywords'
            >)[]
        ).forEach((field) => {
            newSelectStates[field] = {
                type: parsedContent[field]?.type || null,
                model: parsedContent[field]?.model || null,
            };
        });
        setSelectStates(newSelectStates);
        setEditingPromptId(p.id);
        setIsPromptModalOpen(true);
    };

    const promptColumns: DataTableColumn<any>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        { accessor: 'level', title: 'Cấp', sortable: true },
        { accessor: 'name', title: 'Tên', sortable: true },
        { accessor: 'money', title: 'Giá', sortable: true },
        {
            accessor: 'action',
            title: 'Hành động',
            render: (p: any) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditPrompt(p)} className="btn btn-primary">
                        Cập nhật
                    </button>
                    <button onClick={() => deletePrompt(p.id)} className="btn btn-danger">
                        Xóa
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                {/* Khi nhấn "Tạo Prompt", reset form để đảm bảo không có dữ liệu cũ */}
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
                    <div className="min-h-screen px-4 text-center">
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
                            <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    {editingPromptId ? 'Cập nhật Prompt' : 'Tạo Prompt'}
                                </Dialog.Title>
                                <div className="mt-4 space-y-4 custom-select">
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
                                        [
                                            'prompt_h1',
                                            'prompt_title',
                                            'prompt_meta',
                                            'prompt_sapo',
                                            'prompt_captions',
                                            'prompt_conclusion',
                                            'prompt_internal',
                                            'prompt_outline',
                                            'prompt_trienkhai',
                                        ] as (keyof Omit<PromptContent, 'prompt_system' | 'prompt_keywords'>)[]
                                    ).map((field) => (
                                        <div key={field} className="space-y-2 border p-2 rounded">
                                            <label className="capitalize text-gray-900 dark:text-white">{field.replace('_', ' ')}</label>
                                            <textarea
                                                value={promptForm.content[field].content}
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
                                                        placeholder="Select Prompt Type"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        options={getModelOptionsForField(field)}
                                                        value={selectStates[field].model}
                                                        onChange={(option) => handleSelectChange(field, 'model', option)}
                                                        placeholder="Select Prompt Model"
                                                        isDisabled={!selectStates[field].type}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end space-x-4">
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
