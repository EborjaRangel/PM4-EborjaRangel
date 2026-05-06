import { AppDataSource } from "../config/dataSource";
import { PurchaseRecord } from "../entities/PurchaseRecord";

export const PurchaseRecordRepository =
  AppDataSource.getRepository(PurchaseRecord);
