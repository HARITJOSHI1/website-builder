import { createAPICaller } from "@/server/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import React from "react";

const page = async () => {
  const api = createAPICaller(cookies().get("__session"));
  return <div>{(await api.v1.agency.get()).length}</div>;
};

export default page;
