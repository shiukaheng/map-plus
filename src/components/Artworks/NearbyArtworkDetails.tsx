import { MutableRefObject, useEffect, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"

import { DP, gate, getDespawnProbability, sampleFromArray, sampleProbability, Slot, SP } from "../utils"
import { IndividualArtwork } from "./IndividualArtwork"

function useArtworkSlots(maxArtworksVisible) {
    const [artworkSlots, setArtworkSlots] = useState<Slot[]>([])
    useEffect(()=>{
        // Keep artwork slots numbers in sync with maxArtworksVisible
        if (artworkSlots.length < maxArtworksVisible) { // If there are less slots than maxArtworksVisible
            const newSlots: Slot[] = []
            for(let i = artworkSlots.length; i < maxArtworksVisible; i++){
                newSlots.push({
                    slot_index: i,
                    art_index: i
                }) // Add a new slot
            }
            // console.log(newSlots)
            setArtworkSlots(newSlots) // Set the new slots
        }
        if (artworkSlots.length > maxArtworksVisible) { // If there are more slots than maxArtworksVisible
            // Remove the last slots
            setArtworkSlots((slots)=>{
                return slots.slice(0, maxArtworksVisible)
            })
        }
    }, [maxArtworksVisible])
    return {artworkSlots, setArtworkSlots}
}

export function NearbyArtworkDetails({data, distancesRef, maxArtworksVisible=5, dropoffStart=0.5, dropoffEnd=1}: {
    data: any,
    distancesRef: MutableRefObject<number[] | null>,
    visibleArtworkIndices?: number[],
    maxArtworksVisible?: number,
    dropoffStart?: number,
    dropoffEnd?: number,
}) {
    const {artworkSlots, setArtworkSlots} = useArtworkSlots(maxArtworksVisible)
    useFrame((state, dt)=>{
        // Based on the distance array, update the artwork slots using poisson distribution
        if (distancesRef.current) {
            const distances = distancesRef.current
            // We first calculate the despawn rate using the poisson distribution
            const despawnRate = artworkSlots.map((slot)=>{
                // If the slot is empty, return 0
                if (slot.art_index === null) {
                    return 0
                }
                // If the slot is not empty, calculate the despawn rate
                const dp = 1-gate(distances[slot.art_index], dropoffStart, dropoffEnd)
                return dp
            })
            // console.log(despawnRate)
            // Then we calculate despawn probabilities
            const despawnProbabilities = despawnRate.map((rate)=>{
                return getDespawnProbability(dt, rate)
            })
            // Then we sample the despawn probabilities
            const despawnIndices = despawnProbabilities.map((prob)=>{
                return sampleProbability(prob)
            })
            console.log(despawnIndices)
            
        }
    })
    return (
        <group>
            {
                artworkSlots.map((slot)=>{
                    if (slot.art_index === null || slot.art_index === undefined) {
                        return null
                    }
                    return (
                        <IndividualArtwork key={slot.art_index} data={data} index={slot.art_index} visible/>
                    )
                }
                )
            }
        </group>
    )
}