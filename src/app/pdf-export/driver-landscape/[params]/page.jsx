"use client";

import DriverLandscape from "@/components/modules/mutation";
import { useParams } from "next/navigation"; // 导入 useRouter
export default function DriverLandscapePage() {
  const { params } = useParams();
  return (
    <DriverLandscape conditions={JSON.parse(decodeURIComponent(params))}></DriverLandscape>
  );
}