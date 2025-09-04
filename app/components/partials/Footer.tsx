import { Link } from "react-router";

import BackgroundGradient from "~/components/BackgroundGradient";
import Container from "~/components/Container";
import { H3 } from "~/components/Heading";

export default function Footer() {
  return (
    <BackgroundGradient>
      <footer className="mt-4 p-8 pb-24 bg-zinc-800/50 border-t border-zinc-800 backdrop-blur-xl sm:pb-8">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-8">
            <div className="md:col-span-2">
              <FooterLogo />
              <FooterSlogan />
              <FooterSocials />
            </div>

            <div>
              <FooterLinks
                title="links"
                links={[
                  {
                    to: "/products",
                    text: "products",
                  },
                  // {
                  //   to: "/rewards",
                  //   text: "rewards",
                  // },
                  {
                    to: "/help",
                    text: "help",
                  },
                  {
                    to: "/track",
                    text: "track your order",
                  },
                  {
                    to: "/blog",
                    text: "blog",
                  },
                  {
                    to: "/sitemap",
                    text: "sitemap",
                  },
                ]}
              />
            </div>

            <div>
              <FooterLinks
                title="policies"
                links={[
                  {
                    to: "/legal/privacy",
                    text: "privacy policy",
                  },
                  {
                    to: "/legal/refund",
                    text: "refund policy",
                  },
                  {
                    to: "/legal/shipping",
                    text: "shipping policy",
                  },
                  {
                    to: "/legal/terms",
                    text: "terms of service",
                  },
                ]}
              />
            </div>
          </div>

          <div>
            <FooterDisclaimer />

            <FooterPaymentMethods />

            <FooterCopy />
          </div>
        </Container>
      </footer>
    </BackgroundGradient>
  );
}

function FooterLogo() {
  return (
    <Link className="font-bold leading-9 text-4xl pb-2" to="/">
      <p className="inline">puff</p>
      <p className="inline text-pink-500">ly</p>
    </Link>
  );
}

function FooterSlogan() {
  return <p className="mt-4 text-sm">your go-to source for top-tier vapes, unbeatable flavor, and premium quality.</p>;
}

function FooterSocials() {
  return (
    <div className="flex items-center gap-2 mt-4">
      <FooterSocial alt="Instagram" image="/img/instagram.svg" to="https://www.instagram.com/pufflyio" />

      <FooterSocial alt="TikTok" image="/img/tiktok.svg" to="https://www.tiktok.com/@pufflyio" />

      <FooterSocial alt="YouTube" image="/img/youtube.svg" to="https://www.youtube.com/@pufflyio" />
    </div>
  );
}

type FooterSocialProps = {
  alt: string;
  image: string;
  to: string;
};

function FooterSocial({ alt, image, to }: FooterSocialProps) {
  return (
    <Link to={to} target="_blank" rel="noreferrer">
      <img alt={alt} className="h-4 w-4" src={image} />
    </Link>
  );
}

function FooterPaymentMethods() {
  return (
    <div className="flex items-center gap-1 mt-4">
      <img alt="visa" className="h-5 rounded-xs" src="/img/visa.svg" />

      <img alt="mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" />

      <img alt="diners club" className="h-5 rounded-xs" src="/img/diners.svg" />

      <img alt="discover" className="h-5 rounded-xs" src="/img/discover.svg" />

      <img alt="zelle" className="h-5 rounded-xs" src="/img/zelle.svg" />
    </div>
  );
}

function FooterDisclaimer() {
  return (
    <p className="mt-8 pt-4 border-t border-zinc-700 text-xs text-zinc-300">
      <span className="text-white font-semibold">disclaimer:</span> products on this site are not approved by the FDA
      and are not intended to diagnose, treat, cure, or prevent any disease. nicotine is an addictive chemical. for
      adults 21+ only.
    </p>
  );
}

type FooterLinksProps = {
  title: string;
  links: FooterLinkProps[];
};

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className="flex flex-col gap-2 mt-8 pt-8 border-t border-zinc-700 md:mt-0 md:pt-0 md:border-t-0">
      <H3>{title}</H3>

      {links.map((link) => (
        <FooterLink key={link.to} {...link} />
      ))}
    </div>
  );
}

type FooterLinkProps = {
  to: string;
  text: string;
};

function FooterLink({ to, text }: FooterLinkProps) {
  return (
    <Link className="text-sm text-zinc-300" to={to}>
      {text}
    </Link>
  );
}

function FooterCopy() {
  return (
    <div className="flex items-center justify-center mt-4 pt-4 border-t border-zinc-700 text-center">
      <p className="text-xs text-zinc-300">&copy; {new Date().getFullYear()} puffly, all rights reserved.</p>
    </div>
  );
}
