import { getUserInterviews } from '@/actions/mockInterview';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const sessions = await getUserInterviews();
  return <DashboardClient sessions={sessions} />;
}