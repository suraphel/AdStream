import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';

interface NSFWResult {
  isNSFW: boolean;
  confidence: number;
  predictions: {
    className: string;
    probability: number;
  }[];
}

interface NSFWModerationProps {
  imageUrl: string;
  onModerationComplete: (result: NSFWResult) => void;
  autoModerate?: boolean;
}

export function NSFWModerationService({ imageUrl, onModerationComplete, autoModerate = false }: NSFWModerationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NSFWResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock NSFW detection service (in production, replace with actual NSFWJS or similar)
  const moderateImage = async (imageUrl: string): Promise<NSFWResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock predictions - in production, use actual NSFW detection
    const mockPredictions = [
      { className: 'Neutral', probability: 0.85 },
      { className: 'Drawing', probability: 0.10 },
      { className: 'Sexy', probability: 0.03 },
      { className: 'Porn', probability: 0.01 },
      { className: 'Hentai', probability: 0.01 }
    ];
    
    const nsfwThreshold = 0.6;
    const nsfwScore = mockPredictions
      .filter(p => ['Sexy', 'Porn', 'Hentai'].includes(p.className))
      .reduce((sum, p) => sum + p.probability, 0);
    
    return {
      isNSFW: nsfwScore > nsfwThreshold,
      confidence: Math.max(...mockPredictions.map(p => p.probability)),
      predictions: mockPredictions
    };
  };

  const handleModeration = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const moderationResult = await moderateImage(imageUrl);
      setResult(moderationResult);
      onModerationComplete(moderationResult);
    } catch (err) {
      setError('Failed to moderate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoModerate && imageUrl) {
      handleModeration();
    }
  }, [autoModerate, imageUrl]);

  const getStatusColor = () => {
    if (!result) return 'gray';
    return result.isNSFW ? 'red' : 'green';
  };

  const getStatusIcon = () => {
    if (isLoading) return <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;
    if (!result) return <Shield className="h-4 w-4" />;
    return result.isNSFW ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Image Preview */}
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Content to moderate" 
            className="w-full h-32 object-cover rounded-lg"
          />
          {result?.isNSFW && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Badge variant="destructive" className="text-white">
                NSFW Content Detected
              </Badge>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`text-${getStatusColor()}-600`}>
              {getStatusIcon()}
            </div>
            <span className="font-medium">
              {isLoading ? 'Analyzing...' : 
               result ? (result.isNSFW ? 'Inappropriate Content' : 'Content Approved') : 
               'Ready to Analyze'}
            </span>
          </div>
          
          {result && (
            <Badge variant={result.isNSFW ? 'destructive' : 'default'}>
              {(result.confidence * 100).toFixed(1)}% confidence
            </Badge>
          )}
        </div>

        {/* Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing image content...</span>
              <span>Processing</span>
            </div>
            <Progress value={65} className="w-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Details */}
        {result && (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>

            {showDetails && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Detection Results:</h4>
                {result.predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{prediction.className}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={prediction.probability * 100} 
                        className="w-20 h-2"
                      />
                      <span className="w-12 text-right">
                        {(prediction.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleModeration}
            disabled={isLoading || !imageUrl}
            className="flex-1"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Content'}
          </Button>
          
          {result?.isNSFW && (
            <Button variant="destructive" size="sm">
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          )}
        </div>

        {/* Warning */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This service helps maintain community standards by detecting inappropriate content. 
            Results are advisory and subject to human review.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Hook for using NSFW moderation in forms
export function useNSFWModeration() {
  const [results, setResults] = useState<Map<string, NSFWResult>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const moderateImages = async (imageUrls: string[]) => {
    setIsProcessing(true);
    const newResults = new Map(results);
    
    for (const url of imageUrls) {
      try {
        // Mock moderation - replace with actual service
        await new Promise(resolve => setTimeout(resolve, 500));
        const result: NSFWResult = {
          isNSFW: Math.random() > 0.9, // 10% chance of NSFW for demo
          confidence: 0.85 + Math.random() * 0.15,
          predictions: [
            { className: 'Neutral', probability: 0.85 },
            { className: 'Drawing', probability: 0.10 },
            { className: 'Sexy', probability: 0.03 },
            { className: 'Porn', probability: 0.01 },
            { className: 'Hentai', probability: 0.01 }
          ]
        };
        newResults.set(url, result);
      } catch (error) {
        console.error(`Failed to moderate image: ${url}`, error);
      }
    }
    
    setResults(newResults);
    setIsProcessing(false);
    return newResults;
  };

  const getResult = (imageUrl: string) => results.get(imageUrl);
  const hasNSFWContent = () => Array.from(results.values()).some(r => r.isNSFW);
  
  return {
    moderateImages,
    getResult,
    hasNSFWContent,
    isProcessing,
    results: Array.from(results.entries())
  };
}