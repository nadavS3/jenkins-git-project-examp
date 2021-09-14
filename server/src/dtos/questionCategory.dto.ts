import { Optional } from "@nestjs/common"
import { Prop } from "@nestjs/mongoose"
import { IsNumber, IsString, Length } from "class-validator"

export class QuestionCategoryInfo {
    //! is this needed????
    // @IsNumber()
    // categoryNumber: number

    @IsString()
    @Length(3, 50, { message: 'too many charactrers' })
    name: string

    @IsString()
    @Length(5, 200, { message: 'too many charactrers' })
    description: string

    @IsString()
    courseLink: string
}

export class NewQuestionCategoryInfo {
    //! is this needed????
    @IsString()
    @Length(3, 50, { message: 'bad category Id' })
    categoryId: string
    // categoryNumber: number

    @IsString()
    @Length(3, 50, { message: 'too many charactrers' })
    name: string

    @IsString()
    @Length(5, 200, { message: 'too many charactrers' })
    description: string

    @IsString()
    courseLink: string
}

export class updateQuestionCategory {

    // @Prop()
    // categoryNumber: number

    @Prop({ minlength: 3, maxlength: 50 })
    categoryName: string;


    @Prop({ minlength: 3, maxlength: 200 })
    categoryDescription: string;

    @Prop({ minlength: 10 })
    courseLink: string

    @Optional()
    @Prop()
    iconPath?: string

}
