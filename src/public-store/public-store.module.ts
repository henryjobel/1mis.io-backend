import { Module } from '@nestjs/common';
import { PublicStoreController } from './public-store.controller';
import { PublicStoreService } from './public-store.service';

@Module({
  controllers: [PublicStoreController],
  providers: [PublicStoreService],
})
export class PublicStoreModule {}
