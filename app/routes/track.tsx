import { CircleAlert, MoveRight } from "lucide-react";
import { useState } from "react";
import { Form, useNavigate } from "react-router";
import BackgroundGradient from "~/components/BackgroundGradient";

import Button from "~/components/Button";
import Card from "~/components/Card";
import { H1, H2 } from "~/components/Heading";
import Input from "~/components/Input";
import InputControl from "~/components/InputControl";
import Label from "~/components/Label";

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-red-950 border border-red-500 rounded-lg text-red-500 text-sm font-semibold">
      <CircleAlert className="w-4 h-4" />
      <p>{error}</p>
    </div>
  );
}

export default function Track() {
  const nav = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState("");

  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (!orderId) {
      setError("order id is required");
      return;
    }

    nav(`/order/${orderId}`);
  }

  return (
    <>
      <H1>track your order</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        see the status of your purchase
      </p>

      <BackgroundGradient className="mt-4">
        <Card className="p-4">
          <H2 className="mb-4 pb-4 border-b border-zinc-700">
            enter your order id
          </H2>

          <Form className="flex flex-col gap-4" onSubmit={onFormSubmit}>
            {error && <ErrorMessage error={error} />}

            <InputControl>
              <Label htmlFor="order_id">order id</Label>

              <Input
                id="order_id"
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
