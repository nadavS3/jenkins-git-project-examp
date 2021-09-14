import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactService } from './fact.service';
import { Fact } from './fact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fact])],
  providers: [FactService],
  exports: [FactService]
})
export class FactModule {}
