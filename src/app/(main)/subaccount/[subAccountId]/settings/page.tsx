import SubAccountDetails from "@/components/forms/SubAccountDetails";
import UserDetails from "@/components/forms/UserDetails";
import BlurPage from "@/components/global/BlurPage";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";

type TProps = {
  params: {
    subAccountId: string;
  };
};

const page = async ({ params }: TProps) => {
  const authUser = await currentUser();
  const userDetails = await db.user.findUnique({
    where: { email: authUser?.emailAddresses[0].emailAddress },
  });
  if (!userDetails) return;

  const subAccountDetails = await db.subAccount.findUnique({
    where: { id: params.subAccountId },
  });
  if (!subAccountDetails) return;

  const agencyDetails = await db.agency.findUnique({
    where: { id: subAccountDetails.agencyId },
    include: { SubAccount: true }
  });

  if (!agencyDetails) return;
  const subAccounts = agencyDetails.SubAccount

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccountDetails}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subAccountId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  );
};

export default page;
