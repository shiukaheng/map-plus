import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

export function App() {
    return (
        <div className="absolute w-full h-full bg-black">
            <Canvas className="w-full h-full">
                <OrbitControls maxDistance={2} minDistance={1.07} zoomSpeed={0.2} enablePan={false} rotateSpeed={0.5} screenSpacePanning={false}/>
                <Scene/>
            </Canvas>
        </div>
    )
}