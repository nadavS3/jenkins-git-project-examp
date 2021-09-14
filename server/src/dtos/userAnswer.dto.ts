import { IsOptional, Min, IsString, IsEnum, IsNumber } from 'class-validator'
import { Types } from 'mongoose'
import { AnswerPositions } from 'src/consts/classes'
import { DDQUserAnswer } from 'src/consts/dtos/interfaces'


export class UserAnswerInfo {

    questionId: string

    @IsOptional() // in case of 'regular' question
    answerPositions?: AnswerPositions

    @IsOptional() // in case of 'MCQ' question
    multipleChoiceAnswerId?: number;

    @IsOptional() // in case of 'DDQ' question
    answerIndexDDQ?: Array<DDQUserAnswer>

    @IsString()
    @IsEnum(['CORRECT', 'INCORRECT', 'SKIPPED'], { message: "not in enum" })
    answerStatus: string

    @IsNumber()
    @Min(1)
    answerDuration: number

    @IsString()
    @IsEnum(['MOBILE', 'BROWSER'], { message: "not in enum" })
    answerDevice: string
}