export interface IAuthor{
    _id:string,
    email:string,
    password:string,
}
export interface UpdateUserRequestBody {
    name?: string;
    email?: string;
    oldPassword?: string;
    newPassword?: string;
  }