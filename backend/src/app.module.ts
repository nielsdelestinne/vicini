import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { GridModule } from './grid/grid.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [RoomsModule, GridModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
