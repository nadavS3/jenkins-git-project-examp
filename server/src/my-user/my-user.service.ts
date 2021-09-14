import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Model, Types } from 'mongoose';

import { UserConfig, UserService, USER_MODULE_OPTIONS } from '@hilma/auth-mongo-nest';

import { MyUser, MyUserDocument } from '../schemas/my-user.schema';
import { DIGITAL_ORIENTATION_LEVEL } from 'src/consts/consts';
// import { DeepPartial }  '@hilma/auth-mongo-nest/dist/user/user.service';


@Injectable()
export class MyUserService extends UserService {
    constructor(
        @Inject(USER_MODULE_OPTIONS) protected config_options: UserConfig,
        @InjectModel(MyUser.name)
        protected readonly usersModel: Model<MyUserDocument>,
        protected readonly jwtService: JwtService,
        protected readonly configService: ConfigService,
    ) {
        super(config_options, usersModel, jwtService, configService)
    }

    async updateDigitalOrientationLevel(userId: string, digitalOrientationLevel: string) {
        let userObjectId = new Types.ObjectId(userId);
        let userData = await this.usersModel.findById(userObjectId);
        //*if user already have a DGOL we just return and not modifying anything
        if (!userData || typeof userData !== "object" || !(userData.DigitalOrientationLevel === DIGITAL_ORIENTATION_LEVEL.UNKNOWN)) {
            return null;
        }
        try {
            //? (nadav) not sure for now if use findAndModify is needed at global level so for now i put it specificly for this query
            const updateDGOL = await this.usersModel.findByIdAndUpdate(userObjectId, { DigitalOrientationLevel: digitalOrientationLevel }, { useFindAndModify: false })
            return updateDGOL;
        }
        catch (err) { return err }

    }

    //* new admin
    async getUserQuestionnaireId(userId: string): Promise<Types.ObjectId> {
        let userObjectId = new Types.ObjectId(userId);

        let userData = await this.usersModel.findOne({ _id: userObjectId }, { _id: 0, questionnaireId: 1 });
        return userData.questionnaireId;
    }
    async updateTotalTimeForUser(userId: string) {
        let userObjectId = new Types.ObjectId(userId);
        let userData = await this.usersModel.findById(userObjectId);
        //*if user have a value which is not 0 in the total duration we just return
        if (!userData || typeof userData !== "object" || !(Number(userData.totalDuration) === 0)) { return null }
        try {
            const TotalTimeQuery = await this.usersModel.aggregate([
                {
                    $lookup: {
                        from: 'userAnswers',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'questions'
                    }
                },
                { $match: { _id: userObjectId } },
                { $project: { questions: 1, _id: 0 } },
                { $unwind: '$questions' },
                {
                    $group: {
                        _id: null,

                        totalTime: { $sum: "$questions.answerDuration" }
                    }
                },
                { $project: { totalTime: 1, _id: 0 } }


            ])
            let totalTime = TotalTimeQuery[0].totalTime;


            const updateTotalTime = await this.usersModel.findByIdAndUpdate(userObjectId, { totalDuration: totalTime }, { useFindAndModify: false })

        } catch (err) { return err }
    }
}
