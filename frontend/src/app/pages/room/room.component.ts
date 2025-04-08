import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { RoomService } from '../../services/room.service';
import { GridService } from '../../services/grid.service';
import { SocketService } from '../../services/socket.service';
import { CallService } from '../../services/call.service';
import { Room } from '../../models/room.model';
import { Cell } from '../../models/cell.model';
import { GridComponent } from '../../components/grid/grid.component';
import { VideoCallComponent } from '../../components/video-call/video-call.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, GridComponent, VideoCallComponent],
  template: `
    <div class="room-container">
      <header class="room-header">
        <div class="room-info">
          <h1>{{ room?.name || 'Loading...' }}</h1>
          <p *ngIf="room">{{ room.users.length }} user(s) connected</p>
        </div>
        <div class="room-actions">
          <button class="back-btn" (click)="goToLobby()">Back to Lobby</button>
        </div>
      </header>
      
      <div class="room-content">
        <div class="grid-container">
          <app-grid 
            [cells]="cells" 
            [username]="username"
            (cellClick)="onCellClick($event)">
          </app-grid>
        </div>
        
        <div class="call-container" *ngIf="inCall">
          <app-video-call></app-video-call>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .room-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    
    .room-info h1 {
      margin: 0 0 0.25rem 0;
    }
    
    .room-info p {
      margin: 0;
      color: #666;
    }
    
    .back-btn {
      background-color: #757575;
    }
    
    .back-btn:hover {
      background-color: #616161;
    }
    
    .room-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 1rem;
    }
    
    .grid-container {
      flex: 1;
      min-height: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      overflow: hidden;
    }
    
    .call-container {
      height: 200px;
      background: #f5f5f5;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
    }
    
    @media (min-width: 992px) {
      .room-content {
        flex-direction: row;
      }
      
      .grid-container {
        flex: 2;
      }
      
      .call-container {
        flex: 1;
        height: auto;
      }
    }
  `]
})
export class RoomComponent implements OnInit, OnDestroy, AfterViewInit {
  roomId: string = '';
  username: string = '';
  room: Room | null = null;
  cells: Cell[] = [];
  inCall: boolean = false;
  currentCell: Cell | null = null;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roomService: RoomService,
    private gridService: GridService,
    private socketService: SocketService,
    private callService: CallService
  ) {}
  
  ngOnInit(): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.username = currentUser;
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.roomId = id;
        this.loadRoom();
        this.loadGrid();
        this.setupSocketListeners();
        this.joinRoom();
      } else {
        this.router.navigate(['/lobby']);
      }
    });
  }
  
  ngAfterViewInit(): void {
    // Initialize call service
    this.callService.initLocalStream().catch(error => {
      console.error('Failed to initialize local stream:', error);
    });
  }
  
  ngOnDestroy(): void {
    this.leaveRoom();
    this.socketService.disconnect();
    this.callService.stopLocalStream();
    this.callService.closeAllPeerConnections();
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadRoom(): void {
    this.roomService.getRoom(this.roomId).subscribe({
      next: (room) => {
        this.room = room;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.router.navigate(['/lobby']);
      }
    });
  }
  
  loadGrid(): void {
    this.gridService.getGridState(this.roomId).subscribe({
      next: (cells) => {
        this.cells = cells;
        this.checkIfInCall();
      },
      error: (error) => {
        console.error('Error loading grid:', error);
      }
    });
  }
  
  setupSocketListeners(): void {
    // Connect to socket
    this.socketService.connect();
    
    // Listen for grid updates
    const gridSub = this.socketService.onGridUpdated().subscribe(data => {
      if (data.roomId === this.roomId) {
        this.cells = data.cells;
        this.checkIfInCall();
      }
    });
    
    // Listen for room updates
    const roomSub = this.socketService.onRoomUpdated().subscribe(data => {
      if (data.id === this.roomId) {
        this.room = data;
      }
    });
    
    this.subscriptions.push(gridSub, roomSub);
  }
  
  joinRoom(): void {
    this.roomService.joinRoom(this.roomId, this.username).subscribe({
      next: () => {
        this.socketService.joinRoom(this.roomId, this.username);
      },
      error: (error) => {
        console.error('Error joining room:', error);
      }
    });
  }
  
  leaveRoom(): void {
    if (this.currentCell) {
      this.gridService.releaseCell(this.roomId, this.currentCell.x, this.currentCell.y).subscribe();
      this.socketService.releaseCell(this.roomId, this.currentCell.x, this.currentCell.y, this.username);
    }
    
    this.socketService.leaveRoom(this.roomId, this.username);
  }
  
  onCellClick(cell: { x: number, y: number }): void {
    // If already in this cell, do nothing
    if (this.currentCell && this.currentCell.x === cell.x && this.currentCell.y === cell.y) {
      return;
    }
    
    // Release current cell if any
    if (this.currentCell) {
      this.gridService.releaseCell(this.roomId, this.currentCell.x, this.currentCell.y).subscribe();
      this.socketService.releaseCell(this.roomId, this.currentCell.x, this.currentCell.y, this.username);
    }
    
    // Claim new cell
    this.gridService.claimCell(this.roomId, cell.x, cell.y, this.username).subscribe({
      next: (updatedCell) => {
        this.currentCell = updatedCell;
        this.socketService.claimCell(this.roomId, cell.x, cell.y, this.username);
      },
      error: (error) => {
        console.error('Error claiming cell:', error);
      }
    });
  }
  
  checkIfInCall(): void {
    if (!this.currentCell) {
      this.inCall = false;
      return;
    }
    
    // Find adjacent cells with users
    const adjacentCells = this.cells.filter(cell => {
      if (!cell.userId || cell.userId === this.username) return false;
      
      // Check if cell is adjacent to current cell
      return (
        (Math.abs(cell.x - this.currentCell!.x) <= 1 && Math.abs(cell.y - this.currentCell!.y) <= 1) &&
        !(cell.x === this.currentCell!.x && cell.y === this.currentCell!.y)
      );
    });
    
    this.inCall = adjacentCells.length > 0;
  }
  
  goToLobby(): void {
    this.router.navigate(['/lobby']);
  }
}
