import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { QuestionnaireService, } from './questionnaire.service';
import { UseFilesHandler, UploadedFiles, FilesType } from '@hilma/fileshandler-server';
import { RequestUser, UseJwtAuth } from '@hilma/auth-mongo-nest';
import { QuestionInfo } from '../dtos/question.dto';
import { QUESTION_TYPES } from '../consts/consts';
import { checkPSQAnswers, checkMCQAnswers, checkStoryAndInstruction } from '../consts/funcs';
import { FAILED_CREATING_QUESTION, QUESTION_CREATED } from 'src/consts/consts';
import { Types } from 'mongoose';
import { MyUserService } from 'src/my-user/my-user.service';
import { SIMPLEUSER, SUPERADMIN } from 'src/consts/user-consts';
import { FilesIdsObject, InitialQuestionnaireInfo, QuestionUnwinded } from 'src/consts/dtos/interfaces';



@Controller('/api/questionnaire')
export class QuestionnaireController {
    constructor(
        private readonly questionnaireService: QuestionnaireService,
        private readonly myUserService: MyUserService
    ) { }

    @UseJwtAuth(SIMPLEUSER)
    @Get('/initial-questionnaire-info')
    async getInitialQuestionnaireInfo(@RequestUser() user, @Query('device') device: string): Promise<InitialQuestionnaireInfo | string> { // get total num of questions and first question        
        try {
            const userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(user._id);

            const allQuestionsImagePaths = await this.questionnaireService.getImagePathsForUser(device, user._id, userQuestionnaireId);

            const nextQuestionInfo = await this.questionnaireService.getNextQuestion(user._id, device, userQuestionnaireId);
            const totalQuestions: number = await this.questionnaireService.getTotalNumberOfQuestions(userQuestionnaireId);
            let res: InitialQuestionnaireInfo = { allQuestionsImagePaths: allQuestionsImagePaths, totalQuestions: totalQuestions };
            if (Array.isArray(nextQuestionInfo)) {
                res.sqqQuestionsArr = nextQuestionInfo;
                return res;
            }
            res.nextQuestionInfo = nextQuestionInfo;
            return res;
        }
        catch (err) {
            return err
        }
    }

    @UseJwtAuth(SUPERADMIN)
    @Post('/next-question-number')
    async getNumberOfQuestions(@Body('questionnaireId') questionnaireId: string): Promise<number> { // info for menu, include categories, num of questions and userAnswers
        const totalQuestions = await this.questionnaireService.getTotalNumberOfQuestions(Types.ObjectId(questionnaireId));

        return totalQuestions + 1;
    }

    @UseJwtAuth(SIMPLEUSER)
    @Get('/menu-info')
    async getMenuInfo(@RequestUser() user) { // info for menu, include categories, num of questions and userAnswers
        const questionnaireId = await this.myUserService.getUserQuestionnaireId(user._id)
        const res = await this.questionnaireService.getMenuInfo(user._id, questionnaireId) // get array of categories
        return res;
    }

    @UseJwtAuth(SIMPLEUSER)
    @Get('/fetch-by-id/:qNumberToFetch')
    async fetchById(@RequestUser() user,
        @Param('qNumberToFetch') nextQuestionNumber: string,
        @Query('device') device: string,
        @Query('qNumber') qNumber: string,
        @Query('currentQId') currentQuestionId: string,
    ): Promise<QuestionUnwinded | QuestionUnwinded[] | string> {
        try {
            const questionnaireId = await this.myUserService.getUserQuestionnaireId(user._id);
            // const res = await this.questionnaireService.fetchById(Types.ObjectId(questionId), device);
            const res = await this.questionnaireService.fetchQuestionsByQuestionNumber(questionnaireId, Number(nextQuestionNumber), device);

            await this.updateRestSQQ(user._id, qNumber, device, currentQuestionId)
            return res;
        }
        catch (err) {
            console.log('fjmnew1kc err: ', err);
            return err;
        }
    }

    async updateRestSQQ(userId: string, qNumber: string, device: string, currentQuestionId: string) {
        const userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(userId)

        await this.questionnaireService.updateSQQRest(userQuestionnaireId, userId, qNumber, device, currentQuestionId)

    }

    @UseJwtAuth(SUPERADMIN)
    @Get('/fetch-question-for-edit/:questionId')
    async fetchQuestionForEdit(@Param('questionId') questionId: string) {
        try {
            const res = await this.questionnaireService.fetchByIdBothDevices(Types.ObjectId(questionId));
            return res;
        }
        catch (err) {
            return err;
        }
    }

