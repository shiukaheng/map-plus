import { useFrame, useLoader } from "@react-three/fiber"
import { useMemo } from "react"
import { BufferGeometry, FileLoader, Float32BufferAttribute } from "three"
import gamma from "gamma"

function objectToList(obj: any): any[] {
    // Somehow the imported arrays are instead an object with numbers as keys. This function converts them to a list.
    const list: any[] = []
    for (const key of Object.keys(obj)) {
        list[key] = obj[key]
    }
    // Filter missing indices
    return list.filter((_, i) => i in list)
}

export function useMapifiedData(url: string) {
    const points = (useLoader(FileLoader, url, (loader) => {
        loader.setResponseType('json')
    })) as object
    // Fix the fact that the columns are in a dict with numeric keys instead of an array
    const points_fixed = useMemo(() => {
        const columns = Object.keys(points)
        const modified_points = {}
        for (const column of columns) {
            modified_points[column] = objectToList(points[column])
        }
        return modified_points
    }, [points])
    return points_fixed
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
    const pointsArray: number[] = []
    const colorsArray: number[] = []
    const queryDistanceArray: number[] = []
    for (const i of Object.keys(points["id"])) {
        pointsArray.push(points["mapify_x"][i], points["mapify_y"][i], points["mapify_z"][i])
        queryDistanceArray.push(0)
        if (points["colorPredominant"][i] !== null) {
            const colorRGB = hexToRGB(JSON.parse(points["colorPredominant"][i])[0]["color"]) as [number, number, number]
            colorsArray.push(...colorRGB)
        } else {
            colorsArray.push(1, 1, 1)
        }
    }
    geometry.setAttribute('position', new Float32BufferAttribute(pointsArray, 3))
    geometry.setAttribute('artwork_color', new Float32BufferAttribute(colorsArray, 3))
    geometry.setAttribute('query_distance', new Float32BufferAttribute(queryDistanceArray, 1))
    return geometry
}

export function useArtworkGeometry(points, distancesRef: React.MutableRefObject<number[] | null>) {
    const geometry = useMemo(()=>{
        return _useArtworkGeometry(points)
    }, [points])
    useFrame(()=>{
        if (distancesRef.current && geometry) {
            // console.log(distancesRef)
            // Update the geometry's query_distance attribute using the distances
            const queryDistanceArray = geometry.attributes.query_distance.array
            for (let i = 0; i < queryDistanceArray.length; i++) {
                queryDistanceArray[i] = distancesRef.current[i]
            }
            geometry.attributes.query_distance.needsUpdate = true
        }
    })
    return geometry
}

export type Slot = {
    slot_index: number,
    art_index: number | null, // NOT ID
}

function raw_gate(x: number): number {
    // Raw gating function based on cos
    if (x < 0) {
        return 1
    } else if (x > 1) {
        return 0
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

// Poisson distribution for calculating despawn rates
/**
 * @param samplingTimeWindow The time window we want query the probability of a despawn event
 * @param despawnRatePerSecond The despawn rate (How many despawn events per second are expected)
 * @returns The probability of a despawn event in the given time window
 */
export function getDespawnProbability(samplingTimeWindow: number, despawnRatePerSecond: number=0.5): number {
    if (despawnRatePerSecond === 0) {
        return 0
    }
    return 1 - Math.exp(-despawnRatePerSecond * samplingTimeWindow)
}

window.getDespawnProbability = getDespawnProbability