import { AppDataSource } from "../config/dataSource";
import { Address } from "../entities/Address";

export const AddressRepository = AppDataSource.getRepository(Address);
