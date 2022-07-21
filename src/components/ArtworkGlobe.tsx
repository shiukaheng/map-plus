import dataURL from '../../exported/combined.json?url'
import { useState, Fragment } from 'react'
import { useMapifiedData } from './utils'
import { ArtworkPreviewPoints } from './Artworks/ArtworkPreviewPoints'
import { ArtworkDetails } from './Artworks/ArtworkDetails'

export function ArtworkGlobe() {
    // Build geometry from points
    const data = useMapifiedData(dataURL)// points is a parsed JSON object
    const [visibleArtworkIndices, setVisibleArtworkIndices] = useState<number[]>([])
    // useEffect(()=>{
    //     setVisibleArtworkIndices(sampleFromArray(Object.keys(data["id"]), 500))
    // }, [])
    return (
        <Fragment>
            <group>
                <ArtworkDetails data={data}/>
                <ArtworkPreviewPoints data={data}/>
            </group>
        </Fragment>
    )
}