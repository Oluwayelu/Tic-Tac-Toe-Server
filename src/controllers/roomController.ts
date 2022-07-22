import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
  @OnMessage("join_game")
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { roomId: string; name: string }
  ) {
    console.log("New User joining room: ", message);

    const { roomId, name } = message;
    const connectedSockets = io.sockets.adapter.rooms.get(roomId);
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      await socket.join(roomId);
      socket.emit("room_joined");

      if (io.sockets.adapter.rooms.get(roomId).size === 2) {
        socket.emit("start_game", { start: true, symbol: "x" });
        socket.to(roomId).emit("start_game", { start: false, symbol: "o" });
      }
    }
  }

  @OnMessage("leave_game")
  public async leaveGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { roomId: string }
  ) {
    const { roomId } = message;
    console.log("Leaving room: ", roomId);

    await socket.leave(roomId);
    socket.emit("room_left");
    socket.to(roomId).emit("left_game", `${socket.id} left the room`);
  }
}

