/**
 * Analytics Platform Detection & Attribution Engine
 * 
 * STRICT PRIVACY GUARANTEE:
 * Visitor identity is NEVER inferred or guessed from technical identifiers such as
 * IP address, user agent, browser, operating system, device, referrer URL path, or location.
 * Visitor name is ONLY populated when explicitly provided via verified tracking parameters
 * (e.g. ?utm_profile=..., ?ref=..., or /ref/[code]).
 * All other visitors are strictly and uncompromisingly designated as 'Anonymous'.
 */

export const NORMALIZED_PLATFORMS = [
  'LinkedIn',
  'Behance',
  'Dribbble',
  'GitHub',
  'Instagram',
  'Facebook',
  'X / Twitter',
  'YouTube',
  'WhatsApp',
  'Google',
  'Bing',
  'Direct',
  'Other',
  'Unknown',
] as const;

export type NormalizedPlatform = (typeof NORMALIZED_PLATFORMS)[number];

const SELF_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'im-saileshprofolio.vercel.app',
  'imsailesh.com',
  'www.imsailesh.com',
  'imsaileshportfolio.vercel.app',
];

/**
 * Normalizes user-supplied string or keyword into canonical platform name
 */
export function normalizePlatformName(input: string | null | undefined): NormalizedPlatform | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase();

  if (clean === 'linkedin' || clean.includes('linkedin') || clean === 'lnkd.in') return 'LinkedIn';
  if (clean === 'behance' || clean.includes('behance')) return 'Behance';
  if (clean === 'dribbble' || clean.includes('dribbble')) return 'Dribbble';
  if (clean === 'github' || clean.includes('github')) return 'GitHub';
  if (clean === 'instagram' || clean.includes('instagram') || clean === 'ig') return 'Instagram';
  if (clean === 'facebook' || clean.includes('facebook') || clean === 'fb') return 'Facebook';
  if (clean === 'twitter' || clean === 'x' || clean.includes('twitter') || clean === 't.co') return 'X / Twitter';
  if (clean === 'youtube' || clean.includes('youtube') || clean === 'youtu.be') return 'YouTube';
  if (clean === 'whatsapp' || clean.includes('whatsapp') || clean === 'wa.me') return 'WhatsApp';
  if (clean === 'google' || clean.includes('google')) return 'Google';
  if (clean === 'bing' || clean.includes('bing')) return 'Bing';
  if (clean === 'direct') return 'Direct';
  if (clean === 'other') return 'Other';

  return null;
}

/**
 * Safely extracts clean hostname from a referrer string
 */
export function extractReferrerHost(referrer: string | null | undefined): string {
  if (!referrer) return 'Direct';
  const trimmed = referrer.trim();
  if (!trimmed || trimmed === 'Direct') return 'Direct';

  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    return host || 'Direct';
  } catch {
    // If URL parsing fails, extract basic alphanumeric hostname
    const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)/);
    return match ? match[1].toLowerCase() : 'Other';
  }
}

/**
 * Detects the normalized referral platform from the referrer URL and explicit tracking parameters
 */
export function detectReferralPlatform(
  referrer: string | null | undefined,
  paramPlatform?: string | null | undefined,
  utmSource?: string | null | undefined
): NormalizedPlatform {
  // 1. Explicit platform parameter has first precedence
  const explicitPlatform = normalizePlatformName(paramPlatform);
  if (explicitPlatform) return explicitPlatform;

  // 2. Explicit utm_source parameter
  const utmPlatform = normalizePlatformName(utmSource);
  if (utmPlatform) return utmPlatform;

  // 3. Referrer URL detection
  if (!referrer) return 'Direct';
  const trimmed = referrer.trim();
  if (!trimmed || trimmed.toLowerCase() === 'direct') return 'Direct';

  const host = extractReferrerHost(trimmed);
  if (host === 'Direct' || SELF_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return 'Direct';
  }

  // Known platforms by host patterns
  if (host.includes('linkedin.com') || host === 'lnkd.in' || host.includes('licdn.com')) {
    return 'LinkedIn';
  }
  if (host.includes('behance.net')) {
    return 'Behance';
  }
  if (host.includes('dribbble.com')) {
    return 'Dribbble';
  }
  if (host.includes('github.com') || host.endsWith('.github.io')) {
    return 'GitHub';
  }
  if (host.includes('instagram.com') || host === 'ig.me' || host.includes('cdninstagram.com')) {
    return 'Instagram';
  }
  if (
    host.includes('facebook.com') ||
    host === 'fb.com' ||
    host === 'fb.me' ||
    host.includes('messenger.com')
  ) {
    return 'Facebook';
  }
  if (host === 'twitter.com' || host === 'x.com' || host === 't.co') {
    return 'X / Twitter';
  }
  if (host.includes('youtube.com') || host === 'youtu.be') {
    return 'YouTube';
  }
  if (host.includes('whatsapp.com') || host === 'wa.me') {
    return 'WhatsApp';
  }
  if (host.includes('google.') || host.startsWith('google.')) {
    return 'Google';
  }
  if (host.includes('bing.com')) {
    return 'Bing';
  }

  return 'Other';
}

/**
 * Formats a clean human-readable referral name from a code or parameter
 * e.g. "athul" -> "Athul", "athul_kumar" -> "Athul Kumar"
 */
export function formatReferralName(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Remove URL encoded artifacts and clean
  const decoded = decodeURIComponent(trimmed).replace(/[^\w\s-]/g, '').trim();
  if (!decoded) return null;

  // Format title case
  return decoded
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 50);
}

export interface AttributionResult {
  platform: NormalizedPlatform;
  referralCode: string | null;
  referralName: string | null;
  referralSource: string;
  referrerHost: string;
  visitorName: string;
}

/**
 * Resolves complete attribution metadata from request parameters and referrer
 * Strictly enforces privacy: No identity is ever guessed.
 */
export function resolveAttribution(params: {
  referrer?: string | null;
  utmSource?: string | null;
  utmProfile?: string | null;
  ref?: string | null;
  platform?: string | null;
  referralCode?: string | null;
  referralName?: string | null;
}): AttributionResult {
  const platform = detectReferralPlatform(params.referrer, params.platform, params.utmSource);
  const referrerHost = extractReferrerHost(params.referrer);

  // Explicit attribution only: from utm_profile, ref, or explicit referralCode/referralName
  const explicitRawName =
    params.referralName ||
    params.utmProfile ||
    params.ref ||
    params.referralCode ||
    null;

  const rawCode = params.referralCode || params.ref || (params.utmProfile ? params.utmProfile.toLowerCase() : null);
  const referralCode = rawCode ? rawCode.trim().toLowerCase().slice(0, 60) : null;
  const referralName = explicitRawName ? formatReferralName(explicitRawName) : null;

  // Determine visitor display name: Strictly 'Anonymous' unless explicitly attributed
  const visitorName = referralName || 'Anonymous';

  // Determine source display:
  // E.g. "LinkedIn Profile" when profile attribution is present on LinkedIn,
  // or "linkedin.com" / "behance.net" / "Direct"
  let referralSource: string;
  if (referralName) {
    if (platform === 'LinkedIn') {
      referralSource = 'LinkedIn Profile';
    } else if (platform !== 'Direct' && platform !== 'Other') {
      referralSource = `${platform} Profile`;
    } else {
      referralSource = 'Direct Referral';
    }
  } else {
    if (referrerHost !== 'Direct') {
      referralSource = referrerHost;
    } else {
      referralSource = 'Direct';
    }
  }

  return {
    platform,
    referralCode,
    referralName,
    referralSource,
    referrerHost,
    visitorName,
  };
}
