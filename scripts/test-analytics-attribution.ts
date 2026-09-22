import {
  detectReferralPlatform,
  formatReferralName,
  resolveAttribution,
} from '../src/lib/analytics/attribution';

function runTests() {
  console.log('--- RUNNING ANALYTICS ATTRIBUTION & PRIVACY TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Direct Visit
  const direct = resolveAttribution({ referrer: null });
  assert(direct.platform === 'Direct', 'Direct visit platform is "Direct"');
  assert(direct.visitorName === 'Anonymous', 'Direct visit visitor is "Anonymous"');
  assert(direct.referralSource === 'Direct', 'Direct visit source is "Direct"');

  // 2. Self domain should be Direct
  const selfVisit = resolveAttribution({ referrer: 'https://im-saileshprofolio.vercel.app/works' });
  assert(selfVisit.platform === 'Direct', 'Internal navigation referrer resolves to "Direct"');

  // 3. LinkedIn Referral (without profile param)
  const linkedIn = resolveAttribution({ referrer: 'https://www.linkedin.com/feed/' });
  assert(linkedIn.platform === 'LinkedIn', 'linkedin.com referrer maps to "LinkedIn"');
  assert(linkedIn.visitorName === 'Anonymous', 'LinkedIn visit without profile param is strictly "Anonymous"');
  assert(linkedIn.referralSource === 'linkedin.com', 'LinkedIn source is "linkedin.com"');

  // 4. Behance Referral
  const behance = resolveAttribution({ referrer: 'https://www.behance.net/gallery/123/Case-Study' });
  assert(behance.platform === 'Behance', 'behance.net referrer maps to "Behance"');
  assert(behance.visitorName === 'Anonymous', 'Behance visit is "Anonymous"');
  assert(behance.referralSource === 'behance.net', 'Behance source is "behance.net"');

  // 5. GitHub Referral
  const github = resolveAttribution({ referrer: 'https://github.com/imsaileshh' });
  assert(github.platform === 'GitHub', 'github.com referrer maps to "GitHub"');
  assert(github.visitorName === 'Anonymous', 'GitHub visit is "Anonymous"');

  // 6. Instagram Referral
  const instagram = resolveAttribution({ referrer: 'https://l.instagram.com/?u=...' });
  assert(instagram.platform === 'Instagram', 'l.instagram.com maps to "Instagram"');

  // 7. Dribbble Referral
  const dribbble = resolveAttribution({ referrer: 'https://dribbble.com/shots/123' });
  assert(dribbble.platform === 'Dribbble', 'dribbble.com maps to "Dribbble"');

  // 8. Other Platforms (Facebook, X / Twitter, YouTube, WhatsApp, Google, Bing)
  assert(detectReferralPlatform('https://t.co/abc') === 'X / Twitter', 't.co maps to "X / Twitter"');
  assert(detectReferralPlatform('https://x.com/') === 'X / Twitter', 'x.com maps to "X / Twitter"');
  assert(detectReferralPlatform('https://m.facebook.com/') === 'Facebook', 'facebook.com maps to "Facebook"');
  assert(detectReferralPlatform('https://youtu.be/xyz') === 'YouTube', 'youtu.be maps to "YouTube"');
  assert(detectReferralPlatform('https://wa.me/') === 'WhatsApp', 'wa.me maps to "WhatsApp"');
  assert(detectReferralPlatform('https://www.google.com/search') === 'Google', 'google.com maps to "Google"');
  assert(detectReferralPlatform('https://www.bing.com/') === 'Bing', 'bing.com maps to "Bing"');

  // 9. Tracking link with profile: ?utm_source=linkedin&utm_profile=athul
  const athulLinkedIn = resolveAttribution({
    utmSource: 'linkedin',
    utmProfile: 'athul',
    referrer: 'https://www.linkedin.com/',
  });
  assert(athulLinkedIn.platform === 'LinkedIn', 'Attributed link platform is "LinkedIn"');
  assert(athulLinkedIn.visitorName === 'Athul', 'utm_profile=athul resolves visitor name to "Athul"');
  assert(athulLinkedIn.referralSource === 'LinkedIn Profile', 'Attributed source is "LinkedIn Profile"');

  // 10. Tracking link with ref & platform: ?ref=athul&platform=linkedin
  const athulRef = resolveAttribution({
    ref: 'athul',
    platform: 'linkedin',
  });
  assert(athulRef.platform === 'LinkedIn', 'ref & platform parameter resolves platform to "LinkedIn"');
  assert(athulRef.visitorName === 'Athul', 'ref=athul resolves visitor name to "Athul"');
  assert(athulRef.referralCode === 'athul', 'referralCode is "athul"');

  // 11. Tracking link without profile: ?utm_source=linkedin
  const noProfile = resolveAttribution({
    utmSource: 'linkedin',
    referrer: 'https://www.linkedin.com/',
  });
  assert(noProfile.platform === 'LinkedIn', 'Platform is "LinkedIn"');
  assert(noProfile.visitorName === 'Anonymous', 'Without profile parameter, visitor MUST be "Anonymous"');

  // 12. Referral code formatting
  assert(formatReferralName('athul') === 'Athul', 'formatReferralName("athul") -> "Athul"');
  assert(formatReferralName('sailesh_p') === 'Sailesh P', 'formatReferralName("sailesh_p") -> "Sailesh P"');
  assert(formatReferralName('john-doe') === 'John Doe', 'formatReferralName("john-doe") -> "John Doe"');

  // 13. PRIVACY GUARANTEE: Never extract name from URL path or technical data
  const privacyCheck = resolveAttribution({
    referrer: 'https://www.linkedin.com/in/some-person-profile',
  });
  assert(privacyCheck.visitorName === 'Anonymous', 'PRIVACY: Never parse username from referrer URL path');
  assert(privacyCheck.referralName === null, 'PRIVACY: referralName remains null without explicit parameter');

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
