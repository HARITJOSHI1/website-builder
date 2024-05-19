import BlurPage from "@/components/global/BlurPage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getStripeOAuthLink } from "@/lib/utils";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type TProps = {
  params: { subAccountId: string };
  searchParams: { state: string; code: string };
};

const page = async ({ params, searchParams }: TProps) => {
  const subAccDetails = await db.subAccount.findUnique({
    where: { id: params.subAccountId },
  });

  if (!subAccDetails) return;

  const allDetailsExist =
    subAccDetails.address &&
    subAccDetails.subAccountLogo &&
    subAccDetails.city &&
    subAccDetails.companyEmail &&
    subAccDetails.companyPhone &&
    subAccDetails.country &&
    subAccDetails.name &&
    subAccDetails.state &&
    subAccDetails.zipCode;

  const stripeOAuthLink = getStripeOAuthLink(
    "subaccount",
    `launchpad___${subAccDetails.id}`
  );

  let connectedStripeAcc = false;

  if (searchParams.code) {
    if (!subAccDetails.connectAccountId) {
      try {
        const res = await stripe.oauth.token({
          grant_type: "authorization_code",
          code: searchParams.code,
        });

        await db.agency.update({
          where: { id: subAccDetails.id },
          data: { connectAccountId: res.stripe_user_id },
        });

        connectedStripeAcc = true;
      } catch {
        console.log("🔴 Could not connect stripe account");
      }
    }
  }

  return (
    <BlurPage>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[800px]">
          <Card className="border-none ">
            <CardHeader>
              <CardTitle>Lets get started!</CardTitle>
              <CardDescription>
                Follow the steps below to get your account setup correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
                <div className="flex items-center gap-4">
                  <Image
                    src="/assets/appstore.png"
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain"
                  />
                  <p>Save the website as a shortcut on your mobile devide</p>
                </div>
                <Button>Start</Button>
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src="/assets/stripeLogo.png"
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain "
                  />
                  <p>
                    Connect your stripe account to accept payments. Stripe is
                    used to run payouts.
                  </p>
                </div>
                {subAccDetails.connectAccountId || connectedStripeAcc ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={stripeOAuthLink || ""}
                  >
                    Start
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={subAccDetails.subAccountLogo}
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain p-4"
                  />
                  <p>Fill in all your business details.</p>
                </div>
                {allDetailsExist ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={`/subaccount/${subAccDetails.id}/settings`}
                  >
                    Start
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  );
};

export default page;
