// ThreeJS object that displays image using PlaneGeometry and MeshBasicMaterial

import { useSpring, animated } from "@react-spring/three";
import { Billboard, Image } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArtworkData } from "../utils";

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
            // console.log("Gone!", imageIndex)
            if (!visibleRef.current) {
                onDisappear(imageIndex)
            }},
        config: {
            mass: 0.5,
            tension: 100,
            friction: 50,
            precision: 0.001
        }
        }
    );
    return (
        <animated.group position={imagePosition} scale={scale}>
            <Billboard>
                <Suspense>
                    {image_url === null ? null : (
                        <Image url={image_url} scale={0.1}/>
                    )}
                </Suspense>
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
            imagePosition: (actualPostion).map(x=>x*1.01) as [number, number, number],
            position: actualPostion
        }
    }, [data, artworkIndex])
    const [imageStateArray, setImageStateArray] = useState<ImageState[]>([])
    useEffect(()=>{
        // Set all previous images to invisible and add new image when new image is loaded
        setImageStateArray(imageStateArray.map(imageState=>({...imageState, visible: false})).concat([{imagePosition, image_url, visible: true, imageIndex: artworkIndex}]))
    }, [artworkIndex])
    // console.log(imageStateArray.length)
    return (
        <group>
            {
                imageStateArray.map((imageState)=>(
                    <ImageSlotSingle key={imageState.imageIndex} {...imageState} onDisappear={(id)=>{
                        // Remove image from array
                        setImageStateArray(imageStateArray.filter(imageState=>imageState.imageIndex !== id))
                    }
                    }/>
                ))
            }
        </group>
    )
}