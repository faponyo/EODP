export const generateVoucherNumber = (): string => {
  const prefix = 'VP';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${random}`;
};

export const createVoucher = (attendeeId: string, eventId: string) => {
  return {
    id: Date.now().toString(),
    voucherNumber: generateVoucherNumber(),
    attendeeId,
    eventId,
    softDrinks: {
      total: 2,
      claimed: 0,
    },
    hardDrinks: {
      total: 2,
      claimed: 0,
    },
    isFullyClaimed: false,
    createdAt: new Date().toISOString(),
  };
};