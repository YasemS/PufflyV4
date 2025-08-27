import { data, redirect } from "react-router";
import validator from "validator";

import type { Route } from "./+types/email.subscribe";

import { resend } from "~/lib/email.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const email = form.get("email");

  if (!email || typeof email !== "string") {
    return data({ error: "email is required" }, { status: 400 });
  }

  if (!validator.isEmail(email)) {
    return data({ error: "invalid email address" }, { status: 400 });
  }

  await resend.contacts.create({
    email,
    audienceId: "c29812ff-a6b8-450f-ac02-6b61912652a0",
  });

  return data({ success: true });
}

export function loader() {
  return redirect("/cart");
}
