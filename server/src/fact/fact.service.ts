import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { ObjectID, Repository } from 'typeorm';
import { Fact } from './fact.entity';

type factRow = Array<string | number | Types.ObjectId> //* [fact_type, fact_value, fact_value_id]

@Injectable()
export class FactService {
  constructor(
    @InjectRepository(Fact)
    private factRepository: Repository<Fact>,
  ) { }

  async addFacts(typeAndValuesArr: Array<factRow> | factRow, userId: string) {
    //* Function add new facts with the same timestamp
    if (!userId || !typeAndValuesArr) return;
    const timeStamp = new Date();
    const newFacts = [];
    if (Array.isArray(typeAndValuesArr[0])) {
      typeAndValuesArr.forEach((typeVal) => {
        const factRow = this.fitObj(typeVal, timeStamp, userId);
        factRow && newFacts.push(factRow);
      });
    }
    else {
      const factRow = this.fitObj(typeAndValuesArr, timeStamp, userId);
      factRow && newFacts.push(factRow);
    };
    try {
      const newFactRes = await this.factRepository.save(newFacts);
    } catch (error) {
      console.log('error creating newFacts: ', error, "typeAndValuesArr", typeAndValuesArr, "timeStamp", timeStamp, "userId", userId);
    }
  };

  fitObj(typeVal, timeStamp, userId) {
    try {
      const [factType, factValue, factValueId] = typeVal;
      return {
        grainObjId: String(userId),
        timeStamp,
        factType,
        factValue: (factValue && factValue.toString()) || null,
        factValueId: (factValueId && String(factValueId)) || null
      };
    } catch (error) {
      console.log("error addFacts", error, "typeVal:", typeVal, 'timeStamp', timeStamp, "userId", userId);
    }
  }
}