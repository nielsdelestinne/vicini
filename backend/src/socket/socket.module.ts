import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { RoomsModule } from '../rooms/rooms.module';
import { GridModule } from '../grid/grid.module';

@Module({
  imports: [RoomsModule, GridModule],
  providers: [SocketGateway],
})
export class SocketModule {}
