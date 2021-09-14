import { TypeOrmModuleOptions , TypeOrmOptionsFactory} from '@nestjs/typeorm';
import { secret } from './utils/awsSecretsManager'
import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
  } from '@nestjs/mongoose';
  
var mongoConnect: string;
var secretpriv: secret;

export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: secretpriv.digitalOrientationMysql.host,
      port: secretpriv.digitalOrientationMysql.port,
      username: secretpriv.digitalOrientationMysql.username,
      password: secretpriv.digitalOrientationMysql.password,
      database: secretpriv.digitalOrientationMysql.dbname,
      entities: [ 
         "dist/**/*.entity{.ts,.js}",
         "node_modules/@hilma/auth-mongo-nest/dist/**/*.entity{.ts,.js}"
        ],
      ssl: true,
      synchronize: process.env.NODE_ENV === 'production' ? false : true,
      logging: false
    };
  }
}

export class ConfigMongoose implements MongooseOptionsFactory {
    createMongooseOptions(): MongooseModuleOptions {
      return {
        uri: mongoConnect,
        useCreateIndex: true,
      };
    }
  }
  export const setOrm = (secretObj: secret, useSRV: boolean)=>{
    secretpriv = secretObj;
    mongoConnect = useSRV?'mongodb+srv://':'mongodb://'
    let host = useSRV?  secretObj.digitalOrientationMongo.host
                     :   secretObj.digitalOrientationMongo.host+ ':' + secretObj.digitalOrientationMongo.port;
    if (secretObj.digitalOrientationMongo.username && secretObj.digitalOrientationMongo.password){
        mongoConnect += secretObj.digitalOrientationMongo.username + ':' + secretObj.digitalOrientationMongo.password +'@'  
    }
    mongoConnect += host +'/' + secretObj.digitalOrientationMongo.dbname + "?retryWrites=true&w=majority"
    console.log(mongoConnect);
    
  }
  

// import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { Fact } from "./fact/fact.entity";
// const envfile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
// require('dotenv').config({ path: envfile })

// export const DbConfig: TypeOrmModuleOptions = {
//     type: "mysql",
//     host: process.env.DB_SQL_HOST || 'localhost',
//     port: 3306,
//     username: process.env.DB_SQL_USER || 'root',
//     password: process.env.DB_SQL_PASSWORD || 'z10mz10m',
//     database: "digitalOrientation",
//     entities: [Fact],
//     ssl: true,
//     synchronize: process.env.NODE_ENV === 'production' ? false : true,
//     logging: false
// }