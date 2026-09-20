import { LegalDocument } from '@/components/legal-document';
import { PRIVACY_POLICY_SECTIONS } from '@/constants/legal-content';

export default function PrivacyPolicyScreen() {
  return <LegalDocument title="Privacy Policy" sections={PRIVACY_POLICY_SECTIONS} />;
}
