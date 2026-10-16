import Image from "next/image";

import { mediaUrl } from "@/lib/media";

type Props = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
};

/**
 * Cover image filling its (relative, sized) parent. Without a src it renders a neutral block,
 * so layouts keep their shape while content is still being added in the CMS.
 */
export function MediaImage({ src, alt, sizes, className = "", preload }: Props) {
  if (!src) {
    return <div aria-hidden className={`absolute inset-0 bg-linear-to-br from-line to-panel ${className}`} />;
  }
  return <Image src={mediaUrl(src)} alt={alt} fill sizes={sizes} preload={preload} className={`object-cover ${className}`} />;
}
