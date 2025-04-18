import React, {useEffect} from 'react';
import {Button} from 'antd';
import i18n from '@/utils/i18n'; // Path to your i18n setup
import {useCookies} from "react-cookie";
import Image from 'next/image';
import {useLanguage} from '@/contexts/LanguageContext'

const Language = () => {
    const [cookies, setCookie] = useCookies(["i18next"]);
    const {language, setLanguage} = useLanguage("en");
    const handleLanguage = () => {
        const newLanguage = i18n?.language === "zh" ? "en" : "zh";
        setCookie("i18next", newLanguage);
        setLanguage(newLanguage);
    }

    const showLanguage = () => {
        return i18n?.language === "zh" ? "中" : "en"
    }
    return (
        <Button color="default" variant="text" style={{color: "#fff"}}><span
            style={{marginBottom: 0, color: "#fff"}}>{showLanguage()}</span>
            <Image
                onClick={handleLanguage}
                src="/images/globe.svg"
                alt="globe"
                width={25}
                height={25}
            /></Button>
    );
}
export default Language;
