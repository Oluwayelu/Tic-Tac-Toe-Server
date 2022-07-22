import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

import { GameController, MainController, RoomController } from "./controllers";

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  useSocketServer(io, {
    controllers: [GameController, MainController, RoomController],
  });

  return io;
};
