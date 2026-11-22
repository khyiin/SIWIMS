# Product Requirements Document (`product.md`)
**System Name:** Student Internship and Work Immersion Management System (SIWIMS)  
**Design System Reference:** `DESIGN.md` (Tactile Spatial Minimalism)

---

## 1. Product Overview
The **Student Internship and Work Immersion Management System (SIWIMS)** is a centralized, web-based platform designed to simplify, standardize, and monitor the end-to-end internship and work immersion lifecycle. It connects **Students/Interns**, **School Coordinators**, **Partner Companies (HR Personnel)**, and **Company Supervisors** within a unified digital workflow.

* **Students:** Submit pre-deployment requirements, search and apply for verified internship opportunities, log daily attendance, track verified hours, and submit weekly accomplishment reports.
* **Partner Companies:** Manage company profiles, publish internship openings, screen applicants, and assign company supervisors.
* **Company Supervisors:** Monitor assigned interns, verify daily attendance/hours, review weekly accomplishment reports, and submit formal performance evaluations.
* **School Coordinators:** Oversee the complete student journey—from initial registration and eligibility verification to placement validation, progress tracking, final evaluation review, and official completion approval.

---

## 2. Problem Statement
Traditional internship and work immersion workflows rely heavily on fragmented manual processes—including printed requirement packets, independent job hunting across disconnected channels, paper Daily Time Records (DTRs), and physical accomplishment binders. 

As student cohorts scale across multiple host establishments, schools face significant administrative friction in tracking individual progress, validating rendered hours, following up on missing documents, and collecting supervisor evaluations on time. SIWIMS eliminates these bottlenecks by consolidating all records, approvals, and progress metrics into a single, real-time source of truth.

---

## 3. Product Objectives
1. **Centralize Operations:** Unify all internship and work immersion workflows into a single web platform.
2. **Streamline Onboarding & Applications:** Simplify student registration, document verification, and online company applications.
3. **Empower Industry Partners:** Enable partner companies to publish opportunities, manage slots, and process student applications efficiently.
4. **Facilitate Supervisor Oversight:** Provide supervisors with dedicated tools to verify attendance, review reports, and evaluate intern performance.
5. **Enable Institutional Monitoring:** Give school coordinators real-time visibility into every student's status, compliance, and progress.
6. **Ensure Accurate Hour Tracking:** Compute internship completion strictly from supervisor-verified attendance logs.
7. **Eliminate Manual Paperwork:** Replace physical forms and repetitive follow-ups with automated status workflows and notifications.
8. **Standardize Records & Reporting:** Maintain audit-ready histories for evaluations, attendance, and official completion records.

---

## 4. Target Users & System Actors

### 4.1 Student / Intern
An enrolled student completing an internship or work immersion program to fulfill academic requirements.
* **Account & Profile:** Register, log in, and maintain personal and academic information.
* **Requirements:** Upload and track required pre-deployment documents.
* **Placement:** Browse verified partner companies, view open positions, submit applications, monitor application statuses, and view confirmed placements.
* **Monitoring & Reporting:** Record daily time-in/time-out, track verified vs. remaining hours, and submit weekly accomplishment reports.
* **Completion:** View supervisor feedback, performance evaluation results, and overall completion status.

### 4.2 School Coordinator
The institutional administrator responsible for overseeing student eligibility, placements, compliance, and completion.
* **Student Verification:** Manage student accounts, review profiles/requirements, verify internship eligibility, and approve or return incomplete submissions.
* **Company & Placement Governance:** Verify partner company registrations, monitor student applications, and validate/approve student-company placements.
* **Progress Oversight:** Monitor student attendance, verified hours, and accomplishment reports; identify students with missing requirements or delayed progress.
* **Completion & Reporting:** Review supervisor evaluations, verify completion criteria, approve final internship completion, and generate student, company, attendance, and completion reports.

### 4.3 Partner Company / HR Personnel
An accredited host organization offering internship or work immersion slots.
* **Company Setup:** Register company details, maintain company profiles, and submit credentials for school verification.
* **Opportunity Management:** Create and manage internship postings, position descriptions, qualifications, available slots, and availability statuses.
* **Applicant & Intern Management:** Review student applications and profiles, accept or reject applicants, manage accepted interns, assign company supervisors, and monitor active placements.

