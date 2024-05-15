import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const { customerId, priceId } = await req.json();

  if (!customerId || !priceId)
    return new NextResponse("Customer Id or Price Id is missing", {
      status: 400,
    });

  const subscriptions = await db.agency.findFirst({
    where: {
      customerId,
    },

    include: {
      Subscription: true,
    },
  });

  try {
    if (
      subscriptions?.Subscription?.id &&
      subscriptions?.Subscription?.active
    ) {
        
      // update the subscription
      if (!subscriptions?.Subscription?.id)
        throw new Error("Couldn't find the subscription.");
      console.log("Updating subscription....");

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptions.Subscription.subscritiptionId
      );

      const stripeSubscription = await stripe.subscriptions.update(
        subscriptions.Subscription.subscritiptionId,
        {
          items: [
            { id: currentSubscriptionDetails.items.data[0].id, deleted: true },
            { price: priceId },
          ],

          expand: ["latest_invoice.payment_intent"],
        }
      );

      return NextResponse.json({
        subscriptionId: stripeSubscription.id,
        //@ts-ignore
        clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
      console.log("Creating a subscription....");

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (e) {
    console.log("🔴 Error", e);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
};
