import AgencyDetails from "@/components/forms/AgencyDetails";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type TAgency = {
  searchParams: {
    plan: Plan;
    state: string;
    code: string;
  };
};

const Agency = async ({ searchParams }: TAgency) => {
  const authUser = await currentUser();
  const agencyId = await verifyAndAcceptInvitation();
  console.log("AGENCY ID: ", { agencyId });

  await new Promise((r) => setTimeout(() => r(1), 5000));
  
  // get user details
  const user = await getAuthUserDetails();

  if (agencyId) {
    if (user?.role.includes("SUBACCOUNT")) return redirect("/subaccount");
    else if (user?.role.includes("AGENCY")) {
      if (searchParams.plan)
        return redirect(
          `/agency?=${agencyId}/billing?plan=${searchParams.plan}`
        );

      if (searchParams.state) {
        const stateAgencyPath = searchParams.state.split("__")[0];
        const stateAgencyId = searchParams.state.split("___")[0];

        if (!stateAgencyId) return <div>Not Authorized</div>;
        return redirect(
          `/agent/${stateAgencyId}/${stateAgencyPath}?code=${searchParams.code}`
        );
      }

      return redirect(`/agency/${agencyId}`);
    }
  } 
  // else return <div>Not Authorized</div>;

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl mb-6"> Create an Agency</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  );
};

export default Agency;
