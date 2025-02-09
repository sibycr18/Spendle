import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Category, Income, Expense, MonthData } from '../types';
import { Plus, Trash2, DollarSign, X, Calendar } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

interface IncomeSource {
    id: number;
    name: string;
    amount: number;
}

interface Expense {
    id: number;
    category: 'investment' | 'debt' | 'needs' | 'leisure';
    name: string;
    amount: number;
}

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

export default function Dashboard() {
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [newIncomeSource, setNewIncomeSource] = useState({ name: '', amount: '' });
    const [newExpense, setNewExpense] = useState({
        category: 'needs' as const,
        name: '',
        amount: ''
    });
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isAddingIncomeSource, setIsAddingIncomeSource] = useState(false);

    const handleAddIncomeSource = () => {
        if (newIncomeSource.name && newIncomeSource.amount) {
            setIncomeSources([
                ...incomeSources,
                {
                    id: Date.now(),
                    name: newIncomeSource.name,
                    amount: parseFloat(newIncomeSource.amount),
                },
            ]);
            setNewIncomeSource({ name: '', amount: '' });
            setIsAddingIncomeSource(false);
        }
    };

    const handleAddExpense = () => {
        if (newExpense.name && newExpense.amount && newExpense.category) {
            setExpenses([
                ...expenses,
                {
                    id: Date.now(),
                    category: newExpense.category,
                    name: newExpense.name,
                    amount: parseFloat(newExpense.amount),
                },
            ]);
            setNewExpense({ category: 'needs', name: '', amount: '' });
            setIsAddingExpense(false);
        }
    };

    const handleRemoveIncomeSource = (id: number) => {
        setIncomeSources(incomeSources.filter((source) => source.id !== id));
    };

    const handleRemoveExpense = (id: number) => {
        setExpenses(expenses.filter((expense) => expense.id !== id));
    };

    const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);

    const expensesByCategory = CATEGORIES.reduce((acc, category) => {
        acc[category] = expenses
            .filter((e) => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
        return acc;
    }, {} as Record<typeof CATEGORIES[number], number>);

    const totalExpenses = Object.values(expensesByCategory).reduce(
        (sum, amount) => sum + amount,
        0
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 sm:gap-0">
                <div className="text-center sm:text-left w-full sm:w-auto">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-700 mt-1">
                        {format(selectedMonth, 'MMMM yyyy')}
                    </p>
                </div>
                <div className="relative w-full sm:w-auto flex justify-center sm:justify-end">
                    <DatePicker
                        key={selectedMonth.getTime()}
                        selected={selectedMonth}
                        onChange={(date: Date) => setSelectedMonth(startOfMonth(date))}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        showFullMonthYearPicker
                        showTwoColumnMonthYearPicker
                        customInput={
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 text-sm">
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
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-100 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-blue-700 font-medium">Total Income</div>
                        <div className="text-2xl font-bold text-blue-800">
                            ₹{totalIncome.toFixed(2)}
                        </div>
                    </div>
                    <div className="bg-red-100 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-red-700 font-medium">Total Expenses</div>
                        <div className="text-2xl font-bold text-red-800">
                            ₹{totalExpenses.toFixed(2)}
                        </div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-green-700 font-medium">
                            Remaining Balance
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                            ₹{(totalIncome - totalExpenses).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Income Sources */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Income Sources</h2>
                        <button
                            onClick={() => setIsAddingIncomeSource(!isAddingIncomeSource)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                        >
                            {isAddingIncomeSource ? (
                                <>
                                    <X className="h-5 w-5" />
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    <span>Add</span>
                                </>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-500" />
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
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddIncomeSource}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Save</span>
                            </button>
                        </div>
                    )}

                    {/* Income Sources List */}
                    <div className="space-y-3">
                        {incomeSources.map((source) => (
                            <div
                                key={source.id}
                                className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-sm border border-gray-200"
                            >
                                <span className="font-medium text-gray-900">{source.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-900 font-medium">₹{source.amount.toFixed(2)}</span>
                                    <button
                                        onClick={() => handleRemoveIncomeSource(source.id)}
                                        className="text-red-600 hover:text-red-800 focus:outline-none"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
                    <button
                        onClick={() => setIsAddingExpense(!isAddingExpense)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                    >
                        {isAddingExpense ? (
                            <>
                                <X className="h-5 w-5" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                <span>Add</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Add Expense Form */}
                {isAddingExpense && (
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={newExpense.amount}
                                    onChange={(e) =>
                                        setNewExpense({ ...newExpense, amount: e.target.value })
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddExpense}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Save</span>
                        </button>
                    </div>
                )}

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*]:h-fit">
                    {CATEGORIES.map((category) => (
                        <div key={category} className="bg-gray-100 rounded-lg p-4 shadow-sm border border-gray-200 h-fit">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
                                <span className="text-sm font-medium text-gray-700">
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
                                                    onClick={() => handleRemoveExpense(expense.id)}
                                                    className="text-red-600 hover:text-red-800 focus:outline-none"
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
