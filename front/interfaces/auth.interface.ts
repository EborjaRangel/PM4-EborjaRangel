export type UserRole = "user" | "admin";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  address: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  loginCount: number;
  lastLoginAt: string;
}

export type PublicUser = Omit<IUser, "password">;

export interface ILoginFormValues {
  email: string;
  password: string;
}

export interface IRegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: string;
}

/** Dirección de entrega + teléfono (perfil / checkout). */
export interface IContactDeliveryFormValues {
  address: string;
  phone: string;
}
