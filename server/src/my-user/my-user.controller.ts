import { Body, Controller, Post, Res } from '@nestjs/common';
import { RequestUser, UseJwtAuth, UserService } from '@hilma/auth-mongo-nest';
import { MyUserService } from './my-user.service'
import { UserInfo } from '../dtos/my-user.dto'
import { nameRegExp, organizationRegExp, questionInfoRegExp, sectorRegExp, emailRegExp, phoneNumberRegExp } from '../consts/RegExps';
import { PERSONAL_INFO_ERROR, FACT_TYPES } from 'src/consts/consts';
import { FactService } from 'src/fact/fact.service'
import { simpleUserRole, SIMPLEUSER } from '../consts/user-consts';
import { OrganizationService } from 'src/organization/organization.service';
import { Types } from 'mongoose';

@Controller('/api/my-user')
export class MyUserController {

    constructor(
        private readonly myUserService: MyUserService,
        private readonly userService: UserService,
        private readonly factService: FactService,
        private readonly organizationService: OrganizationService
    ) { }

    @UseJwtAuth(SIMPLEUSER)
    @Post('/login')
    async logIn(@RequestUser() user, @Res() res) {
        let body = this.userService.login(user, res);
        res.send(body);
    }
    //*when:a user finished entering his information and press lets go in instruction component
    //*input: userData have inside of it organizationId,firstName,lastName,city,age,gender,familyStatus,sector. also get res because we need it to create the user
    //*output:right now sends the body of the success message
    @Post('/register')
    async register(@Body('userInfo') userData: UserInfo, @Res() res, @Body('customOrganization') customOrganization?: string) {
        const { organizationId, city, age, gender, familyStatus, sector, questionnaireId } = userData;

        if (customOrganization) {
            userData.organizationId = String(await this.organizationService.addOrganization(customOrganization, true)); // true for custom organization
        }

        //*validations
        let { firstName, lastName, phoneNumber, email } = userData
        firstName = firstName.trim();
        lastName = lastName.trim();
        phoneNumber = phoneNumber.trim();
        email = email.trim();
        try {
            if (firstName) {
                const checkFirstName = nameRegExp.test(firstName)
                if (!checkFirstName) { throw Error(PERSONAL_INFO_ERROR) }
            }

            if (familyStatus) {
                const checkFamilyStatus = questionInfoRegExp.test(familyStatus)
                if (!checkFamilyStatus) { throw Error(PERSONAL_INFO_ERROR) }
            }
            if (phoneNumber) {
                const checkPhoneNumber = phoneNumberRegExp.test(phoneNumber)
                if (!checkPhoneNumber) { throw Error(PERSONAL_INFO_ERROR) }
            }
            if (email) {
                const checkEmail = emailRegExp.test(email)
                if (!checkEmail) { throw Error(PERSONAL_INFO_ERROR) }
            }
            if (sector) {
                const checkSector = sectorRegExp.test(sector)
                if (!checkSector) { throw Error(PERSONAL_INFO_ERROR) }
            }
            if (gender) {
                const checkGender = nameRegExp.test(gender)
                if (!checkGender) { throw Error(PERSONAL_INFO_ERROR) }
            }
            if (lastName) {
                const checkLastName = nameRegExp.test(lastName)
                if (!checkLastName) { throw Error(PERSONAL_INFO_ERROR) }
            }

            userData.familyStatus = familyStatus.toUpperCase();
            userData.gender = gender.toUpperCase();

            //*after string is trimmed it being inserted to the userData again
            userData.firstName = firstName;
            userData.lastName = lastName;
            let body = await this.myUserService.forceLogin({ ...userData, username: Date.now().toString(), password: 'password' }, 'username', res, [simpleUserRole])
            body && this.handleFact(userData, body['_id']);
            res.send(body)
        }
        catch (err) {
            console.log(err);

            return { error: err.toString() }
        }
    }

    async handleFact(userData: UserInfo, userId: object) {
        //* Adding user info to fact table
        if (!userId || !userData || typeof userData !== "object") return;
        const { organizationId, city, age, gender, familyStatus, sector, firstName, lastName, questionnaireId } = userData;
        const organization = await this.organizationService.returnOrganizationById(Types.ObjectId(organizationId));
        if (!organization || typeof organization !== "object") {
            // console.log("user's info facts didn't create because there is no organization. userData: ", userData, "userId", userId);
            return;
        };
        const factRows = [
            [FACT_TYPES.USER_NAME, firstName + " " + lastName], //userName
            [FACT_TYPES.GENDER, gender], //userGender
            [FACT_TYPES.AGE, age], //userAge
            [FACT_TYPES.CITY, city], //userCity
            [FACT_TYPES.SECTOR, sector], //userSector
            [FACT_TYPES.ORGANIZATION, organization.organizationName, organizationId], //userOrganization
            [FACT_TYPES.FAMILY_STATUS, familyStatus], //userFamStat
            [FACT_TYPES.QUESTIONNAIRE, null, questionnaireId] // questionnaire
        ];
        this.factService.addFacts(factRows, String(userId));
    }


}