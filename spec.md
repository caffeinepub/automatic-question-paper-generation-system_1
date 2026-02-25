# Specification

## Summary
**Goal:** Build a full-stack Automatic Question Paper Generation System ("QuestionPaper Pro") with a Motoko backend and a professional academic React frontend, enabling teachers to manage subjects/questions and generate randomized exam paper sets.

**Planned changes:**

### Backend (Motoko – single actor)
- CRUD operations for subjects (id, name, code, description) with 10 pre-seeded engineering subjects
- CRUD operations for questions (id, subjectId, questionText, category: MCQ/2M/4M/6M/8M, difficulty: Easy/Medium/Hard, MCQ options/correctOption)
- Storage and retrieval of generated paper sets (id, subjectId, examDuration, totalMarks, sections, setLabel A–E, createdAt)
- Stable variables for data persistence across upgrades

### Frontend Pages & Features
- **Login Page** (`/`): College logo placeholder, system title, email/password fields, Login button (simulated client-side auth), Forgot Password link; navy blue/white/light grey theme
- **Dashboard** (`/dashboard`): Welcome header, left sidebar navigation (Dashboard, Add Questions, Question Bank, Generate Paper, Generated Papers, Logout), stat cards (Total Subjects, Total Questions, Papers Generated) fetched from backend, database flow visualization (Subjects → Question Categories → Stored Questions → Paper Generation Engine → PDF Output)
- **Add Questions Page** (`/add-question`): Subject dropdown (from backend), category dropdown, question textarea, MCQ option fields (conditionally shown), difficulty selector, Save to Database button calling backend, success toast; supports pre-filled edit mode via question ID
- **Question Bank Page** (`/question-bank`): Filterable table (by subject, category, difficulty) with Edit/Delete actions per row; Manage Subjects sub-section for adding/editing/deleting subjects
- **Generate Paper Page** (`/generate-paper`): Subject dropdown, exam duration input, total marks input, per-category question count selectors, live marks calculator, Generate Paper button producing 5 shuffled sets (A–E) saved to backend
- **Generated Papers Page** (`/generated-papers`): List of all stored paper sets grouped by subject with metadata
- **Paper Preview Page**: Formal academic header (college name + logo), subject/duration/marks, Section A (MCQ), Section B (2M & 4M), Section C (6M & 8M), sequential numbering, Set A–E switcher tabs, Download PDF button (browser print API or client-side library)

### Visual Theme
- Navy Blue (#1E3A5F) primary, Light Blue (#4A90D9) accent, Very Light Grey (#F4F6F9) background
- Poppins or Inter font, lucide-react icons, rounded cards with soft shadows, responsive collapsible sidebar
- College logo and login background used as static assets

**User-visible outcome:** Teachers can log in, manage subjects and questions via a connected question bank, configure and auto-generate 5 randomized exam paper sets per subject, preview them in a formal academic layout, and download each set as a PDF.
