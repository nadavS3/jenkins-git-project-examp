import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationData, OrganizationDataAndAdmin } from 'src/consts/dtos/interfaces';
import { ADMIN } from 'src/consts/user-consts';
import { OrganizationInfo } from 'src/dtos/organization.dto';
import { Organization, OrganizationDocument } from 'src/schemas/organization.schema';

@Injectable()
export class OrganizationService {

    constructor(@InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>) { }


    //? not sure if we actually using this
    createOrganization(organizationInfo: OrganizationInfo) {
        const organizationForDB = {
            organizationName: organizationInfo.name,
        }
        const createdOrganization = new this.organizationModel(organizationForDB);

        return createdOrganization.save();
    }

    async returnAllOrganizations(): Promise<Array<OrganizationData>> {
        const res = await this.organizationModel.find({ deleted: { $exists: false }, custom: { $exists: false } }, { _id: 1, organizationName: 1 });

        return res;
    }

    async allOrganizationsIncludeDeleted(): Promise<Array<OrganizationData>> {
        return await this.organizationModel.find({}, { _id: 1, organizationName: 1 });
    }

    async customDeleteOne(organizationId: Types.ObjectId) {
        try {
            return await this.organizationModel.updateOne({ _id: organizationId }, { $set: { deleted: true } });
        }
        catch (err) {
            return err;
        }
    }

    async addOrganization(organizationName: string, custom?: boolean): Promise<Types.ObjectId> /* id of organization added */ {
        try {
            let insertObj: { organizationName: string, custom?: boolean } = { organizationName: organizationName };
            if (custom) { insertObj.custom = true };
            const res = await this.organizationModel.insertMany(insertObj);
            return res[0]._id;
        }
        catch (err) {
            return err;
        }
    }

    async returnOrganizationById(organizationId: Types.ObjectId): Promise<OrganizationData> {
        try {
            return await this.organizationModel.findOne({ _id: organizationId });
        } catch (error) {
            console.log('error in returnOrganizationById: ', error);
        }
    }

    async returnOrganizationAndAdminById(organizationId: Types.ObjectId | object): Promise<OrganizationDataAndAdmin> {
        try {
            let aggregation = [];
            const match = { $match: { _id: organizationId } }
            const lookupUserAnswers = {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'users'
                }
            };
            const unwind = { $unwind: "$users" }
            const matchAdmin = { $match: { "users.type": 'Admin' } }
            const project = {
                $project: {
                    organizationName: 1,
                    email: "$users.username"
                }
            }
            aggregation.push(match, lookupUserAnswers, unwind, matchAdmin, project)
            let res = await this.organizationModel.aggregate(aggregation)
            if (res.length > 1) { throw 'too much admins' }
            return res[0]

            // return await this.organizationModel.findOne({ _id: organizationId });
        } catch (error) {
            console.log('error in returnOrganizationAndAdminById: ', error);
        }
    }

    async updateOrganization(organizationId: Types.ObjectId | object, organizationName: string): Promise<any> {
        try {
            return await this.organizationModel.updateOne({ _id: organizationId }, { $set: { organizationName: organizationName } })
        } catch (error) { }
    }
}