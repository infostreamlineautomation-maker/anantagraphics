import Image from "next/image";

import { mediaUrl } from "@/lib/media";

export type Client = { name: string; logo: string; website?: string | null };

function Tile({ client, size }: { client: Client; size: "lg" | "sm" }) {
  const logo = (
    <Image
      src={mediaUrl(client.logo)}
      alt={client.name}
      width={240}
      height={150}
      sizes={size === "lg" ? "(min-width: 768px) 136px, 104px" : "(min-width: 640px) 170px, 45vw"}
      className="h-full w-full object-contain transition-all duration-300 hover:scale-108"
    />
  );
  const box =
    size === "lg"
      ? "h-20 w-32 border-line/80 p-3 md:h-24 md:w-40 rounded-xl hover:shadow-md hover:border-brand/40 hover:-translate-y-0.5"
      : "h-20 w-full border-line/70 p-2.5 rounded-lg hover:shadow-sm hover:border-brand/30";
  return (
    <div className={`flex shrink-0 items-center justify-center border bg-white shadow-[0_1px_3px_rgb(0_0_0/0.04)] transition-all duration-300 ${box}`}>
      {client.website ? (
        <a href={client.website} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
          {logo}
        </a>
      ) : (
        logo
      )}
    </div>
  );
}

/**
 * "Our Clients". `marquee` (home): rows scroll sideways and pause on hover.
 * `grid` (about): compact 4-column grid of rounded tiles.
 */
export function ClientLogos({ clients, variant = "marquee", rows = 2 }: { clients: Client[]; variant?: "marquee" | "grid"; rows?: number }) {
  if (clients.length === 0) return null;

  if (variant === "grid") return <LogoGrid clients={clients} />;

  // Deal the logos across the rows in CMS order (1st → row 1, 2nd → row 2, 3rd → row 1…), so the
  // clients ordered first in the CMS lead each row. The track scrolls by half its width, so each half
  // must be wider than the screen: repeat short rows (≥ 12 tiles ≈ 2500px), then double the result.
  const lines = Array.from({ length: rows }, (_, r) => clients.filter((_, i) => i % rows === r))
    .filter((l) => l.length)
    .map((l) => ({ unique: l.length, tiles: Array.from({ length: Math.ceil(12 / l.length) }, () => l).flat() }));

  return (
    <>
      <div className="flex flex-col gap-4 motion-reduce:hidden md:gap-5">
        {lines.map(({ unique, tiles }, r) => (
          <div key={r} className="marquee overflow-hidden">
            <ul
              className="marquee-track flex w-max"
              style={{ animationDirection: r % 2 ? "reverse" : "normal", ["--marquee-duration" as string]: `${tiles.length * 3}s` }}
            >
              {[...tiles, ...tiles].map((c, i) => (
                // Screen readers get each logo once; the repeats are decorative. Margin rather than
                // flex gap keeps both halves exactly equal, so the loop has no jump.
                <li key={`${c.name}-${i}`} aria-hidden={i >= unique || undefined} className="mr-4 md:mr-5">
                  <Tile client={c} size="lg" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Visitors who switched off animations (Reduce Motion) get a still grid instead of a frozen, cut-off strip */}
      <div className="container-site hidden motion-reduce:block">
        <LogoGrid clients={clients} />
      </div>
    </>
  );
}

function LogoGrid({ clients }: { clients: Client[] }) {
  return (
    // Flex rather than grid so a last, partial row is centred
    <ul className="mx-auto flex w-full max-w-[1440px] flex-wrap justify-center gap-3 md:gap-4 lg:gap-5">
      {clients.map((c) => (
        <li
          key={c.name}
          className="basis-[calc(50%-0.5rem)] overflow-hidden rounded-lg shadow-[0_1px_4px_rgb(0_0_0/0.06)] sm:basis-[calc(33.33%-0.75rem)] md:basis-[calc(25%-0.85rem)] lg:basis-[calc(16.66%-1rem)]"
        >
          <Tile client={c} size="sm" />
        </li>
      ))}
    </ul>
  );
}
