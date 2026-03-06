/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";

import PhylogeneticRelationship from "@/components/modules/mutation";
import { useParams } from "next/navigation";
export default function PhylogeneticRelationshipPage() {
  const { params } = useParams();
  return (
    <div style={{ transform: "scale(0.85)" }}>
      <PhylogeneticRelationship range={JSON.parse(decodeURIComponent(params))}></PhylogeneticRelationship>
    </div>
  );
}