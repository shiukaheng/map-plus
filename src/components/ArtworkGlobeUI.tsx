import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AnimatedControls } from "./AnimatedControls";
import { ArtworkData, useInterval, useMapifiedData } from "./utils";
import { Scene } from "../Scene";

const defaultPos: [number, number, number] = [0,0,2]

export function ArtworkGlobeUI({targetCameraPosition=defaultPos, data}:{targetCameraPosition?: [number, number, number], data: ArtworkData}) {
    const [inAnimation, setInAnimation] = useState(false);
    useEffect(()=>{
        setInAnimation(true);
    }, [targetCameraPosition])
    return (
        <Canvas className="w-full h-full">
            <Scene data={data}/>
            {inAnimation ? <AnimatedControls targetPosition={targetCameraPosition} onFinish={()=>{setInAnimation(false)}}/> : <OrbitControls maxDistance={2} minDistance={1.07} zoomSpeed={0.2} enablePan={false} rotateSpeed={0.5} screenSpacePanning={false}/>}
        </Canvas>
    )
}