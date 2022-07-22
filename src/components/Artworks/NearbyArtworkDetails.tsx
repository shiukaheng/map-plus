import { MutableRefObject, useEffect, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"

import { DP, gate, getDespawnProbability, sampleFromArray, sampleProbability, Slot, SP, useInterval } from "../utils"
import { IndividualArtwork } from "./IndividualArtwork"
import { ImageSlot } from "./Slot"

function useArtworkSlots(maxArtworksVisible) {
    const [artworkSlots, setArtworkSlots] = useState<Slot[]>([])
    useEffect(()=>{
        // Keep artwork slots numbers in sync with maxArtworksVisible
        if (artworkSlots.length < maxArtworksVisible) { // If there are less slots than maxArtworksVisible
            const newSlots: Slot[] = []
            for(let i = artworkSlots.length; i < maxArtworksVisible; i++){
                newSlots.push({
                    slot_index: i,
                    art_index: null
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

export function NearbyArtworkDetails({data, distancesRef, maxArtworksVisible=30, dropoffStart=0.4, dropoffEnd=0.7, updateInterval=250}: {
    data: any,
    distancesRef: MutableRefObject<number[] | null>,
    visibleArtworkIndices?: number[],
    maxArtworksVisible?: number,
    dropoffStart?: number,
    dropoffEnd?: number,
    updateInterval?: number
}) {
    const {artworkSlots, setArtworkSlots} = useArtworkSlots(maxArtworksVisible)
    const camera = useThree((context) => context.camera)
    // Interval for dropping off artwork

    useInterval(()=>{
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
                const dp = 1-gate(distances[slot.art_index] * 2/camera.position.length() , dropoffStart, dropoffEnd)
                return dp
            })
            // console.log(despawnRate)
            // Then we calculate despawn probabilities
            const despawnProbabilities = despawnRate.map((rate)=>{
                return getDespawnProbability(updateInterval, rate)
            })
            // Then we sample the despawn probabilities
            const despawnIndices = despawnProbabilities.map((prob)=>{
                return sampleProbability(prob)
            })
            // We null the slots that are despawned
            var newSlots = artworkSlots.map((slot, i)=>{
                if (despawnIndices[i]) {
                    return {
                        slot_index: slot.slot_index,
                        art_index: null
                    }
                }
                return slot
            })
            // Now we set the new slots.
            // Enumerate
            var replacementCandidates = distances.map((d, index)=>([gate(d * 2/camera.position.length() , dropoffStart, dropoffEnd), index])) 
            // Filter (using sampleProbability)
            replacementCandidates = replacementCandidates.filter(([sp, index])=>{
                return sampleProbability(sp)
            })
            // Map to indices
            const replacementCandidateIndices = replacementCandidates.map(([sp, index])=>{
                return index
            })
            // Count number of empty slots
            const emptySlots = newSlots.filter((slot)=>{
                return slot.art_index === null
            }).length
            // Sample uniformly the amount of despawned items from the replacement indices
            const replacementIndices = sampleFromArray(replacementCandidateIndices, emptySlots)
            // console.log(replacementIndices)
            // Fill the new slots with the replacement indices using pop
            newSlots = newSlots.map((slot, i)=>{
                if (slot.art_index === null) {
                    return {
                        slot_index: slot.slot_index,
                        art_index: replacementIndices.pop()
                    }
                }
                return slot
            })
            // console.log(newSlots.map(x => x.art_index))
            setArtworkSlots(newSlots)
        }
    }, updateInterval)
    return (
        <group>
            {
                artworkSlots.map((slot)=>{
                    if (slot.art_index === null || slot.art_index === undefined) {
                        return null
                    }
                    return (
                        <ImageSlot artworkIndex={slot.art_index} data={data} key={slot.slot_index}/>
                    )
                }
                )
            }
        </group>
    )
}