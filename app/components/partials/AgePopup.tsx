import { useEffect, useState } from "react";
import { Link } from "react-router";

import Button from "~/components/Button";
import Card from "~/components/Card";
import { H2 } from "~/components/Heading";
import BackgroundGradient from "../BackgroundGradient";

export default function AgePopup() {
  const [visible, setVisible] = useState(false);

  function onPopupLoad() {
    const verified = localStorage.getItem("age-verified");

    if (verified) {
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";
  }

  function onCancelClick() {
    window.location.href = "https://www.lung.org/quit-smoking";
  }

  function onConfirmClick() {
    localStorage.setItem("age-verified", "true");

    setVisible(false);

    document.body.style.overflow = "auto";
  }

  useEffect(() => {
    onPopupLoad();
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full p-8 backdrop-blur-sm z-998">
        <BackgroundGradient>
          <Card className="relative text-center overflow-hidden bg-zinc-800/90">
            <H2>age verification</H2>

            <p className="mt-2 text-sm text-zinc-300 leading-4">
              please confirm you are 21 years of age or older to enter this site.
            </p>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-700">
              <Button className="w-full" variant="outline" onClick={onCancelClick}>
                under 21
              </Button>
              <Button className="w-full" onClick={onConfirmClick}>
                21 or over
              </Button>
            </div>
          </Card>
        </BackgroundGradient>
      </div>

      <Card className="flex items-center justify-center fixed top-0 left-0 w-full p-4 border-t-0 border-x-0 rounded-none z-999">
        <p className="text-white text-center font-bold leading-5">
          nicotine is a highly addictive substance and poses serious risks to anyone under 21.
        </p>
      </Card>
    </>
  );
}
