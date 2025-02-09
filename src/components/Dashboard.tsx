import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Category, Income, Expense, MonthData } from '../types';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(startOfMonth(new Date()));
    const [monthData, setMonthData] = useState<MonthData>({
        month: selectedDate,
        incomes: [{ source: 'Salary', amount: 0 }],
        expenses: []
    });

    const addIncome = () => {
        setMonthData(prev => ({
            ...prev,
            incomes: [...prev.incomes, { source: '', amount: 0 }]
        }));
    };

    const updateIncome = (index: number, field: keyof Income, value: string | number) => {
        setMonthData(prev => ({
            ...prev,
            incomes: prev.incomes.map((income, i) => 
                i === index ? { ...income, [field]: value } : income
            )
        }));
    };

    const addExpense = (category: Category) => {
        const newExpense: Expense = {
            id: crypto.randomUUID(),
            name: '',
            amount: 0,
            category,
            date: selectedDate
        };
        setMonthData(prev => ({
            ...prev,
            expenses: [...prev.expenses, newExpense]
        }));
    };

    const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
        setMonthData(prev => ({
            ...prev,
            expenses: prev.expenses.map(expense => 
                expense.id === id ? { ...expense, [field]: value } : expense
            )
        }));
    };

    const deleteExpense = (id: string) => {
        setMonthData(prev => ({
            ...prev,
            expenses: prev.expenses.filter(expense => expense.id !== id)
        }));
    };

    const totalIncome = monthData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = monthData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = totalIncome - totalExpenses;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-8">
                <input
                    type="month"
                    value={format(selectedDate, 'yyyy-MM')}
                    onChange={(e) => setSelectedDate(startOfMonth(new Date(e.target.value)))}
                    className="border rounded p-2"
                />
            </div>

            {/* Income Section */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Income Sources</h2>
                {monthData.incomes.map((income, index) => (
                    <div key={index} className="flex gap-4 mb-2">
                        <input
                            type="text"
                            value={income.source}
                            onChange={(e) => updateIncome(index, 'source', e.target.value)}
                            placeholder="Source"
                            className="border rounded p-2 flex-1"
                        />
                        <input
                            type="number"
                            value={income.amount}
                            onChange={(e) => updateIncome(index, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="Amount"
                            className="border rounded p-2 w-32"
                        />
                    </div>
                ))}
                <button
                    onClick={addIncome}
                    className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <Plus size={16} /> Add Income Source
                </button>
            </div>

            {/* Categories Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map(category => (
                    <div key={category} className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 capitalize">{category}</h2>
                        {monthData.expenses
                            .filter(expense => expense.category === category)
                            .map(expense => (
                                <div key={expense.id} className="flex gap-4 mb-2">
                                    <input
                                        type="text"
                                        value={expense.name}
                                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                        placeholder="Expense name"
                                        className="border rounded p-2 flex-1"
                                    />
                                    <input
                                        type="number"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="Amount"
                                        className="border rounded p-2 w-32"
                                    />
                                    <button
                                        onClick={() => deleteExpense(expense.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        <button
                            onClick={() => addExpense(category)}
                            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                            <Plus size={16} /> Add Expense
                        </button>
                        <div className="mt-4 text-right">
                            <p className="text-gray-600">
                                Total: ₹{monthData.expenses
                                    .filter(expense => expense.category === category)
                                    .reduce((sum, expense) => sum + expense.amount, 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Section */}
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-gray-600">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Remaining</p>
                        <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{remaining.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
