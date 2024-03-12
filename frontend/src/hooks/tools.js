import { createContext, useContext, useState } from "react";

const Tool = createContext();

export const ToolPovider = ({ children }) => {
  const [tools, setTool] = useState({
    line: false,
    pencil: false,
    square: false,
    text: false,
    ellipse: false,
    select: true,
    erase: false,
  });

  const toggle = (type) => {
    setTool((prevTools) => ({
      ...prevTools,
      line: type === "line",
      pencil: type === "pencil",
      square: type === "square",
      text: type === "text",
      ellipse: type === "ellipse",
      select: type === "select",
      erase: type === "erase",
    }));
  };

  const reset = () => {
    setTool({
      line: false,
      pencil: false,
      square: false,
      text: false,
      ellipse: false,
      erase: false,
      select: true,
    });
  };
  return (
    <Tool.Provider value={{ tools, toggle, reset }}>{children}</Tool.Provider>
  );
};

const useTool = () => {
  return useContext(Tool);
};

export default useTool;
