/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

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
