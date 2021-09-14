import { RequestUser, UseJwtAuth } from '@hilma/auth-mongo-nest';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DIGITAL_ORIENTATION_LEVEL, Filters, FACT_TYPES, DEVICES } from 'src/consts/consts';
import { UserAnswerInfo } from 'src/dtos/userAnswer.dto';
import { QuestionnaireService } from 'src/questionnaire/questionnaire.service';
import { UserAnswerService } from './userAnswer.service';
import { MyUserService } from 'src/my-user/my-user.service'
import { FactService } from 'src/fact/fact.service';
import { SIMPLEUSER } from 'src/consts/user-consts';
import { Types } from 'mongoose';
import { QuestionUnwinded } from 'src/consts/dtos/interfaces';

@Controller('/api/userAnswer')
export class UserAnswerController {

    constructor(
        private readonly userAnswerService: UserAnswerService,
        private readonly questionnaireService: QuestionnaireService,
        private readonly myUserService: MyUserService,
        private readonly factService: FactService,
    ) { }
    //*when: user answer a question
    //*what: creates the userAnswer in DB and give back the next question
    //*input: answerInfo: questionId ,answerPositions ,answerStatus ,answerDuration . user:give back the user info if authintication suceeded
    //*output: return the status of the answer question(if he was correct or not or skipped) and return the next question

    @UseJwtAuth(SIMPLEUSER)
    @Post('/post-answer-and-get-question')
    async createUserAnswerAndGetNextQuestion(@Body('userAnswer') answerInfo: UserAnswerInfo, @Body('onlyPostUserAnswer') onlyPostUserAnswer: boolean, @RequestUser() user): Promise<{ newQuestion?: QuestionUnwinded | string, sqqQuestionsArr?: QuestionUnwinded[] | string, userAnswerStatus: string } | Error | string> {
        try {
            // status is checked for enum in dto
            // duration is checked in dto
            let userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(user._id)

            //*add question to DB
            const UAres = await this.userAnswerService.createUserAnswer(answerInfo, user._id, userQuestionnaireId);

            if (onlyPostUserAnswer) {
                return { userAnswerStatus: UAres };
            }
            //*get the next question from DB
            const Qres = await this.questionnaireService.getNextQuestion(user._id, answerInfo.answerDevice, userQuestionnaireId, answerInfo); // answerInfo needed for SQQ
            if (Array.isArray(Qres)) {
                return { sqqQuestionsArr: Qres, userAnswerStatus: UAres }
            }
            return { newQuestion: Qres, userAnswerStatus: UAres };
        }
        catch (err) {
            console.log(err);
            return err;
        }

    }


