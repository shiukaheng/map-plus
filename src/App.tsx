import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

export function App() {
    return (
        <div className="absolute w-full h-full bg-black">
            <Canvas className="w-full h-full">
                <OrbitControls/>
                <Scene/>
            </Canvas>
        </div>
    )
}