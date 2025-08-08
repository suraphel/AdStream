import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordStrengthProps {
  password: string;
  onPasswordChange: (password: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

interface PasswordCriteria {
  id: string;
  label: string;
  test: (password: string) => boolean;
  suggestion: string;
}

const passwordCriteria: PasswordCriteria[] = [
  {
    id: 'length',
    label: 'At least 8 characters long',
    test: (password) => password.length >= 8,
    suggestion: 'Use at least 8 characters for better security'
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
    suggestion: 'Add at least one uppercase letter'
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
    suggestion: 'Add at least one lowercase letter'
  },
  {
    id: 'number',
    label: 'Contains number (0-9)',
    test: (password) => /\d/.test(password),
    suggestion: 'Add at least one number'
  },
  {
    id: 'special',
    label: 'Contains special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    suggestion: 'Add a special character like !@#$%^&*'
  }
];

const strengthLevels = [
  { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' },
  { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' }
];

export function PasswordStrengthInput({
  password,
  onPasswordChange,
  placeholder = "Enter password",
  className = "",
  showSuggestions = true
}: PasswordStrengthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [passedCriteria, setPassedCriteria] = useState<string[]>([]);

  useEffect(() => {
    const passed = passwordCriteria.filter(criteria => criteria.test(password));
    setPassedCriteria(passed.map(c => c.id));
    setStrength(passed.length);
  }, [password]);

  const strengthLevel = strengthLevels[Math.min(strength, strengthLevels.length - 1)];
  const strengthPercentage = (strength / passwordCriteria.length) * 100;

  const generatePassword = () => {
    const chars = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      special: '!@#$%^&*(),.?":{}|<>'
    };

    let password = '';
    
    // Ensure at least one character from each category
    password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
    password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
    password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
    password += chars.special[Math.floor(Math.random() * chars.special.length)];

    // Fill the rest randomly to make it 12 characters total
    const allChars = chars.lowercase + chars.uppercase + chars.numbers + chars.special;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    onPasswordChange(shuffled);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`pr-20 ${className}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-xs"
            onClick={generatePassword}
            title="Generate strong password"
          >
            🎲
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Password strength:</span>
            <span className={`text-sm font-medium ${strengthLevel.textColor}`}>
              {strengthLevel.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${strengthLevel.color} transition-all`} 
              style={{ width: `${strengthPercentage}%` }} 
            />
          </div>
        </div>
      )}

      {showSuggestions && password && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Password Requirements:</h4>
            <div className="space-y-2">
              {passwordCriteria.map((criteria) => {
                const isPassed = passedCriteria.includes(criteria.id);
                return (
                  <div key={criteria.id} className="flex items-center gap-2 text-sm">
                    {isPassed ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={isPassed ? 'text-green-700' : 'text-gray-600'}>
                      {criteria.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {strength < passwordCriteria.length && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-800 mb-1">💡 Tips:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {passwordCriteria
                    .filter(criteria => !passedCriteria.includes(criteria.id))
                    .slice(0, 2)
                    .map((criteria) => (
                      <li key={criteria.id}>• {criteria.suggestion}</li>
                    ))}
                  <li>• Try the dice button (🎲) to generate a strong password</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getPasswordStrength(password: string): number {
  const passed = passwordCriteria.filter(criteria => criteria.test(password));
  return passed.length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) >= 4; // At least 4 out of 5 criteria
}

export function getPasswordSuggestions(password: string): string[] {
  return passwordCriteria
    .filter(criteria => !criteria.test(password))
    .map(criteria => criteria.suggestion);
}