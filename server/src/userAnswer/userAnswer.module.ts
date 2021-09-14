import { forwardRef, Module } from '@nestjs/common';
import { UserAnswerService } from './userAnswer.service';
import { UserAnswerController } from './userAnswer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAnswer, UserAnswerSchema } from 'src/schemas/userAnswer.schema';
import { QuestionnaireModule } from 'src/questionnaire/questionnaire.module';
import { UserModule } from '@hilma/auth-mongo-nest';
import { MyUserModule } from '../my-user/my-user.module';
import { FactModule } from '../fact/fact.module'
import { QuestionCategoryModule } from 'src/questionCategory/questionCategory.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserAnswer.name, schema: UserAnswerSchema, collection: "userAnswers" }]), forwardRef(() => QuestionnaireModule),
    UserModule, MyUserModule, FactModule, QuestionCategoryModule],
  providers: [UserAnswerService],
  controllers: [UserAnswerController],
  exports: [UserAnswerService]
})
export class UserAnswerModule { }
