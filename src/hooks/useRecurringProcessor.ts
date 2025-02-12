import { useEffect, useRef } from 'react';
import { processMonthlyRecurringTransactions } from '../lib/recurring';

export function useRecurringProcessor(user: any | null) {
    const lastProcessedDate = useRef<string | null>(null);

    useEffect(() => {
        if (!user) return; // Only process if user is logged in

        const checkAndProcessRecurring = async () => {
            const today = new Date();
            const currentMonth = `${today.getFullYear()}-${today.getMonth()}`;
            
            // Only process once per month
            if (lastProcessedDate.current !== currentMonth) {
                try {
                    await processMonthlyRecurringTransactions();
                    lastProcessedDate.current = currentMonth;
                    // Store the last processed date in localStorage for persistence
                    localStorage.setItem('lastProcessedRecurring', currentMonth);
                } catch (error) {
                    console.error('Error processing recurring transactions:', error);
                }
            }
        };

        // Check if we've already processed this month (persisted across refreshes)
        const storedDate = localStorage.getItem('lastProcessedRecurring');
        if (storedDate) {
            lastProcessedDate.current = storedDate;
        }

        // Process recurring transactions when component mounts
        checkAndProcessRecurring();
    }, [user]); // Add user as a dependency
}
