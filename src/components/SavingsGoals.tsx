import { useState, useEffect } from 'react';
import { format, differenceInMonths, addMonths } from 'date-fns';
import { Target, Plus, Trash2, TrendingUp, AlertCircle, X, PlusCircle, Info, Wallet, Play, Pause, Loader2 } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { SavingsGoal, SavingsRecommendation, Category } from '../types';
import { createPortal } from 'react-dom';
import ContributionModal from './ContributionModal';
import { supabase } from '../lib/supabase';

const CATEGORIES: Category[] = ['investment', 'debt', 'needs', 'leisure'];

// Utility function for Indian number formatting (consistent with Dashboard)
const formatIndianNumber = (num: number): string => {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `₹${parts.join('.')}`;
};

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: SavingsGoal;
    onConfirm: (deleteRecurring: boolean, deleteExpenses: boolean) => Promise<void>;
}

function DeleteConfirmationModal({ isOpen, onClose, goal, onConfirm }: DeleteConfirmationModalProps) {
    const [deleteRecurring, setDeleteRecurring] = useState(true);
    const [deleteExpenses, setDeleteExpenses] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(deleteRecurring, deleteExpenses);
            onClose();
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('Failed to delete goal');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delete Goal
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                            disabled={isDeleting}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Are you sure you want to delete the goal "{goal.name}"? This action cannot be undone.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    id="deleteRecurring"
                                    type="checkbox"
                                    checked={deleteRecurring}
                                    onChange={(e) => setDeleteRecurring(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                                <label htmlFor="deleteRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Delete the active recurring transaction for this goal
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="deleteExpenses"
                                    type="checkbox"
                                    checked={deleteExpenses}
                                    onChange={(e) => setDeleteExpenses(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                                <label htmlFor="deleteExpenses" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Delete all expenses associated with this goal
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="rounded-lg bg-red-600 dark:bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Goal'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

interface GoalRecurringState {
    [goalId: string]: {
        hasRecurring: boolean;
        isActive: boolean;
        recurringId?: string;
        isLoading: boolean;
    };
}

export default function SavingsGoals() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [recommendations, setRecommendations] = useState<SavingsRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [isContributing, setIsContributing] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: '',
        target_amount: '',
        monthly_contribution: '1000',
        category: 'investment' as Category,
        is_recurring: false
    });
    const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
    const [recurringStates, setRecurringStates] = useState<GoalRecurringState>({});

    useEffect(() => {
        if (!user) return;
        fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // First get all goals
            const { data: goalsData, error: goalsError } = await supabase
                .from('savings_goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (goalsError) throw goalsError;

            // Then get all expenses for these goals
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('goal_id, amount')
                .in('goal_id', goalsData.map(g => g.id));

            if (expensesError) throw expensesError;

            // Calculate current amount for each goal from expenses
            const goalsWithProgress = goalsData.map(goal => ({
                ...goal,
                current_amount: expensesData
                    .filter(e => e.goal_id === goal.id)
                    .reduce((sum, expense) => sum + expense.amount, 0)
            }));

            setGoals(goalsWithProgress);
            setRecommendations([]); // Set empty recommendations for now
        } catch (error) {
            console.error('Error fetching savings goals:', error);
            toast.error('Failed to load savings goals');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate estimated completion date based on monthly contribution
    const calculateEstimatedDate = (targetAmount: number, monthlyContribution: number, currentAmount: number = 0) => {
        if (monthlyContribution <= 0) return null;
        const remainingAmount = targetAmount - currentAmount;
        const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);
        return addMonths(new Date(), monthsNeeded);
    };

    // Calculate time duration in months and years
    const calculateTimeRemaining = (targetAmount: number, monthlyContribution: number, currentAmount: number = 0) => {
        if (monthlyContribution <= 0) return null;
        const remainingAmount = targetAmount - currentAmount;
        const monthsNeeded = Math.ceil(remainingAmount / monthlyContribution);
        const years = Math.floor(monthsNeeded / 12);
        const months = monthsNeeded % 12;
        
        let timeString = '';
        if (years > 0) {
            timeString += `${years} year${years > 1 ? 's' : ''}`;
            if (months > 0) timeString += ` and ${months} month${months > 1 ? 's' : ''}`;
        } else {
            timeString += `${months} month${months > 1 ? 's' : ''}`;
        }
        return timeString;
    };

    const handleAddGoal = async () => {
        if (!user) return;
        try {
            // Destructure is_recurring out of newGoal and keep the rest
            const { is_recurring, ...goalFields } = newGoal;
            
            const monthlyContribution = parseFloat(newGoal.monthly_contribution) || 0;
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const formattedDate = firstDayOfMonth.toISOString();
            
            const goalData = {
                ...goalFields,
                target_amount: parseFloat(newGoal.target_amount) || 0,
                monthly_contribution: monthlyContribution,
                user_id: user.id,
                status: 'active',
                created_at: formattedDate
            };

            const { data: goal, error } = await supabase
                .from('savings_goals')
                .insert([goalData])
                .select()
                .single();

            if (error) throw error;

            if (is_recurring && monthlyContribution > 0) {
                // Create a recurring transaction for the monthly contribution
                const { data: recurringTx, error: recurringError } = await supabase
                    .from('recurring_transactions')
                    .insert([{
                        user_id: user.id,
                        name: `Monthly contribution to ${newGoal.name}`,
                        amount: monthlyContribution,
                        type: 'expense',
                        category: newGoal.category,
                        active: true,
                        goal_id: goal.id,
                        frequency: 'monthly',
                        created_at: formattedDate
                    }])
                    .select()
                    .single();

                if (recurringError) throw recurringError;

                // Create the first expense
                await db.expenses.add({
                    user_id: user.id,
                    name: `Contribution to ${newGoal.name}`,
                    amount: monthlyContribution,
                    category: newGoal.category,
                    date: formattedDate,
                    goal_id: goal.id,
                    is_recurring: true,
                    recurring_id: recurringTx.id
                });

                toast.success('Goal created with recurring contribution');
            } else {
                toast.success('Goal created successfully');
            }

            setIsAddingGoal(false);
            setNewGoal({
                name: '',
                target_amount: '',
                monthly_contribution: '1000',
                category: 'investment',
                is_recurring: false
            });
            await fetchGoals();
        } catch (error) {
            console.error('Error adding savings goal:', error);
            toast.error('Failed to add savings goal');
        }
    };

    const handleDeleteGoal = async (deleteRecurring: boolean, deleteExpenses: boolean) => {
        if (!goalToDelete) return;

        try {
            // First get all recurring transactions for this goal
            const { data: recurringTransactions } = await supabase
                .from('recurring_transactions')
                .select('id')
                .eq('goal_id', goalToDelete.id)
                .eq('active', true);

            if (recurringTransactions && recurringTransactions.length > 0) {
                // First update expenses to remove recurring_id references
                const { error: expensesUpdateError } = await supabase
                    .from('expenses')
                    .update({ recurring_id: null, is_recurring: false })
                    .in('recurring_id', recurringTransactions.map(rt => rt.id));

                if (expensesUpdateError) throw expensesUpdateError;

                // Then handle recurring transactions
                if (deleteRecurring) {
                    // Delete the recurring transactions
                    const { error: recurringDeleteError } = await supabase
                        .from('recurring_transactions')
                        .delete()
                        .eq('goal_id', goalToDelete.id);

                    if (recurringDeleteError) throw recurringDeleteError;
                } else {
                    // Nullify goal_id reference in recurring transactions
                    const { error: recurringError } = await supabase
                        .from('recurring_transactions')
                        .update({ goal_id: null })
                        .eq('goal_id', goalToDelete.id);

                    if (recurringError) throw recurringError;
                }
            }

            // Handle expenses
            const { data: expenses } = await supabase
                .from('expenses')
                .select('id')
                .eq('goal_id', goalToDelete.id);

            if (expenses && expenses.length > 0) {
                if (deleteExpenses) {
                    // Delete the expenses
                    const { error: expensesDeleteError } = await supabase
                        .from('expenses')
                        .delete()
                        .eq('goal_id', goalToDelete.id);

                    if (expensesDeleteError) throw expensesDeleteError;
                } else {
                    // Nullify goal_id reference in expenses
                    const { error: expensesError } = await supabase
                        .from('expenses')
                        .update({ goal_id: null })
                        .eq('goal_id', goalToDelete.id);

                    if (expensesError) throw expensesError;
                }
            }

            // Finally, delete the goal itself
            const { error: goalDeleteError } = await supabase
                .from('savings_goals')
                .delete()
                .eq('id', goalToDelete.id);

            if (goalDeleteError) throw goalDeleteError;

            await fetchGoals();
            toast.success('Goal deleted successfully');
        } catch (error) {
            console.error('Error deleting goal:', error);
            throw error; // Re-throw to be handled by the modal
        }
    };

    const handleContribute = (goal: SavingsGoal) => {
        setSelectedGoal(goal);
        setIsContributing(true);
    };

    const calculateProgress = (goal: SavingsGoal) => {
        return (goal.current_amount / goal.target_amount) * 100;
    };

    const handleDeleteClick = (goal: SavingsGoal) => {
        setGoalToDelete(goal);
    };

    const modal = isAddingGoal && (
        <>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden my-auto">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Goal</h2>
                        <button
                            onClick={() => setIsAddingGoal(false)}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }} className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                                <input
                                    type="text"
                                    value={newGoal.name}
                                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                    className="block w-full rounded-lg border-0 px-3 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                    placeholder="e.g., House Down Payment"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={newGoal.target_amount}
                                        onChange={(e) => {
                                            const targetAmount = e.target.value;
                                            const numericValue = parseFloat(targetAmount) || 0;
                                            // Set monthly contribution to either 1000 or 10% of target amount, whichever is smaller
                                            const suggestedMonthly = Math.min(1000, numericValue * 0.1).toString();
                                            setNewGoal({ 
                                                ...newGoal, 
                                                target_amount: targetAmount,
                                                monthly_contribution: numericValue > 0 ? suggestedMonthly : '1000'
                                            });
                                        }}
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

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Contribution</label>
                                <div className="space-y-4">
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={newGoal.monthly_contribution}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numericValue = parseFloat(value) || 0;
                                                const targetValue = parseFloat(newGoal.target_amount) || 0;
                                                if (targetValue > 0) {
                                                    setNewGoal({ 
                                                        ...newGoal, 
                                                        monthly_contribution: Math.min(numericValue, targetValue).toString()
                                                    });
                                                } else {
                                                    setNewGoal({ ...newGoal, monthly_contribution: value });
                                                }
                                            }}
                                            className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            max={parseFloat(newGoal.target_amount) || undefined}
                                            step="100"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">INR</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max={parseFloat(newGoal.target_amount) || 10000}
                                            step="100"
                                            value={parseFloat(newGoal.monthly_contribution) || 0}
                                            onChange={(e) => setNewGoal({ 
                                                ...newGoal, 
                                                monthly_contribution: e.target.value 
                                            })}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                            disabled={!parseFloat(newGoal.target_amount)}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>₹0</span>
                                            <span>₹{formatIndianNumber(parseFloat(newGoal.target_amount) || 10000).replace('₹', '')}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        {parseFloat(newGoal.target_amount) > 0 ? (
                                            parseFloat(newGoal.monthly_contribution) > 0 ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Info size={16} className="text-blue-600 dark:text-blue-400" />
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Goal Completion
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        At {formatIndianNumber(parseFloat(newGoal.monthly_contribution))} per month, you'll reach your goal by{' '}
                                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                                            {format(calculateEstimatedDate(
                                                                parseFloat(newGoal.target_amount), 
                                                                parseFloat(newGoal.monthly_contribution)
                                                            )!, 'MMMM yyyy')}
                                                        </span>
                                                        {' '}
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            ({calculateTimeRemaining(
                                                                parseFloat(newGoal.target_amount), 
                                                                parseFloat(newGoal.monthly_contribution)
                                                            )})
                                                        </span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Set a monthly contribution to see when you'll reach your goal
                                                </p>
                                            )
                                        ) : (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Set a target amount first to adjust your monthly contribution
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="recurring"
                                    type="checkbox"
                                    checked={newGoal.is_recurring}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, is_recurring: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Contribute {formatIndianNumber(parseFloat(newGoal.monthly_contribution) || 1000)} every month?
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setNewGoal(prev => ({ ...prev, category }))}
                                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow ring-1 ring-inset ${
                                                newGoal.category === category
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

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAddingGoal(false)}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                            >
                                Add Goal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

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
                            <p className="text-base text-gray-600 dark:text-gray-400">Loading goals</p>
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Savings Goals</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                        Track and achieve your financial goals
                    </p>
                </div>
                <button
                    onClick={() => setIsAddingGoal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                    <Plus size={20} />
                    <span>Add Goal</span>
                </button>
            </div>

            {modal && createPortal(modal, document.body)}

            {selectedGoal && (
                <ContributionModal
                    isOpen={isContributing}
                    onClose={() => {
                        setIsContributing(false);
                        setSelectedGoal(null);
                        fetchGoals(); // Refresh goals after contribution
                    }}
                    goal={selectedGoal}
                />
            )}

            {goalToDelete && (
                <DeleteConfirmationModal
                    isOpen={true}
                    onClose={() => setGoalToDelete(null)}
                    goal={goalToDelete}
                    onConfirm={handleDeleteGoal}
                />
            )}

            {!isLoading && goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                        <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No savings goals yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                        Start your financial journey by creating a savings goal. Track your progress and stay motivated to reach your financial targets.
                    </p>
                    <button
                        onClick={() => setIsAddingGoal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                        <Plus size={20} />
                        <span>Create Your First Goal</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => (
                        <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {calculateEstimatedDate(goal.target_amount, goal.monthly_contribution, goal.current_amount)
                                            ? `Estimated to complete by ${format(calculateEstimatedDate(goal.target_amount, goal.monthly_contribution, goal.current_amount)!, 'MMMM yyyy')}`
                                            : 'Set monthly contribution'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleContribute(goal)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                                        title="Add contribution"
                                    >
                                        <PlusCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(goal)}
                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                        title="Delete goal"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                        <span className="text-gray-900 dark:text-white">{formatIndianNumber(goal.current_amount)} / {formatIndianNumber(goal.target_amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(calculateProgress(goal), 100)}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <Target size={16} className="text-blue-600 dark:text-blue-400" />
                                    <span className="text-gray-700 dark:text-gray-300">Monthly: {formatIndianNumber(goal.monthly_contribution)}</span>
                                    <div className="relative">
                                        <button
                                            onClick={() => handleRecurringToggle(goal.id)}
                                            disabled={!recurringStates[goal.id]?.hasRecurring || recurringStates[goal.id]?.isLoading}
                                            className={`p-1 rounded-full transition-colors ${
                                                recurringStates[goal.id]?.hasRecurring
                                                    ? recurringStates[goal.id]?.isActive
                                                        ? 'text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400'
                                                        : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                            title={
                                                recurringStates[goal.id]?.hasRecurring
                                                    ? recurringStates[goal.id]?.isActive
                                                        ? 'Pause recurring contribution'
                                                        : 'Resume recurring contribution'
                                                    : 'Recurring contribution not set up'
                                            }
                                        >
                                            {recurringStates[goal.id]?.isLoading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : recurringStates[goal.id]?.isActive ? (
                                                <Pause size={16} />
                                            ) : (
                                                <Play size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 