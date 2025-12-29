import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <Card className="max-w-md w-full mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Chat Application</CardTitle>
          <CardDescription className="text-lg mt-4">
            Connect to chat with an AI assistant specialized in Roman history.
            Enter your nickname and start chatting!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild size="lg">
            <a href="/chat">Go to Chat</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
