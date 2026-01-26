// app/actions/interview.js
'use server';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkUser } from "@/lib/checkUser";

/**
 * Creates a new interview session.
 * Maps fields to top-level columns for high-performance dashboard querying.
 */
export async function createSession(data) {
    try {
        const user = await checkUser();
        if (!user) throw new Error("User not found");

        const session = await db.interviewSession.create({
            data: {
                userId: user.id,
                date: new Date(),
                // Top-level fields for fast Dashboard access
                jobRole: data.jobRole,
                focus: data.focus,
                companyName: data.companyName || '',
                techStack: data.techStack || '',
                difficulty: data.difficulty,
                personality: data.personality,
                duration: data.duration,
                jobDescription: data.jobDescription,

                // Backup of the full setup configuration
                config: {
                    ...data,
                    seniority: data.seniority || '',
                },

                transcript: [], // Initialize empty
                analysis: null, // Analysis generated later on Result Page
            },
        });

        return session.id;
    } catch (error) {
        console.error("Failed to create session:", error);
        throw new Error("Failed to create interview session");
    }
}

/**
 * Fetches a single session with all data (Transcript + Analysis).
 * Used by the Interview Room and the Result Detail page.
 */
export async function getSession(id) {
    if (!id) return null;
    try {
        const session = await db.interviewSession.findUnique({
            where: { id },
        });
        // We serialize the data to ensure Dates and ObjectIDs don't crash Client Components
        return session ? JSON.parse(JSON.stringify(session)) : null;
    } catch (error) {
        console.error("Failed to get session:", error);
        return null;
    }
}



/**
 * Updates the AI-generated analysis JSON.
 */
export async function updateSessionAnalysis(id, analysis) {
    try {
        await db.interviewSession.update({
            where: { id },
            data: { analysis },
        });
        // Refresh the dashboard and result page cache
        revalidatePath(`/ai-interview-prep/ai-mock-interview/result/${id}`);
        revalidatePath('/ai-interview-prep/ai-mock-interview');
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error("Failed to update session analysis:", error);
        return false;
    }
}

/**
 * Saves the conversation transcript AND the actual time spent.
 */
export async function updateSessionTranscript(id, transcript, timeSpentMinutes) {
    try {
        await db.interviewSession.update({
            where: { id },
            data: {
                transcript,
                // Ensure we don't save negative numbers or nulls
                actualDuration: timeSpentMinutes ? Math.max(1, Math.round(timeSpentMinutes)) : 0
            },
        });
        // revalidatePath('/dashboard'); // Refresh dashboard stats immediately
        return true;
    } catch (error) {
        console.error("Failed to update session transcript:", error);
        return false;
    }
}


export async function getUserInterviews() {
    try {
        const user = await checkUser();
        if (!user) return [];

        const interviews = await db.interviewSession.findMany({
            where: {
                userId: user.id
            },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                date: true,
                jobRole: true,
                companyName: true,
                focus: true,
                difficulty: true,
                duration: true,        // Planned time
                actualDuration: true,  // ✅ Actual time spent
                analysis: true,
            }
        });
        return JSON.parse(JSON.stringify(interviews));
    } catch (error) {
        console.error("Failed to fetch dashboard interviews:", error);
        return [];
    }
}