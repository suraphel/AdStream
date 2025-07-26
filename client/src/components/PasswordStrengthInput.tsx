import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showStrengthMeter?: boolean;
  showRequirements?: boolean;
  showGenerator?: boolean;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export default function PasswordStrengthInput({
  value,
  onChange,
  placeholder = 'Enter password',
  className,
  showStrengthMeter = true,
  showRequirements = true,
  showGenerator = true,
}: PasswordStrengthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');

  useEffect(() => {
    calculateStrength(value);
  }, [value]);

  const calculateStrength = (password: string) => {
    if (!password) {
      setStrength(0);
      setStrengthLabel('');
      return;
    }

    const passedRequirements = passwordRequirements.filter(req => req.test(password));
    const strengthValue = passedRequirements.length;
    setStrength(strengthValue);

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    setStrengthLabel(labels[Math.min(strengthValue - 1, 4)] || 'Very Weak');
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = lowercase + uppercase + numbers + specialChars;
    
    // Ensure at least one character from each category
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill remaining characters
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    onChange(shuffled);
  };

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthTextColor = () => {
    if (strength <= 1) return 'text-red-600';
    if (strength <= 2) return 'text-orange-600';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('pr-20', className)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {showGenerator && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generatePassword}
              className="h-6 w-6 p-0 hover:bg-gray-100"
              title="Generate strong password"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {showStrengthMeter && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Password strength:</span>
            <span className={cn('font-medium', getStrengthTextColor())}>
              {strengthLabel}
            </span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getStrengthColor())}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Password must contain:</p>
          <div className="grid grid-cols-1 gap-1">
            {passwordRequirements.map((requirement) => {
              const passed = requirement.test(value);
              return (
                <div
                  key={requirement.id}
                  className={cn(
                    'flex items-center space-x-2 text-xs',
                    passed ? 'text-green-600' : 'text-gray-500'
                  )}
                >
                  {passed ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  <span>{requirement.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}