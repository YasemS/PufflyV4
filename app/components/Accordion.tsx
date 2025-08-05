import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import BackgroundGradient from "~/components/BackgroundGradient";
import Card from "~/components/Card";

export type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = React.ComponentProps<"div"> & {
  questions: AccordionItem[];
};

type AccordionItemProps = AccordionItem & {
  active: boolean;
  onClick: () => void;
};

export default function Accordion({ questions, ...props }: AccordionProps) {
  const [active, setActive] = useState<string>("");

  function onQuestionClick(question: string) {
    setActive((prev) => (prev === question ? "" : question));
  }

  return (
    <BackgroundGradient {...props}>
      <Card className="p-0">
        {questions.map((item, index) => (
          <AccordionItem
            active={active === item.question}
            key={index}
            question={item.question}
            answer={item.answer}
            onClick={() => onQuestionClick(item.question)}
          />
        ))}
      </Card>
    </BackgroundGradient>
  );
}

function AccordionItem({
  question,
  answer,
  active,
  onClick,
}: AccordionItemProps) {
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
