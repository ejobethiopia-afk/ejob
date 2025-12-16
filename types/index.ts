export interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary: string;       // Textual representation (e.g., "30k - 50k")
    salary_min: number;   // Numeric value for filtering/sorting
    salary_max: number;
    type: string;
    description: string;
    category: string;
    views_count: number;
    created_at: string;
    employer_id?: string;
    experience_level?: string;
    required_skills?: string;
    application_deadline?: string; // ISO Date string
}

export interface NewJob {
    title: string;
    company_name: string;
    location: string;
    salary: string;
    salary_min: number;
    salary_max: number;
    category: string;
    type: string;
    description: string;
    employer_id: string;
    experience_level?: string;
    required_skills?: string;
    application_deadline?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Application {
    id: string;
    job_id: string;
    applicant_id: string;
    status: 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'hired';
    created_at: string;
    profiles?: Profile; // Joined data
}

export type UserRole = 'job_seeker' | 'employer';

export interface AppUser {
    id: string; // references auth.users
    role: UserRole;
    created_at: string;
}

export interface JobSeekerProfile {
    user_id: string; // references app_users.id
    // Names are stored on `app_users.full_name` to avoid duplication
    bio?: string;
    location?: string;
    resume_url?: string;
    // education and experience stored as JSON arrays of objects
    education?: EducationEntry[] | null;
    experience?: ExperienceEntry[] | null;
    skills?: string; // Comma-separated list
    phone_number?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
}

export interface EducationEntry {
    institution?: string;
    field_of_study?: string;
    graduation_date?: string; // YYYY-MM-DD
}

export interface ExperienceEntry {
    company?: string;
    start_date?: string;
    end_date?: string | null; // YYYY-MM-DD or 'Present'
    currently?: boolean;
}

export interface EmployerProfile {
    user_id: string; // references app_users.id
    company_name: string;
    company_logo?: string;
    company_website?: string;
    company_description?: string;
    location?: string;
}
