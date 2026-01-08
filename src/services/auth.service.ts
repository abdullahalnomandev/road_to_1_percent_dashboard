
// Handles user login by saving the token to localStorage
function setToLocalStorage(token: string) {
    if (!token) return;
    localStorage.setItem('token',token);
    window.location.href = '/';

}

// Handles user logout by removing the token from localStorage
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

function getFromLocalStorage( key: string ) {
    return localStorage.getItem(key) ?? '';
}

export { setToLocalStorage, handleLogout, getFromLocalStorage };