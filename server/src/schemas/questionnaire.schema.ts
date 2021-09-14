import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuestionInfoReadyForQuestionnaire } from 'src/consts/dtos/interfaces';

export type QuestionnaireDocument = Questionnaire & Document;

@Schema({ timestamps: true })
export class Questionnaire {

  // @Optional()
  // @Prop({ minlength: 5, maxlength: 400 })
  // questionStory?: string;

  // @Optional()
  // @Prop({ minlength: 5, maxlength: 400 })
  // questionInstruction?: string;

  // @Prop({ default: "" })
  // audioPath: string;

  // @Prop({ enum: [QUESTION_TYPES.PSQ, QUESTION_TYPES.MCQ], default: QUESTION_TYPES.PSQ })
  // questionType: string;

  // @Prop()
  // multipleChoiceAnswers?: MCQAnswer[];

  // @Prop()
  // mobileQuestionInfo: DeviceQuestionInfo

  // @Prop()
  // browserQuestionInfo: DeviceQuestionInfo

  // @Prop({ type: fSchema.Types.ObjectId, ref: QuestionCategory.name })
  // categoryId: Types.ObjectId;

  // @Prop()
  // questionNumber: number;


  //* new admin
  @Prop()
  title: string;
  
  @Prop()
  questions: Array<QuestionInfoReadyForQuestionnaire>;

  @Optional()
  @Prop()
  deleted?: boolean;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);