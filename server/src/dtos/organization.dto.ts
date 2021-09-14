import { IsString, Length } from "class-validator"

export class OrganizationInfo {

    @IsString()
    @Length(3, 100, { message: 'too many charactrers' })
    name: string
}