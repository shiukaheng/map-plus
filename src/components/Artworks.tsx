import dataURL from '../../exported/combined.json?url'
import { useState, useEffect, useRef, Fragment, useMemo } from 'react'
import { extend, useFrame, useLoader, useThree, Vector3 } from '@react-three/fiber'
import { FileLoader, Float32BufferAttribute, BufferGeometry, Points, PointsMaterial, ShaderMaterial, Color, UniformsUtils, UniformsLib, Camera } from 'three'
import { IndexHtmlTransform } from 'vite'
import frag from "./materials/artworkPoints.frag"
import vert from "./materials/artworkPoints.vert"
import { Billboard, Image } from '@react-three/drei'
import DistanceWorker from "./workers/distanceHelper?worker"

function useMapifiedData(url: string) {
    const points = useLoader(FileLoader, dataURL, (loader) => {
        loader.setResponseType('json')
    })
    return points
}

function hexToRGB(hexString): [number, number, number] {
    const hex = hexString.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    return [r, g, b]
}

function useArtworkGeometry(points) {
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

function ArtworkPreviewPoints({data}) {
    const geometry = useArtworkGeometry(data)
    const matRef = useRef<ShaderMaterial>(null)
    useFrame((state, dt)=>{
        if(matRef.current){
            // console.log(matRef.current.uniforms.time.value)
            matRef.current.uniforms.time.value += dt
        }
    })
    return (
        <points>
            {/* <pointsMaterial attach="material" color="black" size={0.01} sizeAttenuation/> */}
            <primitive attach="geometry" object={geometry} />
            <shaderMaterial
                ref={matRef}
                attach="material"
                args={[{
                    vertexShader: vert,
                    fragmentShader: frag,
                }]}
                uniforms={
                    UniformsUtils.merge([
                        UniformsLib['fog'],
                        {
                            color: { value: new Color( 0xffffff ) },
                            size: {value: 0.02,},
                            // size: {value: 5},
                            alphaTest: { value: 0.9 },
                            distortion_scale: { value: 20 },
                            distortion_intensity: { value: 0.015 },
                            distortion_speed: { value: 1 },
                            time: { value: 0 },
                        }
                    ])
                }
                fog={true}
            />
        </points>
    )
}

function IndividualArtwork({data, index, visible=true}: {data: any, index: number, visible: boolean}) {
    const {image_url, imagePosition, position} = useMemo(()=>{
        const actualPostion = [data["mapify_x"][index], data["mapify_y"][index], data["mapify_z"][index]] as [number, number, number]
        return {
            image_url: data["imageURL"][index],
            imagePosition: (actualPostion).map(x=>x*1.01),
            position: actualPostion
        }
    }, [data, index])
    const imageRef = useRef(null)
    // useEffect(()=>{
    //     if(imageRef.current){
    //         imageRef.current.material.depthTest = false
    //         imageRef.current.renderOrder = 100
    //     }
    // })
    return (
        ((image_url === null) || (image_url === undefined)) ? null : (
            <Billboard position={imagePosition} scale={0.1}>
                <Image url={image_url} ref={imageRef}/>
            </Billboard>
        )
    )
}

type Slot = {
    slot_index: number,
    art_index: number | null, // NOT ID
}



function gate(x:number, dropoff_start=0.5, dropoff_end=1.0):number {
    // We repurpose cosine to make a dropoff curve with Y=1 at 0 and Y=0 at distance end. Y min is 0 and max is 1.
    return Math.max(0, Math.min(1, (Math.cos(Math.PI * (x - dropoff_start) / (dropoff_end - dropoff_start)) + 1) / 2))
}

function SP(distance, camera, dropoff_start=0.5, dropoff_end=1.0): number {
    return 1-gate(distance, dropoff_start, dropoff_end)
}

function DP(distance, camera, dropoff_start=0.5, dropoff_end=1.0): number {
    return gate(distance, dropoff_start, dropoff_end)
}

function sampleProbability(p=0.5): boolean {
    return Math.random() < p
}

function sampleFromArray(array: any[], samples=10): any {
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

function ArtworkDetails({data, maxArtworksVisible=30, dropoffStart=0.2, dropoffEnd=0.5}: {
    data: any,
    visibleArtworkIndices: number[],
    maxArtworksVisible: number,
    dropoffStart: number,
    dropoffEnd: number,
}) {
    const groupRef = useRef(null)
    const workerRef = useRef<Worker>()
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
    const camera = useThree((context) => context.camera)
    useEffect(()=>{
        workerRef.current = new DistanceWorker() as Worker
        workerRef.current.postMessage({
            "type": "updatePoints",
            "data": {
                x: data["mapify_x"],
                y: data["mapify_y"],
                z: data["mapify_z"],
            }
        })
        workerRef.current.onmessage = (e)=>{
            // On message, print the message
            const distances: [number, number][] = e.data.data
            const dt = e.data.dt
            const query = camera.position.clone().normalize().toArray()
            workerRef.current?.postMessage({
                "type": "updateQueryPoint",
                "data": query
            })
            // The return value is an array of [index, distance] pairs sorted by distance

            // Algorithm: 

            // There are only a limited number of slots for nearby artworks as defined by maxArtworksVisible
            // We will use a custom component for each slot, which will fade out the old artwork and fade in the 
            // new artwork when the id changes. The assignment of id -> slot will be kept by a map.

            // We use sigmoid to define a spawn / despawn probability based on distance and camera distance: we will call this probability SP and DP respectively.
            // On every distance update, we decide which artwork to despawn, and which artworks to replace as follows:
            // For each slot we sample DP to be either true or false. If DP is true, we will need to replace the artwork in the slot.
            setArtworkSlots(
                (slots)=>{
                    const emptied = slots.map((slot)=>{
                        const distance = distances[slot.slot_index]
                        if (distance === undefined) {
                            return slot
                        }
                        // console.log(distance)
                        const dp = DP(distance[1], camera, dropoffStart, dropoffEnd)
                        // console.log(dp)
                        const despawn = sampleProbability(dp)
                        if (despawn) {
                            return {...slot, art_index: null}
                        } else {
                            return slot
                        }
                    })
                    const nEmpty = emptied.filter((slot)=>(slot.art_index === null || slot.art_index === undefined)).length
                    // Get a filtered list of possible replacement indices by removing distance > dropoffEnd. Since the list is sorted by distance, we can early out if we find a distance > dropoffEnd.
                    var filtered: [number, number][] = []
                    for(let i = 0; i < distances.length; i++){
                        if (distances[i][1] <= dropoffEnd) {
                            // Now we sample SP to be either true or false.
                            if (sampleProbability(SP(distances[i][1], camera, dropoffStart, dropoffEnd))) {
                                filtered.push(distances[i])
                            }
                        } else {
                            break
                        }
                    }
                    // We further filter indices already in the slots
                    filtered = filtered.filter(([index, distance])=>emptied.find((slot)=>slot.art_index === index) === undefined)
                    // Now we randomly sample from the filtered list to get a replacement index.
                    const replacementIndices = sampleFromArray(filtered, nEmpty)
                    // We iterate over the slots to assign replacement indices to the slots
                    for (let i = 0; i < emptied.length; i++) {
                        if (emptied[i].art_index === null || emptied[i].art_index === undefined) {
                            if (replacementIndices[i] !== undefined) {
                                emptied[i].art_index = replacementIndices[i][0]
                            }
                        }
                    }
                    return emptied
                }
            )
            // As to which artwork we fill the now empty slot with, we will sample SP for all artworks excluding artworks already in the slot as possible candidates.

            // Then, there will most likely be more artworks to spawn than slots to fill. So, we randomly sample from the list of artworks to spawn for each slot.
        }
        return ()=>{
            if (workerRef.current) {
                workerRef.current.terminate()
            }
        }
    }, [])
    return (
        <group ref={groupRef}>
            {/* {
                nearbyArtworkIndices.map((index) => 
                    <IndividualArtwork key={index} data={data} index={index}/>
                )
            } */}
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

export function ArtworkGlobe() {
    // Build geometry from points
    const data = useMapifiedData(dataURL)// points is a parsed JSON object
    const [visibleArtworkIndices, setVisibleArtworkIndices] = useState<number[]>([])
    // useEffect(()=>{
    //     setVisibleArtworkIndices(sampleFromArray(Object.keys(data["id"]), 500))
    // }, [])
    return (
        <Fragment>
            <group>
                <ArtworkDetails data={data} visibleArtworkIndices={visibleArtworkIndices}/>
                <ArtworkPreviewPoints data={data}/>
            </group>
        </Fragment>
    )
}