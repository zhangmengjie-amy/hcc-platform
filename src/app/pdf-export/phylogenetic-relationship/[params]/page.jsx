"use client";

import PhylogeneticRelationship from "@/components/mutation/phylogeneticRelationship";
import { useParams } from 'next/navigation';
export default function PhylogeneticRelationshipPage() {
    const { params } = useParams();
    return (
        <div style={{transform: "scale(0.85)"}}>
            <PhylogeneticRelationship range={JSON.parse(decodeURIComponent(params))}></PhylogeneticRelationship>
        </div>
    );
}