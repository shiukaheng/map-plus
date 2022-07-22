import dataURL from '../exported/combined.json?url'
import { ArtworkGlobeUI } from './components/ArtworkGlobeUI'
import { useMapifiedData } from './components/utils'

export default function App() {
    const data = useMapifiedData(dataURL)
    return (
        <div className="absolute w-full h-full bg-black text-white">
            {/* <div className='absolute w-full h-full z-10 pointer-events-none p-8 md:p-16'>
                <div className='text-6xl'>
                    MAP+
                </div>
            </div> */}
            <ArtworkGlobeUI data={data}/>
        </div>
    )
}