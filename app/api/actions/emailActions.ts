'use server';

import { createTransport } from 'nodemailer';

const transporter = createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    welcomeStudent: (name: string, email: string, password: string) => ({
        subject: 'Welcome to Zenith - Your Student Account',
        html: `
            <h2>Welcome to Zenith, ${name}!</h2>
            <p>Your student account has been created successfully.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
                <li>Email: ${email}</li>
                <li>Initial Password: ${password}</li>
            </ul>
            <p>For security reasons, please change your password after your first login.</p>
            <p>If you have any questions, please contact your administrator.</p>
        `
    }),

    welcomeFaculty: (name: string, email: string, password: string) => ({
        subject: 'Welcome to Zenith - Your Faculty Account',
        html: `
            <h2>Welcome to Zenith, ${name}!</h2>
            <p>Your faculty account has been created successfully.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
                <li>Email: ${email}</li>
                <li>Initial Password: ${password}</li>
            </ul>
            <p>For security reasons, please change your password after your first login.</p>
            <p>If you have any questions, please contact your administrator.</p>
        `
    }),

    marksPublished: (studentName: string, courseName: string, examType: string) => ({
        subject: `${examType} Marks Published - ${courseName}`,
        html: `
            <h2>Dear ${studentName},</h2>
            <p>Your ${examType} marks for the course "${courseName}" have been published.</p>
            <p>Please log in to your student dashboard to view your marks.</p>
        `
    }),

    courseRegistration: (studentName: string, courseName: string, facultyName: string) => ({
        subject: `Course Registration Confirmation - ${courseName}`,
        html: `
            <h2>Dear ${studentName},</h2>
            <p>You have been successfully registered for the course "${courseName}" with ${facultyName}.</p>
            <p>You can now access the course materials and updates through your student dashboard.</p>
        `
    })
};

export async function sendWelcomeEmailToStudentAction(
    name: string,
    email: string,
    password: string
): Promise<void> {
    const template = emailTemplates.welcomeStudent(name, email, password);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html
    });
}

export async function sendWelcomeEmailToFacultyAction(
    name: string,
    email: string,
    password: string
): Promise<void> {
    const template = emailTemplates.welcomeFaculty(name, email, password);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html
    });
}

export async function sendMarksPublishedEmailAction(
    studentEmail: string,
    studentName: string,
    courseName: string,
    examType: 'Internal' | 'Mid-Term' | 'End-Term'
): Promise<void> {
    const template = emailTemplates.marksPublished(studentName, courseName, examType);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: template.subject,
        html: template.html
    });
}

export async function sendCourseRegistrationEmailAction(
    studentEmail: string,
    studentName: string,
    courseName: string,
    facultyName: string
): Promise<void> {
    const template = emailTemplates.courseRegistration(studentName, courseName, facultyName);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: studentEmail,
        subject: template.subject,
        html: template.html
    });
} 