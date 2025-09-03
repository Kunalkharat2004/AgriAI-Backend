export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: "user" | "admin";
}
export interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
}
