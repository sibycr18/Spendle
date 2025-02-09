import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import DatePicker from "react-datepicker";
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
                    callback: (value) => `₹${value}`
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
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
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setChartType('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                            chartType === 'monthly'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setChartType('yearly')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                            chartType === 'yearly'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Monthly Chart Section */}
            {chartType === 'monthly' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">Monthly Performance</h2>
                            <select
                                value={monthlyPeriod}
                                onChange={(e) => setMonthlyPeriod(Number(e.target.value))}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-sm shadow-sm"
                            >
                                <option value={3}>Last 3 Months</option>
                                <option value={6}>Last 6 Months</option>
                                <option value={12}>Last 12 Months</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <DatePicker
                                selected={selectedMonth}
                                onChange={(date: Date) => setSelectedMonth(startOfMonth(date))}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                customInput={
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm shadow-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{format(selectedMonth, 'MMM yyyy')}</span>
                                    </button>
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
                    <div className="h-[400px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <Line data={monthlyChartData} options={chartOptions} />
                        )}
                    </div>
                </div>
            )}

            {/* Yearly Chart Section */}
            {chartType === 'yearly' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">Yearly Performance</h2>
                            <select
                                value={yearlyPeriod}
                                onChange={(e) => setYearlyPeriod(Number(e.target.value))}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-sm shadow-sm"
                            >
                                <option value={3}>Last 3 Years</option>
                                <option value={5}>Last 5 Years</option>
                                <option value={10}>Last 10 Years</option>
                                <option value={new Date().getFullYear() - 2020}>Maximum</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousYear}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-sm shadow-sm">
                                {selectedYear}
                            </span>
                            <button
                                onClick={goToNextYear}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <Line data={yearlyChartData} options={yearlyChartOptions} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
