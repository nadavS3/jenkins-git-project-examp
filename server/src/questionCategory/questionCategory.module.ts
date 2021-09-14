import { Module } from '@nestjs/common';
import { QuestionCategoryService } from './questionCategory.service';
import { QuestionCategoryController } from './questionCategory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionCategory, QuestionCategorySchema } from 'src/schemas/questionCategory.schema';
import { UserModule } from '@hilma/auth-mongo-nest';

@Module({
  imports: [MongooseModule.forFeature([{ name: QuestionCategory.name, schema: QuestionCategorySchema, collection: "questionCategories" }])
    , UserModule],
  providers: [QuestionCategoryService],
  controllers: [QuestionCategoryController],
  exports: [QuestionCategoryService]
})
export class QuestionCategoryModule { }
