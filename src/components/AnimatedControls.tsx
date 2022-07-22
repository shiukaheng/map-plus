import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { useInterval } from "./utils";

const center = new Vector3(0, 0, 0);

export function AnimatedControls({onFinish, targetPosition}: {onFinish:()=>void, targetPosition: [number, number, number]}) {
    const {camera} = useThree();
    const finishedRef = useRef(false);
    // Use THREE.MathUtils.lerp to interpolate between the current position and the target position spherically
    // Use useFrame to update the position of the camera, and when position is equal to the target position, call the onFinish callback
    useFrame((state, dt)=>{
        camera.position.lerp(new Vector3(...targetPosition), dt * 2)
        camera.lookAt(center)
        // console.log(camera.position)
        if (camera.position.distanceTo(new Vector3(...targetPosition)) < 0.01) {
            if (!finishedRef.current) {
                finishedRef.current = true;
                onFinish();
            }
        }
    })
    return null;
}