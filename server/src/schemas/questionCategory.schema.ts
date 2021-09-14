import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionCategoryDocument = QuestionCategory & Document;

@Schema({ timestamps: true })
export class QuestionCategory {

  // @Prop()
  // categoryNumber: number

  @Prop({ minlength: 3, maxlength: 50 })
  categoryName: string;


  @Prop({ minlength: 3, maxlength: 200 })
  categoryDescription: string;

  @Prop({ minlength: 10 })
  courseLink: string

  @Prop()
  iconPath: string

  @Optional()
  @Prop()
  deleted?: boolean;
}

export const QuestionCategorySchema = SchemaFactory.createForClass(QuestionCategory);