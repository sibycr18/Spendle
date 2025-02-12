import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Edit2, Pause, Play, Trash2 } from 'lucide-react';
import { RecurringTransaction, Category } from '../types';
import RecurringTransactionModal from './RecurringTransactionModal';
import { 
    fetchRecurringTransactions, 
    createRecurringTransaction, 
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransactionActive 
} from '../lib/recurring';
import { toast } from 'react-hot-toast';

export default function Recurring() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expenses'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>();
    const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await fetchRecurringTransactions();
            setTransactions(data);
        } catch (error) {
            toast.error('Failed to load recurring transactions');
            console.error('Error loading transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate summary from real transactions
    const summaryData = {
        monthlyIncome: transactions
            .filter(t => t.type === 'income' && t.active)
            .reduce((sum, t) => sum + t.amount, 0),
        monthlyExpenses: transactions
            .filter(t => t.type === 'expense' && t.active)
            .reduce((sum, t) => sum + t.amount, 0),
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (activeTab === 'all') return true;
        if (activeTab === 'expenses') return transaction.type === 'expense';
        if (activeTab === 'income') return transaction.type === 'income';
        return false;
    });

    const handleAddTransaction = () => {
        setEditingTransaction(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (id: string) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            setEditingTransaction(transaction);
            setIsModalOpen(true);
        }
    };

    const handleSaveTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'user_id'>) => {
        try {
            if (editingTransaction) {
                await updateRecurringTransaction({ 
                    id: editingTransaction.id,
                    ...transaction 
                });
                toast.success('Transaction updated successfully');
            } else {
                await createRecurringTransaction(transaction);
                toast.success('Transaction created successfully');
            }
            loadTransactions();
        } catch (error) {
            toast.error('Failed to save transaction');
            console.error('Error saving transaction:', error);
        } finally {
            setIsModalOpen(false);
            setEditingTransaction(undefined);
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            const transaction = transactions.find(t => t.id === id);
            if (transaction) {
                await toggleRecurringTransactionActive(id, !transaction.active);
                toast.success(
                    transaction.active 
                        ? 'Transaction paused successfully' 
                        : 'Transaction resumed successfully'
                );
                loadTransactions();
            }
        } catch (error) {
            toast.error('Failed to update transaction status');
            console.error('Error toggling active state:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRecurringTransaction(id);
            toast.success('Transaction deleted successfully');
            loadTransactions();
        } catch (error) {
            toast.error('Failed to delete transaction');
            console.error('Error deleting transaction:', error);
        }
    };

    const getCategoryColor = (category?: Category) => {
        switch (category) {
            case 'investment': return 'text-purple-600';
            case 'debt': return 'text-yellow-600';
            case 'needs': return 'text-blue-600';
            case 'leisure': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Monthly Recurring Transactions</h1>
                <button
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleAddTransaction}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Monthly Recurring Income */}
                <div className="bg-white rounded-lg shadow p-6 space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                        <ArrowUpCircle className="h-5 w-5" />
                        <h2 className="text-sm font-medium">Monthly Recurring Income</h2>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{summaryData.monthlyIncome.toLocaleString()}
                    </p>
                </div>

                {/* Monthly Recurring Expenses */}
                <div className="bg-white rounded-lg shadow p-6 space-y-2">
                    <div className="flex items-center space-x-2 text-red-600">
                        <ArrowDownCircle className="h-5 w-5" />
                        <h2 className="text-sm font-medium">Monthly Recurring Expenses</h2>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{summaryData.monthlyExpenses.toLocaleString()}
                    </p>
                </div>

                {/* Net Monthly Recurring */}
                <div className="bg-white rounded-lg shadow p-6 space-y-2">
                    <div className="flex items-center space-x-2 text-blue-600">
                        <Wallet className="h-5 w-5" />
                        <h2 className="text-sm font-medium">Net Monthly Recurring</h2>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{(summaryData.monthlyIncome - summaryData.monthlyExpenses).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['all', 'income', 'expenses'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as typeof activeTab)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {isLoading ? (
                    <div className="p-6">
                        <p className="text-gray-500 text-center">Loading...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-6">
                        <p className="text-gray-500 text-center">No recurring transactions yet.</p>
                        <p className="text-gray-500 text-center mt-1">Set up your first recurring transaction to automate your finances.</p>
                        <div className="mt-4 flex justify-center">
                            <button
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handleAddTransaction}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transaction
                            </button>
                        </div>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`${
                                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? 
                                            <ArrowUpCircle className="h-5 w-5" /> : 
                                            <ArrowDownCircle className="h-5 w-5" />
                                        }
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{transaction.name}</h3>
                                        <div className="flex items-center space-x-2 mt-0.5">
                                            <span className="text-sm text-gray-500">
                                                ₹{transaction.amount.toLocaleString()}
                                            </span>
                                            {transaction.category && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className={`text-sm ${getCategoryColor(transaction.category)}`}>
                                                        {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(transaction.id)}
                                        className="p-1 text-gray-400 hover:text-gray-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(transaction.id)}
                                        className={`p-1 ${
                                            transaction.active 
                                                ? 'text-green-400 hover:text-green-500' 
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        {transaction.active ? 
                                            <Pause className="h-4 w-4" /> : 
                                            <Play className="h-4 w-4" />
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleDelete(transaction.id)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <RecurringTransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(undefined);
                }}
                onSave={handleSaveTransaction}
                transaction={editingTransaction}
            />
        </div>
    );
}
