import { createContext, useContext, useState } from "react";

const Tool = createContext()

export const ToolPovider = ({children}) =>{
    const [tools ,setTool] = useState({
        line:false,
        pencil:true,
        square:false,
        text:false
    })

    const toggle = (type) => {
        setTool((prevTools) => ({
          ...prevTools,
          line: type === 'line',
          pencil: type === 'pencil',
          square: type === 'square',
          text: type === 'text',
        }))
      }

      const reset = () =>{
         setTool({
            line:false,
            pencil:false,
            square:false,
            text:false
         })
      }
    return(
        <Tool.Provider value={{tools,toggle ,reset}}>
            {children}
        </Tool.Provider>
    )
}

const useTool = () =>{
    return useContext(Tool)
}

export default useTool