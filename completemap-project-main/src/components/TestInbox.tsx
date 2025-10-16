import { Mail, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface TestInboxProps {
  email: string;
  provider: string;
  icon: React.ReactNode;
  status?: 'pending' | 'checking' | 'received' | 'not_received' | 'error';
  folderLocation?: 'inbox' | 'spam' | 'promotions' | 'unknown';
}

export const TestInbox = ({ email, provider, icon, status, folderLocation }: TestInboxProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (!status || status === 'pending') return 'text-muted-foreground';
    if (status === 'checking') return 'text-blue-500';
    if (status === 'received') {
      if (folderLocation === 'inbox') return 'text-green-600';
      if (folderLocation === 'spam') return 'text-red-600';
      if (folderLocation === 'promotions') return 'text-yellow-600';
    }
    if (status === 'not_received') return 'text-gray-500';
    if (status === 'error') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getStatusText = () => {
    if (!status || status === 'pending') return 'Waiting for test';
    if (status === 'checking') return 'Checking...';
    if (status === 'received') {
      if (folderLocation === 'inbox') return '✓ Inbox';
      if (folderLocation === 'spam') return '✗ Spam';
      if (folderLocation === 'promotions') return '⚠ Promotions';
      return '✓ Received';
    }
    if (status === 'not_received') return 'Not received';
    if (status === 'error') return 'Error';
    return '';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="text-primary mt-1 flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{provider}</h3>
            <p className="text-sm text-muted-foreground truncate font-mono">
              {email}
            </p>
            {status && status !== 'pending' && (
              <p className={`text-sm font-medium mt-2 ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
};
