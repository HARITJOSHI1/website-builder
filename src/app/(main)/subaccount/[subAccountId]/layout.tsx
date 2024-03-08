import BlurPage from "@/components/global/BlurPage";
import InfoBar from "@/components/global/InfoBar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import {
  getAuthUserDetails,
  getNotificationsAndUser,
  getUserPermissions,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { FuncReturnType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

type TProps = {
  children: ReactNode;
  params: {
    subaccountId: string;
  };
};

const layout = async ({ children, params }: TProps) => {
  const authUser = await currentUser();
  if (!authUser) return redirect("/");

  const agencyId = await verifyAndAcceptInvitation(authUser);
  if (!agencyId) return <Unauthorized />;

  const allPermissions = await getAuthUserDetails(authUser);
  const hasPermission = allPermissions?.Permissions.find(
    ({ subAccountId, access }) => access && subAccountId === params.subaccountId
  );

  if (!hasPermission) return <Unauthorized />;

  let allNotifs: FuncReturnType<typeof getNotificationsAndUser> = [];

  const notifications = await getNotificationsAndUser(agencyId); 
  if (notifications)
    if ((authUser.privateMetadata.role as Role).includes("AGENCY"))
      allNotifs = notifications;
    else
      allNotifs = notifications.filter(
        ({ subAccountId }) => subAccountId === params.subaccountId
      );

  return (
    <div className="h-screen overflow-hidden" suppressHydrationWarning>
      <Sidebar id={params.subaccountId} type="subaccount" />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={allNotifs}
          role={authUser.privateMetadata?.role as Role}
          subAccountId={params.subaccountId}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
