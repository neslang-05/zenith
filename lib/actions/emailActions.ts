'use server';

export async function sendWelcomeEmailToStudentAction(
    name: string,
    email: string,
    password: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'welcomeStudent',
            data: { name, email, password }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send welcome email');
    }
}

export async function sendWelcomeEmailToFacultyAction(
    name: string,
    email: string,
    password: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'welcomeFaculty',
            data: { name, email, password }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send welcome email');
    }
}

export async function sendMarksPublishedEmailAction(
    studentEmail: string,
    studentName: string,
    courseName: string,
    examType: 'Internal' | 'Mid-Term' | 'End-Term'
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'marksPublished',
            data: {
                email: studentEmail,
                studentName,
                courseName,
                examType
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send marks published email');
    }
}

export async function sendCourseRegistrationEmailAction(
    studentEmail: string,
    studentName: string,
    courseName: string,
    facultyName: string
): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'courseRegistration',
            data: {
                email: studentEmail,
                studentName,
                courseName,
                facultyName
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send course registration email');
    }
} 