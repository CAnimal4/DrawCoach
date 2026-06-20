import Image from "next/image";
import Link from "next/link";
import { DRAWCOACH_LOGO_PATH } from "@/lib/site";

export function BrandLink() {
  return (
    <Link
      aria-label="DrawCoach home"
      className="inline-flex min-w-0 items-center gap-2 text-[1.45rem] font-semibold leading-none tracking-normal text-[#161719] sm:gap-2.5 sm:text-[1.7rem]"
      href="/"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="h-7 w-7 shrink-0 object-contain sm:h-9 sm:w-9"
        height="36"
        priority
        src={DRAWCOACH_LOGO_PATH}
        width="36"
      />
      <span>DrawCoach</span>
    </Link>
  );
}
