# ThrivePath - Therapy Management Platform

ThrivePath is a comprehensive web application for managing therapy sessions, learner progress, and parent-therapist collaboration, built with React/TypeScript frontend and FastAPI backend. [1](#0-0) 

## Tech Stack

**Frontend:**
- React 18 with TypeScript [2](#0-1) 
- Vite for build tooling [3](#0-2) 
- React Router for navigation [4](#0-3) 
- Tailwind CSS with Radix UI components [5](#0-4) 
- Zustand for state management [6](#0-5) 

**Backend:**
- FastAPI (Python) [7](#0-6) 
- Supabase PostgreSQL database [8](#0-7) 
- JWT authentication [9](#0-8) 
- Google Gemini AI integration [10](#0-9) 

## Project Structure

```
ThrivePath/
├── project/                          # Frontend React application
│   ├── src/
│   │   ├── App.tsx                  # Main app with routing
│   │   ├── components/
│   │   │   ├── auth/                # Login/Registration
│   │   │   ├── therapist/           # Therapist dashboard & tools
│   │   │   ├── parent/              # Parent dashboard & homework
│   │   │   ├── sessions/            # Session planning
│   │   │   ├── layout/              # Sidebar & navbar
│   │   │   └── shared/              # Shared components
│   │   ├── context/                 # React contexts (Auth, Data, Theme)
│   │   └── hooks/                   # Custom React hooks
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.ts              # Vite configuration
│
└── backend/                         # FastAPI backend
    ├── app.py                       # Main API endpoints
    ├── db.py                        # Supabase connection
    ├── supabase_setup.py           # Database setup script
    ├── authentication/              # Auth logic
    ├── users/                       # User management
    ├── students/                    # Student/learner management
    ├── sessions/                    # Session management
    ├── notes/                       # Session notes
    ├── ai_services.py              # AI integration
    └── others/
        └── schema.sql              # Database schema
```

## Key Features

**Role-Based Access:**
- Therapist role: Dashboard, learner management, assessments, session planning, activities [11](#0-10) 
- Parent role: Child dashboard, homework manager, progress reports [12](#0-11) 

**Core Functionality:**
- User authentication with JWT tokens [9](#0-8) 
- Session planning and management [13](#0-12) 
- AI-powered activity suggestions [14](#0-13) 
- Medical document OCR extraction [15](#0-14) 
- Real-time notifications [16](#0-15) 
- Session status tracking and smart notifications [17](#0-16) 

## Database Schema

The application uses PostgreSQL with the following core tables: [18](#0-17) 

- `users` - Authentication and user accounts [19](#0-18) 
- `therapists` - Therapist profiles [20](#0-19) 
- `parents` - Parent profiles [21](#0-20) 
- `children` - Student/learner information<cite />
- `session_notes` - Therapy session notes [22](#0-21) 
- `ai_preferences` - Custom AI behavior per child [23](#0-22) 

## API Architecture

The backend exposes RESTful endpoints organized by domain: [24](#0-23) 

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/students/*` - Student operations [25](#0-24) 
- `/api/sessions/*` - Session CRUD operations
- `/api/notes/*` - Session notes
- `/api/ai/*` - AI-powered features
- `/health` - Health check endpoint [26](#0-25) 

## Setup & Installation

**Frontend:**
```bash
cd project
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python supabase_setup.py  # Initialize database
uvicorn app:app --reload
```

The frontend proxies API requests to `localhost:8000`. [27](#0-26) 

## Notes

The application uses context providers for global state management (Auth, Data, Notifications, Theme). [28](#0-27)  Protected routes ensure role-based access control. [29](#0-28)  The backend includes comprehensive session status monitoring with smart notification systems. [17](#0-16)  File uploads are handled through a local files directory mounted as static files. [30](#0-29)

### Citations

**File:** project/index.html (L7-7)
```html
    <title>ThrivePath Therapy Planner - Complete Web Application</title>
```

**File:** project/package.json (L16-24)
```json
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-slot": "^1.2.3",
    "@supabase/supabase-js": "^2.57.4",
    "@tabler/icons-react": "^3.34.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
```

**File:** project/package.json (L31-34)
```json
    "react": "^18.3.1",
    "react-calendar": "^6.0.0",
    "react-day-picker": "^9.9.0",
    "react-dom": "^18.3.1",
```

**File:** project/package.json (L39-39)
```json
    "zustand": "^5.0.8"
```

**File:** project/vite.config.ts (L1-6)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
```

**File:** project/vite.config.ts (L16-27)
```typescript
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/files': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
```

**File:** project/src/App.tsx (L2-2)
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
```

**File:** project/src/App.tsx (L5-6)
```typescript
import { NotificationProvider } from './context/NotificationContext';
import { NotificationPopupContainer } from './components/notifications/NotificationPopup';
```

**File:** project/src/App.tsx (L21-21)
```typescript
import { ProtectedRoute } from './components/shared/ProtectedRoute';
```

**File:** project/src/App.tsx (L54-118)
```typescript
          {/* Therapist Routes */}
          <Route 
            path="/learners" 
            element={
              <ProtectedRoute requiredRole="therapist">
                <LearnersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learners/my-learners" 
            element={
              <ProtectedRoute requiredRole="therapist">
                <MyLearners />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learners/temp-students" 
            element={
              <ProtectedRoute requiredRole="therapist">
                <TemporaryStudents />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/assessments"
            element={
              <ProtectedRoute requiredRole="therapist">
                <AssessmentTools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="therapist">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute requiredRole="therapist">
                <SessionPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute requiredRole="therapist">
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities/:learnerId"
            element={
              <ProtectedRoute requiredRole="therapist">
                <ChildDetailsPage />
              </ProtectedRoute>
            }
          />
```

**File:** project/src/App.tsx (L120-158)
```typescript
          {/* Parent Routes */}
          <Route 
            path="/child" 
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentDashboard isProfileOpen={isProfileOpen} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/homework" 
            element={
              <ProtectedRoute requiredRole="parent">
                <HomeworkManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute requiredRole="parent">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Progress Reports</h2>
                  <p className="text-muted-foreground">Detailed progress reports coming soon!</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute requiredRole="parent">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Goals & Milestones</h2>
                  <p className="text-muted-foreground">Goal tracking interface coming soon!</p>
                </div>
              </ProtectedRoute>
            } 
          />
```

**File:** project/src/App.tsx (L191-202)
```typescript
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <ThemeProvider>
            <Router>
              <AppLayout />
            </Router>
          </ThemeProvider>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
```

**File:** backend/app.py (L6-6)
```python
from authentication.authh import authenticate_user_detailed, create_access_token, get_current_user, update_last_login
```

**File:** backend/app.py (L11-16)
```python
from sessions.sessions import (
    create_session, get_sessions_by_therapist, get_todays_sessions_by_therapist, get_session_by_id, update_session, delete_session,
    add_activity_to_session, get_session_activities, get_available_child_goals, get_master_activities,
    remove_activity_from_session, assign_ai_activity_to_child, SessionCreate, SessionUpdate, SessionResponse,
    SessionActivityCreate, SessionActivityUpdate, SessionActivityResponse, ChildGoalResponse, ActivityResponse
)
```

**File:** backend/app.py (L17-27)
```python
from sessions.session_status import (
    update_session_status, start_session, complete_session, cancel_session,
    get_sessions_needing_status_update, auto_update_session_statuses,
    get_upcoming_session_notifications, create_session_notifications, get_todays_sessions_status,
    start_smart_notification_system, stop_smart_notification_system, 
    get_smart_notification_system_status, refresh_smart_notification_system,
    check_sessions_on_login, schedule_session_notifications_for_day,
    get_continuous_notifications, handle_dynamic_schedule_changes,
    get_monitoring_service_status, trigger_manual_status_update, trigger_manual_notification_check,
    SessionStatusUpdate, SessionNotification, SessionStatusResponse
)
```

**File:** backend/app.py (L49-57)
```python
app = FastAPI(title="ThrivePath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**File:** backend/app.py (L59-62)
```python
# Ensure local files directory exists and mount it for static serving
FILES_DIR = os.path.join(os.path.dirname(__file__), "files")
os.makedirs(FILES_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=FILES_DIR), name="files")
```

**File:** backend/app.py (L268-271)
```python
@app.get("/health")
async def health_check():
    """Health check endpoint - Service availability monitoring"""
    return {"status": "healthy", "service": "ThrivePath API"}
```

**File:** backend/supabase_setup.py (L1-4)
```python
"""
Supabase Setup Script for ThrivePath
This script helps set up tables and RLS policies in Supabase
"""
```

**File:** backend/ai_services.py (L312-409)
```python
# Functions for interacting with Gemini API

def _build_ocr_prompt() -> str:
    """
    Build comprehensive OCR prompt for medical document analysis
    - Returns standardized prompt for consistent API responses
    - Focuses on structured medical information extraction
    """
    return """Please perform OCR on this medical document and extract comprehensive information for a child's assessment form with three steps.

IMPORTANT: Return ONLY a valid JSON object with no additional text, explanations, or markdown formatting.

Extract and structure the data exactly as follows:
{
    "step1_basic_info": {
        "patient_name": "full patient name if found or null",
        "first_name": "first name extracted or null",
        "last_name": "last name extracted or null", 
        "date_of_birth": "DOB in YYYY-MM-DD format if found or null",
        "age": "age in years if mentioned or null"
    },
    "step2_profile_info": {
        "primary_complaint": "main complaint/reason for visit or empty string",
        "referred_by": "referring doctor/institution or empty string",
        "diagnosis": "primary diagnosis or condition mentioned or empty string",
        "family_info": {
            "father": {
                "name": "father's name if mentioned or empty string",
                "age": "father's age if mentioned or null",
                "education": "father's education if mentioned or empty string",
                "occupation": "father's occupation if mentioned or empty string"
            },
            "mother": {
                "name": "mother's name if mentioned or empty string", 
                "age": "mother's age if mentioned or null",
                "education": "mother's education if mentioned or empty string",
                "occupation": "mother's occupation if mentioned or empty string"
            },
            "family_history": {
                "late_talkers": "family history of speech delays or empty string",
                "genetic_disorders": "family genetic conditions or empty string",
                "family_type": "nuclear/joint/single parent etc or empty string"
            }
        },
        "language_profile": {
            "primary_language": "primary language at home or empty string",
            "other_languages": "other languages exposed to or empty string"
        },
        "educational_details": {
            "school_name": "school name and location or empty string",
            "school_type": "type of school or empty string",
            "current_grade": "current grade/class or empty string",
            "school_concerns": "concerns from school or empty string"
        }
    },
    "step3_medical_info": {
        "prenatal_birth_history": {
            "mothers_age_at_delivery": "number or null",
            "pregnancy_illnesses_medication": "pregnancy complications/medications or empty string",
            "length_of_pregnancy_weeks": "pregnancy duration in weeks or null",
            "delivery_type": "normal/cesarean/forceps/vacuum extraction or empty string",
            "difficulties_at_birth": "birth complications or empty string", 
            "birth_cry": "immediate/delayed/absent or empty string",
            "birth_weight_kg": "birth weight in kg or null"
        },
        "medical_history": {
            "allergies": {"has": "boolean", "details": "allergy details or empty string"},
            "convulsions": {"has": "boolean", "details": "seizure details or empty string"},
            "head_injury": {"has": "boolean", "details": "head injury details or empty string"},
            "visual_problems": {"has": "boolean", "details": "vision problem details or empty string"},
            "hearing_problems": {"has": "boolean", "details": "hearing problem details or empty string"},
            "other_health_issues": "other medical conditions or empty string",
            "current_medication": "current medications or empty string",
            "vaccination_details": "vaccination history or empty string",
            "specific_diet": "dietary restrictions or empty string"
        },
        "developmental_milestones": {
            "turning_over_months": "age when turned over or null",
            "sitting_months": "age when sat independently or null", 
            "crawling_months": "age when crawled or null",
            "walking_months": "age when walked independently or null",
            "babbling_months": "age when started babbling or null",
            "first_word_months": "age of first word or null",
            "use_of_words_months": "age when using meaningful words or null",
            "combining_words_months": "age when combining words or null",
            "toilet_training_status": "toilet training status or empty string"
        },
        "feeding_skills": {
            "drinking_from_cup": "boolean or null",
            "eating_solid_food": "boolean or null", 
            "using_spoon": "boolean or null",
            "food_texture_sensitivity": "texture sensitivity details or empty string",
            "drooling": "drooling issues or empty string",
            "feeding_difficulties": "sucking/swallowing/chewing issues or empty string"
        },
        "behavioral_issues": {
            "aggression": "aggression issues or empty string",
            "temper_tantrums": "tantrum behavior or empty string", 
```

**File:** backend/ai_services.py (L670-728)
```python
# ==================== ACTIVITY SUGGESTION FUNCTIONS ====================
# Functions for generating therapeutic activity recommendations

def _safe_dump(data: Any) -> str:
    """Safely convert dictionaries or complex structures to formatted strings."""
    if data is None:
        return "Not provided"
    if isinstance(data, (str, int, float, bool)):
        return str(data)
    try:
        return json.dumps(data, indent=2, ensure_ascii=False)
    except TypeError:
        return str(data)


def _prepare_learner_context(learner_profile: Dict[str, Any]) -> str:
    """Create a structured context block combining medical and assessment details."""
    name = learner_profile.get('name', 'Unknown')
    age = learner_profile.get('age', 'Unknown')
    profile_details = learner_profile.get('profileDetails') or {}
    medical_diagnosis = learner_profile.get('medicalDiagnosis') or {}
    assessment_details = (
        learner_profile.get('assessmentDetails')
        or learner_profile.get('assessment_details')
        or {}
    )
    goals = learner_profile.get('goals') or profile_details.get('goals') or []

    strengths = profile_details.get('strengths') or []
    concerns = profile_details.get('concerns') or []

    context_lines = [
        f"Name: {name}",
        f"Age: {age}",
        f"Primary Goals: {', '.join(goals) if goals else 'Not specified'}",
        "",
        "Medical Diagnosis Summary:",
        _safe_dump(medical_diagnosis),
        "",
        "Assessment Findings:",
        _safe_dump(assessment_details),
    ]

    if strengths:
        context_lines.extend([
            "",
            "Identified Strengths:",
            _safe_dump(strengths)
        ])

    if concerns:
        context_lines.extend([
            "",
            "Key Concerns:",
            _safe_dump(concerns)
        ])

    return "\n".join(context_lines)

```

**File:** backend/others/schema.sql (L1-2)
```sql
-- Database schema for ThrivePath authentication and user management
-- Updated for Supabase compatibility
```

**File:** backend/others/schema.sql (L5-15)
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('therapist', 'parent')),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**File:** backend/others/schema.sql (L18-31)
```sql
CREATE TABLE therapists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_therapist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**File:** backend/others/schema.sql (L34-48)
```sql
CREATE TABLE parents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255),
  address TEXT,
  emergency_contact VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_parent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**File:** backend/others/schema.sql (L59-70)
```sql
CREATE TABLE session_notes (
  notes_id BIGSERIAL PRIMARY KEY,
  therapist_id BIGINT NOT NULL,
  session_date DATE NOT NULL,  -- The date the session occurred
  note_content TEXT NOT NULL,
  note_title VARCHAR(255),  -- Optional: brief title/summary
  session_time TIME,  -- Optional: time of session
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_notes_therapist FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE
);
```

**File:** backend/others/schema.sql (L78-86)
```sql
CREATE TABLE ai_preferences (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL UNIQUE,
  ai_instructions TEXT NOT NULL,  -- Custom instructions for how AI should behave
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_ai_pref_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);
```

**File:** backend/students/students.py (L160-199)
```python
# ==================== STUDENT RETRIEVAL FUNCTIONS ====================
# Functions for fetching and querying student information

def get_all_students() -> List[Dict[str, Any]]:
    """
    Retrieve all students from the system
    
    Returns:
        List of student dictionaries in frontend format
    
    Usage:
        - Used for system-wide student overview and reporting
        - Powers administrative dashboards and student lists
        - Accessible by authenticated users for general student information
        - Includes therapist assignment information
    """
    try:
        client = get_supabase_client()
        
        # Query using standardized base query
        response = client.table('children').select(_get_student_base_query()).execute()
        
        handle_supabase_error(response)
        students = format_supabase_response(response)
        
        if not students:
            logger.info("No students found in the system")
            return []
        
        # Transform all students using helper function
        transformed_students = [
            _transform_student_data(student, include_therapist_name=True) 
            for student in students
        ]
        
        logger.info(f"Successfully fetched {len(transformed_students)} students")
        return transformed_students
        
    except Exception as e:
        _handle_student_query_error("fetch", "all students", e)
```
