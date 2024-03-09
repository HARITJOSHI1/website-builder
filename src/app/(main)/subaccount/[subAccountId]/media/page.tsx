import BlurPage from "@/components/global/BlurPage";
import Media from "@/components/media";
import { getMedia } from "@/lib/queries";
import React from "react";

type TProps = {
  params: { subaccountId: string };
};

const page = async ({ params }: TProps) => {
  const data = await getMedia(params.subaccountId);

  return (
    <BlurPage>
      <Media data={data} subaccountId={params.subaccountId} />
    </BlurPage>
  );
};

export default page;
