import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common';
import { getSecrets, secret } from './utils/awsSecretsManager';
import { setOrm } from './ormconfig';

const envfile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
require('dotenv').config({ path: envfile })

// mongoose for debugging pusposes
// import * as mongoose from 'mongoose';

async function bootstrap() {
  console.log("LISTEN ON PORT:", process.env.PORT)
  const config : {secret: secret, useSRV: boolean} =  process.env.AWS_SECRET_MANAGER?
  {secret: await getSecrets(['digitalOrientationMysql', 'digitalOrientationMongo']), useSRV:true}:
  {secret: {
    digitalOrientationMysql: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD, 
      engine: 'mysql', 
      host: process.env.DB_HOST, 
      port: 3306, 
      dbname:process.env.DB_NAME
    },
    digitalOrientationMongo: {
      username: process.env.MDB_USER,
      password: process.env.MDB_PASSWORD,
      engine: "mongodb",
      host: process.env.MDB_HOST,
      port: 27017,
      dbname: process.env.MDB_DB_NAME  
    }
  }, useSRV: false};

  setOrm( config.secret, config.useSRV);
  console.log(config);
  
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe());
  console.log("LISTEN ON PORT:", process.env.PORT)
  // mongoose.set('debug', true); // mongoose for debugging pusposes
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
//!we need async await on all related mongodb methods

