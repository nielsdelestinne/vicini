import { Module } from '@nestjs/common';
import { GridController } from './grid.controller';
import { GridService } from './grid.service';

@Module({
  controllers: [GridController],
  providers: [GridService],
  exports: [GridService],
})
export class GridModule {}
