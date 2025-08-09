import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";

interface LoginPromptProps {
  title?: string;
  message?: string;
  onLogin?: () => void;
  onRegister?: () => void;
  className?: string;
}

export function LoginPrompt({ 
  title = "Sign in Required",
  message = "Please sign in to access this feature",
  onLogin = () => window.location.href = '/api/login',
  onRegister = () => window.location.href = '/api/login',
  className = ""
}: LoginPromptProps) {
  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="bg-gray-100 p-3 rounded-full">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600 text-sm">{message}</p>
        
        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={onLogin}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onRegister}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Join thousands of users buying and selling on our marketplace
        </p>
      </CardContent>
    </Card>
  );
}