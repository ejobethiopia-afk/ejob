import { createActionClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import MessageButton from '@/components/applicant/MessageButton'; // Import the client component
import { unstable_noStore as noStore } from 'next/cache'; // Import to prevent data caching
// 🛑 IMPORT THE NEW WRAPPER ACTION
import { messageApplicantAction } from '@/lib/actions';

// Define the Props type for the component
interface ApplicationPageProps {
  params: {
    applicationId: string;
  };
}

/**
 * Helper function to fetch application-related data.
 */
async function getApplicationData(applicationId: string) {
  // Use noStore() to force dynamic rendering and prevent stale data from the server cache
  noStore();

  const supabase = await createActionClient();

  // 1. Authentication Check
  const { data: { user: employer }, error: authError } = await supabase.auth.getUser();
  if (authError || !employer) {
    redirect('/auth/signin');
  }

  // 2. Fetch Application Details
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (appError || !application) {
    if (appError) {
      console.error('Failed to fetch application:', appError.message);
    }
    return { notFound: true };
  }

  // 3. Fetch Related Job and Applicant Data in Parallel
  const [jobResponse, applicantResponse] = await Promise.all([
    supabase
      .from('jobs')
      .select('title, company_name')
      .eq('id', application.job_id)
      .maybeSingle(),
    supabase
      .from('app_users')
      .select('full_name, email')
      .eq('id', application.applicant_id)
      .maybeSingle(),
  ]);

  // 4. Mark Notification as Read (Non-blocking)
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', employer.id)
    .eq('link_url', `/dashboard/applications/${applicationId}`);

  return {
    application,
    job: jobResponse.data,
    applicant: applicantResponse.data,
  };
}

// Main Server Component
export default async function ApplicationDetailPage({ params }: ApplicationPageProps) {

  let applicationId: string;

  try {
    const resolvedParams = await Promise.resolve(params);
    applicationId = resolvedParams.applicationId;

  } catch (e) {
    return notFound();
  }

  if (!applicationId) {
    return notFound();
  }

  try {
    const data = await getApplicationData(applicationId);

    if (data.notFound) {
      return notFound();
    }

    const { application, job, applicant } = data;
    // Define applicantName for the client component prop
    const applicantName = applicant?.full_name || 'Job Seeker';
    // 🛑 Get the ID to pass as a simple prop to the client component
    const applicantId = application.applicant_id;


    // Render the Application Details
    return (
      // Dark Mode Fix: Main container background
      <div className="container mx-auto max-w-4xl p-6 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-extrabold mb-2 dark:text-white">
          Application for {job?.title || 'Job Listing'}
        </h1>
        <h2 className="text-xl text-gray-600 mb-6 dark:text-gray-400">
          {job?.company_name || 'Unknown Company'}
        </h2>

        {/* Messaging Section (Client Component Host) */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 flex justify-between items-center border-l-4 border-indigo-500">
          <div>
            <h3 className="text-2xl font-semibold mb-1 dark:text-white">Contact Applicant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Initiate a direct chat or send a follow-up message to the job seeker.
            </p>
          </div>
          {/* 🛑 FIX: Pass the action directly and the ID as a standard prop */}
          <MessageButton
            applicantName={applicantName}
            // Pass the exported Server Action (messageApplicantAction) directly
            actionToRun={messageApplicantAction}
            // Pass the dynamic ID as a standard prop to be used in the form
            applicantId={applicantId}
          />
        </div>


        {/* Applicant Details Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 dark:text-white dark:border-gray-700">Applicant Details</h3>
          <p className="mb-2 dark:text-gray-300">
            <span className="font-medium dark:text-white">Name:</span> {applicant?.full_name || 'N/A (Profile Missing)'}
          </p>
          <p className="mb-2 dark:text-gray-300">
            <span className="font-medium dark:text-white">Email:</span> {applicant?.email || 'N/A (Profile Missing)'}
          </p>
          <p className="mb-2 dark:text-gray-300">
            <span className="font-medium dark:text-white">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${application.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
              {application.status}
            </span>
          </p>
          <p className="mb-2 dark:text-gray-300">
            <span className="font-medium dark:text-white">Applied On:</span> {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Cover Letter Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 dark:text-white dark:border-gray-700">Cover Letter</h3>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {application.cover_letter_content || 'The applicant did not provide a cover letter with this application.'}
          </p>
        </div>

        {/* CV/Resume Section */}
        {application.cv_url && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-4 border-b pb-2 dark:text-white dark:border-gray-700">CV/Resume</h3>
            <a
              href={application.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-150 ease-in-out flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2z"></path></svg>
              Download Applicant Resume/CV
            </a>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Final Error in ApplicationDetailPage:', error);
    return notFound();
  }
}