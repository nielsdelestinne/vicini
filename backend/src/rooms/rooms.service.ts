import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './interfaces/room.interface';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  findAll(): Room[] {
    return Array.from(this.rooms.values());
  }

  findOne(id: string): Room {
    const room = this.rooms.get(id);
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  create(createRoomDto: CreateRoomDto): Room {
    const id = uuidv4();
    const newRoom: Room = {
      id,
      name: createRoomDto.name,
      users: [],
      createdAt: new Date(),
    };

    this.rooms.set(id, newRoom);
    return newRoom;
  }

  joinRoom(id: string, username: string): Room {
    const room = this.findOne(id);
    
    // Add user if not already in the room
    if (!room.users.includes(username)) {
      room.users.push(username);
    }
    
    return room;
  }

  leaveRoom(id: string, username: string): Room {
    const room = this.findOne(id);
    
    // Remove user from room
    room.users = room.users.filter(user => user !== username);
    
    return room;
  }
}
