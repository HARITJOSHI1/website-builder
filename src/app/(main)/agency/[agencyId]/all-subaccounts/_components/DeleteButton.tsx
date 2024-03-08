"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  deleteSubAccount,
  getSubAccountDetails,
  saveActivityLogsNotification,
} from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";

type TProps = {
  subAccountId: string;
};

const DeleteButton = ({ subAccountId }: TProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    const res = await getSubAccountDetails(subAccountId);
    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Deleted a subaccount | ${res?.name}`,
      subAccountId,
    });
    const deleted = await deleteSubAccount(subAccountId);

    if (deleted) {
      toast({
        title: "Deleted Subaccount",
        description: "Account deleted successfully",
        variant: "default",
      });

      router.refresh();
    }
  };

  return <div onClick={handleDelete}>DeleteButton</div>;
};

export default DeleteButton;
