import { createContext, useContext, useState } from "react";

const Pallete =  createContext()

export const PalleteProvider =  ({children}) =>{
    const [open,setOpen] = useState(false)
    const [pallete,setPallete] = useState({
        color:{
            "hsl": {
                "h": 155.87628865979383,
                "s": 0,
                "l": 0,
                "a": 1
            },
            "hex": "#000000",
            "rgb": {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 1
            },
            "hsv": {
                "h": 155.87628865979383,
                "s": 0,
                "v": 0,
                "a": 1
            },
            "oldHue": 155.87628865979383,
            "source": "hex"
        },
        strokeWidth:1
    })
    const changePallete = (type,value) =>{
       setPallete(prev=>( {...prev, [type]:value}))
    }
    return (
        <Pallete.Provider value={{open, setOpen, pallete, changePallete}}>
            {children}
        </Pallete.Provider>
    )
}

const usePallete = () =>{
    return useContext(Pallete)
}

export default usePallete
