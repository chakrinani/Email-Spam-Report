import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, TrendingUp } from "lucide-react";
import { TestInbox } from "./TestInbox";
import { toast } from "sonner";

interface TestResult {
  inbox_email: string;
  provider: string;
  status: 'pending' | 'checking' | 'received' | 'not_received' | 'error';
  folder_location?: 'inbox' | 'spam' | 'promotions' | 'unknown';
}

interface ResultsCardProps {
  testCode: string;
  results: TestResult[];
  deliverabilityScore: number;
  providerIcons: Record<string, React.ReactNode>;
}

export const ResultsCard = ({ testCode, results, deliverabilityScore, providerIcons }: ResultsCardProps) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/report/${testCode}`;
    await navigator.clipboard.writeText(url);
    toast.success("Report link copied to clipboard!");
  };

  const getScoreColor = () => {
    if (deliverabilityScore >= 80) return 'text-green-600';
    if (deliverabilityScore >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (deliverabilityScore >= 80) return 'Excellent';
    if (deliverabilityScore >= 50) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-4 border-primary/20">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deliverability Score</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${getScoreColor()}`}>
                  {deliverabilityScore}%
                </p>
                <span className={`text-lg font-semibold ${getScoreColor()}`}>
                  {getScoreLabel()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Report
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-xl font-semibold">Inbox Results</h3>
        {results.map((result) => (
          <TestInbox
            key={result.inbox_email}
            email={result.inbox_email}
            provider={result.provider.charAt(0).toUpperCase() + result.provider.slice(1)}
            icon={providerIcons[result.provider]}
            status={result.status}
            folderLocation={result.folder_location}
          />
        ))}
      </div>
    </div>
  );
};
