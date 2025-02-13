import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Category, Income, Expense, MonthData } from '../types';
import { Trash2, IndianRupee, X, Calendar, ChevronLeft, ChevronRight, ArrowDownCircle, ChevronDown, Plus, Edit2 } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { processMonthlyRecurringTransactions, createRecurringTransaction } from '../lib/recurring';
import { toast } from 'react-hot-toast';
import IncomeModal from './IncomeModal';
import ExpenseModal from './ExpenseModal';

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

// Add utility function for Indian number formatting
const formatIndianNumber = (num: number): string => {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `₹${parts.join('.')}`;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [incomeSources, setIncomeSources] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [prevIncomeSources, setPrevIncomeSources] = useState<Income[]>([]);
    const [prevExpenses, setPrevExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | undefined>();
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

    // Fetch data when month changes
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const startDate = startOfMonth(selectedMonth);
                const endDate = endOfMonth(selectedMonth);
                const prevStartDate = startOfMonth(new Date(startDate.getFullYear(), startDate.getMonth() - 1));
                const prevEndDate = endOfMonth(new Date(startDate.getFullYear(), startDate.getMonth() - 1));
                
                const [incomes, expenses, prevIncomes, prevExpenses] = await Promise.all([
                    db.income.getAll(user.id, startDate, endDate),
                    db.expenses.getAll(user.id, startDate, endDate),
                    db.income.getAll(user.id, prevStartDate, prevEndDate),
                    db.expenses.getAll(user.id, prevStartDate, prevEndDate)
                ]);
                
                setIncomeSources(incomes);
                setExpenses(expenses);
                setPrevIncomeSources(prevIncomes);
                setPrevExpenses(prevExpenses);
            } catch (error) {
                console.error('Error fetching data:', error);
                // TODO: Add proper error handling
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [selectedMonth, user]);

    const handleDeleteIncome = async (id: string) => {
        if (!user) return;
        try {
            await db.income.remove(id);
            
            // Refresh the data
            const startDate = startOfMonth(selectedMonth);
            const endDate = endOfMonth(selectedMonth);
            const updatedIncomes = await db.income.getAll(user.id, startDate, endDate);
            setIncomeSources(updatedIncomes);
        } catch (error) {
            console.error('Error deleting income:', error);
            // TODO: Add proper error handling
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!user) return;
        try {
            await db.expenses.remove(id);
            
            // Refresh the data
            const startDate = startOfMonth(selectedMonth);
            const endDate = endOfMonth(selectedMonth);
            const updatedExpenses = await db.expenses.getAll(user.id, startDate, endDate);
            setExpenses(updatedExpenses);
        } catch (error) {
            console.error('Error deleting expense:', error);
            // TODO: Add proper error handling
        }
    };

    const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);
    const prevTotalIncome = prevIncomeSources.reduce((sum, source) => sum + source.amount, 0);
    
    const expensesByCategory = CATEGORIES.reduce((acc, category) => {
        acc[category] = expenses
            .filter((e) => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return acc;
    }, {} as Record<typeof CATEGORIES[number], number>);

    const prevExpensesByCategory = CATEGORIES.reduce((acc, category) => {
        acc[category] = prevExpenses
            .filter((e) => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return acc;
    }, {} as Record<typeof CATEGORIES[number], number>);

    const totalExpenses = Object.values(expensesByCategory).reduce(
        (sum, amount) => sum + amount,
        0
    );

    const prevTotalExpenses = Object.values(prevExpensesByCategory).reduce(
        (sum, amount) => sum + amount,
        0
    );

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const getLargestExpenseCategory = (expenses: Record<typeof CATEGORIES[number], number>) => {
        const result = Object.entries(expenses).reduce((max, [category, amount]) => 
            amount > max.amount ? { category, amount } : max, 
            { category: 'None', amount: 0 }
        );
        return {
            category: result.category.charAt(0).toUpperCase() + result.category.slice(1),
            amount: result.amount
        };
    };

    const getCategoryColor = (category: Category) => {
        switch (category) {
            case 'investment':
                return 'text-emerald-600';
            case 'debt':
                return 'text-orange-600';
            case 'needs':
                return 'text-blue-600';
            case 'leisure':
                return 'text-purple-600';
            default:
                return 'text-gray-800';
        }
    };

    const goToPreviousMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
    };

    const handleImportRecurring = async () => {
        if (!user) return;
        setIsImporting(true);
        try {
            await processMonthlyRecurringTransactions();
            // Refresh the data after importing
            const startDate = startOfMonth(selectedMonth);
            const endDate = endOfMonth(selectedMonth);
            const [incomes, expenses] = await Promise.all([
                db.income.getAll(user.id, startDate, endDate),
                db.expenses.getAll(user.id, startDate, endDate)
            ]);
            setIncomeSources(incomes);
            setExpenses(expenses);
            toast.success('Successfully imported recurring transactions');
        } catch (error) {
            console.error('Error importing recurring transactions:', error);
            toast.error('Failed to import recurring transactions');
        } finally {
            setIsImporting(false);
        }
    };

    const handleEditIncome = async (income: { name: string; amount: number }) => {
        if (!user || !editingIncome) return;
        try {
            await db.income.update(editingIncome.id, income);
            
            // Refresh the data
            const startDate = startOfMonth(selectedMonth);
            const endDate = endOfMonth(selectedMonth);
            if (!user) return;
            const updatedIncomes = await db.income.getAll(user.id, startDate, endDate);
            setIncomeSources(updatedIncomes);
            toast.success('Income updated successfully');
        } catch (error) {
            console.error('Error updating income:', error);
            toast.error('Failed to update income');
        }
    };

    const handleEditExpense = async (expense: { name: string; amount: number; category: Category }) => {
        if (!user || !editingExpense) return;
        try {
            await db.expenses.update(editingExpense.id, expense);
            
            // Refresh the data
            const startDate = startOfMonth(selectedMonth);
            const endDate = endOfMonth(selectedMonth);
            const updatedExpenses = await db.expenses.getAll(user.id, startDate, endDate);
            setExpenses(updatedExpenses);
            toast.success('Expense updated successfully');
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Failed to update expense');
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {isLoading && (
                <>
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-blue-600 dark:bg-blue-500 animate-loading-bar"></div>
                            </div>
                            <p className="text-base text-gray-600 dark:text-gray-400">Loading dashboard</p>
                        </div>
                    </div>
                </>
            )}
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200 text-center sm:text-left">Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                        Track your income and expenses
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                        onClick={handleImportRecurring}
                        disabled={isImporting}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors duration-200 w-full sm:w-auto justify-center ${
                            isImporting 
                                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-400 border-blue-100 dark:border-blue-800 cursor-not-allowed'
                                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900'
                        }`}
                    >
                        {isImporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-blue-400 dark:border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                                Importing...
                            </>
                        ) : (
                            <>
                                <ArrowDownCircle className="w-4 h-4" />
                                Import Recurring Transactions
                            </>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition duration-200"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="inline-block">
                            <DatePicker
                                selected={selectedMonth}
                                onChange={(date: Date | null) => date && setSelectedMonth(startOfMonth(date))}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                customInput={
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm shadow-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{format(selectedMonth, 'MMM yyyy')}</span>
                                    </button>
                                }
                                calendarClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                                wrapperClassName="!block"
                                popperClassName="!z-50"
                            />
                        </div>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition duration-200"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 [&>*]:h-fit">
                {/* Summary Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-blue-200 dark:border-blue-900">
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Income</div>
                            <div className="text-base sm:text-lg font-bold text-black dark:text-gray-200">
                                {formatIndianNumber(totalIncome)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalIncome, prevTotalIncome) > 0 ? 'text-green-600 dark:text-green-400' : calculateTrend(totalIncome, prevTotalIncome) < 0 ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                                {calculateTrend(totalIncome, prevTotalIncome) > 0 ? '↑' : calculateTrend(totalIncome, prevTotalIncome) < 0 ? '↓' : '='} {Math.abs(calculateTrend(totalIncome, prevTotalIncome)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-red-200 dark:border-red-900">
                            <div className="text-xs font-medium text-red-600 dark:text-red-400">Total Expenses</div>
                            <div className="text-base sm:text-lg font-bold text-black dark:text-gray-200">
                                {formatIndianNumber(totalExpenses)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalExpenses, prevTotalExpenses) > 0 ? 'text-red-600 dark:text-red-400' : calculateTrend(totalExpenses, prevTotalExpenses) < 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>
                                {calculateTrend(totalExpenses, prevTotalExpenses) > 0 ? '↑' : calculateTrend(totalExpenses, prevTotalExpenses) < 0 ? '↓' : '='} {Math.abs(calculateTrend(totalExpenses, prevTotalExpenses)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-200 dark:border-green-900">
                            <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                Remaining Balance
                            </div>
                            <div className="text-base sm:text-lg font-bold text-black dark:text-gray-200">
                                {formatIndianNumber(totalIncome - totalExpenses)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) > 0 ? 'text-green-600 dark:text-green-400' : calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) < 0 ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                                {calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) > 0 ? '↑' : calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) < 0 ? '↓' : '='} {Math.abs(calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-purple-200 dark:border-purple-900">
                            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                Largest Spend
                            </div>
                            <div className="text-base sm:text-lg font-bold text-black dark:text-gray-200">
                                {getLargestExpenseCategory(expensesByCategory).category}
                            </div>
                            <div className="text-xs font-medium text-black dark:text-gray-200">
                                {formatIndianNumber(getLargestExpenseCategory(expensesByCategory).amount)}
                            </div>
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {getLargestExpenseCategory(expensesByCategory).category === getLargestExpenseCategory(prevExpensesByCategory).category ? 
                                    'Same as last month' : 
                                    `Was ${getLargestExpenseCategory(prevExpensesByCategory).category} last month`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Sources */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Income Sources</h2>
                        <button
                            onClick={() => setIsIncomeModalOpen(true)}
                            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm text-sm"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5 inline-block" />
                            Add Income
                        </button>
                    </div>

                    {/* Income List */}
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                            {incomeSources.length === 0 ? (
                                <div className="px-3 sm:px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                    No income added
                                </div>
                            ) : (
                                incomeSources.map((source) => (
                                    <div
                                        key={source.id}
                                        className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{source.name}</span>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                {formatIndianNumber(source.amount)}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingIncome(source);
                                                    setIsIncomeModalOpen(true);
                                                }}
                                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteIncome(source.id)}
                                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-center items-center mt-3">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Total: {formatIndianNumber(totalIncome)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Expenses</h2>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm text-sm"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5 inline-block" />
                        Add Expense
                    </button>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 [&>*]:h-fit">
                    {CATEGORIES.map((category) => (
                        <div key={category} className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0 mb-3">
                                <h3 className={`text-sm font-bold uppercase tracking-wide ${getCategoryColor(category)} dark:text-${category === 'investment' ? 'emerald' : category === 'debt' ? 'orange' : category === 'needs' ? 'blue' : 'purple'}-400`}>
                                    {category}
                                </h3>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Total: {formatIndianNumber(expensesByCategory[category])}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                {expenses
                                    .filter((expense) => expense.category === category)
                                    .map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                {expense.name}
                                            </span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    {formatIndianNumber(expense.amount)}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingExpense(expense);
                                                        setIsExpenseModalOpen(true);
                                                    }}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                {expenses.filter((expense) => expense.category === category).length === 0 && (
                                    <div className="px-3 sm:px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                        No expenses here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Footer */}
            <div className="flex flex-col items-center space-y-2 mt-6 sm:mt-8">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center px-4">Made with ❤️ by Siby C.R.</p>
                <div className="flex space-x-4 justify-center">
                    <a href="https://github.com/sibycr18" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                    </a>
                    <a href="https://x.com/siby_cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/sibycr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/siby.cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                    </a>
                </div>
            </div>

            {/* Income Modal */}
            <IncomeModal
                isOpen={isIncomeModalOpen}
                onClose={() => {
                    setIsIncomeModalOpen(false);
                    setEditingIncome(undefined);
                }}
                onSave={async (income) => {
                    if (!user) return;
                    
                    if (editingIncome) {
                        await handleEditIncome(income);
                    } else {
                        try {
                            const firstDayOfMonth = startOfMonth(selectedMonth);

                            // If it's a recurring income, create the recurring transaction first
                            let recurring_id: string | undefined;
                            if (income.is_recurring) {
                                const recurringTransaction = await createRecurringTransaction({
                                    name: income.name,
                                    amount: income.amount,
                                    type: 'income',
                                    active: true,
                                });
                                recurring_id = recurringTransaction.id;
                            }

                            // Then create the income with the recurring_id if it exists
                            await db.income.add({
                                user_id: user.id,
                                name: income.name,
                                amount: income.amount,
                                date: firstDayOfMonth.toISOString(),
                                is_recurring: income.is_recurring || false,
                                recurring_id: recurring_id,
                            });
                            
                            // Refresh the data
                            const startDate = startOfMonth(selectedMonth);
                            const endDate = endOfMonth(selectedMonth);
                            const updatedIncomes = await db.income.getAll(user.id, startDate, endDate);
                            setIncomeSources(updatedIncomes);
                            
                            toast.success('Income added successfully');
                        } catch (error) {
                            console.error('Error adding income:', error);
                            toast.error('Failed to add income');
                        }
                    }
                    setIsIncomeModalOpen(false);
                    setEditingIncome(undefined);
                }}
                income={editingIncome}
            />

            {/* Expense Modal */}
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    setEditingExpense(undefined);
                }}
                onSave={async (expense) => {
                    if (!user) return;
                    
                    if (editingExpense) {
                        await handleEditExpense(expense);
                    } else {
                        try {
                            const firstDayOfMonth = startOfMonth(selectedMonth);
                            
                            // If it's a recurring expense, create the recurring transaction first
                            let recurring_id: string | undefined;
                            if (expense.is_recurring) {
                                const recurringTransaction = await createRecurringTransaction({
                                    name: expense.name,
                                    amount: expense.amount,
                                    type: 'expense',
                                    category: expense.category,
                                    active: true,
                                });
                                recurring_id = recurringTransaction.id;
                            }

                            // Then create the expense with the recurring_id if it exists
                            await db.expenses.add({
                                user_id: user.id,
                                name: expense.name,
                                amount: expense.amount,
                                category: expense.category,
                                date: firstDayOfMonth.toISOString(),
                                is_recurring: expense.is_recurring || false,
                                recurring_id: recurring_id,
                            });
                            
                            // Refresh the data
                            const startDate = startOfMonth(selectedMonth);
                            const endDate = endOfMonth(selectedMonth);
                            const updatedExpenses = await db.expenses.getAll(user.id, startDate, endDate);
                            setExpenses(updatedExpenses);
                            
                            toast.success('Expense added successfully');
                        } catch (error) {
                            console.error('Error adding expense:', error);
                            toast.error('Failed to add expense');
                        }
                    }
                    setIsExpenseModalOpen(false);
                    setEditingExpense(undefined);
                }}
                expense={editingExpense}
            />
        </div>
    );
}
