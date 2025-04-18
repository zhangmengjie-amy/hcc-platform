"use client";
import React, {createContext, useEffect, useContext, useState} from 'react';
import i18n from '@/utils/i18n'; // Path to your i18n setup
import {useCookies} from "react-cookie";

const LanguageContext = createContext({
    language: 'en', setLanguage: () => {
    }
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({children, lng}) => {
    const [language, setLanguage] = useState("en"); // Default language
    useEffect(() => {
        i18n?.changeLanguage(lng);
    }, [lng]);

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
