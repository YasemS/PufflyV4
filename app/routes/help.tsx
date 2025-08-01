import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { H1 } from "~/components/Heading";

export default function Help() {
  return (
    <>
      <H1>help</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        find answers or get in touch with us.
      </p>

      <div className="relative mt-8">
        <HelpAccordion />

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-500 to-purple-500 blur-3xl opacity-20 rounded-bl-full z-0"></div>
      </div>
    </>
  );
}

function HelpAccordion() {
  const [active, setActive] = useState<string>("");

  const questions = [
    {
      question: "do you offer discreet shipping?",
      answer: "yes, we offer discreet shipping included with all orders.",
    },
    {
      question: "what is your return policy?",
      answer:
        "we accept returns within 30 days of purchase for unopened items.",
    },
  ];

  function onQuestionClick(question: string) {
    setActive((prev) => (prev === question ? "" : question));
  }

  return (
    <div className="relative w-full bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg z-1">
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

function HelpAccordionItem({
  active,
  question,
  answer,
  onClick,
}: HelpAccordionItemProps) {
  return (
    <div className="flex flex-col border-b border-zinc-700 last:border-b-0">
      <button className="flex items-center gap-2 p-3" onClick={onClick}>
        <div className="flex items-center w-5 h-5 text-pink-500">
          {active ? <Minus /> : <Plus />}
        </div>

        <p className="text-sm font-semibold">{question}</p>
      </button>

      {active && (
        <div className="p-3 border-t border-zinc-700 text-sm text-zinc-300">
          {answer}
        </div>
      )}
    </div>
  );
}
