import { RequestUser, UseLocalAuth, User, UserService, UseJwtAuth } from '@hilma/auth-mongo-nest';
import { Body, Controller, Get, Post, Res, Query, Param, Put, UploadedFiles } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { DATA_NOT_FOUND, DIGITAL_ORIENTATION_LEVEL, Filters, INVALID_USER_ID, INVALID_QUESTION_ID, NEW_CATEGORY_ERROR } from 'src/consts/consts';
import { CityData, ByGenderData, QuestionData, SpecificUserAnswerData, SpecificUserData, CategoryData, AgeRangeData, SectorCount, OrganizationCount, SpecificQuestionData, OrganizationData, QuestionIdsCategories, QuestionnaireData } from 'src/consts/dtos/interfaces';
import { checkFilters } from 'src/consts/funcs';
import { userAdmin } from 'src/dtos/admin.dto';
import { OrganizationService } from 'src/organization/organization.service';
import { QuestionnaireService } from 'src/questionnaire/questionnaire.service';
import { Admin } from 'src/schemas/admin.schema';
import { UserAnswerService } from 'src/userAnswer/userAnswer.service';
import { adminRole, ADMIN, superAdminRole, SUPERADMIN } from '../consts/user-consts';
import { AdminService } from './admin.service';
import { MyUserService } from "../my-user/my-user.service";
import { QuestionCategoryService } from "../questionCategory/questionCategory.service";
import { FilesType, UseFilesHandler } from '@hilma/fileshandler-server';
import { NewQuestionCategoryInfo, QuestionCategoryInfo } from 'src/dtos/questionCategory.dto';
import { categoryDescriptionRegExp, categoryLinkRegExp, categoryNameRegExp, organizationRegExp, emailRegExp, passwordRegExp } from 'src/consts/RegExps';

const envfile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
require('dotenv').config({ path: envfile })


@Controller('/api/admin')
export class AdminController {
  constructor(

    private readonly questionCategoryService: QuestionCategoryService,
    private readonly questionnaireService: QuestionnaireService,
    private readonly userService: UserService,
    private readonly adminService: AdminService,
    private readonly userAnswerService: UserAnswerService,
    private readonly organizationService: OrganizationService,
    private readonly myUserService: MyUserService,
  ) { }
  // admin functions

  //create admin or super admin
  //! if want to create new super admin, comment the UseJwtAuth line
  @UseJwtAuth(SUPERADMIN)
  @Post('/new-admin')
  adminRegister(@Body('adminUser') adminUser: userAdmin, @Body('role') role, @Body('organizationId') organizationId) {
    const { username, password } = adminUser;

    let user: Partial<Admin> = new User({ username, password });

    user.roles = [role === SUPERADMIN ? superAdminRole : adminRole];
    if (role === ADMIN)
      if (organizationId)
        //only for admin -> admin of an organization
        user.organizationId = organizationId;
      //if the role is admin but organizationId isent proveded
      //todo : not sure how to sand a message with the error , right now client just get error code 500
      else throw 'didnt prove all necessary field'

    //todo: right now we does not return anything from server, need to return error or success
    this.adminService
      .createUser<Admin>(user)
      .then(res => console.log('res', res))
      .catch(err => console.log('err:', err));
  }

  //function to verify email
  @Get('/email-verify')
  verify(@Query('token') token, @Res() res) {
    this.adminService.verifyEmailByToken(token);
    res.redirect(`${process.env.REACT_APP_DOMAIN_ADMIN}`);
  }

  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Get('/user-role')
  async userRole(@RequestUser() userInfo) {
    //if ADMIN then check organization and return data , if SUPERADMIN just return role 
    if (userInfo.roles[0] === ADMIN) {
      let organizationId = await this.adminService.getOrganizationIdAdmin(Types.ObjectId(userInfo._id));
      let organizationName = await this.organizationService.returnOrganizationById(organizationId);
      return { role: userInfo.roles[0], organizationId: organizationId, organizationName: organizationName };
    }
    return { role: userInfo.roles[0] };
  }


  //admin and superadmin login
  @UseLocalAuth()
  @Post('/admin-login')
  login(@RequestUser() userInfo, @Res() res) {
    let body = this.userService.login(userInfo, res);
    res.send(body);
  }

  // admin statistics

