import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lobby-container">
      <header class="lobby-header">
        <h1>Welcome, {{ username }}</h1>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </header>
      
      <div class="lobby-content">
        <div class="create-room">
          <h2>Create a New Room</h2>
          <form (ngSubmit)="createRoom()" #roomForm="ngForm">
            <div class="form-group">
              <label for="roomName">Room Name</label>
              <input 
                type="text" 
                id="roomName" 
                name="roomName" 
                [(ngModel)]="newRoomName" 
                required 
                minlength="3"
                placeholder="Enter room name"
                #roomNameInput="ngModel">
              
              <div *ngIf="roomNameInput.invalid && (roomNameInput.dirty || roomNameInput.touched)" class="error-message">
                <div *ngIf="roomNameInput.errors?.['required']">Room name is required.</div>
                <div *ngIf="roomNameInput.errors?.['minlength']">Room name must be at least 3 characters long.</div>
              </div>
            </div>
            
            <button type="submit" [disabled]="roomForm.invalid">Create Room</button>
          </form>
        </div>
        
        <div class="available-rooms">
          <h2>Available Rooms</h2>
          
          <div *ngIf="loading" class="loading">
            Loading rooms...
          </div>
          
          <div *ngIf="!loading && rooms.length === 0" class="no-rooms">
            No rooms available. Create one to get started!
          </div>
          
          <ul class="room-list" *ngIf="!loading && rooms.length > 0">
            <li *ngFor="let room of rooms" class="room-item">
              <div class="room-info">
                <h3>{{ room.name }}</h3>
                <p>{{ room.users.length }} user(s) connected</p>
              </div>
              <button (click)="joinRoom(room.id)">Join Room</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .lobby-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .logout-btn {
      background-color: #f44336;
    }
    
    .logout-btn:hover {
      background-color: #d32f2f;
    }
    
    .lobby-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .lobby-content {
        grid-template-columns: 1fr;
      }
    }
    
    .create-room, .available-rooms {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .room-list {
      list-style: none;
      padding: 0;
    }
    
    .room-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .room-item:last-child {
      border-bottom: none;
    }
    
    .room-info h3 {
      margin: 0 0 0.25rem 0;
    }
    
    .room-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
    
    .loading, .no-rooms {
      padding: 1rem;
      text-align: center;
      color: #666;
    }
    
    .error-message {
      color: #d93025;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class LobbyComponent implements OnInit {
  username: string = '';
  rooms: Room[] = [];
  newRoomName: string = '';
  loading: boolean = true;
  
  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser;
      this.loadRooms();
    } else {
      this.router.navigate(['/login']);
    }
  }
  
  loadRooms(): void {
    this.loading = true;
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.loading = false;
      }
    });
  }
  
  createRoom(): void {
    if (this.newRoomName.trim()) {
      this.roomService.createRoom(this.newRoomName.trim()).subscribe({
        next: (room) => {
          this.joinRoom(room.id);
        },
        error: (error) => {
          console.error('Error creating room:', error);
        }
      });
    }
  }
  
  joinRoom(roomId: string): void {
    this.router.navigate(['/room', roomId]);
  }
  
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
