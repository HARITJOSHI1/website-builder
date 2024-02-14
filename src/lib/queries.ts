"use server";

import { clerkClient } from "@clerk/nextjs";
import { db } from "./db";
import { User as AuthUser, currentUser } from "@clerk/nextjs/server";
import { Agency, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { use } from "react";

export const getAuthUserDetails = async (authUser: AuthUser | null) => {
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
