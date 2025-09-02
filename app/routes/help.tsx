import { useState } from "react";
import { AtSign, Mail, Minus, MoveRight, Plus } from "lucide-react";

import type { Route } from "./+types/help";

import { H1, H2, H3 } from "~/components/Heading";

export const meta: Route.MetaFunction = () => {
  return [{ title: `help - puffly` }];
};

export default function Help() {
  return (
    <>
      <H1>help</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">find answers or get in touch with us.</p>

      <div className="relative mt-8">
        <div className="grid grid-cols-1 gap-8 relative z-1 md:grid-cols-5">
          <div className="md:col-span-3">
            <H2>frequently asked questions</H2>

            <div className="mt-3">
              <HelpAccordion />
            </div>
          </div>

          <div className="md:col-span-2">
            <H2>still need help?</H2>

            <div className="flex flex-col mt-3 gap-2">
              <HelpContactItem
                icon={<Mail />}
                title="email"
                description="contact us via email for support."
                action="send email"
                to="mailto:support@puffly.io"
              />

              <HelpContactItem
                icon={<AtSign />}
                title="instagram"
                description="message us for fast support."
                action="message us"
                to="https://www.instagram.com/pufflyio"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-500 to-purple-500 blur-3xl opacity-20 z-0"></div>
      </div>
    </>
  );
}

function HelpAccordion() {
  const [active, setActive] = useState<string>("");

  const questions = [
    {
      question: "can I pay with a different method?",
      answer:
        "yes, just reach out to us through one of the methods below, and we'll help arrange an alternative payment method.",
    },
    {
      question: "do you offer discreet shipping?",
      answer: "yes, all orders are shipped in non-branded, discreet packaging to ensure your privacy.",
    },
    {
      question: "do you offer international shipping?",
      answer: "no, we currently only ship within the united states. overseas shipping is not available at this time.",
    },
    {
      question: "how long does shipping take?",
      answer: "our standard shipping time is estimated at 2-4 business days after your order is processed.",
    },
    {
      question: "what is your return policy?",
      answer:
        "we allow the refund of any unopened (sealed) products within 14 days of purchase, please see our full return policy for more details.",
    },
  ];

  function onQuestionClick(question: string) {
    setActive((prev) => (prev === question ? "" : question));
  }

  return (
    <div className="w-full bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg">
      {questions.map((item, index) => (
        <HelpAccordionItem
          active={active === item.question}
          key={index}
          question={item.question}
          answer={item.answer}
          onClick={() => onQuestionClick(item.question)}
        />
      ))}
    </div>
  );
}

type HelpAccordionItemProps = {
  active?: boolean;
  question: string;
  answer: string;
  onClick?: () => void;
};

function HelpAccordionItem({ active, question, answer, onClick }: HelpAccordionItemProps) {
  return (
    <div className="flex flex-col border-b border-zinc-700 last:border-b-0">
      <button className="flex items-center gap-2 p-3" onClick={onClick}>
        <div className="flex items-center w-5 h-5 text-pink-500">{active ? <Minus /> : <Plus />}</div>

        <p className="text-sm font-semibold">{question}</p>
      </button>

      {active && <div className="p-3 border-t border-zinc-700 text-sm text-zinc-300">{answer}</div>}
    </div>
  );
}

type HelpContactItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  to: string;
};

function HelpContactItem({ title, description, icon, action, to }: HelpContactItemProps) {
  return (
    <a
      className="flex gap-3 w-full p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg"
      href={to}
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex items-center justify-center aspect-square h-12 bg-pink-950/50 border border-pink-500 rounded text-pink-500">
        {icon}
      </div>

      <div className="flex flex-col h-12">
        <H3 className="text-sm leading-4">{title}</H3>

        <p className="mt-0.25 text-xs text-zinc-300 leading-3">{description}</p>

        <div className="flex items-center gap-1 mt-auto text-xs font-semibold text-pink-500">
          <p>{action}</p>
          <MoveRight className="w-4 h-4" />
        </div>
      </div>
    </a>
  );
}
