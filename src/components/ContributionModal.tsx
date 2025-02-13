import React, { useState, useEffect } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SavingsGoal } from '../types';
import { db, supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { format, addMonths } from 'date-fns';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    goal: SavingsGoal;
}

export default function ContributionModal({ isOpen, onClose, goal }: Props) {
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [hasExistingRecurring, setHasExistingRecurring] = useState(false);
    const [isCheckingRecurring, setIsCheckingRecurring] = useState(true);

    // Set default amount when modal opens
    useEffect(() => {
        if (isOpen) {
            const remainingAmount = goal.target_amount - goal.current_amount;
            const suggestedAmount = Math.min(1000, remainingAmount * 0.1);
            setAmount(suggestedAmount.toString());
        } else {
            setAmount('');
            setIsRecurring(false);
        }
    }, [isOpen, goal]);

    useEffect(() => {
        const checkExistingRecurring = async () => {
            setIsCheckingRecurring(true);
            try {
                const { data: recurringTransactions } = await supabase
                    .from('recurring_transactions')
                    .select('id')
                    .eq('goal_id', goal.id)
                    .eq('active', true);

                setHasExistingRecurring(!!recurringTransactions && recurringTransactions.length > 0);
            } catch (error) {
                console.error('Error checking recurring transactions:', error);
            } finally {
                setIsCheckingRecurring(false);
            }
        };

        if (isOpen && goal) {
            checkExistingRecurring();
        }
    }, [isOpen, goal]);

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

    const formatIndianNumber = (num: number): string => {
        const parts = num.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `₹${parts.join('.')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const parsedAmount = parseFloat(amount);
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const formattedDate = firstDayOfMonth.toISOString().slice(0, 10); // YYYY-MM-DD format

            let recurringTxId: string | undefined;

            if (isRecurring && !hasExistingRecurring) {
                // Create a recurring transaction
                const recurringTx = await db.recurringTransactions.create({
                    user_id: goal.user_id,
                    name: `Monthly contribution to ${goal.name}`,
                    amount: parsedAmount,
                    type: 'expense',
                    category: goal.category,
                    active: true,
                    goal_id: goal.id,
                    frequency: 'monthly'
                });

                recurringTxId = recurringTx.id;

                // Also create the first expense
                await db.expenses.add({
                    user_id: goal.user_id,
                    name: `Contribution to ${goal.name}`,
                    amount: parsedAmount,
                    category: goal.category,
                    date: formattedDate,
                    goal_id: goal.id,
                    is_recurring: true,
                    recurring_id: recurringTx.id
                });

                toast.success('Monthly recurring contribution set up successfully');
            } else {
                // Create a one-time expense
                await db.expenses.add({
                    user_id: goal.user_id,
                    name: `Contribution to ${goal.name}`,
                    amount: parsedAmount,
                    category: goal.category,
                    date: formattedDate,
                    goal_id: goal.id,
                    is_recurring: false
                });

                toast.success('Contribution added successfully');
            }

            // Check if goal is reached
            const totalContributed = await db.savingsGoals.getExpensesTotal(goal.id);

            if (totalContributed >= goal.target_amount) {
                // Update goal status to completed
                await db.savingsGoals.update(goal.id, { status: 'completed' });

                // If this was a recurring contribution, deactivate it
                if (recurringTxId) {
                    await db.recurringTransactions.deactivate(recurringTxId);
                    toast.success('Goal reached! Recurring contribution has been paused.');
                } else {
                    toast.success('Goal reached!');
                }
            }

            onClose();
            setAmount('');
            setIsRecurring(false);
        } catch (error) {
            console.error('Error adding contribution:', error);
            toast.error('Failed to add contribution');
        }
    };

    if (!isOpen) return null;

    const modal = (
        <>
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Add Contribution to {goal.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <div className="space-y-4">
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            max={goal.target_amount - goal.current_amount}
                                            step="0.01"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">INR</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max={goal.target_amount - goal.current_amount}
                                            step="100"
                                            value={parseFloat(amount) || 0}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>₹0</span>
                                            <span>₹{formatIndianNumber(goal.target_amount - goal.current_amount).replace('₹', '')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isCheckingRecurring ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Checking recurring status...</span>
                                </div>
                            ) : !hasExistingRecurring && (
                                <div className="flex items-center">
                                    <input
                                        id="recurring"
                                        type="checkbox"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                    <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        Make this a monthly recurring contribution
                                    </label>
                                </div>
                            )}

                            {isRecurring && !hasExistingRecurring && parseFloat(amount) > 0 && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Info size={16} className="text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Goal Completion
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            At {formatIndianNumber(parseFloat(amount))} per month, you'll reach your goal by{' '}
                                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                                {format(calculateEstimatedDate(
                                                    goal.target_amount,
                                                    parseFloat(amount),
                                                    goal.current_amount
                                                )!, 'MMMM yyyy')}
                                            </span>
                                            {' '}
                                            <span className="text-gray-500 dark:text-gray-400">
                                                ({calculateTimeRemaining(
                                                    goal.target_amount,
                                                    parseFloat(amount),
                                                    goal.current_amount
                                                )})
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCheckingRecurring}
                                className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Contribution
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

    return createPortal(modal, document.body);
}