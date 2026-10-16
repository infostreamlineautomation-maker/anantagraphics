import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Motion";

type Props = {
  title?: string;
  text?: string;
  cta?: string;
  href?: string;
};

/** Red "Have an idea in mind?" card with a white "Request Quote" button and magnetic micro-interaction. */
export function CtaCard({
  title = "Have an idea in mind?",
  text = "Let’s turn it into something people can see, feel and remember.",
  cta = "Request Quote",
  href = "/contact?type=quote#contact-form",
}: Props) {
  return (
    <section className="group rounded-lg bg-cta p-6 text-white shadow-xs transition-shadow duration-300 hover:shadow-lg md:p-8">
      <h2 className="font-sans text-h3 font-bold">{title}</h2>
      <p className="mt-2 max-w-md font-sans text-body-lg text-white/95">{text}</p>
      <div className="mt-5 md:mt-6">
        <Magnetic strength={0.25}>
          <ButtonLink href={href} variant="light" size="lg" className="min-w-44 shadow-sm hover:shadow-md">
            {cta}
          </ButtonLink>
        </Magnetic>
      </div>
    </section>
  );
}
