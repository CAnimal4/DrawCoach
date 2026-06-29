import { FALLBACK_SITE_URL, SITE_URL } from "@/lib/site";

export const PRIMARY_SHARE_URL = SITE_URL;
export const FALLBACK_SHARE_URL = FALLBACK_SITE_URL;
export const SHARE_PROMO_DISMISSED_KEY = "drawcoach-share-promo-dismissed";

export const SHARE_TITLE = "DrawCoach";
export const SHARE_TEXT =
  `Try DrawCoach for quick drawing feedback: ${PRIMARY_SHARE_URL}. If that does not work, use ${FALLBACK_SHARE_URL}.`;

export type ShareLinks = {
  mailto: string;
  sms: string;
};

export function buildShareData(text = SHARE_TEXT): ShareData {
  return {
    title: SHARE_TITLE,
    text,
    url: PRIMARY_SHARE_URL,
  };
}

export function buildShareLinks(text = SHARE_TEXT): ShareLinks {
  const subject = encodeURIComponent("Try DrawCoach");
  const body = encodeURIComponent(text);

  return {
    mailto: `mailto:?subject=${subject}&body=${body}`,
    sms: `sms:?&body=${body}`,
  };
}
