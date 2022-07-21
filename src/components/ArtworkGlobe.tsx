import dataURL from '../../exported/combined.json?url'
import { useState, Fragment, useRef, useEffect } from 'react'
import { useMapifiedData } from './utils'
import { ArtworkPreviewPoints } from './Artworks/ArtworkPreviewPoints'
import { ArtworkDetails } from './Artworks/ArtworkDetails'
import DistanceWorker from "./workers/distanceHelper?worker"
import { useThree } from '@react-three/fiber'

function DistanceCalculator({data, setDistancesArray}) {
    const workerRef = useRef<Worker>()
    const camera = useThree((context) => context.camera)
    useEffect(()=>{
        workerRef.current = new DistanceWorker() as Worker
        workerRef.current.postMessage({
            "type": "updatePoints",
            "data": {
                x: data["mapify_x"],
                y: data["mapify_y"],
                z: data["mapify_z"],
            }
        })
        workerRef.current.onmessage = (e)=>{
            // On message, print the message
            const distances: [number, number][] = e.data.data
            setDistancesArray(distances)
            // const dt = e.data.dt
            const query = camera.position.clone().normalize().toArray()
            workerRef.current?.postMessage({
                "type": "updateQueryPoint",
                "data": query
            })
        }
        return ()=>{
            if (workerRef.current) {
                workerRef.current.terminate()
            }
        }
    }, [])
    return null
}

export function ArtworkGlobe() {
    // Build geometry from points
    const data = useMapifiedData(dataURL)// points is a parsed JSON object
    const [visibleArtworkIndices, setVisibleArtworkIndices] = useState<number[]>([])
    const [distancesArray, setDistancesArray] = useState<[number, number][] | null>(null)
    return (
        <Fragment>
            <group>
                {/* <ArtworkDetails data={data}/> */}
                <ArtworkPreviewPoints data={data}/>
                <DistanceCalculator data={data} setDistancesArray={setDistancesArray}/>
            </group>
        </Fragment>
    )
}