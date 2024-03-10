import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { getLanesWithTicketAndTags, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from "@/lib/queries";
import { LaneDetails } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import PipelineInfoBar from "../_components/PipelineInfoBar";
import PipelineSettings from "../_components/PipelineSettings";
import PipelineView from "../_components/PipelineView";

type TProps = {
  params: {
    subAccountId: string;
    pipelineId: string;
  };
};

const page = async ({ params }: TProps) => {
  const { subAccountId, pipelineId } = params;
  const pipelineDetails = await getPipelineDetails(pipelineId);

  if (!pipelineDetails)
    return redirect(`/subaccount/${params.subAccountId}/pipelines`);

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subAccountId },
  });

  const lanes = (await getLanesWithTicketAndTags(pipelineId)) as LaneDetails[];

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          subAccountId={params.subAccountId}
          pipelines={pipelines}
        />

        <div>
          <TabsTrigger value="view">Pipeline view</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          subAccountId={params.subAccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
        
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          subAccountId={params.subAccountId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default page;
