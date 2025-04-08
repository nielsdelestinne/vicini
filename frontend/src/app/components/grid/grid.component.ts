import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cell } from '../../models/cell.model';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-wrapper">
      <div class="grid" [style.grid-template-columns]="gridTemplateColumns">
        <div 
          *ngFor="let cell of gridCells" 
          class="cell"
          [class.occupied]="cell.userId !== null"
          [class.my-cell]="cell.username === username"
          [style.background-color]="getCellColor(cell)"
          (click)="onCellClick(cell)">
          <div *ngIf="cell.username" class="username">{{ cell.username }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid-wrapper {
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 1rem;
    }
    
    .grid {
      display: grid;
      gap: 4px;
      width: max-content;
      min-width: 100%;
      min-height: 100%;
    }
    
    .cell {
      width: 100px;
      height: 100px;
      background-color: #f0f0f0;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }
    
    .cell:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .occupied {
      background-color: #e0e0e0;
    }
    
    .my-cell {
      border: 2px solid #4285f4;
    }
    
    .username {
      position: absolute;
      bottom: 5px;
      left: 5px;
      right: 5px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 2px 5px;
      border-radius: 2px;
      font-size: 12px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class GridComponent implements OnChanges {
  @Input() cells: Cell[] = [];
  @Input() username: string = '';
  @Output() cellClick = new EventEmitter<{ x: number, y: number }>();
  
  gridSize = 10; // Default grid size
  gridCells: Cell[] = [];
  gridTemplateColumns = '';
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cells']) {
      this.initializeGrid();
    }
  }
  
  initializeGrid(): void {
    // Find the maximum x and y from existing cells
    let maxX = 0;
    let maxY = 0;
    
    this.cells.forEach(cell => {
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    });
    
    // Ensure grid is at least the default size
    this.gridSize = Math.max(this.gridSize, maxX + 1, maxY + 1);
    
    // Create grid template columns
    this.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    
    // Initialize grid cells
    this.gridCells = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // Find if this cell exists in the input cells
        const existingCell = this.cells.find(cell => cell.x === x && cell.y === y);
        
        if (existingCell) {
          this.gridCells.push(existingCell);
        } else {
          // Create empty cell
          this.gridCells.push({ x, y, userId: null, username: null });
        }
      }
    }
  }
  
  onCellClick(cell: Cell): void {
    // Only allow clicking on empty cells or the user's own cell
    if (cell.userId === null || cell.username === this.username) {
      this.cellClick.emit({ x: cell.x, y: cell.y });
    }
  }
  
  getCellColor(cell: Cell): string {
    if (!cell.userId) return '#f0f0f0';
    
    // Generate a color based on the userId for consistent colors per user
    const hash = this.hashCode(cell.userId);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  }
  
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
