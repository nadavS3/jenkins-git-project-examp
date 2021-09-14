import { forwardRef, Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Questionnaire, QuestionnaireSchema } from '../schemas/questionnaire.schema';
import { UserAnswerModule } from 'src/userAnswer/userAnswer.module';
import { UserModule } from '@hilma/auth-mongo-nest';
import { MyUserModule } from 'src/my-user/my-user.module';



@Module({
  imports: [
    MongooseModule.forFeature([{ name: Questionnaire.name, schema: QuestionnaireSchema, collection: "questionnaires" }]), forwardRef(() => UserAnswerModule),
    UserModule, MyUserModule

  ],
  providers: [QuestionnaireService],
  controllers: [QuestionnaireController],
  exports: [QuestionnaireService]
})
export class QuestionnaireModule { }
