import React, { useState, useEffect } from 'react';
import { X, IndianRupee } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Income } from '../types';
import { createRecurringTransaction } from '../lib/recurring';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (income: { name: string; amount: number; is_recurring?: boolean }) => void;
    income?: Income;
}

export default function IncomeModal({ isOpen, onClose, onSave, income }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        is_recurring: false,
    });

    useEffect(() => {
        if (income) {
            setFormData({
                name: income.name,
                amount: income.amount.toString(),
                is_recurring: income.is_recurring || false,
            });
        } else {
            setFormData({
                name: '',
                amount: '',
                is_recurring: false,
            });
        }
    }, [income]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create the income
        onSave({
            name: formData.name.trim(),
            amount: parseFloat(formData.amount),
            is_recurring: formData.is_recurring,
        });

        onClose();
        setFormData({ name: '', amount: '', is_recurring: false });
    };

    if (!isOpen) return null;

    const modal = (
        <>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {income ? 'Edit Income' : 'Add Income'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="block w-full rounded-lg border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
                                    placeholder="e.g. Salary, Freelance"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-gray-500 sm:text-sm">INR</span>
                                    </div>
                                </div>
                            </div>

                            {!income && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_recurring"
                                        checked={formData.is_recurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                                        Make this a recurring income
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
                            >
                                {income ? 'Save Changes' : 'Add Income'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

    return createPortal(modal, document.body);
} 