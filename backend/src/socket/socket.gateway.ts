import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { GridService } from '../grid/grid.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to track which room and cell each socket is in
  private socketMap: Map<string, { roomId: string; username: string; x?: number; y?: number }> = new Map();

  constructor(
    private readonly roomsService: RoomsService,
    private readonly gridService: GridService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Clean up when a socket disconnects
    const socketData = this.socketMap.get(client.id);
    if (socketData) {
      const { roomId, username, x, y } = socketData;
      
      // Release cell if user was in one
      if (x !== undefined && y !== undefined) {
        try {
          this.gridService.releaseCell(roomId, x, y);
          
          // Notify other clients about the grid update
          this.server.to(roomId).emit('gridUpdated', {
            roomId,
            cells: this.gridService.getGridState(roomId),
          });
        } catch (error) {
          console.error('Error releasing cell:', error);
        }
      }
      
      // Remove user from room
      try {
        const updatedRoom = this.roomsService.leaveRoom(roomId, username);
        
        // Notify other clients about the room update
        this.server.to(roomId).emit('roomUpdated', updatedRoom);
        this.server.to(roomId).emit('userLeft', { username, roomId });
      } catch (error) {
        console.error('Error leaving room:', error);
      }
      
      // Remove from socket map
      this.socketMap.delete(client.id);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { roomId: string; username: string }) {
    const { roomId, username } = payload;
    
    // Join socket.io room
    client.join(roomId);
    
    // Track socket in map
    this.socketMap.set(client.id, { roomId, username });
    
    // Notify other clients
    this.server.to(roomId).emit('userJoined', { username, roomId });
    
    // Send updated room info
    try {
      const room = this.roomsService.findOne(roomId);
      this.server.to(roomId).emit('roomUpdated', room);
    } catch (error) {
      console.error('Error finding room:', error);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: { roomId: string; username: string }) {
    const { roomId, username } = payload;
    
    // Leave socket.io room
    client.leave(roomId);
    
    // Remove from socket map
    this.socketMap.delete(client.id);
    
    // Update room in service
    try {
      const updatedRoom = this.roomsService.leaveRoom(roomId, username);
      
      // Notify other clients
      this.server.to(roomId).emit('roomUpdated', updatedRoom);
      this.server.to(roomId).emit('userLeft', { username, roomId });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  @SubscribeMessage('claimCell')
  handleClaimCell(
    client: Socket,
    payload: { roomId: string; x: number; y: number; username: string },
  ) {
    const { roomId, x, y, username } = payload;
    
    try {
      // Claim cell in service
      const updatedCell = this.gridService.claimCell(roomId, x, y, username);
      
      // Update socket map with cell position
      const socketData = this.socketMap.get(client.id);
      if (socketData) {
        socketData.x = x;
        socketData.y = y;
      }
      
      // Get adjacent cells to check for call connections
      const adjacentCells = this.gridService.getAdjacentCells(roomId, x, y);
      
      // Notify all clients in room about grid update
      this.server.to(roomId).emit('gridUpdated', {
        roomId,
        cells: this.gridService.getGridState(roomId),
      });
    } catch (error) {
      console.error('Error claiming cell:', error);
    }
  }

  @SubscribeMessage('releaseCell')
  handleReleaseCell(
    client: Socket,
    payload: { roomId: string; x: number; y: number; username: string },
  ) {
    const { roomId, x, y } = payload;
    
    try {
      // Release cell in service
      this.gridService.releaseCell(roomId, x, y);
      
      // Update socket map to remove cell position
      const socketData = this.socketMap.get(client.id);
      if (socketData) {
        delete socketData.x;
        delete socketData.y;
      }
      
      // Notify all clients in room about grid update
      this.server.to(roomId).emit('gridUpdated', {
        roomId,
        cells: this.gridService.getGridState(roomId),
      });
    } catch (error) {
      console.error('Error releasing cell:', error);
    }
  }
}
