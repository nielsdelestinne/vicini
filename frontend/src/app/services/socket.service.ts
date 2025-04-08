import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl);
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  joinRoom(roomId: string, username: string): void {
    this.socket.emit('joinRoom', { roomId, username });
  }

  leaveRoom(roomId: string, username: string): void {
    this.socket.emit('leaveRoom', { roomId, username });
  }

  claimCell(roomId: string, x: number, y: number, username: string): void {
    this.socket.emit('claimCell', { roomId, x, y, username });
  }

  releaseCell(roomId: string, x: number, y: number, username: string): void {
    this.socket.emit('releaseCell', { roomId, x, y, username });
  }

  onRoomUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('roomUpdated', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off('roomUpdated');
      };
    });
  }

  onGridUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('gridUpdated', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off('gridUpdated');
      };
    });
  }

  onUserJoined(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('userJoined', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off('userJoined');
      };
    });
  }

  onUserLeft(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('userLeft', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off('userLeft');
      };
    });
  }
}
