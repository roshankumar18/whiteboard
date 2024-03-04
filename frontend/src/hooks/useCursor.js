import { useEffect, useState } from "react";
import useSocket from "./useSocket";

const useCursor = () => {
  const { socket } = useSocket();
  const [cursors, setCursors] = useState([]);
  useEffect(() => {
    if (!socket) return;
    if (!localStorage.getItem("roomUuid")) return;

    let roomId = localStorage
      .getItem("roomUuid")
      .split("/")
      .pop()
      .replace('"', "");

    const mouseMovehandler = ({ clientX, clientY }) => {
      socket.emit("updateCursor", roomId, { clientX, clientY });
    };
    document.addEventListener("mousemove", mouseMovehandler);
    return () => {
      document.removeEventListener("mousemove", mouseMovehandler);
    };
  });
  useEffect(() => {
    if (!socket) return;
    const handleUpdateCursor = (cursor) => {
      const _cursors = Object.keys(cursor)
        .filter((value) => value != socket.id)
        .filter((value) => cursor[value].cursor)
        .map((value) => ({ [value]: cursor[value] }));
      setCursors(_cursors);
    };

    socket.on("updateCursor", handleUpdateCursor);
    return () => {
      socket.off("updateCursor", handleUpdateCursor);
    };
  }, [socket]);

  return { cursors };
};

export default useCursor;
