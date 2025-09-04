export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  maxAttendees: number;
  createdAt: string;
  createdBy: string;
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
}

export interface VoucherClaim {
  id: string;
  voucherId: string;
  drinkType: 'soft' | 'hard';
  claimedAt: string;
  claimedBy: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}