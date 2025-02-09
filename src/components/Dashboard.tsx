import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Category, Income, Expense, MonthData } from '../types';
import { Trash2, IndianRupee, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

export default function Dashboard() {
    const { user } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [incomeSources, setIncomeSources] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [prevIncomeSources, setPrevIncomeSources] = useState<Income[]>([]);
    const [prevExpenses, setPrevExpenses] = useState<Expense[]>([]);
    const [newIncomeSource, setNewIncomeSource] = useState({ name: '', amount: '' });
    const [newExpense, setNewExpense] = useState({
        category: 'needs' as Category,
        name: '',
        amount: ''
    });
    const [isAddingIncomeSource, setIsAddingIncomeSource] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleAddIncomeSource = async () => {
        if (!user) return;
        if (newIncomeSource.name && newIncomeSource.amount) {
            try {
                const firstDayOfMonth = startOfMonth(selectedMonth);
                const income = {
                    user_id: user.id,
                    name: newIncomeSource.name,
                    amount: parseFloat(newIncomeSource.amount),
                    date: firstDayOfMonth.toISOString(),
                };
                
                await db.income.add(income);
                
                // Refresh the data
                const startDate = startOfMonth(selectedMonth);
                const endDate = endOfMonth(selectedMonth);
                const updatedIncomes = await db.income.getAll(user.id, startDate, endDate);
                setIncomeSources(updatedIncomes);
                
                setNewIncomeSource({ name: '', amount: '' });
                setIsAddingIncomeSource(false);
            } catch (error) {
                console.error('Error adding income:', error);
                // TODO: Add proper error handling
            }
        }
    };

    const handleAddExpense = async () => {
        if (!user) return;
        if (newExpense.name && newExpense.amount && newExpense.category) {
            try {
                const expense = {
                    user_id: user.id,
                    name: newExpense.name,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    date: startOfMonth(selectedMonth).toISOString(),
                };
                
                await db.expenses.add(expense);
                
                // Refresh the data
                const startDate = startOfMonth(selectedMonth);
                const endDate = endOfMonth(selectedMonth);
                const updatedExpenses = await db.expenses.getAll(user.id, startDate, endDate);
                setExpenses(updatedExpenses);
                
                setNewExpense({
                    category: 'needs',
                    name: '',
                    amount: ''
                });
            } catch (error) {
                console.error('Error adding expense:', error);
                // TODO: Add proper error handling
            }
        }
    };

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

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-600">
                        Track your income and expenses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <DatePicker
                        key={selectedMonth.getTime()}
                        selected={selectedMonth}
                        onChange={(date: Date) => setSelectedMonth(startOfMonth(date))}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        showFullMonthYearPicker
                        showTwoColumnMonthYearPicker
                        customInput={
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm shadow-sm">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{format(selectedMonth, 'MMM yyyy')}</span>
                            </button>
                        }
                        calendarClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                        wrapperClassName="!block"
                        popperClassName="!z-50"
                        popperPlacement="bottom-end"
                        popperModifiers={[
                            {
                                name: "offset",
                                options: {
                                    offset: [0, 8]
                                }
                            }
                        ]}
                        renderCustomHeader={({
                            date,
                            decreaseYear,
                            increaseYear,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled
                        }) => (
                            <div className="flex justify-between items-center mb-2 px-2">
                                <button
                                    onClick={decreaseYear}
                                    disabled={prevMonthButtonDisabled}
                                    type="button"
                                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                                >
                                    <span className="text-gray-600">←</span>
                                </button>
                                <h2 className="text-sm font-medium text-gray-900">
                                    {format(date, 'yyyy')}
                                </h2>
                                <button
                                    onClick={increaseYear}
                                    disabled={nextMonthButtonDisabled}
                                    type="button"
                                    className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                                >
                                    <span className="text-gray-600">→</span>
                                </button>
                            </div>
                        )}
                        children={
                            <div className="datepicker-footer">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const currentMonth = startOfMonth(new Date());
                                        setSelectedMonth(currentMonth);
                                    }}
                                    type="button"
                                    className="current-month-button"
                                >
                                    Current Month
                                </button>
                            </div>
                        }
                    />
                    <button
                        onClick={goToNextMonth}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 [&>*]:h-fit">
                {/* Summary Section */}
                <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-100 rounded-lg p-3 shadow-sm">
                            <div className="text-xs text-blue-700 font-medium">Total Income</div>
                            <div className="text-lg font-bold text-blue-800">
                                ₹{totalIncome.toFixed(2)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalIncome, prevTotalIncome) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateTrend(totalIncome, prevTotalIncome) >= 0 ? '↑' : '↓'} {Math.abs(calculateTrend(totalIncome, prevTotalIncome)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-red-100 rounded-lg p-3 shadow-sm">
                            <div className="text-xs text-red-700 font-medium">Total Expenses</div>
                            <div className="text-lg font-bold text-red-800">
                                ₹{totalExpenses.toFixed(2)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalExpenses, prevTotalExpenses) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {calculateTrend(totalExpenses, prevTotalExpenses) >= 0 ? '↑' : '↓'} {Math.abs(calculateTrend(totalExpenses, prevTotalExpenses)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-3 shadow-sm">
                            <div className="text-xs text-green-700 font-medium">
                                Remaining Balance
                            </div>
                            <div className="text-lg font-bold text-green-800">
                                ₹{(totalIncome - totalExpenses).toFixed(2)}
                            </div>
                            <div className={`text-xs font-medium ${calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses) >= 0 ? '↑' : '↓'} {Math.abs(calculateTrend(totalIncome - totalExpenses, prevTotalIncome - prevTotalExpenses)).toFixed(1)}% vs last month
                            </div>
                        </div>
                        <div className="bg-purple-100 rounded-lg p-3 shadow-sm">
                            <div className="text-xs text-purple-700 font-medium">
                                Largest Expense
                            </div>
                            <div className="text-lg font-bold text-purple-800">
                                {getLargestExpenseCategory(expensesByCategory).category}
                            </div>
                            <div className="text-xs font-medium text-purple-600">
                                ₹{getLargestExpenseCategory(expensesByCategory).amount.toFixed(2)}
                            </div>
                            <div className={`text-xs font-medium ${getLargestExpenseCategory(expensesByCategory).category === getLargestExpenseCategory(prevExpensesByCategory).category ? 'text-purple-600' : 'text-blue-600'}`}>
                                {getLargestExpenseCategory(expensesByCategory).category === getLargestExpenseCategory(prevExpensesByCategory).category ? 
                                    'Same as last month' : 
                                    `Was ${getLargestExpenseCategory(prevExpensesByCategory).category} last month`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income Sources */}
                <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Income Sources</h2>
                        <button
                            onClick={() => setIsAddingIncomeSource(!isAddingIncomeSource)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                        >
                            {isAddingIncomeSource ? (
                                <span>Cancel</span>
                            ) : (
                                <span>Add</span>
                            )}
                        </button>
                    </div>

                    {/* Add Income Form */}
                    {isAddingIncomeSource && (
                        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-lg mb-6 shadow-sm">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Source name"
                                    value={newIncomeSource.name}
                                    onChange={(e) =>
                                        setNewIncomeSource({ ...newIncomeSource, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white shadow-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IndianRupee className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={newIncomeSource.amount}
                                        onChange={(e) =>
                                            setNewIncomeSource({
                                                ...newIncomeSource,
                                                amount: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddIncomeSource}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                            >
                                <span>Save</span>
                            </button>
                        </div>
                    )}

                    {/* Income Sources List */}
                    <div className="space-y-3">
                        {incomeSources.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No income added
                            </div>
                        ) : (
                            incomeSources.map((source) => (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm border border-gray-200"
                                >
                                    <span className="font-medium text-gray-900">{source.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-900 font-medium">₹{source.amount.toFixed(2)}</span>
                                        <button
                                            onClick={() => handleDeleteIncome(source.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
                </div>

                {/* Add Expense Form */}
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-lg mb-6 shadow-sm">
                    <div className="flex-1">
                        <select
                            value={newExpense.category}
                            onChange={(e) =>
                                setNewExpense({
                                    ...newExpense,
                                    category: e.target.value as typeof CATEGORIES[number],
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Expense name"
                            value={newExpense.name}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IndianRupee className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpense.amount}
                                onChange={(e) =>
                                    setNewExpense({ ...newExpense, amount: e.target.value })
                                }
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddExpense}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                    >
                        <span>Save</span>
                    </button>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:h-fit">
                    {CATEGORIES.map((category) => (
                        <div key={category} className="bg-gray-100 rounded-lg p-4 shadow-sm border border-gray-200 h-fit">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className={`text-sm font-bold uppercase tracking-wide ${getCategoryColor(category)}`}>
                                    {category}
                                </h3>
                                <span className="text-sm font-semibold text-gray-700">
                                    Total: ₹{expensesByCategory[category].toFixed(2)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {expenses
                                    .filter((expense) => expense.category === category)
                                    .map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between bg-white py-2 px-3 rounded-md shadow-sm border border-gray-200"
                                        >
                                            <span className="font-medium text-gray-900">
                                                {expense.name}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-900 font-medium">
                                                    ₹{expense.amount.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
