import { authService } from '../services';

class AuthStore {
    constructor() {
        this.user = null;
        this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        this.listeners = new Set();
        this.initialized = false;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return {
            user: this.user,
            token: this.token,
            initialized: this.initialized
        };
    }

    async init() {
        if (this.token && !this.user) {
            try {
                const userData = await authService.getMe();
                this.user = userData;
            } catch (error) {
                console.error('AuthStore init failed:', error);
                this.logout();
            }
        }
        this.initialized = true;
        this.notify();
    }

    async login(email, password) {
        const data = await authService.login(email, password);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        this.notify();
        return data;
    }

    async vendorLogin(email, password) {
        const data = await authService.vendorLogin(email, password);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        this.notify();
        return data;
    }

    async vendorRegister(formData) {
        const data = await authService.vendorRegister(formData);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        this.notify();
        return data;
    }

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        this.notify();
    }

    setUser(user) {
        this.user = user;
        this.notify();
    }
}

const authStore = new AuthStore();
export default authStore;
