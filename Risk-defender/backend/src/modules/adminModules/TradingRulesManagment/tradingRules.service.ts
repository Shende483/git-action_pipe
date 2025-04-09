import { Injectable } from '@nestjs/common';
import { MarketType } from '../MarketType/marketType.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { TradingRulesDto } from './dto/tradingRules.dto';
import { TradingRules, TradingRulesDocument } from './tradingRules.schema'; // Added TradingRulesDocument
import { Types } from 'mongoose';

const ObjectId = Types.ObjectId;

@Injectable()
export class TradingRulesService {
  constructor(
    @InjectModel(TradingRules.name)
    private tradingRulesModel: Model<TradingRulesDocument>,
    @InjectModel(MarketType.name) private marketTypeModel: Model<MarketType>,
  ) {}

  async createTradingRules(
    tradingRulesDto: TradingRulesDto,
    res: Response,
  ): Promise<TradingRulesDocument | void> {
    const { marketTypeId, rules } = tradingRulesDto;

    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        message: '❌ Market type does not exist.',
        success: false,
      });
      return; // Explicit return to avoid further execution
    }

    try {
      const addRules = new this.tradingRulesModel({
        marketTypeId,
        rules,
      });
      const savedRules = await addRules.save();
      console.log('✅ Trading rules created successfully:', savedRules);

      res.status(200).json({
        statusCode: 200,
        message: '✅ Trading rules created successfully.',
        success: true,
        data: savedRules,
      });
    } catch (error) {
      console.error('❌ Error saving broker:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. Trading rules not saved.',
        success: false,
      });
    }
  }

  async getRules(): Promise<TradingRulesDocument[]> {
    try {
      return this.tradingRulesModel.find().exec();
    } catch (error) {
      console.error('Error retrieving trading rules:', error);
      throw error;
    }
  }

  async getRulesByMarketTypeId(
    marketTypeId: string,
  ): Promise<TradingRulesDocument[]> {
    try {
      return this.tradingRulesModel
        .find({ marketTypeId: new ObjectId(marketTypeId) })
        .exec();
    } catch (error) {
      console.error('Error retrieving trading rules by market type ID:', error);
      throw error;
    }
  }
}
