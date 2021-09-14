import { Catch } from '@nestjs/common'
import { Length, IsInt, IsString, Min, IsEmail, IsPhoneNumber, isMobilePhone } from 'class-validator'

@Catch()
export class UserInfo {
    // @IsString()
    @Length(2, 200, { message: 'too many charactrers organization' })
    organizationId: string

    @IsString()
    @Length(2, 20, { message: 'too many charactrers firstnamae' })
    firstName: string

    @IsString()
    @Length(2, 20, { message: 'too many charactrers lastname' })
    lastName: string

    @IsString()
    @Length(2, 55, { message: 'too many charactrers city' })
    city: string

    @IsInt()
    @Min(20, { message: 'age needs to be a number between 20 and 120' })
    age: number

    @IsString()
    @Length(2, 6, { message: 'too many charactrers gender' })
    gender: string

    @IsString()
    @Length(2, 55, { message: 'too many charactrers family status' })
    familyStatus: string

    @IsString()
    @Length(2, 55, { message: 'too many charactrers sector' })
    sector: string

    @IsString()
    @Length(2, 200, { message: 'too many charactrers questionnaire' })
    questionnaireId: string

    @IsEmail({}, { message: 'bad email' })
    email: string

    @IsString()
    @Length(8, 12, { message: 'bad phone number' })
    phoneNumber: string

}