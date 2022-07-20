import dataURL from '../../exported/combined.json?url'
import { useState, useEffect, useRef, Fragment } from 'react'
import { extend, useFrame, useLoader } from '@react-three/fiber'
import { FileLoader, Float32BufferAttribute, BufferGeometry, Points, PointsMaterial, ShaderMaterial, Color, UniformsUtils, UniformsLib } from 'three'
import { IndexHtmlTransform } from 'vite'
import frag from "./materials/artworkPoints.frag"
import vert from "./materials/artworkPoints.vert"

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

export function ArtworkDetail({id, displayDistance=0.1}) {
    // Displays a preview of the artwork, 
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

function IndividualArtwork({id}) {
    return null
}

function ArtworkDetails({data, visibleArtworkIDs}: {
    data: any,
    visibleArtworkIDs: string[]
}) {
    const previousArtworkIDs = useRef<string[]>([])
    const displayObjectRef = useRef({}) // Object for keeping track of artwork objects
    const groupRef = useRef(null)
    useEffect(()=>{
        const newIDs = visibleArtworkIDs.filter(id => !previousArtworkIDs.current.includes(id))
        const removedIDs = previousArtworkIDs.current.filter(id => !visibleArtworkIDs.includes(id))
        newIDs.forEach((id)=>{
            // Create a new artwork object
            // Update the displayObjectRef
        })
        removedIDs.forEach((id)=>{
            // Remove the artwork object
            // Update the displayObjectRef
        })
    }, [])
    return (
        <group ref={groupRef}>
        </group>
    )
}

export function ArtworkGlobe() {
    // Build geometry from points
    const data = useMapifiedData(dataURL)// points is a parsed JSON object
    const [visibleArtworkIDs, setVisibleArtworkIDs] = useState<string[]>([])
    return (
        <Fragment>
            <group>
                <ArtworkDetails data={data} visibleArtworkIDs={visibleArtworkIDs}/>
                <ArtworkPreviewPoints data={data}/>
            </group>
        </Fragment>
    )
}