import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import DataTable from "./data-table";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import SendInvitation from "@/components/forms/SendInvitation";

type TProps = { params: { agencyId: string } };

const page = async ({ params }: TProps) => {
  const authUser = await currentUser();
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },

    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: {
        include: { SubAccount: true },
      },
    },
  });

  if (!teamMembers) return null;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: { SubAccount: true },
  });

  if (!agencyDetails) return;

  return (
    <div>
      <DataTable
        actionButtonText={
          <>
            <Plus size={15}/> Add
          </>
        }

        modalChildren={<SendInvitation agencyId={params.agencyId} />}
        filterValue="name"
        columns={columns}
        data={teamMembers}
      />
    </div>
  );
};

export default page;
