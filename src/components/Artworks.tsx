import dataURL from '../../exported/combined.json?url'
import { useState, useEffect } from 'react'
import { extend, useLoader } from '@react-three/fiber'
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

function useArtworkGeometry() {
    const points = useMapifiedData(dataURL)// points is a parsed JSON object
    // Build a geometry from the points
    const geometry = new BufferGeometry()
    const pointsArray = []
    for (const i of Object.keys(points["id"])) {
        pointsArray.push(points["mapify_x"][i])
        pointsArray.push(points["mapify_y"][i])
        pointsArray.push(points["mapify_z"][i])
    }
    geometry.setAttribute('position', new Float32BufferAttribute(pointsArray, 3))
    return geometry
}

export function ArtworkGlobe() {
    // Build geometry from points
    const geometry = useArtworkGeometry()
    return (
        <points>
            {/* <pointsMaterial attach="material" color="black" size={0.01} sizeAttenuation/> */}
            <primitive attach="geometry" object={geometry} />
            <shaderMaterial
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
                            size: {value: 0.05,},
                            alphaTest: { value: 0.9 }
                        }
                    ])
                }
                fog={true}
            />
        </points>
    )
}