    //! this always should be commented , only uncomment when want to use the data_generator function from client
    @UseJwtAuth("NO ONE")
    @Post('/DG-answerAll')
    async data_generator_create_all_answers_for_user(@Body('userQuestionnaireId') userQuestionnaireId: string, @Body('userId') userId: string): Promise<{}> {
        try {
            let arrayOfLogs = []
            let device: "BROWSER" | "MOBILE" = Math.floor(Math.random() * 2) ? DEVICES.BROWSER as "BROWSER" : DEVICES.MOBILE as "MOBILE";
            const userQuestionnaireObjectId = new Types.ObjectId(userQuestionnaireId)
            const totalQuestions: number = await this.questionnaireService.getTotalNumberOfQuestions(userQuestionnaireObjectId);
            const answerStatus: ['CORRECT', 'INCORRECT', 'SKIPPED'] = ['CORRECT', 'INCORRECT', 'SKIPPED']
            for (let i = 0; i < totalQuestions; i++) {
                //todo: added any type here just as hot fix, not suppose to work , need to fix
                const nextQuestionInfo: any = await this.questionnaireService.getNextQuestion(userId, device, userQuestionnaireObjectId);


                if (typeof nextQuestionInfo === "string") {
                    throw Error("typeof next question is string")
                }
                const questionData = nextQuestionInfo
                const currentAnswerStatus: 'CORRECT' | 'INCORRECT' | 'SKIPPED' = answerStatus[Math.floor(Math.random() * 3)]

                let answer: Partial<UserAnswerInfo> = {
                    questionId: String(questionData._id),
                    answerDuration: Math.floor(Math.random() * 15000),
                    answerDevice: device,
                    answerStatus: currentAnswerStatus
                };

                //* if MCQ question
                if (questionData.multipleChoiceAnswers) {
                    if (currentAnswerStatus === "INCORRECT") {
                        const multipleChoiceAnswerIdWithOutCorrect = questionData.multipleChoiceAnswers.filter(MCQquestion => !MCQquestion.isCorrect);
                        answer.multipleChoiceAnswerId = multipleChoiceAnswerIdWithOutCorrect[Math.floor(Math.random() * multipleChoiceAnswerIdWithOutCorrect.length)].answerId;

                    }
                    //* if PSQ question
                } else {

                    if (currentAnswerStatus === "INCORRECT") {
                        if (device === "BROWSER") {
                            answer.answerPositions = questionData.incorrectPositions[Math.floor(Math.random() * questionData.incorrectPositions.length)]
                        } else {
                            answer.answerPositions = questionData.incorrectPositions[Math.floor(Math.random() * questionData.incorrectPositions.length)]
                        }
                    }
                }
                const UAres = await this.userAnswerService.createUserAnswer(answer as UserAnswerInfo, userId, userQuestionnaireObjectId);
                arrayOfLogs.push(UAres)
            }

            let results = await this.userAnswerService.getUserResults(userId, userQuestionnaireObjectId);
            let total = 0;
            let totalCorrect = 0;
            results.forEach(elem => {
                totalCorrect += elem.correctAnswers;
                total += elem.numberOfQuestions
                if ((elem.correctAnswers / elem.numberOfQuestions) >= 0.75) {
                    elem.courseLink = ""; //remove course link if the user answered correct in 75% of the questoins in this category 
                }
            })
            let percentage = Math.ceil(100 - ((total - totalCorrect) / total * 100))
            let digitalOrientationLevel = '';
            if (percentage < 33) { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.BAD }
            else if (percentage < 66) { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.INTERMEDIATE }
            else { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.GOOD }

            let updateDGOL = await this.myUserService.updateDigitalOrientationLevel(userId, digitalOrientationLevel)
            let updateTotalTimeForUser = await this.myUserService.updateTotalTimeForUser(userId)
            //* if in the future we wanted to also add this data to facts, need to request user and to send cookies and more ...
            //* Adding digital orientation to fact table
            // if (updateDGOL) {
            //     const userDGOL = [FACT_TYPES.DIGITAL_ORIENTATION, digitalOrientationLevel];
            //     if (user && userId) this.factService.addFacts(userDGOL, userId);
            // }
            return { arrayOfLogs, results };
        }
        catch (err) {
            console.log(err);
            return err;
        }

    }


    //*when: when in result page
    //*what:gives back the user the results of himself, how many questions he was correct and how many not
    //* input: user: just user data we get from Auth if suceeded
    //*output : object which conatin : {correct:n, incorrect:n}
    //* if want to use data_generator comment the JWT
    @UseJwtAuth(SIMPLEUSER)
    @Get('/user-results')
    async getUserResults(@RequestUser() user) {
        try {
            const userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(user._id)

            let results = await this.userAnswerService.getUserResults(user._id, userQuestionnaireId);

            let total = 0;
            let totalCorrect = 0;
            results.forEach(elem => {
                totalCorrect += elem.correctAnswers;
                total += elem.numberOfQuestions
                if ((elem.correctAnswers / elem.numberOfQuestions) >= 0.75) {
                    elem.courseLink = ""; //remove course link if the user answered correct in 75% of the questoins in this category 
                }
            })
            let percentage = Math.ceil(100 - ((total - totalCorrect) / total * 100))
            let digitalOrientationLevel = '';
            if (percentage < 33) { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.BAD }
            else if (percentage < 66) { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.INTERMEDIATE }
            else { digitalOrientationLevel = DIGITAL_ORIENTATION_LEVEL.GOOD }

            let updateDGOL = await this.myUserService.updateDigitalOrientationLevel(user._id, digitalOrientationLevel)
            let updateTotalTimeForUser = await this.myUserService.updateTotalTimeForUser(user._id)
            //* Adding digital orientation to fact table
            if (updateDGOL) {
                const userDGOL = [FACT_TYPES.DIGITAL_ORIENTATION, digitalOrientationLevel];
                if (user && user._id) this.factService.addFacts(userDGOL, user._id);
            }

            return results;
        }
        catch (err) {
            console.log(err);
            return err;
        }

    }

    @UseJwtAuth(SIMPLEUSER)
    @Get('/questions-review')
    async getQuestionsReview(@RequestUser() user, @Query('device') device: string) {
        //todo check that the user have a digitalOrientationLevel
        try {
            const userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(user._id)
            const res = await this.userAnswerService.getQuestionsReview(user['_id'], device, userQuestionnaireId);

            return res;

        } catch (error) {
            return error;
        }

    }
}
