import { Module } from '@nestjs/common';
import { jwtConstants, UserModule as BaseMongoUser, USER_MODULE_OPTIONS } from '@hilma/auth-mongo-nest';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt'

import { MyUserController } from './my-user.controller'
import { MyUserService } from './my-user.service';
import { MyUser, MyUserSchema } from '../schemas/my-user.schema';
import { FactModule } from '../fact/fact.module'
import { OrganizationModule } from 'src/organization/organization.module';




@Module({
    imports: [
        BaseMongoUser,
        MongooseModule.forFeature([{ name: MyUser.name, schema: MyUserSchema, collection: "users" }]),
        JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '99999999min' } }), // to change
        FactModule,
        OrganizationModule
    ],
    providers: [
        MyUserService,
        {
            provide: USER_MODULE_OPTIONS,
            useValue: { emailVerification: false } // to change,

        },
    ],
    controllers: [MyUserController],
    exports:[MyUserService]
})
export class MyUserModule { }