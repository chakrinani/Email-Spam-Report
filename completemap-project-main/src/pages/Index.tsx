import { Mail, History, Loader2, Mail as GmailIcon, Send as OutlookIcon, Inbox as YahooIcon, Shield as ProtonIcon, Cloud as ICloudIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TestInbox } from "@/components/TestInbox";
import { TestCodeCard } from "@/components/TestCodeCard";
import { InstructionsCard } from "@/components/InstructionsCard";
import { ResultsCard } from "@/components/ResultsCard";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const testInboxes = [
  { email: "spamtest.gmail@gmail.com", provider: "Gmail", icon: <GmailIcon className="h-6 w-6" />, key: 'gmail' },
  { email: "spamtest.outlook@outlook.com", provider: "Outlook", icon: <OutlookIcon className="h-6 w-6" />, key: 'outlook' },
  { email: "spamtest.yahoo@yahoo.com", provider: "Yahoo", icon: <YahooIcon className="h-6 w-6" />, key: 'yahoo' },
  { email: "spamtest.proton@proton.me", provider: "ProtonMail", icon: <ProtonIcon className="h-6 w-6" />, key: 'protonmail' },
  { email: "spamtest.icloud@icloud.com", provider: "iCloud", icon: <ICloudIcon className="h-6 w-6" />, key: 'icloud' },
];

const providerIcons: Record<string, React.ReactNode> = {
  gmail: <GmailIcon className="h-6 w-6" />,
  outlook: <OutlookIcon className="h-6 w-6" />,
  yahoo: <YahooIcon className="h-6 w-6" />,
  protonmail: <ProtonIcon className="h-6 w-6" />,
  icloud: <ICloudIcon className="h-6 w-6" />,
};

export default function Index() {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>('pending');
  const [deliverabilityScore, setDeliverabilityScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [recentTests, setRecentTests] = useState<any[]>([]);

  useEffect(() => {
    generateTestCode();
    loadRecentTests();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      const channel = supabase
        .channel(`test_session_${currentSessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'test_results',
            filter: `test_session_id=eq.${currentSessionId}`
          },
          () => {
            loadTestResults();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'test_sessions',
            filter: `id=eq.${currentSessionId}`
          },
          (payload) => {
            setSessionStatus(payload.new.status);
            setDeliverabilityScore(payload.new.deliverability_score || 0);
            if (payload.new.status === 'completed') {
              setIsChecking(false);
              toast.success("Test completed!");
              loadRecentTests();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentSessionId]);

  const generateTestCode = async () => {
    setIsGenerating(true);
    try {
      const code = `TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data: session, error: sessionError } = await supabase
        .from('test_sessions')
        .insert({
          test_code: code,
          status: 'pending'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const resultsToInsert = testInboxes.map(inbox => ({
        test_session_id: session.id,
        inbox_email: inbox.email,
        provider: inbox.key,
        status: 'pending'
      }));

      const { error: resultsError } = await supabase
        .from('test_results')
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;

      setTestCode(code);
      setCurrentSessionId(session.id);
      setTestResults([]);
      setSessionStatus('pending');
      setDeliverabilityScore(0);
      
    } catch (error: any) {
      console.error('Error generating test code:', error);
      toast.error("Failed to generate test code");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadTestResults = async () => {
    if (!currentSessionId) return;

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('test_session_id', currentSessionId)
        .order('provider');

      if (error) throw error;
      setTestResults(data || []);

      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .select('deliverability_score, status')
        .eq('id', currentSessionId)
        .single();

      if (sessionError) throw sessionError;
      if (sessionData) {
        setDeliverabilityScore(sessionData.deliverability_score || 0);
        setSessionStatus(sessionData.status);
      }
    } catch (error: any) {
      console.error('Error loading test results:', error);
    }
  };

  const startTest = async () => {
    if (!currentSessionId) return;

    setIsChecking(true);
    try {
      const { error } = await supabase
        .from('test_sessions')
        .update({ status: 'checking' })
        .eq('id', currentSessionId);

      if (error) throw error;

      const { error: invokeError } = await supabase.functions.invoke('check-email-status', {
        body: { testSessionId: currentSessionId, testCode }
      });

      if (invokeError) throw invokeError;

      toast.success("Test started! Checking inboxes...");
      
    } catch (error: any) {
      console.error('Error starting test:', error);
      toast.error("Failed to start test. Make sure you've sent the email first!");
      setIsChecking(false);
    }
  };

  const loadRecentTests = async () => {
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTests(data || []);
    } catch (error: any) {
      console.error('Error loading recent tests:', error);
    }
  };

  const showResults = sessionStatus === 'completed' || sessionStatus === 'checking';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-extrabold text-center text-teal-700 mb-4">
  Email Spam Report Tool
</h1>
<p className="text-gray-700 text-center text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
  Test your email deliverability across multiple providers and see where your emails land.
</p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <TestCodeCard
              testCode={testCode}
              onRegenerate={generateTestCode}
              isGenerating={isGenerating}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Test Inboxes</h2>
                {sessionStatus === 'pending' && (
                  <Button 
                    onClick={startTest} 
                    disabled={isChecking}
                    className="gap-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Start Test
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                {testInboxes.map((inbox) => {
                  const result = testResults.find(r => r.inbox_email === inbox.email);
                  return (
                    <TestInbox
                      key={inbox.email}
                      email={inbox.email}
                      provider={inbox.provider}
                      icon={inbox.icon}
                      status={result?.status}
                      folderLocation={result?.folder_location}
                    />
                  );
                })}
              </div>
            </div>

            {showResults && (
              <ResultsCard
                testCode={testCode}
                results={testResults}
                deliverabilityScore={deliverabilityScore}
                providerIcons={providerIcons}
              />
            )}
          </div>

          <div className="space-y-8">
            <InstructionsCard />
            
            {recentTests.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Tests
                </h3>
                <div className="space-y-3">
                  {recentTests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => navigate(`/report/${test.test_code}`)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono font-semibold text-sm">{test.test_code}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(test.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {test.deliverability_score !== null && (
                          <div className="text-right">
                            <p className="font-bold text-primary">{test.deliverability_score}%</p>
                            <p className="text-xs text-muted-foreground">{test.status}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