  // @UseLocalAuth()
  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/specific-user-data')
  async getSpecificUserData(@Body('userId') userId: string): Promise<{ userData: Array<SpecificUserData>, userAnswers: Array<SpecificUserAnswerData> }> {
    try {
      if (!isValidObjectId(Types.ObjectId(userId))) {
        throw INVALID_USER_ID;
      }
      let userQuestionnaireId = await this.myUserService.getUserQuestionnaireId(userId);
      const userAnswers = await this.userAnswerService.getSpecificUserAnswers(userId, userQuestionnaireId);
      const userData = await this.adminService.getSpecificUserData(userId, userAnswers);

      return { userData, userAnswers };
    } catch (err) {
      throw err;
    }
  }
  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/specific-question-data')
  async getSpecificQuestionData(@Body('questionId') questionId: string, @Body('isPositionNeeded') isPositionNeeded: boolean, @Body('answerDevice') answerDevice: string, @Body('questionnaireId') questionnaireId: string): Promise<SpecificQuestionData> {
    try {

      if (!isValidObjectId(Types.ObjectId(questionId)) || !isValidObjectId(Types.ObjectId(questionnaireId))) {
        throw INVALID_QUESTION_ID;
      }

      const res = await this.questionnaireService.getSpecificQuestionData(questionId, answerDevice, questionnaireId);
      return res;
    } catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/all-statistics')
  async getAllStatistics(@Body('filters') filters: Filters) {
    try {
      if (!checkFilters(filters)) {
        throw DATA_NOT_FOUND;
      }

      //* this is a new optimized way to fetch categoriesStats , way faster but needs to work with organizations only for admin and also with specific questionnaireId, for now we stay with the old way
      //*gets all the categories
      const allCategories = await this.questionCategoryService.getAllCategories();

      //*gets all the categories and for each category all the questionIds of that category
      // must have questionnaireId
      const questionsByCategory = await this.questionnaireService.getAllQuestionIdsCategories(Types.ObjectId(filters.questionnaireId));

      //* here we connecting the names from allCategories with the data in questionsByCategory
      questionsByCategory.map(categoryStats => {
        let categoryExtended: QuestionIdsCategories & { categoryName?: string } = categoryStats;
        allCategories.map(categoryData => {
          if (String(categoryStats._id) === String(categoryData._id)) {
            categoryExtended.categoryName = categoryData.categoryName;
          }
        })
        return categoryExtended;
      })
      const categoriesStats: Array<CategoryData> = await this.userAnswerService.getStatsByCategoryNew(questionsByCategory, filters); // todo add questionnaire filter
      //* old function
      // const categoriesStats: Array<CategoryData> = await this.userAnswerService.getStatsByCategories(filters);
      const finished: ByGenderData = await this.adminService.getAllFinished(filters);
      const unfinished: number = await this.adminService.getNumberUnfinished(filters);
      const avgTotalDuration: number = await this.adminService.getAvgTotalDuration(filters);
      const levelGood: ByGenderData = await this.adminService.getNumberOfUsersWithSpecificLevel(DIGITAL_ORIENTATION_LEVEL.GOOD, filters);
      const levelBad: ByGenderData = await this.adminService.getNumberOfUsersWithSpecificLevel(DIGITAL_ORIENTATION_LEVEL.BAD, filters);
      const ageRangesNeeded = [
        { low: 20, high: 29 },
        { low: 30, high: 39 },
        { low: 40, high: 49 },
        { low: 50, high: 120 },
      ];
      const ageRangesStats: Array<AgeRangeData> = await this.getAllAgeRangesData(ageRangesNeeded, filters);
      const sectorsStats: Array<SectorCount> = await this.adminService.getStatsBySector(filters);
      const limitedCitiesStats: Array<CityData> = await this.adminService.getStatsByCity(filters, 4);
      const limitedQuestionsStats: Array<QuestionData> = await this.questionnaireService.getQuestionsCorrectIncorrect(filters, 4);
      let allRes = {
        finished,
        unfinished,
        avgTotalDuration,
        levelGood,
        levelBad,
        categoriesStats,
        ageRangesStats,
        sectorsStats,
        limitedCitiesStats,
        limitedQuestionsStats,
      };
      if (!filters.organizationId) {
        let allOrganizations: Array<OrganizationData> = await this.organizationService.allOrganizationsIncludeDeleted();
        const organizationsStatsReduced: Array<OrganizationCount> = await this.adminService.getStatsByOrganization(filters);
        const organizationsStats: Array<OrganizationCount> = await this.addOrganizationsWithNoUsers(allOrganizations, organizationsStatsReduced);

        allRes[`organizationsStats`] = organizationsStats;
      }
      return allRes;

    } catch (err) {
      throw err;
    }
  }

  // helping method for age ranges stats
  async getAllAgeRangesData(ageRangesNeeded: Array<{ low: number, high: number }>, filters: Filters): Promise<Array<AgeRangeData>> {
    let ageRangesStats = [];
    for (let i = 0; i < ageRangesNeeded.length; i++) {
      const ar = ageRangesNeeded[i];
      const numberOfGood: number = await this.adminService.getStatsByAge(ar.low, ar.high, DIGITAL_ORIENTATION_LEVEL.GOOD, filters);
      const numberOfBad: number = await this.adminService.getStatsByAge(ar.low, ar.high, DIGITAL_ORIENTATION_LEVEL.BAD, filters);

      ageRangesStats.push({ range: ar, numberOfGood: numberOfGood, numberOfBad: numberOfBad });
    }
    return ageRangesStats;
  }

  // helping method for organizations stats
  async addOrganizationsWithNoUsers(allOrganizations: Array<OrganizationData>, organizationWithCount: Array<OrganizationCount>,): Promise<Array<OrganizationCount>> {
    let fullArray = [];
    allOrganizations.forEach(org => {
      let organization = org.organizationName;
      let count = 0;
      for (let i = 0; i < organizationWithCount.length; i++) {
        if (organization === organizationWithCount[i].organization) {
          count = organizationWithCount[i].count;
          break;
        }
      }
      fullArray.push({ organization: organization, count: count });
    });
    return fullArray;
  }
  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/all-users-data') // for users page
  async getAllUsersData(@Body('filters') filters: Filters, @Body('limit') limit: number, @Body('skip') skip: number): Promise<SpecificUserData[]> {
    try {
      const res = await this.adminService.getAllUsersData(filters, limit, skip);
      if (res) {
        if (Array.isArray(res)) {
          if (res.length !== limit) {
            res.push(null);
          }
        }
      }
      return res;
    } catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/get-excel')
  async getExcel(@Body('filters') filters: Filters) {
    try {
      const res = await this.adminService.getExcel(filters);
      return res;
    }
    catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/all-questions-statistics') // for statistics page/all questions
  async getAllQuestionsStatistics(@Body('filters') filters: Filters): Promise<Array<QuestionData>> {
    try {
      const questionsStats = await this.questionnaireService.getQuestionsCorrectIncorrect(filters);
      return questionsStats;
    } catch (err) {
      throw err;
    }
  }
  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Post('/all-cities-statistics') // for statistics page/all cities
  async getAllCitiesStatistics(@Body('filters') filters: Filters): Promise<Array<CityData>> {
    try {
      const citiesStats = await this.adminService.getStatsByCity(filters);
      return citiesStats;
    } catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(ADMIN, SUPERADMIN)
  @Get('/all-questionnaires')
  async getAllQuestionnaires(): Promise<{ questionnaires: QuestionnaireData[] }> {
    const questionnairesIdsAndTitles = await this.questionnaireService.getAllQuestionnairesIdAndTitle();
    return { questionnaires: questionnairesIdsAndTitles };
  }
  // ! only for super admin
  @UseJwtAuth(SUPERADMIN)
  @Get('/questionnaires-and-organizations')
  async getQuestionnairesAndOrganizations(): Promise<{ questionnaires: QuestionnaireData[], organizations: OrganizationData[] }> {
    const questionnairesIdsAndTitles = await this.questionnaireService.getAllQuestionnairesIdAndTitle();
    const organizationsIncludeDeleted = await this.organizationService.allOrganizationsIncludeDeleted();
    return { questionnaires: questionnairesIdsAndTitles, organizations: organizationsIncludeDeleted };
  }

  //************** questionCategory related routes  *******************/
  @UseJwtAuth(SUPERADMIN)
  @Get('/admin-get-category')
  async getAllCategories(@RequestUser() userInfo) {
    try {
      return await this.questionCategoryService.getAllCategories();
    }
    catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(SUPERADMIN)
  @Get('/specific-category/:categoryId')
  async getSpecificCategory(@Param('categoryId') categoryId: string) {
    return await this.questionCategoryService.returnCategoryById(new Types.ObjectId(categoryId));
  }

  @UseJwtAuth(SUPERADMIN)
  @Put('/update-category')
  @UseFilesHandler()
  async updateCategory(@UploadedFiles() files: FilesType, @Body() data: NewQuestionCategoryInfo) {
    try {
      return await this.questionCategoryService.updateCategory(files, data);
    } catch (error) {
      throw error
    }
  }
  @UseJwtAuth(SUPERADMIN)
  @Post('/create-category')
  @UseFilesHandler()
  async createQuestionCategory(@UploadedFiles() files: FilesType, @Body() questionCategoryInfo: QuestionCategoryInfo) {
    try {
      let allCategories = await this.questionCategoryService.getAllCategories()
      let { name, description, courseLink } = questionCategoryInfo;
      let checkname = categoryNameRegExp.test(name);
      if (!name) {
        throw Error(NEW_CATEGORY_ERROR)
        // return
      } else if (name.length > 50 || name.length <= 1) {
        throw Error(NEW_CATEGORY_ERROR)
      } else if (!checkname) {
        throw Error(NEW_CATEGORY_ERROR)
      } else {
        allCategories.map(value => {
          if (value.categoryName === name) {
            throw Error(NEW_CATEGORY_ERROR)
          }
        })
      }
      if (!courseLink) {
        throw Error(NEW_CATEGORY_ERROR)
      } else {
        let checkCategoryLink = categoryLinkRegExp.test(courseLink);
        if (!checkCategoryLink) {
          throw Error(NEW_CATEGORY_ERROR)
        }
      }
      if (!description) {
        throw Error(NEW_CATEGORY_ERROR)
      } else if (description.length > 200 || description.length <= 5) {
        throw Error(NEW_CATEGORY_ERROR)
      } else {
        let checkdescription = categoryDescriptionRegExp.test(description);
        if (!checkdescription) {
          throw Error(NEW_CATEGORY_ERROR)
        }
      }
      if (!files) {
        throw Error("problem with files")
      }

      return this.questionCategoryService.createQuestionCategory(files, questionCategoryInfo);
    }
    catch (err) {
      throw err;
    }
  }

  @UseJwtAuth(SUPERADMIN)
  @Put('/delete-and-fetch-category')
  async deleteOne(@Body('categoryId') categoryId: string) {
    try {
      const res = await this.questionCategoryService.customDeleteCategory(new Types.ObjectId(categoryId));
      return await this.questionCategoryService.getAllCategories()
    } catch (error) { }
  }
  //************** questionCategory related routes  *******************/


  //************** organization related routes  *******************/
  @UseJwtAuth(SUPERADMIN)
  @Post('/update-organization')
  async updateOrganizationAdmin(@Body('organizationName') organizationName: string, @Body('organizationId') organizationId: string) {
    try {
      await this.organizationService.updateOrganization(new Types.ObjectId(organizationId), organizationName);
      return await this.organizationService.returnAllOrganizations();
    } catch (error) {
      throw error
    }
  }
  @UseJwtAuth(SUPERADMIN)
  @Post('/add-organization')
  async addOrganizationAndAdmin(@Body('organizationName') organizationName: string, @Body('email') email: string, @Body('password') password: string) {

    try {
      if (organizationName) {
        if (!organizationRegExp.test(organizationName)) { throw Error("Invalid OrganizationName"); }
      } else { throw Error("Missing OrganizationName"); }

      if (email) {
        if (!emailRegExp.test(email)) { throw Error("Invalid email"); }
      } else { throw Error("Missing email"); }

      if (password) {
        if (!passwordRegExp.test(password)) { throw Error("Invalid password"); }
      } else { throw Error("Missing password"); }

      const organizationId = await this.organizationService.addOrganization(organizationName);

      let user: Partial<Admin> = new User({ username: email, password: password });
      user.organizationId = organizationId
      user.roles = [adminRole];
      await this.adminService.createUser<Admin>(user)
        .then(res => console.log('res', res))
        .catch(err => { throw err });

      return await this.organizationService.returnAllOrganizations();
    } catch (error) {
      throw error
    }

  }
  //************** organization related routes  *******************/
}
