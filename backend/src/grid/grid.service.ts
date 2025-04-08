import { Injectable, NotFoundException } from '@nestjs/common';
import { Cell } from './interfaces/cell.interface';

@Injectable()
export class GridService {
  private grids: Map<string, Cell[]> = new Map();

  getGridState(roomId: string): Cell[] {
    if (!this.grids.has(roomId)) {
      this.grids.set(roomId, []);
    }
    return this.grids.get(roomId);
  }

  claimCell(roomId: string, x: number, y: number, username: string): Cell {
    const grid = this.getGridState(roomId);
    
    // Check if cell is already claimed
    const existingCellIndex = grid.findIndex(
      cell => cell.x === x && cell.y === y,
    );
    
    if (existingCellIndex !== -1) {
      // Cell exists, update it
      const cell = grid[existingCellIndex];
      
      // If cell is already claimed by someone else, throw error
      if (cell.userId && cell.username !== username) {
        throw new Error('Cell is already claimed by another user');
      }
      
      // Update cell
      cell.userId = username;
      cell.username = username;
      return cell;
    } else {
      // Cell doesn't exist, create it
      const newCell: Cell = {
        x,
        y,
        userId: username,
        username,
      };
      
      grid.push(newCell);
      return newCell;
    }
  }

  releaseCell(roomId: string, x: number, y: number): Cell {
    const grid = this.getGridState(roomId);
    
    // Find cell
    const cellIndex = grid.findIndex(cell => cell.x === x && cell.y === y);
    
    if (cellIndex === -1) {
      throw new NotFoundException(`Cell at position (${x}, ${y}) not found`);
    }
    
    // Release cell
    const cell = grid[cellIndex];
    cell.userId = null;
    cell.username = null;
    
    return cell;
  }

  getAdjacentCells(roomId: string, x: number, y: number): Cell[] {
    const grid = this.getGridState(roomId);
    
    return grid.filter(
      cell =>
        cell.userId !== null &&
        Math.abs(cell.x - x) <= 1 &&
        Math.abs(cell.y - y) <= 1 &&
        !(cell.x === x && cell.y === y),
    );
  }
}
