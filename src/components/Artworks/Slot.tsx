// ThreeJS object that displays image using PlaneGeometry and MeshBasicMaterial

import { useSpring, animated } from "@react-spring/three";
import { Billboard, Image } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Object3D } from "three";
import { ArtworkData, gate } from "../utils";

function ImageSlotSingle({imagePosition, image_url, visible=true, imageIndex, onDisappear=(index)=>{}}: {
    imagePosition: [number, number, number],
    image_url: string,
    visible?: boolean,
    imageIndex: number,
    onDisappear?: (index: number)=>void
}) {
    const visibleRef = useRef<boolean>(false)
    useEffect(()=>{
        visibleRef.current = visible
    }, [visible])
    const [actuallyVisible, setActuallyVisible] = useState(false) // To animated initial mount
    useEffect(()=>{
        setActuallyVisible(visible)
    }, [visible])
    const {scale} = useSpring({scale: actuallyVisible ? 1 : 0, onRest: ()=>{

            if (!visibleRef.current) {
                onDisappear(imageIndex)
            }},
        config: {
            mass: 0.5,
            tension: 200,
            friction: 50,
            precision: 0.01
        }
        }
    );
    const camera = useThree((c)=>c.camera)
    const imageRef = useRef<Object3D>()
    useFrame(()=>{
        if (imageRef.current) {
            const scalarScale = (camera.position.length() - 1) * 0.2 + gate(camera.position.length() - 1, 0, 0.15) * 0.075
            imageRef.current.scale.set(scalarScale, scalarScale, scalarScale)
        }
    })
    return (
        <animated.group position={imagePosition} scale={scale}>
            <Billboard>
                {image_url === null ? null : (
                    <Image url={image_url} scale={0.1} ref={imageRef}/>
                )}
            </Billboard>
        </animated.group>
    )
}

type ImageState = {
    imagePosition: [number, number, number],
    image_url: string,
    visible: boolean,
    imageIndex: number,
}

export function ImageSlot({artworkIndex, data}:{artworkIndex: number, data: ArtworkData}) {
    const {image_url, imagePosition, position} = useMemo(()=>{
        const actualPostion = [data["mapify_x"][artworkIndex], data["mapify_y"][artworkIndex], data["mapify_z"][artworkIndex]] as [number, number, number]
        return {
            image_url: data["imageURL"][artworkIndex],
            imagePosition: (actualPostion).map(x=>x*(1 + (Math.random() * 0.07))) as [number, number, number],
            position: actualPostion
        }
    }, [data, artworkIndex])
    const [imageStateArray, setImageStateArray] = useState<ImageState[]>([])
    useEffect(()=>{
        // Set all previous images to invisible and add new image when new image is loaded
        setImageStateArray(imageStateArray.map(imageState=>({...imageState, visible: false})).concat([{imagePosition, image_url, visible: true, imageIndex: artworkIndex}]))
    }, [artworkIndex])
    // console.log("ImageSlot", imageStateArray)
    return (
        <group>
            {
                imageStateArray.map((imageState)=>(
                    <ImageSlotSingle key={imageState.imageIndex} {...imageState} onDisappear={(id)=>{
                        // Remove image from array
                        setImageStateArray((imageStateArray)=>imageStateArray.filter(imageState=>((imageState.imageIndex !== id)&&(imageState.visible)))) // Hacky to be culling non-visible images, but works for now
                    }
                    }/>
                ))
            }
            {/* <ImageSlotSingle key={artworkIndex} {...{imagePosition, image_url, visible: true, imageIndex: artworkIndex}}/> */}
        </group>
    )
}