import { CircleAlert, MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
import { data, Form, redirect, useActionData } from "react-router";

import type { Route } from "./+types/track";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import InputControl from "~/components/InputControl";
import Label from "~/components/Label";
import { H1, H2 } from "~/components/Heading";

import prisma from "~/lib/prisma.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const orderId = form.get("order")?.toString();

  if (!orderId) {
    return data({ error: "order id is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return data({ error: "invalid order id" }, { status: 400 });
  }

  return redirect(`/order/${orderId}`);
}

export default function Track() {
  const aData = useActionData<typeof action>();

  const [error, setError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (aData) {
      setError(aData.error);
    }
  }, [aData]);

  return (
    <>
      <H1>track your order</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">see the status of your purchase</p>

      <BackgroundGradient className="mt-4">
        <Card className="p-4">
          <H2 className="mb-4 pb-4 border-b border-zinc-700">enter your order id</H2>

          <Form className="flex flex-col gap-4" method="post">
            {error && <ErrorMessage error={error} />}

            <InputControl>
              <Label htmlFor="order_id">order id</Label>

              <Input
                id="order_id"
                name="order"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </InputControl>

            <Button type="submit">
              <span>track</span>
              <MoveRight className="w-5 h-5" />
            </Button>
          </Form>
        </Card>
      </BackgroundGradient>
    </>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-red-950 border border-red-500 rounded-lg text-red-500 text-sm font-semibold">
      <CircleAlert className="w-4 h-4" />
      <p>{error}</p>
    </div>
  );
}
