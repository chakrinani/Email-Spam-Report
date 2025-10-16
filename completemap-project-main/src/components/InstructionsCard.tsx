import { Card } from "@/components/ui/card";
import { Mail, Send, Clock, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Copy Test Inboxes",
    description: "Copy all 5 test inbox email addresses above",
  },
  {
    icon: <Send className="h-5 w-5" />,
    title: "Send Your Email",
    description:
      "From your email account, send to all test inboxes. Include your test code in the subject or body",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Wait for Analysis",
    description:
      "Our system will check where your email landed (usually takes 2-5 minutes)",
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "View Results",
    description:
      "Get a detailed report showing inbox placement and deliverability score",
  },
];

export const InstructionsCard = () => {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">How It Works</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {step.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                {index + 1}. {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
