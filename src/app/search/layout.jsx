
import React from "react";
import { Suspense } from "react";
import HCCFooter from "@/components/common/footer";
import HCCHeader from "@/components/common/header";


export default function Layout({ children }) {
  return (
    <>
      <HCCHeader></HCCHeader>
      <Suspense fallback={<div>Loading search...</div>}>
        {children}
      </Suspense>
      <HCCFooter></HCCFooter>
    </>
  );
}
