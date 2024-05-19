import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

type TProps = {
  searchParams: { state: string; code: string };
};

const page = async ({ searchParams }: TProps) => {
  const authUser = await currentUser();
  const agencyId = await verifyAndAcceptInvitation(authUser);

  console.log("Id", agencyId);

  if (!agencyId) return <Unauthorized />;

  const user = await getAuthUserDetails(authUser);
  if (!user) return;

  const subAccPermission = user.Permissions.find((p) => p.access);

  if (searchParams.state) {
    const statePath = searchParams.state.split("___")[0];
    const stateSubAccId = searchParams.state.split("___")[1];

    if (!stateSubAccId) return <Unauthorized />;
    return redirect(
      `/subaccount/${stateSubAccId}/${statePath}?code=${searchParams.code}`
    );
  }

  if (subAccPermission?.access)
    return redirect(`/subaccount/${subAccPermission.subAccountId}`);
  return <Unauthorized />;
};

export default page;
