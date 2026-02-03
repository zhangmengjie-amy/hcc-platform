
import React from "react";
import HCCFooter from "@/components/common/footer";
import HCCHeader from "@/components/common/header";


export default function Layout({ children }) {
  return (
    <>
      <HCCHeader></HCCHeader>
      {children}
      <HCCFooter></HCCFooter>
    </>
  );
}
