import { useThree } from "@react-three/fiber";
import { Fragment } from "react";
import { ArtworkGlobe } from "./components/ArtworkGlobe";
import { ArtworkData } from "./components/utils";

export function Scene({data}:{data: ArtworkData}) {
    useThree(({camera}) => {
        camera.near = 0.00001;
        camera.updateProjectionMatrix();
    })
    return (
        <Fragment>
            <ambientLight/>
            <fog attach="fog" color="black" near={1} far={2.5}/>
            <ArtworkGlobe data={data}/>
        </Fragment> 
    )
}