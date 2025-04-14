"use client";
import React, {createContext, useContext, useState} from 'react';
import i18n from '@/utils/i18n'; // Path to your i18n setup

const LanguageContext = createContext({
    language: 'en', setLanguage: () => {
    }
});

export const useLanguage = () => useContext(LanguageContext);


export const LanguageProvider = ({children}) => {
    const [language, setLanguage] = useState('en'); // Default language

    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        i18n?.changeLanguage(newLanguage); // Update i18n instance
    };

    return (
        <LanguageContext.Provider value={{language, setLanguage: handleLanguageChange}}>
            {children}
        </LanguageContext.Provider>
    );
};