"use server";

import { clerkClient } from "@clerk/nextjs";
import { db } from "./db";
import { User as AuthUser, currentUser } from "@clerk/nextjs/server";
import { Agency, Plan, Role, SubAccount, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { use } from "react";
import { v4 } from "uuid";
import { CreateMediaType } from "./types";

export const getAuthUserDetails = async (authUser: AuthUser | null = null) => {
  if (!authUser) authUser = await currentUser();

  const user = await db.user.findUnique({
    where: {
      email: authUser?.emailAddresses[0].emailAddress,
    },

    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },

      Permissions: true,
    },
  });

  return user;
};

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string;
  description: string;
  subAccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;

  if (!authUser) {
    const res = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subAccountId },
          },
        },
      },
    });

    if (res) userData = res;
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser?.emailAddresses[0].emailAddress,
      },
    });
  }

  if (!userData) console.log("Couldn't find the user");

  let foundAgencyId = agencyId;

  if (!agencyId) {
    if (!subAccountId)
      throw new Error(
        "You need to provide atleast an aegency id or subaccount id"
      );

    const res = await db.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
    });

    if (res) foundAgencyId = res.agencyId;
  }

  if (subAccountId) {
    await db.notification.create({
      data: {
        notification: `${userData?.name} | ${description}`,
        User: {
          connect: {
            id: userData?.id,
          },
        },

        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },

        SubAccount: {
          connect: {
            id: subAccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData?.name} | ${description}`,
        User: {
          connect: {
            id: userData?.id,
          },
        },

        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

const createUserTeam = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const res = await db.user.create({
    data: {
      ...user,
    },
  });

  return res;
};

export const verifyAndAcceptInvitation = async (authUser: AuthUser | null) => {
  if (!authUser) return redirect("/sign-in");

  // find invited user
  const invitedUser = await db.invitation.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  // if invited create their account
  if (invitedUser) {
    const userDetails = await createUserTeam(invitedUser.agencyId, {
      agencyId: invitedUser.agencyId,
      email: invitedUser.email,
      avatarUrl: authUser.imageUrl,
      id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`,
      role: invitedUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // save the action occured
    await saveActivityLogsNotification({
      agencyId: invitedUser?.agencyId,
      description: "joined",
      subAccountId: undefined,
    });

    // if user created updated their metadata in clerk
    if (userDetails) {
      await clerkClient.users.updateUserMetadata(authUser.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      await db.invitation.delete({ where: { email: userDetails.email } });
      return userDetails.agencyId;
    }
    return null;
  }

  //  if no invitation return the agency id
  else {
    const agency = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });

    return agency?.agencyId ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) =>
  await db.agency.update({
    where: {
      id: agencyId,
    },
    data: {
      ...agencyDetails,
    },
  });

export const deletingAgency = async (agencyId: string) => {
  const res = db.agency.delete({
    where: {
      id: agencyId,
    },
  });

  return res;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();

  if (!user) return;

  const userData = await db.user.upsert({
    where: { email: user.emailAddresses[0].emailAddress },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  return userData;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationsAndUser = async (id: string) => {
  try {
    const notifs = await db.notification.findMany({
      where: { agencyId: id },
      include: { User: true },
      orderBy: { createdAt: "desc" },
    });

    return notifs;
  } catch (err) {
    console.log(err);
  }
};

export const upsertSubAccount = async (subAcc: SubAccount) => {
  if (!subAcc.companyEmail) return null;

  const agency = await db.user.findFirst({
    where: {
      Agency: {
        id: subAcc.agencyId,
      },

      role: "AGENCY_OWNER",
    },
  });

  if (!agency) {
    console.log("error");
    return;
  }

  const permissionId = v4();
  const res = await db.subAccount.upsert({
    where: {
      id: subAcc.id,
    },

    update: subAcc,

    create: {
      ...subAcc,
      Permissions: {
        create: {
          id: permissionId,
          access: true,
          email: agency.email,
        },

        connect: {
          subAccountId: subAcc.id,
          id: permissionId,
        },
      },

      Pipeline: {
        create: {
          name: "Lead cycle",
        },
      },

      SidebarOption: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAcc.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAcc.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAcc.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAcc.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAcc.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAcc.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAcc.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAcc.id}`,
          },
        ],
      },
    },
  });

  return res;
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  });

  return response;
};

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || "SUBACCOUNT_USER",
    },
  });

  return response;
};

export const changeUserPermission = async (
  permissionId: string,
  email: string,
  subAccountId: string,
  permission: boolean
) => {
  const res = await db.permissions.upsert({
    where: {
      id: permissionId,
    },

    update: {
      access: permission,
    },

    create: {
      email,
      subAccountId,
      access: permission,
    },
  });

  return res;
};

export const getSubAccountDetails = async (subAccId: string) => {
  const res = await db.subAccount.findUnique({
    where: { id: subAccId },
  });

  return res;
};

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  });
  return response;
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  const resposne = await db.invitation.create({
    data: { email, agencyId, role },
  });

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return resposne;
};

export const getMedia = async (subId: string) => {
  const mediaFiles = await db.subAccount.findUnique({
    where: { id: subId },
    include: { Media: true },
  });

  return mediaFiles;
};

export const createMedia = async (
  subaccountId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const deleteMedia = async (fileId: string) => {
  const res = await db.media.delete({
    where: { id: fileId },
  });

  return res;
};
