import { LegalDocument } from '@/components/legal-document';
import { TERMS_SECTIONS } from '@/constants/legal-content';

export default function TermsScreen() {
  return <LegalDocument title="Terms of Service" sections={TERMS_SECTIONS} />;
}
