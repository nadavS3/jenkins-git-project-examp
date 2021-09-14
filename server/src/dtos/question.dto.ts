import { Optional } from '@nestjs/common'
import { Length, IsString, IsArray, IsNumber, IsObject, IsEnum } from 'class-validator'
import { DeviceQuestionInfo, MCQAnswer } from 'src/consts/classes'
import { QUESTION_TYPES } from 'src/consts/consts'


export class QuestionInfo {

    @Optional()
    @IsString()
    @Length(5, 400, { message: 'too many characters' })
    questionStory: string

    @Optional()
    @IsString()
    @Length(5, 400, { message: 'too many characters' })
    questionInstruction: string

    @IsString()
    @IsEnum([QUESTION_TYPES.PSQ, QUESTION_TYPES.MCQ, QUESTION_TYPES.DDQ], { message: 'question type is not on enum' })
    questionType: string

    @Optional()
    @IsArray()
    multipleChoiceAnswers: MCQAnswer[]

    @Optional()
    @IsObject()
    mobileQuestionInfo: DeviceQuestionInfo

    @Optional()
    @IsObject()
    browserQuestionInfo: DeviceQuestionInfo

    @IsString()
    @Length(1, 50, { message: 'too many characters' })
    categoryId: string

    @IsNumber()
    questionNumber: number

    @Optional() // only if question is part of SQQ
    @IsNumber()
    SQQInnerOrder: number
}