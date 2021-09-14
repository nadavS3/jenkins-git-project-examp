import { Controller } from '@nestjs/common';
import { QuestionCategoryService } from './questionCategory.service'

@Controller('api/questionnaireCategory')
export class QuestionCategoryController {
    constructor(private readonly questionCategoryService: QuestionCategoryService) { }
}
