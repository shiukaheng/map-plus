import { Billboard, Image } from "@react-three/drei"
import { useMemo, useRef } from "react"

export function IndividualArtwork({data, index, visible=true}: {data: any, index: number, visible?: boolean}) {
    const {image_url, imagePosition, position} = useMemo(()=>{
        const actualPostion = [data["mapify_x"][index], data["mapify_y"][index], data["mapify_z"][index]] as [number, number, number]
        return {
            image_url: data["imageURL"][index],
            imagePosition: (actualPostion).map(x=>x*1.01),
            position: actualPostion
        }
    }, [data, index])
    const imageRef = useRef(null)
    // useEffect(()=>{
    //     if(imageRef.current){
    //         imageRef.current.material.depthTest = false
    //         imageRef.current.renderOrder = 100
    //     }
    // })
    return (
        ((image_url === null) || (image_url === undefined)) ? null : (
            <Billboard position={imagePosition} scale={0.1}>
                <Image url={image_url} ref={imageRef}/>
            </Billboard>
        )
    )
}