import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from "i18next-resources-to-backend";

const defaultNS = ['common', 'home', 'mutation'];
const languages = ["en", "zh"];
i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace) => import(`@/locales/${language}/${namespace}.json`)))
    .init({
        lng: "en", //默认语言
        fallbackLng: "en", //回退语言
        supportedLngs: languages,
        ns: defaultNS, //默认命名空间列表
        defaultNS: defaultNS,
        fallbackNS: defaultNS,
        preload: ['en', 'zh']
    });

export default i18n;
