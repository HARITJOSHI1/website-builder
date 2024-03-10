import BlurPage from "@/components/global/BlurPage";
import Media from "@/components/media";
import { getMedia } from "@/lib/queries";
import React from "react";

type TProps = {
  params: { subAccountId: string };
};

const page = async ({ params }: TProps) => {
  const data = await getMedia(params.subAccountId);

  return (
    <BlurPage>
      <Media data={data} subAccountId={params.subAccountId} />
    </BlurPage>
  );
};

export default page;
