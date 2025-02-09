import React from 'react';
import { Wallet, IndianRupee, LineChart, PieChart } from 'lucide-react';

export default function FloatingElements() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
            
            {/* Floating elements */}
            <div className="absolute top-1/4 left-1/4 animate-float-slow opacity-10">
                <Wallet className="h-16 w-16 text-blue-600" />
            </div>
            <div className="absolute top-2/3 right-1/4 animate-float-delayed opacity-10">
                <IndianRupee className="h-12 w-12 text-green-600" />
            </div>
            <div className="absolute top-1/6 right-1/4 animate-float opacity-10">
                <LineChart className="h-14 w-14 text-purple-600" />
            </div>
            <div className="absolute bottom-1/4 right-1/6 animate-float-slow opacity-10">
                <PieChart className="h-10 w-10 text-blue-600" />
            </div>
            
            {/* Additional subtle elements */}
            <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-blue-200 opacity-20 animate-float-delayed blur-xl"></div>
            <div className="absolute bottom-1/3 right-1/3 h-32 w-32 rounded-full bg-purple-200 opacity-20 animate-float blur-xl"></div>
            <div className="absolute top-1/6 left-2/3 h-16 w-16 rounded-full bg-green-200 opacity-20 animate-float-slow blur-xl"></div>
        </div>
    );
}
