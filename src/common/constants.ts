export const PERMISSIONS = {
    // EVENTS
    CME: 'CME', // Create  events
    VAE: 'VAE', // View all events
    APE: 'APE', // Approve Pending events
    VSEA: 'VSEA', // View Selected Event Attendees
    VAEO: 'VAEO', // View assigned events only

    // Attendees
    VA: 'VA',//View Attendees
    VAEA: 'VAEA', //View assigned events  attendees only
    CIA: 'CIA', // Check In attendees
    VAVD: 'VAVD',// View Attendees Voucher details

    // Vouchers
    VAV: 'VAV', // View all vouchers
    CV: 'CV', // Claim vouchers

    // Subsidiary
    CS: 'CS', // Create Subsidiary
    ARS: 'ARS', // Approve/Reject Subsidiary
    USE: 'USE', //Upload Subsidiary Employees
    VS: 'VS', //View Subsidiaries
    VSE: 'VSE', //View Subsidiary Employees

    // Users
    CSU: 'CSU', //Create System Users
    ARSU: 'ARSU', //Approve/Reject System Users
    AESU: 'AESU', //Assign Events to System Users
    ADSU: 'ADSU', //Activate/Deactivate System Usets
    VSSU: 'VSSU',// View System Users

    // Reports
    AR: 'AR' // Access Reports
};


export const formatDateTime = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

}


// CME -Create  events