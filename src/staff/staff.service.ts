import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Types } from 'mongoose';
import { CreateStaffDto } from './dtos/staff.create.dto';
import { Staff, StaffDocument } from './schemas/staff.schema';
import { Log, LogDocument } from 'src/logs/schemas/logs.schema';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private readonly model: Model<StaffDocument>,
    @InjectModel(Log.name) private readonly logModel: Model<LogDocument>,
  ) {}

  async getAll() {
    return await this.model.find();
  }

  async create(createStaffDto: CreateStaffDto) {
    if (await this.findByName(createStaffDto)) {
      throw new HttpException('staff already exists', HttpStatus.BAD_REQUEST);
    }

    return await new this.model(createStaffDto).save();
  }

  async findByName(createStaffDto: CreateStaffDto) {
    return await this.model.findOne(createStaffDto);
  }

  async findById(staffId: string) {
    return await this.model.findById(staffId);
  }

  async updateStaff(id: string, createStaffDto: CreateStaffDto) {
    const staff = await this.findById(id);
    if (!staff) {
      throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
    }

    const newStaff = await this.model.findByIdAndUpdate(id, createStaffDto, {
      new: true,
    });
    return newStaff;
  }

  async deleteStaff(id: string) {
    const staff = await this.findById(id);
    if (!staff) {
      throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
    }

    await this.logModel.deleteMany({ staff: id });
    return await this.model.findByIdAndDelete(id);
  }
}
