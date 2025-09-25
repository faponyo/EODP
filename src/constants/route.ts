import {BarChart3, Building, Calendar, TicketIcon, UserCog, Users} from "lucide-react";
import React from "react";
import {PERMISSIONS} from '../common/constants.ts'; // adjust path as needed

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: ('PARTNER' | 'CO-ORDINATOR' | 'ADMIN' | 'HELP-DESK')[];
    requiredPermissions?: Permission[];

}

export const baseNavigationItems: NavItem[] = [
    // {id: 'dashboard', label: 'Dashboard', icon: BarChart3},
    // {id: 'events', label: 'Events', icon: Calendar},
    // {id: 'attendees', label: 'Attendees', icon: Users},
    // {id: 'vouchers', label: 'Vouchers', icon: TicketIcon},
    // {id: 'reports', label: 'Reports', icon: BarChart3},
];
export const dashboardNavigationItems: NavItem[] = [

    {id: 'dashboard', label: 'Dashboard', icon: BarChart3}
];


export const eventsNavigationItems: NavItem[] = [

    {
        id: 'events', label: 'Events', icon: Calendar, requiredPermissions: [PERMISSIONS.CME,
            PERMISSIONS.VAE,
            PERMISSIONS.APE,
            PERMISSIONS.VSEA,
            PERMISSIONS.VAEO]
    },

];

export const attendeesNavigationItems: NavItem[] = [


    {
        id: 'attendees', label: 'Attendees', icon: Users, requiredPermissions: [


            PERMISSIONS.VA,
            PERMISSIONS.VAEA,
            PERMISSIONS.CIA,
            PERMISSIONS.VAVD
        ]
    },

];

export const vouchersNavigationItems: NavItem[] = [


    {id: 'vouchers', label: 'Vouchers', icon: TicketIcon, requiredPermissions: [PERMISSIONS.VAV, PERMISSIONS.CV]},

];

export const reportsNavigationItems: NavItem[] = [


    {id: 'reports', label: 'Reports', icon: BarChart3, requiredPermissions: [PERMISSIONS.AR],},
];

export const subsidiariesNavigationItems: NavItem[] = [
    {
        id: 'subsidiaries',
        label: 'Subsidiaries',
        icon: Building,
        roles: ['ADMIN'],
        requiredPermissions: [PERMISSIONS.CS, PERMISSIONS.ARS, PERMISSIONS.USE, PERMISSIONS.VS, PERMISSIONS.VSE],
    },
];

export const usersNavigationItems: NavItem[] = [
    {
        id: 'users',
        label: 'User Management',
        icon: UserCog,
        roles: ['ADMIN'],
        requiredPermissions: [PERMISSIONS.CSU, PERMISSIONS.ARSU, PERMISSIONS.AESU, PERMISSIONS.ADSU, PERMISSIONS.VSSU],
    },
];


export const adminOnlyItems: NavItem[] = [
    {id: 'users', label: 'User Management', icon: UserCog, roles: ['ADMIN']}
];







