import BlurPage from "@/components/global/BlurPage";
import InfoBar from "@/components/global/InfoBar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import {
  getNotificationsAndUser,
  verifyAndAcceptInvitation,
} from "@/lib/queries";
import { FuncReturnType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

type TProps = {
  children: React.ReactNode;
  params: { agencyId: string };
};

const layout = async ({ params, children }: TProps) => {
  const authUser = await currentUser();
  const agencyId = await verifyAndAcceptInvitation(authUser);

  if (!authUser) return redirect("/");
  if (!agencyId) return redirect("/agency");

  if (!(authUser.privateMetadata.role as string).includes("AGENCY"))
    return <Unauthorized />;

  let allNotifs: FuncReturnType<typeof getNotificationsAndUser> = [];

  const notifications = await getNotificationsAndUser(agencyId);
  if (notifications) allNotifs = notifications;

  return (
    <div className="h-screen overflow-hidden" suppressHydrationWarning>
      <Sidebar id={params.agencyId} type="agency" />

      <div className="md:pl-[300px]">
        <InfoBar notifications={allNotifs} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
