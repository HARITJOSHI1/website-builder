import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type TProps = {
  params: { subaccountId: string };
};

const page = async ({ params }: TProps) => {
  const pipeline = await db.pipeline.findFirst({
    where: { subAccountId: params.subaccountId },
  });

  if (pipeline)
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${pipeline.id} `
    );

  try {
    const response = await db.pipeline.create({
      data: { name: "First Pipeline", subAccountId: params.subaccountId },
    });

    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${response.id}`
    );
  } catch (error) {
    console.log("Some error occured in pipeline", error);
  }

};

export default page;
