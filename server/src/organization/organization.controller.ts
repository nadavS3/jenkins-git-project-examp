import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrganizationInfo } from 'src/dtos/organization.dto';
import { OrganizationService } from './organization.service';
import { SUPERADMIN } from "../consts/user-consts";
import { UseJwtAuth } from '@hilma/auth-mongo-nest';


@Controller('api/organization')
export class OrganizationController {

    constructor(
        private readonly organizationService: OrganizationService,
    ) { }

    //*not using right now
    @UseJwtAuth(SUPERADMIN)
    @Post()
    async createOrganization(@Body() organizationInfo: OrganizationInfo) {
        try {
            const res = await this.organizationService.createOrganization(organizationInfo);
            return { success: "SUCCESS" };
        }
        catch (e) {
            return { err: "error" }
        }
    }
    //*used when user is registering and give back all the organizations
    @Get('/all')
    async getOrganizations() {
        return await this.organizationService.returnAllOrganizations();
    }

    @UseJwtAuth(SUPERADMIN)
    @Get('/specific-organization/:organizationId')
    async getSpecificOrganizations(@Param('organizationId') organizationId: string) {
        return await this.organizationService.returnOrganizationById(new Types.ObjectId(organizationId));
    }

    @UseJwtAuth(SUPERADMIN)
    @Get('/specific-organization-admin/:organizationId')
    async getSpecificOrganizationAdmin(@Param('organizationId') organizationId: string) {
        return await this.organizationService.returnOrganizationAndAdminById(new Types.ObjectId(organizationId));
    }


    @UseJwtAuth(SUPERADMIN)
    @Put('delete-one-and-fetch')
    async deleteOne(@Body('organizationId') organizationId: string) {
        const res = await this.organizationService.customDeleteOne(new Types.ObjectId(organizationId));
        return await this.organizationService.returnAllOrganizations();
    }
}
