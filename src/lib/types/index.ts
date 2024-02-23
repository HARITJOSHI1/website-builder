import { Notification, Prisma, Role, User } from "@prisma/client";
import { getAuthUserDetails, getUserPermissions } from "../queries";

export type FuncReturnType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

export type NotificationWithUser =
  | ({
      User: {
        id: string;
        name: string;
        avatarUrl: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        agencyId: string | null;
      };
    } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>;
