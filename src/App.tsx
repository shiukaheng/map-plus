import dataURL from '../exported/combined.json?url'
import { ArtworkGlobeUI } from './components/ArtworkGlobeUI'
import { useMapifiedData } from './components/utils'
import { useMemo, useRef, useState } from 'react';

export default function App() {
    const data = useMapifiedData(dataURL)
    const cameraRef = useRef<THREE.PerspectiveCamera>()
    const searchBoxData = useMemo(()=>{
        // Return [{key: <data["id"][i]>, value: <data["title"][i]>}]
        return data["id"].map((id, i)=>({value: id, name: data["title"][i]}))
    }, [data])
    const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0,0,2])
    return (
        <div className="absolute w-full h-full bg-black text-white">
            <div className='absolute w-full h-full z-10 pointer-events-none p-8 md:p-16'>
                <div className="flex flex-row gap-4">
                    <button className='pointer-events-auto border text-lg border-white p-2 px-4 rounded-full font-sans' onClick={()=>{
                        if (cameraRef.current) {
                            setCameraPosition(cameraRef.current.position.clone().multiplyScalar(-1).toArray())
                        }
                    }}>
                        antipode
                    </button>
                </div>
                
            </div>
            <ArtworkGlobeUI data={data} cameraRef={cameraRef} targetCameraPosition={cameraPosition}/>
        </div>
    )
}