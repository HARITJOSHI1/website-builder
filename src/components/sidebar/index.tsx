import { getAuthUserDetails } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import MenuOptions from "./MenuOptions";
import { FuncReturnType } from "@/lib/types";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const findSubAcc = (
  user: FuncReturnType<typeof getAuthUserDetails>,
  id: string
) => user?.Agency?.SubAccount.find((subAcc) => subAcc.id === id);


const Sidebar = async ({ id, type }: Props) => {
  const authUser = await currentUser();
  const user = await getAuthUserDetails(authUser);

  if (!user?.Agency) return;
  const details = type === "agency" ? user.Agency : findSubAcc(user, id);
  const isWhiteLabeled = user.Agency.whiteLabel;

  if (!details) return;
  let sidebarLogo = user.Agency.agencyLogo || "/assets/plura-logo";

  if (!isWhiteLabeled) {
    if (type === "subaccount")
      sidebarLogo =
        findSubAcc(user, id)?.subAccountLogo || user.Agency.agencyLogo;
  }

  const sidebarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : findSubAcc(user, id)?.SidebarOption || [];

  const subAccounts = user?.Agency?.SubAccount.filter((subAcc) =>
    user.Permissions.find(
      ({ subAccountId, access }) => subAccountId === subAcc.id && access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subAccounts}
        user={user}
      />

      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subAccounts}
        user={user}
      />
    </>
  );
};

export default Sidebar;
