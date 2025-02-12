import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { RecurringTransaction, Category } from '../types';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<RecurringTransaction, 'id' | 'user_id'>) => void;
    transaction?: RecurringTransaction;
}

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

export default function RecurringTransactionModal({ isOpen, onClose, onSave, transaction }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: 'needs' as Category,
        active: true
    });

    const [showCategory, setShowCategory] = useState(formData.type === 'expense');

    useEffect(() => {
        if (transaction) {
            setFormData({
                name: transaction.name,
                amount: transaction.amount.toString(),
                type: transaction.type,
                category: transaction.category || 'needs',
                active: true
            });
            setShowCategory(transaction.type === 'expense');
        } else {
            setFormData({
                name: '',
                amount: '',
                type: 'expense',
                category: 'needs',
                active: true
            });
            setShowCategory(true);
        }
    }, [transaction, isOpen]);

    useEffect(() => {
        if (formData.type === 'expense') {
            setShowCategory(true);
        } else {
            const timer = setTimeout(() => setShowCategory(false), 200);
            return () => clearTimeout(timer);
        }
    }, [formData.type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name: formData.name.trim(),
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.type === 'expense' ? formData.category : undefined,
            active: true
        });
        onClose();
    };

    if (!isOpen) return null;

    const modal = (
        <>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {transaction ? 'Edit' : 'Add'} Monthly {formData.type === 'income' ? 'Income' : 'Expense'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="min-h-[360px] space-y-5">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ 
                                        ...prev, 
                                        type: 'income',
                                        category: undefined
                                    }))}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                                        formData.type === 'income'
                                            ? 'bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 ring-1 ring-green-600/20 dark:ring-green-400/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ 
                                        ...prev, 
                                        type: 'expense',
                                        category: 'needs'
                                    }))}
                                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                                        formData.type === 'expense'
                                            ? 'bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 ring-1 ring-red-600/20 dark:ring-red-400/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Expense
                                </button>
                            </div>

                            <div className="space-y-1.5 mt-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="block w-full rounded-lg border-0 px-3 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                    placeholder="e.g. Rent, Salary"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">INR</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`space-y-1.5 transition-all duration-200 ease-in-out ${
                                showCategory ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0 overflow-hidden'
                            }`}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, category }))}
                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow ring-1 ring-inset ${
                                                formData.category === category
                                                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-400/20 shadow-blue-100 dark:shadow-blue-900/50'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ring-gray-300 dark:ring-gray-600'
                                            }`}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-5 mt-5 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                            >
                                {transaction ? 'Save Changes' : 'Add Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

    return createPortal(modal, document.body);
}
