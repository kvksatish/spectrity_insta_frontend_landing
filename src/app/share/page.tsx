"use client";

/**
 * Share Target Handler
 * Receives shared links from Instagram and other apps via Web Share Target API
 * Scrapes the Instagram post and displays it
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Instagram, CheckCircle2, AlertCircle } from "lucide-react";
import { scrapeInstagramPost } from "@/api/posts.api";
import { InstagramPost } from "@/components/InstagramPost";

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [scrapedPost, setScrapedPost] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorCode, setErrorCode] = useState<string>("");
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>();

  useEffect(() => {
    const processSharedContent = async () => {
      try {
        // Get shared data from URL parameters
        const title = searchParams.get("title");
        const text = searchParams.get("text");
        const url = searchParams.get("url");

        console.log("[SHARE] Received shared content:", { title, text, url });

        // Instagram URLs can come in different forms
        const instagramUrl = url || text || "";

        if (!instagramUrl) {
          throw new Error("No Instagram link found in shared content");
        }

        console.log("[SHARE] Scraping Instagram post:", instagramUrl);
        setStatus("processing");

        // Call the backend API to scrape the post
        const response = await scrapeInstagramPost(instagramUrl);

        if (response.success && response.data) {
          const post = response.data;

          // Transform backend response to our post format
          const transformedPost = {
            id: post.id || post.shortCode,
            username: post.ownerUsername,
            userAvatar: post.ownerProfilePicUrl,
            postImage: post.mediaItems?.[0]?.url || post.displayUrl,
            caption: post.caption || '',
            likes: post.likeCount || 0,
            comments: post.commentsCount || 0,
            timestamp: 'Just now',
            isLiked: false,
            isSaved: false,
          };

          setScrapedPost(transformedPost);
          setStatus("success");
          console.log("[SHARE] Successfully scraped post:", transformedPost);
        } else {
          // Handle error response from API
          setErrorMessage(response.error?.message || "Failed to scrape post");
          setErrorCode(response.error?.code || "UNKNOWN_ERROR");
          setErrorStatusCode(response.error?.statusCode);
          setStatus("error");
        }
      } catch (error: any) {
        console.error("[SHARE] Error processing shared content:", error);
        setErrorMessage(error.message || "Failed to process Instagram link");
        setErrorCode("CLIENT_ERROR");
        setStatus("error");
      }
    };

    processSharedContent();
  }, [searchParams]);

  // Show the scraped post if successful
  if (status === "success" && scrapedPost) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-2xl mx-auto px-0 py-6">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h1 className="text-xl font-bold">Post Scraped Successfully!</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Instagram post has been extracted
            </p>
          </div>

          <InstagramPost {...scrapedPost} />

          <div className="px-4 mt-6 flex gap-2">
            <Button
              onClick={() => router.push("/essence")}
              className="flex-1"
            >
              Go to Essence
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              Share Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading or error state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Instagram className="h-16 w-16 text-pink-600 dark:text-pink-400" />
            {status === "processing" && (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
            )}
            {status === "error" && (
              <AlertCircle className="h-8 w-8 text-red-600 absolute -bottom-2 -right-2" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {status === "processing" && "Scraping Instagram Post..."}
              {status === "error" && "Oops! Something went wrong"}
            </h1>

            <p className="text-muted-foreground text-sm">
              {status === "processing" && "Please wait while we extract the post data"}
              {status === "error" && errorMessage}
            </p>

            {status === "error" && errorCode && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  Error Code: {errorCode}
                </p>
                {errorStatusCode && (
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 mt-1">
                    Status: {errorStatusCode}
                  </p>
                )}
              </div>
            )}
          </div>

          {status === "error" && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => router.push("/essence")}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Instagram className="h-16 w-16 text-pink-600 dark:text-pink-400 animate-pulse" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
