// AIModel.tsx
'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
const token = Cookies.get('token');

export default function AIModel() {
    const [models, setModels] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [modelForm, setModelForm] = useState({ name: '', description: '' });
    const [selectedTypeOption, setSelectedTypeOption] = useState<any>(null);
    const [typeForm, setTypeForm] = useState({ name: '' });
    const fetchModels = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-ai-models`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setModels(list);
    };
    const fetchTypes = async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/get-type-ai`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : data.data ? data.data : [];
        setTypes(list);
    };
    useEffect(() => {
        fetchModels();
        fetchTypes();
    }, []);
    const createModel = async () => {
        await axios.post(
            `${process.env.NEXT_PUBLIC_URL_API}/api/ai/create-ai-model`,
            { typeAIId: Number(selectedTypeOption.value), name: modelForm.name, description: modelForm.description },
            { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
        );
        setModelForm({ name: '', description: '' });
        setSelectedTypeOption(null);
        fetchModels();
        setIsModelModalOpen(false);
    };
    const deleteModel = async (id: number) => {
        await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/delete-ai-model`, { id: [id] }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        fetchModels();
    };
    const createType = async () => {
        await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/create-type-ai`, { name: typeForm.name }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        setTypeForm({ name: '' });
        fetchTypes();
        setIsTypeModalOpen(false);
    };
    const deleteType = async (id: number) => {
        await axios.post(`${process.env.NEXT_PUBLIC_URL_API}/api/ai/delete-type-ai`, { id: [id] }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        fetchTypes();
    };
    const modelColumns: DataTableColumn<any>[] = [
        { accessor: 'id', title: 'ID', sortable: true },

        { accessor: 'name', title: 'Tên', sortable: true },
        { accessor: 'description', title: 'Mô tả', sortable: true },
        {
            accessor: 'type_ai_id',
            title: 'Type AI',
            sortable: true,
            render: (model: any) => {
                const type = types.find((t: any) => t.id === model.type_ai_id);
                return type ? type.name : model.type_ai_id;
            },
        },
        {
            accessor: 'action',
            title: 'Hành động',
            render: (model: any) => (
                <button onClick={() => deleteModel(model.id)} className="btn btn-danger">
                    Xóa
                </button>
            ),
        },
    ];
    const typeColumns: DataTableColumn<any>[] = [
        { accessor: 'id', title: 'ID', sortable: true },
        { accessor: 'name', title: 'Tên', sortable: true },
        {
            accessor: 'action',
            title: 'Hành động',
            render: (type: any) => (
                <button onClick={() => deleteType(type.id)} className="btn btn-danger">
                    Xóa
                </button>
            ),
        },
    ];
    const typeOptions = types.map((t) => ({ value: t.id, label: t.name }));
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

    return (
        <div className="p-4">
            <Tab.Group selectedIndex={selectedIndex ?? 0} onChange={setSelectedIndex}>
                <Tab.List className="mt-3 flex flex-wrap">
                    <Tab as={Fragment}>
                        {(tabProps) => (
                            <button
                                className={`${
                                    tabProps.selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                            >
                                {' '}
                                Model AI
                            </button>
                        )}
                    </Tab>
                    <Tab as={Fragment}>
                        {(tabProps) => (
                            <button
                                className={`${
                                    tabProps.selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black`}
                            >
                                {' '}
                                Type AI
                            </button>
                        )}
                    </Tab>
                </Tab.List>
                <Tab.Panels className="mt-2">
                    <Tab.Panel>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsModelModalOpen(true)} className="btn btn-success">
                                Tạo Model
                            </button>
                        </div>
                        <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                            <DataTable columns={modelColumns} records={models} />
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsTypeModalOpen(true)} className="btn btn-success">
                                Tạo Type
                            </button>
                        </div>
                        <div className="datatables pagination-padding overflow-auto max-h-[70dvh]">
                            <DataTable columns={typeColumns} records={types} />
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            <Transition appear show={isModelModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsModelModalOpen(false)}>
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
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Tạo Model AI
                                </Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <div className="custom-select">
                                        <Select options={typeOptions} value={selectedTypeOption} onChange={setSelectedTypeOption} placeholder="Select Type AI" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={modelForm.name}
                                        onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={modelForm.description}
                                        onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                                        className="border p-2 w-full form-input"
                                    />
                                </div>
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button onClick={() => setIsModelModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={createModel} className="btn btn-success">
                                        Tạo
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={isTypeModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => setIsTypeModalOpen(false)}>
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
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded dark:bg-[#121c2c]">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Tạo Type AI
                                </Dialog.Title>
                                <div className="mt-4">
                                    <input type="text" placeholder="Name" value={typeForm.name} onChange={(e) => setTypeForm({ name: e.target.value })} className="border p-2 w-full form-input" />
                                </div>
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button onClick={() => setIsTypeModalOpen(false)} className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={createType} className="btn btn-success">
                                        Tạo
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
