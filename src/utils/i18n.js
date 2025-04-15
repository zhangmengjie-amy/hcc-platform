import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from "@/locales";
i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        lng: ('en'),
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
