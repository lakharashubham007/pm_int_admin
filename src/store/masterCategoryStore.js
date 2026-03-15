class MasterCategoryStore {
    constructor() {
        this.masterCategory = typeof window !== 'undefined' ? localStorage.getItem('masterCategory') || 'all' : 'all';
        this.listeners = new Set();
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
            masterCategory: this.masterCategory
        };
    }

    setMasterCategory(category) {
        this.masterCategory = category;
        if (typeof window !== 'undefined') {
            localStorage.setItem('masterCategory', category);
        }
        this.notify();
    }
}

const masterCategoryStore = new MasterCategoryStore();
export default masterCategoryStore;
