import LoginUserDto from "../dtos/loginUser.dto";
import RegisterUserDto from "../dtos/registerUser.dto";
import { User } from "../entities/User";
import { CredentialRepository } from "../repositories/credential.repository";
import { UserRepository } from "../repositories/user.repository";
import { ClientError } from "../utils/errors";
import bcrypt from "bcrypt";
import {
  checkPasswordService,
  createCredentialService,
} from "./credential.service";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/envs";

export const checkUserExists = async (email: string): Promise<boolean> => {
  const user = await UserRepository.findOneBy({ email });
  return !!user;
};

export const registerUserService = async (
  registerUserDto: RegisterUserDto
): Promise<User> => {
  const user = await UserRepository.create(registerUserDto);
  await UserRepository.save(user);
  const credential = await createCredentialService({
    password: registerUserDto.password,
  });
  user.credential = credential;
  await UserRepository.save(user);
  return UserRepository.findOneOrFail({
    where: { id: user.id },
  });
};

export const loginUserService = async (
  loginUserDto: LoginUserDto
): Promise<{ token: string; user: User }> => {
  const user: User | null = await UserRepository.findOne({
    where: {
      email: loginUserDto.email,
    },
    relations: ["credential", "orders"],
  });
  if (!user?.credential)
    throw new ClientError("User not found");

  const valid = await checkPasswordService(
    loginUserDto.password,
    user.credential.password
  );

  if (!valid) throw new ClientError("Invalid password");

  user.loginCount = (Number(user.loginCount) || 0) + 1;
  user.lastLoginAt = new Date();
  await UserRepository.save(user);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  const withoutSecrets = await UserRepository.findOneOrFail({
    where: { id: user.id },
  });

  return {
    user: withoutSecrets,
    token,
  };
};

export const getUserByIdService = async (id: number): Promise<User | null> => {
  return UserRepository.findOneBy({ id });
};

export const listPublicUsersService = async (): Promise<User[]> => {
  return UserRepository.find({
    order: { id: "ASC" },
  });
};

export const updateUserContactService = async (
  userId: number,
  address?: string,
  phone?: string
): Promise<User> => {
  const user = await UserRepository.findOneBy({ id: userId });
  if (!user) throw new ClientError("User not found");

  if (typeof address === "string") user.address = address.trim();
  if (typeof phone === "string") user.phone = phone.trim();

  await UserRepository.save(user);
  return user;
};

export const updateUserPasswordService = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const trimmedNew = newPassword.trim();
  if (trimmedNew.length < 6)
    throw new ClientError("New password too short");

  const user = await UserRepository.findOne({
    where: { id: userId },
    relations: ["credential"],
  });
  if (!user?.credential) throw new ClientError("User not found");

  const ok = await checkPasswordService(
    currentPassword,
    user.credential.password
  );
  if (!ok) throw new ClientError("Current password is invalid");

  const hashedPassword = await bcrypt.hash(trimmedNew, 10);
  await CredentialRepository.update(user.credential.id, {
    password: hashedPassword,
  });
};
