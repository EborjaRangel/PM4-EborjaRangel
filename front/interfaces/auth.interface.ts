export type UserRole = "user" | "admin";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  loginCount: number;
  lastLoginAt: string;
}

export type PublicUser = Omit<IUser, "password">;
