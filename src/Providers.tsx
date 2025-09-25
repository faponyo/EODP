import React from "react";
import {AuthProvider} from "./common/useAuthContext.tsx";
import {EventProvider} from "./common/useEventContext.tsx";


interface ProvidersProps {
    children: React.ReactNode;
}

const Providers = ({children}: ProvidersProps) => {
    return (

        <AuthProvider>
            <EventProvider>

                {children}
            </EventProvider>


        </AuthProvider>

    );
};

export default Providers;
