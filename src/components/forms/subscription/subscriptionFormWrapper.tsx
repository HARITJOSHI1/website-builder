"use client";

import Loader from "@/components/global/Loader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { pricingCards } from "@/lib/constants";
import { useModal } from "@/providers/modal-provider";
import { Plan } from "@prisma/client";
import { StripeElementsOptions } from "@stripe/stripe-js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import SubscriptionForm from ".";
import { getStripe } from "@/lib/stripe/client";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();
  const [isPlanUpgraded, setIsPlanUpgraded] = useState(false);
  const router = useRouter();
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | "">(
    data.plans?.defaultPlanId || ""
  );

  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: "", clientSecret: "" });

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: "night",
      },
    }),
    [subscription]
  );

  useEffect(() => {
    if (!selectedPriceId) return;
    if (isPlanUpgraded) return;

    const createSecret = async () => {
      console.log("Called with price id", selectedPriceId);

      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedPriceId,
        }),
      });

      const data = await res.json();      

      setSubscription({
        clientSecret: data.clientSecret,
        subscriptionId: data.subscriptionId,
      });
      if (planExists) {
        toast({
          title: "Success",
          description: "Your plan has been successfully upgraded!",
        });
        setClose();
        setIsPlanUpgraded(true);
        
        router.refresh(); 
      }
    };

    createSecret();
  }, [data, selectedPriceId, customerId]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.list.map((price) => (
          <Card
            onClick={() => {
              setIsPlanUpgraded(false);
              setSelectedPriceId(price.id as Plan);
            }}
            className={clsx("relative cursor-pointer transition-all", {
              "border-primary": selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ₹{price.unit_amount ? price.unit_amount / 100 : "0"}
                <p className="text-sm text-muted-foreground">
                  {price.nickname}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.priceId === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>

            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;