import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type MonthlyData = {
    month: Date;
    investment: number;
    debt: number;
    needs: number;
    leisure: number;
    salary: number;
};

type YearlyData = {
    month: Date;
    investment: number;
    debt: number;
    needs: number;
    leisure: number;
    salary: number;
};

export default function Analytics() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
    const [monthlyPeriod, setMonthlyPeriod] = useState(12);
    const [yearlyPeriod, setYearlyPeriod] = useState(5);
    const [chartType, setChartType] = useState<'monthly' | 'yearly'>('monthly');

    const goToPreviousMonth = () => {
        setSelectedMonth(subMonths(selectedMonth, 1));
    };

    const goToNextMonth = () => {
        setSelectedMonth(subMonths(selectedMonth, -1));
    };

    const goToPreviousYear = () => {
        setSelectedYear(selectedYear - 1);
    };

    const goToNextYear = () => {
        setSelectedYear(selectedYear + 1);
    };

    // Fetch data for monthly chart
    useEffect(() => {
        if (!user) return;

        const fetchMonthlyData = async () => {
            setIsLoading(true);
            try {
                const months = Array.from({ length: monthlyPeriod }, (_, i) => 
                    startOfMonth(subMonths(selectedMonth, i))
                ).reverse();

                const monthlyDataPromises = months.map(async (month) => {
                    const monthEnd = endOfMonth(month);
                    const [expenses, incomes] = await Promise.all([
                        db.expenses.getAll(user.id, month, monthEnd),
                        db.income.getAll(user.id, month, monthEnd)
                    ]);

                    const salary = incomes.reduce((sum, inc) => sum + inc.amount, 0);
                    const expensesByCategory = {
                        investment: expenses.filter(e => e.category === 'investment').reduce((sum, exp) => sum + exp.amount, 0),
                        debt: expenses.filter(e => e.category === 'debt').reduce((sum, exp) => sum + exp.amount, 0),
                        needs: expenses.filter(e => e.category === 'needs').reduce((sum, exp) => sum + exp.amount, 0),
                        leisure: expenses.filter(e => e.category === 'leisure').reduce((sum, exp) => sum + exp.amount, 0),
                        salary
                    };

                    return {
                        month,
                        ...expensesByCategory
                    };
                });

                const data = await Promise.all(monthlyDataPromises);
                setMonthlyData(data);
            } catch (error) {
                console.error('Error fetching monthly data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMonthlyData();
    }, [user, selectedMonth, monthlyPeriod]);

    // Fetch data for yearly chart
    useEffect(() => {
        if (!user) return;

        const fetchYearlyData = async () => {
            setIsLoading(true);
            try {
                const years = Array.from({ length: yearlyPeriod }, (_, i) => selectedYear - i).reverse();
                const yearlyDataPromises = years.map(async (year) => {
                    const yearStart = startOfMonth(new Date(year, 0));
                    const yearEnd = endOfMonth(new Date(year, 11));
                    
                    const [expenses, incomes] = await Promise.all([
                        db.expenses.getAll(user.id, yearStart, yearEnd),
                        db.income.getAll(user.id, yearStart, yearEnd)
                    ]);

                    const salary = incomes.reduce((sum, inc) => sum + inc.amount, 0);
                    const expensesByCategory = {
                        investment: expenses.filter(e => e.category === 'investment').reduce((sum, exp) => sum + exp.amount, 0),
                        debt: expenses.filter(e => e.category === 'debt').reduce((sum, exp) => sum + exp.amount, 0),
                        needs: expenses.filter(e => e.category === 'needs').reduce((sum, exp) => sum + exp.amount, 0),
                        leisure: expenses.filter(e => e.category === 'leisure').reduce((sum, exp) => sum + exp.amount, 0),
                        salary
                    };

                    return {
                        month: yearStart,
                        ...expensesByCategory
                    };
                });

                const data = await Promise.all(yearlyDataPromises);
                setYearlyData(data);
            } catch (error) {
                console.error('Error fetching yearly data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchYearlyData();
    }, [user, selectedYear, yearlyPeriod]);

    const monthlyChartData: ChartData<'line'> = {
        labels: monthlyData.map(d => format(d.month, 'MMM yyyy')),
        datasets: [
            {
                label: 'Investment',
                data: monthlyData.map(d => d.investment),
                borderColor: 'rgb(59, 130, 246)', // blue
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: 'Debt',
                data: monthlyData.map(d => d.debt),
                borderColor: 'rgb(239, 68, 68)', // red
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
            },
            {
                label: 'Needs',
                data: monthlyData.map(d => d.needs),
                borderColor: 'rgb(34, 197, 94)', // green
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
            },
            {
                label: 'Leisure',
                data: monthlyData.map(d => d.leisure),
                borderColor: 'rgb(168, 85, 247)', // purple
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
            },
            {
                label: 'Salary',
                data: monthlyData.map(d => d.salary),
                borderColor: 'rgb(234, 179, 8)', // yellow
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
            },
        ]
    };

    const yearlyChartData: ChartData<'line'> = {
        labels: yearlyData.map(d => format(d.month, 'yyyy')),
        datasets: [
            {
                label: 'Investment',
                data: yearlyData.map(d => d.investment),
                borderColor: 'rgb(59, 130, 246)', // blue
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: 'Debt',
                data: yearlyData.map(d => d.debt),
                borderColor: 'rgb(239, 68, 68)', // red
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
            },
            {
                label: 'Needs',
                data: yearlyData.map(d => d.needs),
                borderColor: 'rgb(34, 197, 94)', // green
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
            },
            {
                label: 'Leisure',
                data: yearlyData.map(d => d.leisure),
                borderColor: 'rgb(168, 85, 247)', // purple
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
            },
            {
                label: 'Salary',
                data: yearlyData.map(d => d.salary),
                borderColor: 'rgb(234, 179, 8)', // yellow
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
            },
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                display: window.innerWidth > 640, // Hide legend on mobile
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => {
                        return `₹${value.toLocaleString('en-IN')}`;
                    },
                    maxTicksLimit: window.innerWidth < 640 ? 5 : 8, // Fewer ticks on mobile
                },
            },
            x: {
                ticks: {
                    maxRotation: window.innerWidth < 640 ? 45 : 0, // Rotate labels on mobile
                    minRotation: window.innerWidth < 640 ? 45 : 0,
                },
            },
        },
    };

    const yearlyChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: (context) => `Year ${context[0].label}`,
                    label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `₹${value.toLocaleString()}`
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {isLoading && (
                <>
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-blue-600 animate-loading-bar"></div>
                            </div>
                            <p className="text-base text-gray-600">Loading analytics</p>
                        </div>
                    </div>
                </>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">Analytics</h1>
                    <p className="text-sm text-gray-600 text-center sm:text-left">
                        Track your spending patterns
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as 'monthly' | 'yearly')}
                        className="w-full sm:w-auto px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <select
                        value={chartType === 'monthly' ? monthlyPeriod : yearlyPeriod}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (chartType === 'monthly') {
                                setMonthlyPeriod(value);
                            } else {
                                setYearlyPeriod(value);
                            }
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {chartType === 'monthly' ? (
                            <>
                                <option value={3}>Last 3 months</option>
                                <option value={6}>Last 6 months</option>
                                <option value={12}>Last 12 months</option>
                            </>
                        ) : (
                            <>
                                <option value={3}>Last 3 years</option>
                                <option value={5}>Last 5 years</option>
                                <option value={10}>Last 10 years</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4 sm:p-6">
                <div className="h-[300px] sm:h-[400px] md:h-[500px]">
                    <Line
                        data={chartType === 'monthly' ? monthlyChartData : yearlyChartData}
                        options={chartOptions}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center space-y-2 mt-6 sm:mt-8">
                <p className="text-sm sm:text-base text-gray-600 text-center px-4">Made with ❤️ by Siby C.R.</p>
                <div className="flex space-x-4 justify-center">
                    <a href="https://github.com/sibycr18" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                    </a>
                    <a href="https://x.com/siby_cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/sibycr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/siby.cr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
