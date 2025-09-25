import React, { FC } from "react";

interface Props {
    loading: boolean;
    action: string;
}

const OverlayLoader: FC<Props> = ({ loading, action }) => {
    return (
        <>
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="flex flex-col items-center justify-center text-center bg-white bg-opacity-80 rounded-lg p-6 shadow-lg">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
                        <p className="text-lg font-medium text-gray-700">{`${action}, please wait...`}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default OverlayLoader;
