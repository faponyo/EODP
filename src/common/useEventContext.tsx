import {createContext, ReactNode, useContext, useState,} from 'react'


const EventContext = createContext<any>({})

export function useEventContext() {
    const context = useContext(EventContext)
    if (context === undefined) {
        throw new Error('useContext must be used within an AuthProvider')
    }
    return context
}


export function EventProvider({children}: { children: ReactNode }) {
    const [preSelectedEvent, setPreSelectedEvent] = useState(
        null
    )


    return (
        <EventContext.Provider
            value={{
                preSelectedEvent,

                setPreSelectedEvent,

            }}
        >
            {children}
        </EventContext.Provider>
    )
}
