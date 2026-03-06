/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";

import DriverLandscape from "@/components/modules/mutation/right-content/driver-landscape";
import { useParams } from "next/navigation"; // 导入 useRouter
export default function DriverLandscapePage() {
  const { params } = useParams();
  return (
    <DriverLandscape conditions={JSON.parse(decodeURIComponent(params))}></DriverLandscape>
  );
}