export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export const LEGAL_LAST_UPDATED = 'August 20, 2026';

// Placeholder contact — replace before shipping.
export const SUPPORT_EMAIL = 'support@foreverfind.app';

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    paragraphs: [
      'To create your profile and find compatible introductions, we collect: your name, date of birth, gender, phone number, city and hometown, occupation, education level, religion, marital status, number of children and whether you want (more) children, genotype, height and physique, interests, and a bio and profile photo.',
      'We also collect your partner preferences (age range, qualities, deal breakers, and maximum distance), and any messages you send within the app to a match.',
      'If you enable notifications, we store a device push token so we can alert you about new requests, approvals, matches, and messages.',
    ],
  },
  {
    heading: 'Why we collect it',
    paragraphs: [
      'This information is used to build your profile, show it to other members you have not blocked, and let our moderation team review introduction requests before either person is notified — that review step is the core of how ForeverFind works and is why we ask for more than a typical dating app.',
      'Sensitive fields like religion, genotype, and marital status are optional context you choose to share so a human reviewer — and, if you choose to include them in your profile, other members — can make a more informed introduction. You are not required to fill in every field.',
    ],
  },
  {
    heading: 'Who can see your information',
    paragraphs: [
      'Other members can see the profile fields you fill in, except your phone number, which is never shown to other members and is used only for support and safety purposes.',
      'Our moderation team can see full profile details, introduction requests, and reports in order to review requests and act on reports of abuse.',
      'We do not sell your personal information, and we do not share it with advertisers.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can edit or remove most profile fields at any time from your Profile settings. You can block another member, which hides you from each other, and you can report a member, which sends the report to our moderation team.',
      'You can permanently delete your account and all associated data — profile, matches, requests, messages, reports, and blocks — at any time from Profile → Delete account. This action cannot be undone.',
    ],
  },
  {
    heading: 'Age requirement',
    paragraphs: [
      'ForeverFind is only for people 18 years of age or older. We do not knowingly collect information from anyone under 18.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'If we make material changes to this policy, we will update the date below and notify you in the app.',
    ],
  },
  {
    heading: 'Contact us',
    paragraphs: [`Questions about this policy or your data can be sent to ${SUPPORT_EMAIL}.`],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: 'Who can use ForeverFind',
    paragraphs: [
      'You must be at least 18 years old and able to form a binding contract to use ForeverFind. By creating an account, you confirm that the information you provide is accurate and that it is your own.',
    ],
  },
  {
    heading: 'How introductions work',
    paragraphs: [
      'ForeverFind is not a self-serve swiping app. When you request an introduction to another member, our moderation team reviews the request before the other member is ever notified. Only after that review, and only if the other member also chooses to accept, does a match — and the ability to message — open up.',
      'We may decline a request, suspend an account, or remove a profile at our discretion, including in response to a report, to keep the community safe.',
    ],
  },
  {
    heading: 'Your conduct',
    paragraphs: [
      'You agree not to: create a fake or impersonated profile; harass, threaten, or abuse another member; use ForeverFind for commercial solicitation, spam, or scams; post content that is unlawful, obscene, or infringes someone else\'s rights; or attempt to circumvent moderation, blocks, or the introduction-review process.',
      'Violating these terms may result in your account being suspended or your profile being removed, with or without notice.',
    ],
  },
  {
    heading: 'Safety',
    paragraphs: [
      'ForeverFind\'s review step is designed to reduce, not eliminate, risk. We do not conduct criminal background checks on members. You are responsible for exercising your own judgment when communicating with or meeting another member, including meeting for the first time in a public place and telling a friend or family member your plans.',
    ],
  },
  {
    heading: 'Reporting and blocking',
    paragraphs: [
      'If another member makes you uncomfortable, you can block them at any time from their profile, and you can report them so our moderation team can review the account. We may suspend or remove an account in response to a report.',
    ],
  },
  {
    heading: 'Account termination',
    paragraphs: [
      'You may delete your account at any time from Profile → Delete account, which permanently removes your data as described in our Privacy Policy. We may suspend or terminate your account for violating these terms.',
    ],
  },
  {
    heading: 'Disclaimer',
    paragraphs: [
      'ForeverFind is provided "as is." We do not guarantee that any introduction will result in a match, a relationship, or any particular outcome, and we are not responsible for the conduct of any member, on or off the app.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'If we make material changes to these terms, we will update the date below and notify you in the app. Continuing to use ForeverFind after a change means you accept the updated terms.',
    ],
  },
  {
    heading: 'Contact us',
    paragraphs: [`Questions about these terms can be sent to ${SUPPORT_EMAIL}.`],
  },
];
