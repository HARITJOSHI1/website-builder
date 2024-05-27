import { db } from "@/lib/db";
import EditorProvider from "@/providers/editor/editor-provider";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    subAccountId: string;
    funnelId: string;
    funnelPageId: string;
  };
};

const page = async ({ params }: Props) => {
  const funnelPageDetails = await db.funnelPage.findFirst({
    where: {
      id: params.funnelPageId,
    },
  });

  if (!funnelPageDetails)
    return redirect(
      `/subaccount/${params.subAccountId}/funnels/${params.funnelId}`
    );

    
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        subaccountId={params.subAccountId}
        pageDetails={funnelPageDetails}
        funnelId={params.funnelId}
      >
        <div></div>
      </EditorProvider>
    </div>
  );
};

export default page;