### 4.4 Company Supervisor
An industry mentor assigned by a partner company to guide, monitor, and evaluate specific interns.
* **Intern Oversight:** Access the supervisor dashboard to view assigned interns and monitor individual progress.
* **Attendance Verification:** Review daily attendance logs and verify working hours.
* **Report Review:** Review weekly accomplishment reports, approve submissions or return them for revision, and provide constructive feedback.
* **Performance Evaluation:** Assess intern performance using structured rubrics and submit final evaluations.

---

## 5. Main System Modules & Features

### 5.1 Account Registration and Authentication
* User registration, secure login, and logout functionality.
* Strict Role-Based Access Control (RBAC) isolating views and actions per actor.
* Profile management, password management, and administrative account verification.

### 5.2 Student Profile and Requirements Management
* Personal and academic profile management.
* Digital document upload and pre-deployment requirements submission.
* Coordinator verification workflow (`Pending Verification`, `Approved`, `Revision Required`, `Rejected`) with full submission history.

### 5.3 Company and Internship Opportunity Management
* Company registration, profile management, and school verification gate (only verified companies can publish opportunities).
* Internship posting management: position descriptions, qualifications, slot counts, and availability toggles.

### 5.4 Internship Application and Placement Management
* Student opportunity browsing, company/position filtering, and online application submission.
* Company applicant review, acceptance/rejection workflow, and supervisor assignment.
* School coordinator placement validation to ensure policy compliance before deployment begins.

### 5.5 Attendance and Internship Hour Monitoring
* Daily time-in and time-out recording with complete attendance history.
* Automated working-hour calculation displaying **Required Hours**, **Total Verified Hours**, and **Remaining Hours**.
* Supervisor verification workflow (`Pending Verification`, `Verified`, `Rejected`)—progress is calculated strictly from **verified** hours.

### 5.6 Accomplishment Report Management
* Weekly accomplishment report creation with date/activity logs and task descriptions.
* Supervisor review loop (`Submitted`, `Under Review`, `Approved`, `Revision Required`) with inline comments and revision history.
* Read-only monitoring access for school coordinators.

### 5.7 Student Progress Monitoring
* Cohort-wide tracking across key segments: total registered students, awaiting verification, searching for placement, currently undergoing internship, incomplete requirements, ready for final evaluation, and completed records.
* Individual internship completion percentage and early-warning flags for delayed progress.

### 5.8 Performance Evaluation
* Structured digital evaluation forms with standardized criteria and rating scales.
* Qualitative fields for supervisor comments, strengths, and areas for improvement.
* Final evaluation submission and historical record access for school coordinators.

### 5.9 Internship Completion Management
* Automated and manual verification checklist covering required hours, verified attendance, approved accomplishment reports, required documents, and supervisor evaluation.
* Final school coordinator sign-off, status transition to `Completed`, and official completion record generation.

### 5.10 Notifications and Announcements
* Event-driven alerts for requirement approvals/revisions, application decisions, placement confirmations, attendance verifications, report reviews, evaluation submissions, and completion approvals.
* Institution-wide announcements published by the school coordinator.

---

## 6. Complete System Lifecycle Workflow

1. **Phase 1 — Registration & Verification:**  
   Student registers → completes profile → uploads required documents → School Coordinator reviews and approves eligibility (or requests revisions).
2. **Phase 2 — Opportunity & Application:**  
   Company registers → School verifies company → Company publishes openings → Eligible student browses and applies → Company reviews and accepts/rejects application → Student receives status alert.
3. **Phase 3 — Placement Confirmation:**  
   School Coordinator reviews accepted application → validates and approves placement → Partner Company assigns a Company Supervisor → Student receives confirmed placement details.
4. **Phase 4 — Internship Proper:**  
   Student reports to company → logs daily time-in/time-out → Supervisor verifies attendance → System updates verified hours → Student submits weekly accomplishment reports → Supervisor reviews/approves → Coordinator monitors ongoing progress.
5. **Phase 5 — Performance Evaluation:**  
   Student reaches required hours → Supervisor assesses performance → completes and submits final evaluation form → Coordinator reviews evaluation.
