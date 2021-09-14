import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NewQuestionCategoryInfo, QuestionCategoryInfo, updateQuestionCategory } from 'src/dtos/questionCategory.dto';
import { QuestionCategory, QuestionCategoryDocument } from 'src/schemas/questionCategory.schema';
import { UseFilesHandler, UploadedFiles, ImageService, FilesType } from '@hilma/fileshandler-server';


@Injectable()
export class QuestionCategoryService {

    constructor(
        @InjectModel(QuestionCategory.name) private questionCategoryModel: Model<QuestionCategoryDocument>,
        private readonly imageService: ImageService,) { }
    async getAllCategories() {
        return await this.questionCategoryModel.find({ deleted: { $exists: false } }, { categoryName: 1 })
    }

    async getCategoryNumber(categoryId: string) {
        const categories = await this.questionCategoryModel.find({});

        for (let i = 0; i < categories.length; i++) {
            if (categories[i]._id.equals(categoryId)) {
                return i + 1;
            }
        }
    }

    async createQuestionCategory(files: FilesType, questionCategoryInfo: QuestionCategoryInfo) {

        const savedMobileImagePath = await this.imageService.save(files, parseInt(files[0].originalname));
        const questionCategoryForDB: QuestionCategory = {
            categoryName: questionCategoryInfo.name,
            categoryDescription: questionCategoryInfo.description,
            courseLink: questionCategoryInfo.courseLink,
            iconPath: savedMobileImagePath
        }
        const createdQuestionCategory = new this.questionCategoryModel(questionCategoryForDB);

        createdQuestionCategory.save();

        return await this.getAllCategories();
    }

    async customDeleteCategory(categoryId: Types.ObjectId) {
        try {
            return await this.questionCategoryModel.updateOne({ _id: categoryId }, { $set: { deleted: true } });
        } catch (err) {
            return err;
        }
    }

    async returnCategoryById(categoryId: Types.ObjectId): Promise<QuestionCategory> {
        try {
            return await this.questionCategoryModel.findOne({ _id: categoryId });
        } catch (err) {
            return err
        }
    }
    async returnAllcategories(): Promise<Array<QuestionCategory>> {
        try {
            return await this.questionCategoryModel.find({})
        } catch (err) {
            return err
        }
    }
    async updateCategory(files: FilesType, NewQuestionCategoryInfo: NewQuestionCategoryInfo) {

        let questionCategoryForDB: updateQuestionCategory = {
            categoryName: NewQuestionCategoryInfo.name,
            categoryDescription: NewQuestionCategoryInfo.description,
            courseLink: NewQuestionCategoryInfo.courseLink
        }
        //* if the admin updated the question and changed the icon we save i and add iconPath to the data, otherwise we dont change its value
        if (files.length) {
            const savedMobileImagePath = await this.imageService.save(files, parseInt(files[0].originalname));
            questionCategoryForDB.iconPath = savedMobileImagePath;
        }
        try {
            return await this.questionCategoryModel.updateOne({ _id: new Types.ObjectId(NewQuestionCategoryInfo.categoryId) }, { $set: questionCategoryForDB })
        } catch (err) {
            return err
        }
    }
}