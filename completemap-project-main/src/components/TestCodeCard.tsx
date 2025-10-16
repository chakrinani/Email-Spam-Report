import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TestCodeCardProps {
  testCode: string;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const TestCodeCard = ({ testCode, onRegenerate, isGenerating }: TestCodeCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testCode);
    setCopied(true);
    toast.success("Test code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Your Test Code</h3>
        <div className="bg-background rounded-lg p-6 border-2 border-primary/30">
          <p className="text-3xl font-bold font-mono text-primary tracking-wider">
            {testCode}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Include this code in your email subject or body
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleCopy}
            variant="default"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="outline"
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            New Code
          </Button>
        </div>
      </div>
    </Card>
  );
};
