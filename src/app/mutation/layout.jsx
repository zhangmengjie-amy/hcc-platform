
import React from 'react';
import HCCFooter from "@/components/footer";
import HCCHeader from "@/components/header";


export default function Layout({ children }) {
    return (
        <>
            <HCCHeader></HCCHeader>
            {children}
            <HCCFooter></HCCFooter>
        </>
    );
}
