import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import configuration from './config/configuration';

import { AppService } from './app.service';

//tables
import { MyUserModule } from './my-user/my-user.module';
import { OrganizationModule } from './organization/organization.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { UserAnswerModule } from './userAnswer/userAnswer.module';
import { QuestionCategoryModule } from './questionCategory/questionCategory.module';
import { FilesHandlerModule } from '@hilma/fileshandler-server';

import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { FactModule } from './fact/fact.module';
import { Fact } from './fact/fact.entity';
import { TypeOrmConfigService,ConfigMongoose } from './ormconfig';

const envfile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
require('dotenv').config({ path: envfile })

const server = "127.0.0.1:27017";
const database = "digitalOrientation";
const mongoUser = process.env.DATABASE_USER && process.env.DATABASE_PASS ? `${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@` : '';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: ConfigMongoose,
    }),
    
    
    // MongooseModule.forRoot(`mongodb://${mongoUser}${server}/${database}`, { useCreateIndex: true }),
    MyUserModule,
    OrganizationModule,
    QuestionnaireModule,
    UserAnswerModule,
    QuestionCategoryModule,
    FilesHandlerModule.register({
      folder: "../../uploads",
      autoAllow: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../client', 'build'),renderPath:"/"
    }),
    AdminModule,
    FactModule,
  ],
  
  //  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
