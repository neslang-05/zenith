const sendEmail = async (type: string, data: any) => {
    const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
    }
    return response.json();
};

export const sendWelcomeEmailToStudent = async (name: string, email: string, password: string) => {
    await sendEmail('welcomeStudent', { name, email, password });
};

export const sendWelcomeEmailToFaculty = async (name: string, email: string, password: string) => {
    await sendEmail('welcomeFaculty', { name, email, password });
};

export const sendMarksPublishedEmail = async (
    studentEmail: string,
    studentName: string,
    courseName: string,
    examType: 'Internal' | 'Mid-Term' | 'End-Term'
) => {
    await sendEmail('marksPublished', { studentEmail, studentName, courseName, examType });
};

export const sendCourseRegistrationEmail = async (
    studentEmail: string,
    studentName: string,
    courseName: string,
    facultyName: string
) => {
    await sendEmail('courseRegistration', { studentEmail, studentName, courseName, facultyName });
}; 