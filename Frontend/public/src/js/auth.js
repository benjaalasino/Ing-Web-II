const STORAGE_KEYS = {
    token: 'token',
    role: 'role',
    userId: 'userId',
    userName: 'userName'
};

const getToken = () => localStorage.getItem(STORAGE_KEYS.token);
const getRole = () => localStorage.getItem(STORAGE_KEYS.role);
const getUserId = () => localStorage.getItem(STORAGE_KEYS.userId);
const getUserName = () => localStorage.getItem(STORAGE_KEYS.userName);

const saveAuth = (data) => {
    localStorage.setItem(STORAGE_KEYS.token, data.access_token);
    localStorage.setItem(STORAGE_KEYS.role, data.role);
    localStorage.setItem(STORAGE_KEYS.userId, String(data.userId));
    localStorage.setItem(STORAGE_KEYS.userName, data.name);
};

const getHomeByRole = (role) => role === 'advisor' ? 'advisor-panel.html' : 'dashboard.html';

const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.role);
    localStorage.removeItem(STORAGE_KEYS.userId);
    localStorage.removeItem(STORAGE_KEYS.userName);
    window.location.href = 'login.html';
};

const checkAuth = (requiredRole) => {
    const token = getToken();
    const role = getRole();

    if (!token) {
        window.location.href = 'login.html';
        return false;
    }

    if (requiredRole && role !== requiredRole) {
        window.location.href = getHomeByRole(role);
        return false;
    }

    return true;
};

window.auth = {
    getToken,
    getRole,
    getUserId,
    getUserName,
    saveAuth,
    logout,
    checkAuth,
    getHomeByRole
};
