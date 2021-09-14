import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {

    @Prop({ required: true, minlength: 3, maxlength: 100 })
    organizationName: string;

    @Optional()
    @Prop()
    custom?: boolean;

    @Optional()
    @Prop()
    deleted?: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);