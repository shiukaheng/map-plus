import { Fragment } from "react";
import { ArtworkGlobe } from "./components/Artworks";

export function Scene() {
    return (
        <Fragment>
            <ambientLight/>
            <fog attach="fog" color="black" near={1} far={5}/>
            <ArtworkGlobe/>
            <mesh>
                <boxGeometry attach="geometry" args={[1, 1, 1]}/>
                <meshStandardMaterial attach="material" color="red"/>
            </mesh>
        </Fragment>
    )
}