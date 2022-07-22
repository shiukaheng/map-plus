import { useFrame } from "@react-three/fiber"
import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three"
import { useArtworkGeometry } from "../utils"
import frag from "../materials/artworkPoints.frag"
import vert from "../materials/artworkPoints.vert"
import { useRef } from "react"

export function ArtworkPreviewPoints({data, distancesRef}:
    {data: any, distancesRef: React.MutableRefObject<number[] | null>}) {
    const geometry = useArtworkGeometry(data, distancesRef)
    const matRef = useRef<ShaderMaterial>(null)
    useFrame((state, dt)=>{
        if(matRef.current){
            // console.log(matRef.current.uniforms.time.value)
            matRef.current.uniforms.time.value = state.clock.elapsedTime
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