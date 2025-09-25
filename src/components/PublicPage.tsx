import React from 'react';
import {Shield} from 'lucide-react';
import backgroundImage from "../static/coophouse.jfif";


interface Props {

    children: React.ReactNode;

}

const PublicPage: React.FC<Props> = ({

                                         children
                                     }) => {
    return (
        <div className=" min-h-screen w-full bg-gradient-to-br from-coop-1000 via-coop-700 to-coop-800 overflow-hidden">

            {/* Header */}
            <div className="bg-white shadow-sm ">
                <div className="max-w-screen-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:h-16">
                        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                            <div className="w-10 h-10 bg-coop-1000 rounded-lg flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white"/>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Co-op Bank</h1>
                                <p className="text-xs text-gray-600">Event Mgmt.</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Secure Login</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center px-4 py-12 min-h-screen bg-cover bg-center relative"
                 style={{backgroundImage: `url(${backgroundImage})`}}>
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-coop-1000 via-coop-700 to-coop-800 opacity-70 z-0"></div>

                <div className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                    {children}

                </div>
            </div>
        </div>
    );
};

export default PublicPage;