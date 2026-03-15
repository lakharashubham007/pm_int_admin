class ThemeStore {
    constructor() {
        this.theme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
        this.listeners = new Set();
        this.applyTheme();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return { theme: this.theme };
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', this.theme);
        }
        this.applyTheme();
        this.notify();
    }

    applyTheme() {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', this.theme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(this.theme);
        }
    }
}

const themeStore = new ThemeStore();
export default themeStore;
