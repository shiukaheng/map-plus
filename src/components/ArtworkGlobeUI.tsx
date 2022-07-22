import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { AnimatedControls } from "./AnimatedControls";
import { ArtworkData, useInterval, useMapifiedData } from "./utils";
import { Scene } from "../Scene";
import { OrbitControls as OrbitControlsPrim } from "three-stdlib";

const defaultPos: [number, number, number] = [0,0,2]

function CameraSetter({cameraRef}) {
    const { camera } = useThree()
    useEffect(()=>{
        if (cameraRef) {
            cameraRef.current = camera
        }
    }
    , [cameraRef])
    return null
}

export function ArtworkGlobeUI({targetCameraPosition=defaultPos, data, cameraRef}:{targetCameraPosition?: [number, number, number], data: ArtworkData, cameraRef?: React.MutableRefObject<THREE.PerspectiveCamera | undefined>}) {
    const [inAnimation, setInAnimation] = useState(false);
    useEffect(()=>{
        setInAnimation(true);
    }, [targetCameraPosition])
    return (
        <Canvas className="w-full h-full">
            <Scene data={data}/>
            <CameraSetter cameraRef={cameraRef}/>
            {inAnimation ? <AnimatedControls targetPosition={targetCameraPosition} onFinish={()=>{setInAnimation(false)}}/> : <OrbitControlsModified minDistance={1.07} maxDistance={2} rotateSpeed={0.25}/>}
            {/* <OrbitControlsHotfix orbitRef={orbitRef}/> */}
        </Canvas>
    )
}

function OrbitControlsModified({minDistance, maxDistance, rotateSpeed}:{minDistance: number, maxDistance: number, rotateSpeed: number}) {
    const orbitRef = useRef<OrbitControlsPrim>();
    const camera = useThree((c)=>c.camera);
    useFrame(()=>{
        if(orbitRef.current) {
            // Since we are viewing a globe at origin, update rotateSpeed as a function of distance from origin. The surface is at the distance of 1.
            orbitRef.current.rotateSpeed = (camera.position.length() - 1) * rotateSpeed;
            // Similar for zoomSpeed
            orbitRef.current.zoomSpeed = (camera.position.length()) ** 2 * 0.05;
        }
    })
    return (
        <OrbitControls maxDistance={maxDistance} minDistance={minDistance} zoomSpeed={0.1} enablePan={false} rotateSpeed={0.5} screenSpacePanning={false} ref={orbitRef}/>
    )
}