import Button from "~/components/Button";
import Card from "~/components/Card";
import { H1, H2 } from "~/components/Heading";
import Input from "~/components/Input";
import InputControl from "~/components/InputControl";
import Label from "~/components/Label";

export default function Track() {
  return (
    <>
      <H1>track your order</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        see the status of your purchase
      </p>

      <Card className="mt-4 p-4">
        <H2 className="mb-4 pb-4 border-b border-zinc-700">
          enter your order id
        </H2>

        <div className="flex flex-col gap-4">
          <InputControl>
            <Label htmlFor="order_id">order id</Label>

            <Input id="order_id" type="text" />
          </InputControl>

          <Button>track</Button>
        </div>
      </Card>
    </>
  );
}
