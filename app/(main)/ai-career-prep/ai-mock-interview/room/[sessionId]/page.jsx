import { getSession } from '@/actions/mockInterview';
import InterviewRoomClient from './InterviewRoomClient';
import { redirect, notFound } from 'next/navigation';

export default async function InterviewPage({ params }) {
    // 1. Await params properly (Next.js 15 requirement)
    const { sessionId } = await params;

    // 2. Error handling: if no ID is passed in the URL
    if (!sessionId) {
        redirect('/ai-mock-interview/setup');
    }

    // 3. Fetch the session data from MongoDB/Prisma
    const session = await getSession(sessionId);

    // 4. Redirect if the ID doesn't exist in the database
    // Use notFound() if you want to show your 404 page, 
    // or redirect('/') to send them home.
    if (!session) {
        redirect('/');
    }

    // 5. Pass the plain object data to the Client Component
    // Note: Ensure your getSession function returns a "plain" object
    // (no Date objects or MongoDB ObjectIds) or serialize it here.
    return (
        <InterviewRoomClient 
            session={JSON.parse(JSON.stringify(session))} 
        />
    );
}