    @UseJwtAuth(SUPERADMIN)
    @Post('/create-question')
    @UseFilesHandler()
    async createQuestion(@Body() questionnaireId: string /* currently hard coded */, @UploadedFiles() files: FilesType, @Body() body: { questionInfo: QuestionInfo, mobileImageId: number, browserImageId: number, audioId: number }): Promise<object> {

        let { categoryId, questionStory, questionInstruction, mobileQuestionInfo, browserQuestionInfo, questionNumber, questionType, multipleChoiceAnswers } = body.questionInfo; // for validation      

        try {
            if (!checkStoryAndInstruction(questionStory, questionInstruction)) { throw Error("problem with story/instruction") }
            if (questionType === QUESTION_TYPES.PSQ) {
                const devicesQuestionInfo = [mobileQuestionInfo, browserQuestionInfo]; // add more if more devices
                if (!checkPSQAnswers(devicesQuestionInfo)) { throw Error("problem with psq answers") }
            }
            else if (questionType === QUESTION_TYPES.MCQ) {
                if (!checkMCQAnswers(multipleChoiceAnswers)) { throw Error("problem with mcq answers") }
            }
            else { throw Error("problem with question type") }

            if (!files) { throw Error("problem with files") }

            if (!questionNumber || typeof questionNumber !== "number") { throw Error("question number is not valid") }

            questionnaireId = "606ada841623e2ba3f789e4c"; // currently hard coded
            await this.questionnaireService.createQuestion(questionnaireId, files, body);
            return { success: QUESTION_CREATED }
        }
        catch (err) {
            console.log(err);
            return { error: FAILED_CREATING_QUESTION, info: err };
        }
    }

    @UseJwtAuth(SUPERADMIN)
    @Put('/update-question')
    @UseFilesHandler()
    async updateQuestion(@RequestUser() user, @UploadedFiles() files: FilesType, @Body() data: { questionId: string, questionInfo: QuestionInfo, filesIds: FilesIdsObject }): Promise<{ success?: string, error?: string, info?: object }> {
        let { questionInfo, filesIds } = data;
        const questionnaireId = this.myUserService.getUserQuestionnaireId(user.questionnaireId);

        let { categoryId, questionStory, questionInstruction, mobileQuestionInfo, browserQuestionInfo, questionNumber, questionType, multipleChoiceAnswers } = questionInfo; // for validation      

        try {
            if (!checkStoryAndInstruction(questionStory, questionInstruction)) { throw Error("problem with story/instruction") }
            if (questionType === QUESTION_TYPES.PSQ) {
                const devicesQuestionInfo = [mobileQuestionInfo, browserQuestionInfo]; // add more if more devices
                if (!checkPSQAnswers(devicesQuestionInfo)) { throw Error("problem with psq answers") }
            }
            else if (questionType === QUESTION_TYPES.MCQ) {
                if (!checkMCQAnswers(multipleChoiceAnswers)) { throw Error("problem with mcq answers") }
            }
            else { throw Error("problem with question type") }

            if (Object.keys(filesIds).length !== files.length) { throw Error("problem with files") }

            if (!questionNumber || typeof questionNumber !== "number") { throw Error("question number is not valid") }

            await this.questionnaireService.updateQuestion(files, data);
            return { success: QUESTION_CREATED }
        }
        catch (err) {
            console.log(err);
            return { error: FAILED_CREATING_QUESTION, info: err };
        }
    }

    @UseJwtAuth(SUPERADMIN)
    @Post('/admin-category-data')
    async getQuestionsSpecificCategory(@Body('categoryId') categoryId: string, @Body('questionnaireId') questionnaireId: string) {
        try {
            const res = await this.questionnaireService.getCategoryData(Types.ObjectId(categoryId), Types.ObjectId(questionnaireId))
            return res;
        }
        catch (err) {
            throw err;
        }
    }

    @UseJwtAuth(SUPERADMIN)
    @Put('/delete-and-fetch')
    async deleteOne(@Body('questionId') questionId: string, @Body('categoryId') categoryId: string, @Body('questionnaireId') questionnaireId: string) {
        try {
            const res = await this.questionnaireService.customDeleteQuestion(Types.ObjectId(questionId));
            return await this.questionnaireService.getCategoryData(Types.ObjectId(categoryId), Types.ObjectId(questionnaireId));
        } catch (error) { }
    }
}
