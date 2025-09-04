import { Link, useLocation } from "react-router";
import { marked } from "marked";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import { useEffect, useState } from "react";
import cn from "~/lib/cn";
import BackgroundGradient from "~/components/BackgroundGradient";

export default function BlogPost() {
  const [showToc, setShowToc] = useState(false);

  const location = useLocation();

  marked.use(gfmHeadingId());

  const md = `## Introduction  
Protecting your e-liquid isn't just about preserving flavor, it's about safety and cost efficiency, too. Whether you're a casual vaper or a long-term enthusiast, storing your e-juice properly ensures freshness, potency, and peace of mind.

---

## 1. Store in a Cool, Dark, and Dry Place  
- **Avoid heat and sunlight**: UV rays and high temperatures accelerate oxidation and degrade nicotine and flavor compounds. Keep e-liquid away from radiators, windows, and kitchen appliances.  
- **Ideal storage spots**: A shaded drawer or cabinet with steady room temperature (around 60-70 °F / 15-21 °C) is optimal.  

---

## 2. Minimize Air Exposure  
- **Tight seals are critical**: Every time air enters the bottle, it speeds up oxidation, diminishing flavor and nicotine quality.  
- **Store upright**: Prevent leaks and reduce exposure to air by keeping bottles upright.  

---

## 3. Shake Before Use  
- Over time, VG and PG can separate, especially in high-VG blends. Always shake well to ensure a consistent mix.  

---

## 4. Use High-Quality, Purpose-Made Containers  
- **Glass is superior**: Non-reactive and offers UV protection, ideal for long-term stability.  
- **If using plastic**, choose high-grade PET or HDPE bottles designed for e-liquids. Avoid repurposed containers that may leach or contaminate.  

---

## 5. Keep Out of Reach of Children and Pets  
- Even small amounts of nicotine are dangerous to kids and pets. Store e-liquids in locked, elevated, or secure locations, and use childproof caps whenever available.  

---

## 6. Label, Date & Rotate  
- Track batches by labeling with flavor, date purchased or opened, and nicotine strength.  
- Rotate inventory so older bottles get used first, preserving freshness.  

---

## 7. Be Cautious with Fridge/Freezer Storage  
- **Refrigeration** may slow oxidation slightly but risks condensation and ingredient separation.  
- **Freezing** should only be used with care: use glass bottles, thaw to room temperature, and shake thoroughly. VG may thicken; menthol flavors can crystallize.  

---

## 8. Spot the Signs of Degradation  
Watch for these red flags:  
- Darkening color or unusual separation that doesn't blend after shaking  
- Sour, off-putting smells or stale, harsh flavors  
- If unsure, discard, better safe than regretting.  

---

## 9. Understand the Stakes: Safety Risks of E-Liquid  
- Nicotine in liquid form is toxic if swallowed or absorbed, handle with care, keep out of reach, and avoid skin contact.  
- Some flavorings contain diacetyl or other chemicals linked to respiratory harm, proper storage won't eliminate these, but responsible handling helps.  

---

## 10. Handy Tips for Travel  
- Use compact, leak-proof bottles and a reliable travel case.  
- Pack upright, keep away from heat sources, and label clearly.  

---

## Summary Table: Safe E-Liquid Storage at a Glance

| Tip                          | Why It Matters                                  |
|-----------------------------|--------------------------------------------------|
| Cool, dark, dry location     | Slows chemical degradation                        |
| Airtight, upright storage    | Minimizes oxidation & leaking                     |
| Shake before vaping          | Ensures consistent mix and flavor                  |
| Quality containers           | Prevents contamination and protects ingredients   |
| Secure storage               | Protects children and pets                        |
| Label and rotate             | Keeps track of freshness and usage                |
| Avoid cold storage risks     | Avoids separation or flavor degradation          |
| Monitor for spoilage         | Alerts you to toss compromised juice              |

---

## Wrapping Up  
Keeping your e-liquid safe isn't just smart, it's essential for flavor, potency, and safety. By following these practices, you'll ensure that every puff from premium blends is as fresh and satisfying as intended.
`;

  const mdHtml = marked.parse(md);
  const mdHeadings = getHeadingList();

  useEffect(() => {
    setShowToc(true);
  }, []);

  useEffect(() => {
    if (location.hash && mdHeadings.length > 0) {
      window.scroll({
        top: (document.getElementById(location.hash.slice(1)) as HTMLElement).offsetTop - 100,
        behavior: "smooth",
      });
    }
  }, [location.hash]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center relative pt-8 pb-12 text-center z-1">
        <div className="flex items-center justify-center">
          <Link className="px-4 py-1 border rounded-full text-sm font-semibold" to="/blog/collection/e-liquid">
            E-Liquid
          </Link>
        </div>

        <h1 className="mt-4 text-4xl font-bold">How to Keep My E-Liquid Safe</h1>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-300">
          <p>{new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          <span>&bull;</span>
          <p>5 min read</p>
        </div>
      </div>

      <BackgroundGradient>
        <img
          className="aspect-video w-full object-cover object-center rounded-xl"
          src="https://www.puffly.io/img/geek-bar-pulse-banner.png"
          alt=""
        />
      </BackgroundGradient>

      <div className="grid grid-cols-3 gap-8 mt-8">
        <div
          className={cn(
            "col-span-3 max-w-none prose prose-zinc prose-invert prose-sm md:prose-base",
            showToc && "md:col-span-2",
          )}
          dangerouslySetInnerHTML={{
            __html: mdHtml,
          }}
        ></div>

        {showToc && (
          <div className="hidden md:block">
            <div className="flex flex-col">
              <p className="font-semibold">Table of Contents</p>

              {mdHeadings.map((heading) => (
                <Link
                  className={cn(
                    "mt-2 text-sm font-semibold underline-offset-1",
                    location.hash === "#" + heading.id ? "underline" : "",
                  )}
                  to={`#${heading.id}`}
                  key={heading.id}
                >
                  {heading.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
