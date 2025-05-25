import { createTransport } from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Configure email transport
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, ...data } = body;

        let emailData;
        let recipient;
        switch (type) {
            case 'welcomeStudent':
                emailData = emailTemplates.welcomeStudent(data.name, data.email, data.password);
                recipient = data.email;
                break;
            case 'welcomeFaculty':
                emailData = emailTemplates.welcomeFaculty(data.name, data.email, data.password);
                recipient = data.email;
                break;
            case 'marksPublished':
                emailData = emailTemplates.marksPublished(data.studentName, data.courseName, data.examType);
                recipient = data.studentEmail;
                break;
            case 'courseRegistration':
                emailData = emailTemplates.courseRegistration(data.studentName, data.courseName, data.facultyName);
                recipient = data.studentEmail;
                break;
            default:
                console.error('[EMAIL API] Invalid email type:', type, 'Data:', data);
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        console.log('[EMAIL API] Attempting to send email', {
            type,
            recipient,
            subject: emailData.subject,
            data
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: emailData.subject,
            html: emailData.html
        });

        console.log('[EMAIL API] Email sent successfully', {
            type,
            recipient,
            subject: emailData.subject
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[EMAIL API] Email sending error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
} 