import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { jwtConstants, LocalStrategy, NodeMailerService, UserModule } from '@hilma/auth-mongo-nest';
import { MyUserModule } from 'src/my-user/my-user.module';
import { Admin, AdminUserSchema } from 'src/schemas/admin.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { QuestionnaireModule } from 'src/questionnaire/questionnaire.module';
import { UserAnswerModule } from 'src/userAnswer/userAnswer.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { QuestionCategoryModule } from "src/questionCategory/questionCategory.module";

@Module({
  imports: [
    UserModule,
    QuestionnaireModule,
    UserAnswerModule,
    OrganizationModule,
    QuestionCategoryModule,
    NodeMailerService,
    MyUserModule,
    MongooseModule.forFeature(
      [{ name: Admin.name, schema: AdminUserSchema, collection: "users" }]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '999999999999999min' }
    })
  ],

  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: "USER_MODULE_OPTIONS",
      useValue: { emailVerification: true }
    },

    {
      provide: "MailService",
      useClass: NodeMailerService //change it later
    },
    LocalStrategy,
    {
      provide: "UserService",
      useExisting: AdminService
    }
  ],
  exports: [AdminService]
})
export class AdminModule { }
