const authSessionKey = '_EV_AUTH'


export const getAuthToken = () => {
    const user = localStorage.getItem(authSessionKey)
        ? JSON.parse(localStorage.getItem(authSessionKey) || '{}')
        : undefined
    // JSON.parse(localStorage.getItem('user')); // Or retrieve it from context or other storage
    return user ? user.token : undefined;
};

export const clearSession = () => {
    localStorage.removeItem(authSessionKey)

    // localStorage.removeItem('user');
    // Clear any other session-specific data, such as temporary session data
    // You can also add logic to remove session from state management here if needed
};