6. **Phase 6 — Final Verification & Completion:**  
   School verifies hours, attendance, reports, documents, and supervisor evaluation → Coordinator approves final completion → Student status updates to `Completed` and official completion record is generated.

---

## 7. System Status Reference

| Domain | Valid Statuses |
| :--- | :--- |
| **Student Account & Requirements** | `Pending Verification` • `Approved` • `Revision Required` • `Rejected` |
| **Internship Application** | `Pending` • `Under Review` • `Accepted` • `Rejected` • `Withdrawn` |
| **Internship Placement** | `Pending School Approval` • `Approved` • `Returned for Revision` |
| **Internship Progress** | `Not Yet Placed` • `Ready to Start` • `Ongoing` • `For Final Evaluation` • `For Completion Verification` • `Completed` |
| **Attendance Record** | `Pending Verification` • `Verified` • `Rejected` |
| **Accomplishment Report** | `Submitted` • `Under Review` • `Approved` • `Revision Required` |

---

## 8. Core Business Rules
1. Users must authenticate with an authorized account and can only access modules permitted by their assigned role.
2. Students must obtain school verification on their pre-deployment requirements before applying to internships.
3. Only school-verified partner companies may publish internship opportunities.
4. Partner companies can only manage their own postings, applicants, and assigned interns.
5. Only accepted applications can advance to placement confirmation, and every placement must be validated by the school coordinator.
6. Partner companies must assign a designated supervisor to every accepted intern.
7. Company supervisors can only view, verify, and evaluate interns explicitly assigned to them.
8. Only supervisor-verified attendance records count toward official accumulated internship hours.
9. A student cannot be marked `Completed` unless all required hours, documents, accomplishment reports, and supervisor evaluations are verified and approved by the school.

---

## 9. Role-Specific Dashboard Specifications

* **Student Dashboard:** Application status tracker, confirmed company/position card, internship progress bar (`Verified Hours / Required Hours`), daily attendance log widget, weekly accomplishment reports list, supervisor feedback panel, and notifications feed.
* **School Coordinator Dashboard:** Cohort KPI summary (total students, awaiting verification, active interns, completed), student verification queue, application & placement oversight table, attendance/hour compliance monitor, missing requirements alerts, accomplishment report & evaluation tracker, and summary report generator.
* **Partner Company Dashboard:** Verified company profile summary, active internship opportunities & slot availability, incoming applicant queue (accept/reject actions), active interns roster, and supervisor assignment manager.
* **Company Supervisor Dashboard:** Assigned interns overview, pending attendance verification queue, accumulated verified hours per intern, weekly accomplishment report review queue, individual progress indicators, and performance evaluation forms.

---

## 10. Non-Functional Requirements
* **Security:** Encrypted authentication, strict RBAC, secure file upload validation, and privacy isolation for student and company records.
* **Usability:** Clean, minimalist UI (`DESIGN.md` Tactile Spatial Minimalism), intuitive navigation, clear status pills, responsive cross-device layout, and tailored role dashboards.
* **Performance:** Fast querying of student/internship records, real-time calculation of verified hours, reliable document uploads, and prompt notification delivery.
* **Reliability:** ACID-compliant record storage, duplicate/overlapping attendance prevention, strict server-side input validation, and accurate state transitions.
* **Maintainability:** Modular architecture, normalized relational database schema, and configurable institutional rules (e.g., adjustable required internship hours per academic program).

---

## 11. Scope & Limitations (Version 1.0)
* **In Scope:** Account/RBAC management, student requirement verification, company verification & job postings, online applications & placement validation, supervisor assignment, attendance/hour tracking, weekly accomplishment reports, progress dashboards, performance evaluations, completion verification, notifications, and summary reports.
* **Out of Scope (Future Enhancements):** Intern allowance/payroll processing, automated post-internship hiring, full HR/employee lifecycle management, built-in video interviewing, automated AI performance grading, direct external SIS/ERP integration, and physical biometric hardware integration.

---

## 12. Success Criteria
The system achieves product success when all four user roles can seamlessly execute their end-to-end responsibilities within one platform—specifically when students can register, get verified, and apply; companies can post openings and manage placements; supervisors can verify hours, review reports, and submit evaluations; and schools can accurately track verified hours and formally certify internship completion with minimal manual paperwork.