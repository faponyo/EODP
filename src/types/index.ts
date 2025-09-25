export type UserAuth = {
    type?: string
    token?: string

    name?: string
    group?: string
    expires: string
}


export interface Record {
    [key: string]: any
}

export interface PaginationProps {
    number: number
    size: number
    totalElements: number
    totalPages: number
    items?:number
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'PARTNER' | 'CO-ORDINATOR' | 'HELPDESK';
    status: 'active' | 'disabled';
    assignedEvents?: { id:number,name:string }[];
    createdAt: string;
    createdBy?: string;
    isFirstLogin?: boolean;
    passwordChangedAt?: string;
    resetPassword: number;
    token?: string
    group?: string


}

export interface UserGroup {
    id: string;
    groupName: string;
    description: string;
}

export interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    maxAttendees: number;
    status?: 'active' | 'closed' | 'cancelled';
    hasVouchers: boolean;
    voucherCategories?: VoucherCategory[];
    createdAt: string;
    createdBy: string;
}

export interface VoucherCategory {
    id: string;
    name: string;
    numberOfItems: number;
    value: number;
}

export interface Attendee {
    id: string;
    eventId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    registeredAt: string;
    voucherId: string;
    submittedBy: string;
}

export interface Voucher {
    id: string;
    voucherNumber: string;
    attendeeId: string;
    eventId: string;
    softDrinks: {
        total: number;
        claimed: number;
    };
    hardDrinks: {
        total: number;
        claimed: number;
    };
    isFullyClaimed: boolean;
    createdAt: string;
    claimHistory?: VoucherClaim[];
}

export interface VoucherClaim {
    id: string;
    voucherId: string;
    drinkType: 'soft' | 'hard';
    itemName?: string;
    claimedAt: string;
    claimedBy: string;
}

export interface Subsidiary {
    id: string;
    name: string;
    code: string;
    description?: string;
    createdAt: string;
    createdBy: string;
}

export interface SubsidiaryEmployee {
    id: string;
    subsidiaryId: string;
    pfNumber: string;
    name: string;
    email: string;
    department: string;
    createdAt: string;
    uploadedBy: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}