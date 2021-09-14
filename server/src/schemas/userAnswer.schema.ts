import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as fSchema, Types } from 'mongoose';
import { AnswerPositions } from 'src/consts/classes';
import { DDQUserAnswer } from 'src/consts/dtos/interfaces';
import { MyUser } from './my-user.schema';
import { Questionnaire } from './questionnaire.schema';

export type UserAnswerDocument = UserAnswer & Document;

@Schema({ timestamps: true })
export class UserAnswer {

  @Prop({ type: fSchema.Types.ObjectId, ref: MyUser.name, index: true })
  userId: Types.ObjectId;

  @Prop({ type: fSchema.Types.ObjectId, ref: Questionnaire.name })
  questionId: Types.ObjectId;

  @Optional() // in case of 'regular' question
  @Prop()
  answerPositions?: AnswerPositions;

  @Optional() // in case of 'MCQ' question
  @Prop()
  multipleChoiceAnswerId?: number;

  @Optional() // in case of 'DDQ' question
  @Prop({ type: Array })
  answerIndexDDQ?: DDQUserAnswer[];

  @Prop({ enum: ['CORRECT', 'INCORRECT', 'SKIPPED'], default: 'SKIPPED' })
  answerStatus: string;

  @Prop()
  answerDuration: number;

  @Prop({ enum: ['MOBILE', 'BROWSER'], default: 'BROWSER' })
  answerDevice: string;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);