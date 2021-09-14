import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from 'src/schemas/organization.schema';
import { FactModule } from '../fact/fact.module'
import { UserModule } from '@hilma/auth-mongo-nest';
@Module({
  imports: [MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema, collection: "organizations" }]), UserModule],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService]
})
export class OrganizationModule { }
