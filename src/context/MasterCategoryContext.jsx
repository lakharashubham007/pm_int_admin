import React, { createContext, useContext, useState, useEffect } from 'react';

const MasterCategoryContext = createContext();

export const MasterCategoryProvider = ({ children }) => {
    const [masterCategory, setMasterCategoryState] = useState(
        localStorage.getItem('masterCategory') || 'Grocery'
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (masterCategory === 'Food') {
            root.classList.add('food-theme');
        } else {
            root.classList.remove('food-theme');
        }
        localStorage.setItem('masterCategory', masterCategory);
    }, [masterCategory]);

    const setMasterCategory = (category) => {
        setMasterCategoryState(category);
    };

    return (
        <MasterCategoryContext.Provider value={{ masterCategory, setMasterCategory }}>
            {children}
        </MasterCategoryContext.Provider>
    );
};

export const useMasterCategory = () => {
    const context = useContext(MasterCategoryContext);
    if (!context) throw new Error('useMasterCategory must be used within a MasterCategoryProvider');
    return context;
};
