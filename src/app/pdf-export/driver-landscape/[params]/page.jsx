"use client";

import DriverLandscape from "@/components/mutation/driverLandscape";
import { useParams } from 'next/navigation'; // 导入 useRouter
export default function DriverLandscapePage() {
    const { params } = useParams();
    return (
        <DriverLandscape conditions={JSON.parse(decodeURIComponent(params))}></DriverLandscape>
    );
}