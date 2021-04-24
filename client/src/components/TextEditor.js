import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Quill from "quill";
import {
  TOOLBAR_OPTIONS_CONFIG,
  SAVE_INTERVAL_TIMEOUT,
} from "../config/config";
import { toast } from "react-toastify";
import "quill/dist/quill.snow.css";

const TextEditor = () => {
  const [editor, setEditor] = useState();
  const [socket, setSocket] = useState();
  const { id } = useParams();
  const containerRef = useRef();
  const spanRef = useRef();
  console.log("Rendering");

  useEffect(() => {
    if (!containerRef || !containerRef.current) return null;

    // Setting up the editor
    containerRef.current.innerHTML = "";
    const editorcontainer = document.createElement("div");
    containerRef.current.append(editorcontainer);
    const q = new Quill(editorcontainer, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS_CONFIG,
      },
    });
    setEditor(q);

    // setting up the socket
    const s = io("https://my-google-docs-clone-backend.herokuapp.com/", {
      withCredentials: true,
      extraHeaders: {
        "google-docs-clone-headers": "header",
      },
    });

    s.on("connect", function () {
      s.emit("room", id);
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !editor) return null;

    const handler = function textChangeHandler(delta, oldDelta, source) {
      if (source === "user") {
        socket.emit("document-changes", { id, delta });
      }
    };

    socket.emit("get-document", id);
    socket.on("get-document", (data) => {
      editor.setText(data);
    });

    socket.on("document-changes", (data) => {
      editor.updateContents(data);
    });

    socket.on("new-connection-to-room", ({ msg, livecount }) => {
      spanRef.current.innerText = livecount;
      toast.dark(msg, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });

    editor.on("text-change", handler);
    return () => {
      editor.off("text-change", handler);
    };
  }, [socket, editor, id]);

  useEffect(() => {
    const _interval = setInterval(function () {
      if (!editor || !socket) return;

      const output_obj = { id, data: editor.getText() };
      socket.emit("save-document-db", output_obj);
    }, SAVE_INTERVAL_TIMEOUT);
    return () => {
      clearInterval(_interval);
    };
  }, [editor, socket]);

  return (
    <>
      <div id="floater">
        👀 Live View Count:{" "}
        <span id="live-count" ref={spanRef}>
          0
        </span>
      </div>
      <div className="container" ref={containerRef}></div>
    </>
  );
};

export default TextEditor;
