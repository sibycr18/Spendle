import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Edit2, Pause, Play, Trash2, Circle, Info, Target } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expenses' | 'goals'>('all');
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
        if (activeTab === 'expenses') return transaction.type === 'expense' && !transaction.goal_id;
        if (activeTab === 'income') return transaction.type === 'income';
        if (activeTab === 'goals') return !!transaction.goal_id;
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
        <div className="min-h-screen flex flex-col">
            {isLoading && (
                <>
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-blue-600 dark:bg-blue-500 animate-loading-bar"></div>
                            </div>
                            <p className="text-base text-gray-600 dark:text-gray-300">Loading transactions</p>
                        </div>
                    </div>
                </>
            )}
            <div className="flex-1 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Monthly Recurring Transactions</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 px-4">
                        Set up your recurring transactions to automatically add them to your monthly income and expenses
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="max-w-4xl mx-auto w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Monthly Recurring Income */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-green-200 dark:border-green-900 px-4 py-3 flex flex-col items-center">
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                <ArrowUpCircle className="h-4 w-4" />
                                <h2 className="text-xs font-medium">Monthly Recurring Income</h2>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-200 mt-1">
                                ₹{summaryData.monthlyIncome.toLocaleString()}
                            </p>
                        </div>

                        {/* Monthly Recurring Expenses */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-red-200 dark:border-red-900 px-4 py-3 flex flex-col items-center">
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                                <ArrowDownCircle className="h-4 w-4" />
                                <h2 className="text-xs font-medium">Monthly Recurring Expenses</h2>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-200 mt-1">
                                ₹{summaryData.monthlyExpenses.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="max-w-2xl mx-auto w-full space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto w-full sm:w-auto pb-4 sm:pb-0">
                                {['all', 'income', 'expenses', 'goals'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as typeof activeTab)}
                                        className={`
                                            whitespace-nowrap py-2 sm:py-4 px-1 border-b-2 font-medium text-sm
                                            ${activeTab === tab
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                                        `}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                            <button
                                className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                                onClick={handleAddTransaction}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add New
                            </button>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                            <div className="p-4">
                                <p className="text-gray-500 dark:text-gray-400 text-center">Loading...</p>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="p-4">
                                <p className="text-gray-500 dark:text-gray-400 text-center">No recurring transactions yet.</p>
                                <p className="text-gray-500 dark:text-gray-400 text-center mt-1">Set up your first recurring transaction to automate your finances.</p>
                                <div className="mt-4 flex justify-center">
                                    <button
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                                        onClick={handleAddTransaction}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Transaction
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {filteredTransactions.map((transaction) => (
                                    <div key={transaction.id} className="px-3 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                            <div className="flex items-center space-x-2">
                                                <div className={`${
                                                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {transaction.type === 'income' ? (
                                                        <ArrowUpCircle className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowDownCircle className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">{transaction.name}</h3>
                                                        {transaction.goal_id && (
                                                            <Target className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                                                        )}
                                                    </div>
                                                    {transaction.type === 'expense' && transaction.category && (
                                                        <p className={`text-xs ${getCategoryColor(transaction.category)} flex items-center gap-1`}>
                                                            <Circle className="h-1.5 w-1.5 fill-current opacity-75" />
                                                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    ₹{transaction.amount.toLocaleString()}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(transaction.id)}
                                                        className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(transaction.id)}
                                                        className={`p-1 ${transaction.active ? 'text-green-500 hover:text-yellow-500 dark:text-green-400 dark:hover:text-yellow-400' : 'text-yellow-500 hover:text-green-500 dark:text-yellow-400 dark:hover:text-green-400'}`}
                                                    >
                                                        {transaction.active ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    {transaction.goal_id ? (
                                                        <button
                                                            className="p-1 text-blue-500 dark:text-blue-400 group relative"
                                                        >
                                                            <Info className="h-4 w-4" />
                                                            <div className="absolute bottom-full right-0 mb-2 w-48 px-2 py-1.5 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                                Cannot delete recurring transactions linked to Goals
                                                                <div className="absolute -bottom-1 right-1.5 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDelete(transaction.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center space-y-2 mt-6 sm:mt-8">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center px-4">Made with ❤️ by Siby C.R.</p>
                    <div className="flex space-x-4 justify-center">
                        <a href="https://github.com/sibycr18" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                            </svg>
                        </a>
                        <a href="https://x.com/siby_cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/in/sibycr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/siby.cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Modal */}
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
        </div>
    );
}
