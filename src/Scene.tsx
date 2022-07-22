import { useThree } from "@react-three/fiber";
import { Fragment } from "react";
import { ArtworkGlobe } from "./components/ArtworkGlobe";

export function Scene() {
    useThree(({camera}) => {
        camera.near = 0.00001;
        camera.updateProjectionMatrix();
    })
    return (
        <Fragment>
            <ambientLight/>
            <fog attach="fog" color="black" near={1} far={2.5}/>
            {/* <fogExp2 attach="fog" color="black" density={0.5}/> */}
            <ArtworkGlobe/>
            {/* <mesh>
                <boxGeometry attach="geometry" args={[1, 1, 1]}/>
                <meshStandardMaterial attach="material" color="red"/>
            </mesh> */}
        </Fragment> 
    )
}