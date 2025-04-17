import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from "i18next-resources-to-backend";
const lng = 'en';
const fallbackLng = 'en';
const languages = ["en", 'zh'];
const defaultNS = ['common','home','mutation'];
const cookieName = 'i18next';

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace) => import(`@/locales/${language}/${namespace}.json`)))
    .init({
        lng, //默认语言
        fallbackLng, //回退语言
        supportedLngs: languages,
        ns: defaultNS, //默认命名空间列表
        defaultNS,
        fallbackNS: defaultNS,
        detection: {
            order: ["path", "htmlTag", "cookie", "navigator"],
        },
        preload: languages
    });

export default i18n;
