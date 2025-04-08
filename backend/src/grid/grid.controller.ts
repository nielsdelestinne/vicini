import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { GridService } from './grid.service';
import { ClaimCellDto } from './dto/claim-cell.dto';
import { ReleaseCellDto } from './dto/release-cell.dto';

@Controller('grid')
export class GridController {
  constructor(private readonly gridService: GridService) {}

  @Get(':roomId')
  getGridState(@Param('roomId') roomId: string) {
    return this.gridService.getGridState(roomId);
  }

  @Post(':roomId/claim')
  claimCell(
    @Param('roomId') roomId: string,
    @Body() claimCellDto: ClaimCellDto,
  ) {
    return this.gridService.claimCell(
      roomId,
      claimCellDto.x,
      claimCellDto.y,
      claimCellDto.username,
    );
  }

  @Post(':roomId/release')
  releaseCell(
    @Param('roomId') roomId: string,
    @Body() releaseCellDto: ReleaseCellDto,
  ) {
    return this.gridService.releaseCell(
      roomId,
      releaseCellDto.x,
      releaseCellDto.y,
    );
  }
}
