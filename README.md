# Algo-Arena (GenAI_AlgoArena)

Algo-Arena is a cutting-edge, AI-powered coding platform designed for developers to sharpen their algorithmic skills, learn through structured modules, and receive real-time AI assistance. The platform features a robust backend for code execution, a dynamic frontend for a seamless user experience, and a powerful administrative dashboard for content management.

## 🚀 Overview

The project is structured as a monorepo consisting of two primary directories:
- **`be/`**: The backend engine built with Node.js, Express, and MongoDB.
- **`fe/`**: The interactive frontend built with Vite, React, and Tailwind CSS.

---

## 🏗️ Architecture & Tech Stack

### Backend (`be/`)
- **Core**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Queue Management**: BullMQ & Redis (for asynchronous code execution)
- **Code Execution**: Judge0 API
- **AI Integration**: Groq SDK (for AI-powered suggestions/feedback)
- **Storage/Services**: Supabase, Google Cloud (Google APIs)
- **Validation**: Joi
- **Authentication**: JWT & Bcrypt
- **Testing**: Jest & Supertest

### Frontend (`fe/`)
- **Framework**: React (Vite-based)
- **State Management**: Redux Toolkit
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Animations**: Framer Motion
- **Routing**: React Router DOM

---

## 📁 Detailed Project Structure

### 🌐 Backend (`be/`)

The backend follows a modular architecture for scalability and maintainability.

| Directory/File | Description |
| :--- | :--- |
| `index.js` | The entry point of the server. Initializes Express, connects to the database, and sets up middleware. |
| `routes/` | Defines the API endpoints. |
| `routes/index.js` | Central router that aggregates all sub-routers (User, Problem, Submission, etc.). |
| `controllers/` | Contains the business logic for each resource. |
| `controllers/ai.controller.js` | Handles AI-driven features like code analysis and hints. |
| `controllers/auth.controller.js` | Manages user registration, login, and authentication tokens. |
| `controllers/problem.controller.js` | Handles CRUD operations for coding problems. |
| `controllers/submission.controller.js` | Manages the workflow of submitting code and fetching results. |
| `controllers/user.controller.js` | Handles user profile management and stats. |
| `models/` | Mongoose schemas for MongoDB collections. |
| `models/Problem.js` | Schema for coding problems (title, difficulty, test cases, etc.). |
| `models/Submission.js` | Tracks user code submissions and their status (Accepted, Failed, etc.). |
| `models/User.js` | User profiles, authentication data, and progress. |
| `services/` | External integrations and reusable logic. |
| `utils/` | Utility functions and background workers. |
| `utils/worker.js` | The BullMQ worker that interfaces with Judge0 to execute code in the background. |
| `db/` | Database connection configuration. |
| `middleware/` | Custom middleware for authentication (JWT verification) and error handling. |

### 🎨 Frontend (`fe/`)

The frontend is designed for high performance and a rich user experience.

| Directory/File | Description |
| :--- | :--- |
| `src/main.jsx` | Entry point of the React application. |
| `src/App.jsx` | Root component defining the main layout and global providers. |
| `src/pages/` | Individual view components (pages). |
| `src/pages/LandingPage.jsx` | The welcome page for new users. |
| `src/pages/AuthPage.jsx` | Login and Sign-up interface. |
| `src/pages/DashboardPage.jsx` | Overview of user progress and available modules. |
| `src/pages/ProblemPage.jsx` | The core coding interface with Monaco editor and test results. |
| `src/pages/AdminPage.jsx` | Management dashboard for creating and editing problems/modules. |
| `src/components/` | Reusable UI components (Modals, Navbars, Buttons, etc.). |
| `src/store/` | Redux slices for global state management (User, Submissions, AI). |
| `src/hooks/` | Custom React hooks for data fetching and shared logic. |
| `src/api/` | Axios instance and API service calls to the backend. |
| `tailwind.config.js` | Custom styling configurations. |

---

## 🛠️ Key Features

1.  **AI-Assisted Learning**: Integrated AI (Groq) provides real-time feedback on code and helps users solve complex problems.
2.  **Robust Code Execution**: Uses Judge0 to support multiple programming languages with secure and isolated execution.
3.  **Real-time Progress Tracking**: Users can see their status on problems and modules in real-time.
4.  **Admin Suite**: A full-featured admin dashboard to manage the entire platform's content.
5.  **Secure Authentication**: JWT-based auth ensures user data and progress are safe.
6.  **Interactive Editor**: Professional-grade code editing experience using Monaco Editor.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis (for BullMQ)

### Backend Setup
1. Navigate to the `be` directory: `cd be`
2. Install dependencies: `npm install`
3. Configure `.env` (refer to `.env.example` if available)
4. Start the server: `npm run start`
5. Start the worker: `npm run worker`

### Frontend Setup
1. Navigate to the `fe` directory: `cd fe`
2. Install dependencies: `npm install`
3. Configure `.env` with backend URL
4. Run the development server: `npm run dev`

---

## 🧪 Testing

The backend includes a comprehensive test suite using **Jest** and **Supertest**.
- Run all tests: `npm test`

---

Developed with ❤️ as part of the GenAI AlgoArena Project.
