import { useLoader } from "@react-three/fiber"
import { useMemo } from "react"
import { BufferGeometry, FileLoader, Float32BufferAttribute } from "three"

export function useMapifiedData(url: string) {
    const points = useLoader(FileLoader, url, (loader) => {
        loader.setResponseType('json')
    })
    return points
}

export function hexToRGB(hexString): [number, number, number] {
    const hex = hexString.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    return [r, g, b]
}

function _useArtworkGeometry(points) {
    window.points = points
    // Build a geometry from the points
    const geometry = new BufferGeometry()
    const pointsArray = []
    const colorsArray: number[] = []
    for (const i of Object.keys(points["id"])) {
        pointsArray.push(points["mapify_x"][i])
        pointsArray.push(points["mapify_y"][i])
        pointsArray.push(points["mapify_z"][i])
        if (points["colorPredominant"][i] !== null) {
            const colorRGB = hexToRGB(JSON.parse(points["colorPredominant"][i])[0]["color"]) as [number, number, number]
            colorsArray.push(...colorRGB)
        } else {
            colorsArray.push(1, 1, 1)
        }
    }
    geometry.setAttribute('position', new Float32BufferAttribute(pointsArray, 3))
    geometry.setAttribute('artwork_color', new Float32BufferAttribute(colorsArray, 3))
    return geometry
}

export function useArtworkGeometry(points) {
    return useMemo(()=>{
        return _useArtworkGeometry(points)
    }, [points])
}

export type Slot = {
    slot_index: number,
    art_index: number | null, // NOT ID
}

function raw_gate(x: number): number {
    // Raw gating function based on cos
    if (x < 0) {
        return 0
    } else if (x > 1) {
        return 1
    } else {
        return Math.cos(x * Math.PI) / 2 + 0.5
    }
}

export function gate(x: number, dropoff_start: number = 0.7, dropoff_end: number = 1.0): number {
    // Wrapper on raw_gate to shift the range
    return (raw_gate(
        (x - dropoff_start) / (dropoff_end - dropoff_start)
    ))
}

export function SP(distance, camera, dropoff_start=0.5, dropoff_end=1.0): number {
    return 1-gate(distance, dropoff_start, dropoff_end)
}

export function DP(distance, camera, dropoff_start=0.5, dropoff_end=1.0): number {
    return gate(distance, dropoff_start, dropoff_end)
}

export function sampleProbability(p=0.5): boolean {
    return Math.random() < p
}

export function sampleFromArray(array: any[], samples=10): any {
    // Sample n items from an array without replacement
    const clone_array: any[] = array.slice()
    const sampled_items: any[] = []
    for (let i = 0; i < samples; i++) {
        // Early terminate if we have no items left
        if (clone_array.length === 0) {
            break
        }
        // Pick a random index and copy the item to the sampled_items array
        const index = Math.floor(Math.random() * clone_array.length)
        sampled_items.push(clone_array[index])
        // Now remove the item from the clone_array
        clone_array.splice(index, 1)
    }
    return sampled_items
}