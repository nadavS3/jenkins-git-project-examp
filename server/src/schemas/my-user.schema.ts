import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as fSchema, Types } from 'mongoose';
import { User, extendSchema, UserSchema } from '@hilma/auth-mongo-nest';
import { Organization } from '../schemas/organization.schema'
import { Questionnaire } from "./questionnaire.schema";
import { DIGITAL_ORIENTATION_LEVEL } from '../consts/consts'


@Schema({ timestamps: true })
export class MyUser extends User {
  constructor(basicUser: Partial<MyUser>) {
    super(basicUser)
    
  }
  
  @Prop({ minlength: 2, maxlength: 20 })
  firstName: string;

  @Prop({ minlength: 2, maxlength: 20 })
  lastName: string;

  @Prop()
  age: number;

  @Prop()
  city: string;

  @Prop({ enum: ['SINGLE', 'DIVORCED', 'MARRIED', 'WIDOW', 'OTHER'], default: 'OTHER' })
  familyStatus: string;

  @Prop({ enum: ['אחר', 'אזרחים ותיקים', 'חרדית', 'ערבית'], default: 'אחר' })
  sector: string;

  @Prop({ type: fSchema.Types.ObjectId, ref: Organization.name })
  organizationId: Types.ObjectId;

  @Prop({ enum: ['MALE', 'FEMALE', 'OTHER'], default: 'OTHER' })
  gender: string;

  @Prop({ default: 0 })
  totalDuration: number;

  @Prop({ enum: [DIGITAL_ORIENTATION_LEVEL.GOOD, DIGITAL_ORIENTATION_LEVEL.INTERMEDIATE, DIGITAL_ORIENTATION_LEVEL.BAD, DIGITAL_ORIENTATION_LEVEL.UNKNOWN], default: DIGITAL_ORIENTATION_LEVEL.UNKNOWN})
  DigitalOrientationLevel: string

  @Prop({})
  createdAt: Date;

  @Prop({ type: fSchema.Types.ObjectId, ref: Questionnaire.name })
  questionnaireId: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  phoneNumber: string;



}
export const MyUserSchema = extendSchema(UserSchema, MyUser).index({DigitalOrientationLevel:1,age:-1});
// export const MyUserSchema =SchemaFactory.createForClass(extendSchema(UserSchema, MyUser)).index({DigitalOrientationLevel:1,age:-1});



export type MyUserDocument = MyUser & Document;
