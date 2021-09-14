import { Prop, Schema } from "@nestjs/mongoose";
import { Document, Types, Schema as fSchema } from "mongoose";

import { extendSchema, User, UserSchema } from "@hilma/auth-mongo-nest";

import { Organization } from '../schemas/organization.schema'

@Schema({ timestamps: true })
export class Admin extends User {
    constructor(basicUser: Partial<Admin>) {
        super(basicUser)
        this.emailVerified = basicUser.emailVerified;
    }

    @Prop({ type: fSchema.Types.ObjectId, ref: Organization.name })
    organizationId: Types.ObjectId;

    @Prop({ default: 0 })
    emailVerified: boolean

    @Prop({ nullable: true, length: 150 })
    verificationToken: string

}

export const AdminUserSchema = extendSchema(UserSchema, Admin);

export type AdminUserDocument = Document & Admin;