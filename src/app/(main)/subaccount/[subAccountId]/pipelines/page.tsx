import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type TProps = {
  params: { subAccountId: string };
};

const page = async ({ params }: TProps) => {
  const pipeline = await db.pipeline.findFirst({
    where: { subAccountId: params.subAccountId },
  });

  if (pipeline)
    return redirect(
      `/subaccount/${params.subAccountId}/pipelines/${pipeline.id} `
    );

  try {
    const response = await db.pipeline.create({
      data: { name: "First Pipeline", subAccountId: params.subAccountId },
    });

    return redirect(
      `/subaccount/${params.subAccountId}/pipelines/${response.id}`
    );
  } catch (error) {
    console.log("Some error occured in pipeline", error);
  }

};

export default page;
