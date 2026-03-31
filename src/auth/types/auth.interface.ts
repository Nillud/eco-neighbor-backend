import { UserModel } from "prisma/generated/models";

export type TAuthTokenData = Pick<UserModel, 'id' | 'role'>