import React from 'react';
import { Loader2 } from 'lucide-react';

interface DataLoaderProps {
    isLoading: boolean;
    message?: string;
}

const DataLoader: React.FC<DataLoaderProps> = ({ isLoading, message = 'Loading data, please wait…' }) => {
    return (
        <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70 transition-opacity duration-300 ${
                isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            <Loader2 className="animate-spin h-10 w-10 text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
        </div>
    );
};

export default DataLoader;
