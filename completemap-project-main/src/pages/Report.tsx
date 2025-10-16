import { Mail, AlertCircle, Loader2, Mail as GmailIcon, Send as OutlookIcon, Inbox as YahooIcon, Shield as ProtonIcon, Cloud as ICloudIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ResultsCard } from "@/components/ResultsCard";

const providerIcons: Record<string, React.ReactNode> = {
  gmail: <GmailIcon className="h-6 w-6" />,
  outlook: <OutlookIcon className="h-6 w-6" />,
  yahoo: <YahooIcon className="h-6 w-6" />,
  protonmail: <ProtonIcon className="h-6 w-6" />,
  icloud: <ICloudIcon className="h-6 w-6" />,
};

export default function Report() {
  const { testCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (testCode) {
      fetchReport();
    }
  }, [testCode]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch test session
      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('test_code', testCode)
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) {
        setError("Report not found");
        return;
      }

      setSession(sessionData);

      // Fetch test results
      const { data: resultsData, error: resultsError } = await supabase
        .from('test_results')
        .select('*')
        .eq('test_session_id', sessionData.id)
        .order('provider');

      if (resultsError) throw resultsError;
      setResults(resultsData || []);

    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Report Not Found</h1>
          <p className="text-muted-foreground">
            {error || "This test report doesn't exist or has been deleted."}
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Mail className="h-4 w-4" />
            Start New Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Email Deliverability Report</h1>
            <p className="text-muted-foreground">
              Test Code: <span className="font-mono font-semibold">{testCode}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(session.created_at).toLocaleString()}
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            New Test
          </Button>
        </div>

        {session.status === 'pending' && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-center text-blue-900 dark:text-blue-100 font-medium">
              Waiting for email to be sent. Start the test to begin analysis.
            </p>
          </div>
        )}

        {session.status === 'checking' && (
          <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-900 dark:text-yellow-100" />
              <p className="text-yellow-900 dark:text-yellow-100 font-medium">
                Checking inboxes... This may take a few minutes.
              </p>
            </div>
          </div>
        )}

        <ResultsCard
          testCode={testCode!}
          results={results}
          deliverabilityScore={session.deliverability_score || 0}
          providerIcons={providerIcons}
        />
      </div>
    </div>
  );
}
