import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface ImageModerationWarningProps {
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reason?: string;
  className?: string;
}

export default function ImageModerationWarning({ status, reason, className }: ImageModerationWarningProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Image Under Review',
          description: 'Your image is being reviewed for content compliance. This usually takes a few minutes.',
          variant: 'default' as const,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-500'
        };
      case 'approved':
        return {
          icon: Shield,
          title: 'Image Approved',
          description: 'Your image has been approved and is now visible to all users.',
          variant: 'default' as const,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-500'
        };
      case 'rejected':
        return {
          icon: AlertTriangle,
          title: 'Image Rejected',
          description: reason || 'Your image was rejected due to inappropriate content. Please upload a different image.',
          variant: 'destructive' as const,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-500'
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          title: 'Image Flagged for Review',
          description: reason || 'Your image has been flagged for manual review. Please wait for admin approval.',
          variant: 'default' as const,
          bgColor: 'bg-orange-50 border-orange-200',
          iconColor: 'text-orange-500'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Unknown Status',
          description: 'Image moderation status is unknown.',
          variant: 'default' as const,
          bgColor: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Alert className={`${config.bgColor} ${className}`} variant={config.variant}>
      <Icon className={`h-4 w-4 ${config.iconColor}`} />
      <AlertDescription>
        <div className="font-medium mb-1">{config.title}</div>
        <div className="text-sm">{config.description}</div>
      </AlertDescription>
    </Alert>
  );
}