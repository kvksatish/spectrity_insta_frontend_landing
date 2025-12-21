'use client';

import { useState } from 'react';
import { Loader2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { scrapeInstagramPost } from '@/api/posts.api';

interface InstagramScraperProps {
  onPostScraped?: (postData: any) => void;
}

export function InstagramScraper({ onPostScraped }: InstagramScraperProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateInstagramUrl = (url: string): boolean => {
    const instagramPostPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+\/?/;
    return instagramPostPattern.test(url);
  };

  const handleScrape = async () => {
    setError(null);
    setErrorCode(null);
    setErrorStatusCode(null);
    setSuccess(null);

    // Validate URL
    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      setErrorCode('VALIDATION_ERROR');
      return;
    }

    if (!validateInstagramUrl(url)) {
      setError('Please enter a valid Instagram post or reel URL (e.g., https://www.instagram.com/p/ABC123/)');
      setErrorCode('VALIDATION_ERROR');
      return;
    }

    setLoading(true);

    try {
      const response = await scrapeInstagramPost(url);

      if (response.success) {
        setSuccess('Instagram post scraped successfully! ✨');
        setUrl(''); // Clear input

        // Call parent callback if provided
        if (onPostScraped && response.data) {
          onPostScraped(response.data);
        }
      } else {
        setError(response.error?.message || 'Failed to scrape Instagram post');
        setErrorCode(response.error?.code || 'UNKNOWN_ERROR');
        setErrorStatusCode(response.error?.statusCode || null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while scraping the post');
      setErrorCode('CLIENT_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleScrape();
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Scrape Instagram Post
        </CardTitle>
        <CardDescription>
          Enter an Instagram post or reel URL to extract insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="url"
              placeholder="https://www.instagram.com/p/ABC123/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              'Scrape'
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {errorCode && (
              <div className="space-y-1">
                <p className="text-xs font-mono text-red-500 dark:text-red-400">
                  Error Code: {errorCode}
                </p>
                {errorStatusCode && (
                  <p className="text-xs font-mono text-red-500 dark:text-red-400">
                    HTTP Status: {errorStatusCode}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>💡 Supported URLs:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Instagram posts: https://instagram.com/p/ABC123/</li>
            <li>Instagram reels: https://instagram.com/reel/ABC123/</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
