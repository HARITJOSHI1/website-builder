"use client";

import {
  AuthUserWithAgencySigebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { User } from "@prisma/client";
import { SubAccount, SubAccountSidebarOption } from "@prisma/client";
import React, { useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

type TProps = {
  type: "agency" | "subaccount";
  id: string;
  subAccounts: SubAccount[];
  userData?: Partial<User>;
};

const UserDetails = ({ id, type, userData, subAccounts }: TProps) => {
  // states
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts>(null);

  const { setOpen, data } = useModal();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySigebarOptionsSubAccounts | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  return <div>UserDetails</div>;
};

export default UserDetails;
