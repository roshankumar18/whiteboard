import React, { useEffect, useState, memo, useRef } from "react";
import Draggable, { DraggableCore } from "react-draggable";
import "./style.css";
import useSocket from "../../hooks/useSocket";
import { MessageSquare, X } from "lucide-react";
const Chat = ({ setToggle }) => {
  const [chats, setChats] = useState(() => {
    const storedChats = sessionStorage.getItem("chats");
    return storedChats ? JSON.parse(storedChats) : [];
  });
  const [inputValue, setInputValue] = useState();
  const messageEnd = useRef();
  const inputRef = useRef();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handlerecieveMessage = (message) => {
      setChats((chats) => [...chats, message]);
    };
    socket.on("receiveMessage", handlerecieveMessage);
    return () => {
      socket.off("receiveMessage", handlerecieveMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (!messageEnd.current) return;
    messageEnd.current.scrollIntoView({ behaviour: "smooth" });
  }, [chats, messageEnd]);

  useEffect(() => {
    // const store = sessionStorage.getItem("chats");
    // const storeChats =  store ? JSON.parse(store) : [];
    // console.log(chats)
    // storeChats.push(chats)
    sessionStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (!inputRef) return;
    inputRef.current.focus();
  }, [inputRef.current]);

  const onChange = (e) => {
    setInputValue(e.target.value);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (inputValue === "") return;
      const name = JSON.parse(localStorage.getItem("roomUuid"))?.name || "";
      const message = {
        id: socket.id,
        chat: inputValue,
      };
      setChats((prev) => [...prev, message]);
      setInputValue("");
      message.name = name;
      const roomId = JSON.parse(localStorage.getItem("roomUuid"))
        .id.split("/")
        .pop()
        .replace('"', "");

      socket.emit("sendMessage", roomId, message);
    }
  };

  function chat({ id, chat, name }) {
    let style = "";
    let nameStyle = "";
    if (id === socket.id) {
      style = { alignSelf: "flex-end" };
      nameStyle = { "justify-content": "flex-end" };
      name = "You";
    } else {
      style = { alignSelf: "flex-start" };
      nameStyle = { "justify-content": "flex-start" };
    }
    console.log(id, chat);
    return (
      <div style={style} className="chat">
        {name && (
          <div style={nameStyle} className="name">
            {name}
          </div>
        )}
        {chat}
      </div>
    );
  }
  return (
    <Draggable>
      <div className="chat-container">
        <div className="chat-header">
          <MessageSquare />
          <div>Chat Window</div>
          <X
            style={{ alignSelf: "flex-end" }}
            onClick={() => setToggle((prev) => !prev)}
          />
        </div>
        <div className="chats">
          {chats.length > 0 &&
            chats.map((value) => {
              return chat(value);
            })}
          <div ref={messageEnd} />
        </div>
        <div className="input-container">
          <input
            className="input"
            ref={inputRef}
            value={inputValue}
            onKeyDown={onKeyDown}
            onChange={onChange}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default memo(Chat);
