const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const mongoose = require("mongoose");
const docModel = require("./DocumentSchema");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to Database");
});

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_HOST_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["google-docs-clone-headers"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("room", (roomId) => {
    console.log("\t\tClient connected to room: " + roomId);
    socket.join(roomId);
    socket.to(roomId).emit("new-connection-to-room", {
      msg: "👀 Someone joined to view your document.",
      livecount: [...io.sockets.adapter.rooms.get(roomId)].length - 1,
    });
  });

  socket.on("get-document", async (id) => {
    let doc = await docModel.findOne({ doc: id });
    let data = "";
    if (doc) data = doc.body;
    socket.emit("get-document", data);
  });

  socket.on("document-changes", (data) => {
    const { id, delta } = data;
    socket.to(id).emit("document-changes", delta);
  });

  socket.on("save-document-db", async (response) => {
    const { id: docId, data } = response;
    try {
      await docModel.findOneAndUpdate(
        { doc: docId },
        {
          doc: docId,
          body: data,
        },
        {
          upsert: true,
          useFindAndModify: false,
        }
      );
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("This is just a socket server for my google docs clone project!");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
