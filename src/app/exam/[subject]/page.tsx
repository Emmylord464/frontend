import ExamPage from '../page';
import { ALL_19_SUBJECTS } from '@/lib/subjects-config';

interface Props {
  params: Promise<{ subject: string }>;
}

export function generateStaticParams() {
  return ALL_19_SUBJECTS.map((s) => ({
    subject: s.slug,
  }));
}

export default async function DynamicSubjectExamPage({ params }: Props) {
  await params;
  return <ExamPage />;
}
