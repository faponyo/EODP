import React from "react";
import {
    attendeesNavigationItems,
    dashboardNavigationItems,
    eventsNavigationItems,
    NavItem,
    reportsNavigationItems,
    subsidiariesNavigationItems,
    usersNavigationItems,
    vouchersNavigationItems
} from "../constants/route.ts";
import {User as UserType} from "../types";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../common/useAuthContext.tsx";


interface NavbarProps {

    currentPage: string;
    user?: UserType;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onPageChange?: (page: string) => void;
    className?: string;

}

export const Sidebar: React.FC<NavbarProps> = ({
                                                   sidebarOpen,
                                                   setSidebarOpen,
                                                   currentPage,
                                                   onPageChange
                                               }) => {
    // const {pathname} = useLocation();
    // const [sidebarOpen, setSidebarOpen] = useState(false);
    const {hasPermissions} = useAuthContext();

    const navigate = useNavigate();


    // Filter navigation items based on user role
    const getNavigationItems = (): NavItem[] => {
        const items = [...dashboardNavigationItems, ...eventsNavigationItems, ...attendeesNavigationItems, ...vouchersNavigationItems, ...subsidiariesNavigationItems, ...usersNavigationItems, ...reportsNavigationItems];

        //
        // if (user?.role === 'ADMIN') {
        //     items = [...items, ...adminOnlyItems];
        // }

        return items.filter(item =>
            !item.requiredPermissions || hasPermissions(item.requiredPermissions)
        );
    };

    const navigationItems = getNavigationItems();

    const handleNavigation = (pageId: string) => {
        if (onPageChange) {
            onPageChange(pageId.startsWith('/') ? pageId.slice(1) : pageId);           // 3. Update currentPage state if needed
        }
        setSidebarOpen(false); // Close sidebar on mobile after navigation
        navigate(`/${pageId}`);
    };
    return (
        <>
            {/* Navigation Sidebar */}
            <nav className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                        sidebarOpen
                            ? 'fixed top-20 left-4 right-4 z-50 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto'
                            : ''
                    }`}
                >
                    <ul className="space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleNavigation(item.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                            isActive
                                                ? 'bg-coop-50 text-coop-700 border-l-4 border-coop-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0"/>
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </>
    );
};
