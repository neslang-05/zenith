# Zenith Product Roadmap

**Created by:** Nilambar Elangbam  
**Created time:** March 1, 2025, 7:54 PM  
**Category:** Customer Research, Proposal  
**Reviewers:** Nilambar Elangbam, Joymangol Chingangbam  
**Last updated by:** Nilambar Elangbam  
**Last updated time:** March 1, 2025, 11:35 PM  

**AI Summary:**  
Zenith is a comprehensive result management system designed to automate academic result processing, enhance accessibility, and provide analytics for improved student performance. It targets school administrations, students, faculty, and parents.

---

## Team Name: **Synergy**

*Representing collaborative teamwork*  
***"Excellence Tracked, Potential Unlocked"***

## Product Name: **Zenith**

*The highest point reached by a celestial object, suggesting peak performance.*

---

## Design File

[View Design on Figma](https://www.figma.com/design/MlupssNm2yDyenG7INdyYM/Zenith?node-id=3-2&t=eYq7NiU98FQ3NreT-1)

## GitHub Repository

[Zenith Repository](https://github.com/neslang-05/zenith.git)

---

## What is a Result Management System?

A software application designed to automate and streamline the process of managing academic results and student performance data.

---

## Problem Statement

1. **Inefficiency and Human Error**  
   Manual calculation and recording of grades is time-consuming and prone to errors, which can significantly impact students' academic records and future opportunities.

2. **Limited Accessibility and Distribution**  
   Traditional paper-based systems restrict when and how students can access their results, requiring physical presence and causing delays between assessment completion and result availability.

3. **Data Management and Analysis Challenges**  
   Physical record systems make it difficult to securely store, retrieve, and analyze academic data, limiting institutions' ability to track performance trends and make data-driven educational improvements.

---

## Solution

1. **Automated Calculation and Processing**  
   Automatically calculates grades, percentages, GPAs, and pass/fail status based on input marks, ensuring accuracy and consistency in grading.

2. **Centralized Digital Access**  
   Provides a secure online platform for students and parents to access results anytime, while teachers and administrators manage data through role-based access controls.

3. **Comprehensive Analytics and Reporting**  
   Generates customizable reports and visualizations to track individual and class performance.

---

## Tech Stack

1. **Frontend**:  
   - Framework: [Next.js](https://nextjs.org/) (React-based framework for server-side rendering and static site generation).  
   - Styling: Tailwind CSS for utility-first styling.  
   - State Management: Context API and custom hooks.  

2. **Backend**:  
   - Authentication: Firebase Authentication for secure user login and role-based access.  
   - Database: Firestore (NoSQL database) for real-time data storage and retrieval.  
   - Serverless Functions: Firebase Functions for CSV import and PDF generation.  

3. **Utilities**:  
   - Grade Calculation and CSV Parsing: Custom utility functions.  
   - PDF Generation: Serverless function for generating result reports.  

4. **Design**:  
   - Figma for UI/UX design and prototyping.  

---

## Database Design

The database is structured using Firestore (NoSQL) with the following collections:

1. **Users**:  
   - Fields: `userId`, `name`, `email`, `role` (admin, faculty, student), `profileDetails`.  

2. **Results**:  
   - Fields: `resultId`, `studentId`, `subject`, `marks`, `grade`, `GPA`, `timestamp`.  

3. **Classes**:  
   - Fields: `classId`, `className`, `facultyId`, `studentIds[]`.  

4. **Analytics**:  
   - Fields: `analyticsId`, `classId`, `performanceMetrics`, `trendData`.  

---

## System Architecture

Below is the system architecture represented using a Mermaid diagram: