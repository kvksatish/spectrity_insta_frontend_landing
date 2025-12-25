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
import { tokenStorage } from "@/utils/tokenStorage";

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "acknowledged" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorCode, setErrorCode] = useState<string>("");
  const [errorStatusCode, setErrorStatusCode] = useState<number | undefined>();
  const [instagramUrl, setInstagramUrl] = useState<string>("");

  useEffect(() => {
    const validateInstagramUrl = (url: string): boolean => {
      const instagramPostPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+\/?/;
      return instagramPostPattern.test(url);
    };

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

        // Validate Instagram URL before making API call
        if (!validateInstagramUrl(instagramUrl)) {
          throw new Error("Invalid Instagram URL. Please share a valid Instagram post or reel link.");
        }

        // Check if user is authenticated
        const accessToken = tokenStorage.getAccessToken();
        if (!accessToken) {
          console.log("[SHARE] User not authenticated, redirecting to login");
          // Store the shared URL to process after login
          sessionStorage.setItem("pendingShareUrl", instagramUrl);
          router.push(`/login?redirect=/share&url=${encodeURIComponent(instagramUrl)}`);
          return;
        }

        console.log("[SHARE] Scraping Instagram post:", instagramUrl);
        setStatus("processing");
        setInstagramUrl(instagramUrl);

        // Call the backend API to scrape the post
        const response = await scrapeInstagramPost(instagramUrl);

        if (response.success) {
          // API acknowledged the scrape request
          console.log("[SHARE] Scrape request acknowledged");
          setStatus("acknowledged");

          // Wait 2 seconds with animation, then navigate to essence
          setTimeout(() => {
            router.push("/spectrity/essence");
          }, 2000);
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

  // Show success animation after API acknowledgment
  if (status === "acknowledged") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 animate-gradient">
        <Card className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-6">
            {/* Success Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75" />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-6">
                <CheckCircle2 className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Post Added! ✨
              </h1>

              <p className="text-muted-foreground">
                Your Instagram post is being processed
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to Essence feed...
              </p>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 animate-progress" style={{animation: "progress 2s ease-in-out"}} />
            </div>
          </div>
        </Card>

        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
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
              {status === "processing" && "Processing Your Share..."}
              {status === "error" && "Oops! Something went wrong"}
            </h1>

            <p className="text-muted-foreground text-sm">
              {status === "processing" && "Extracting Instagram post details"}
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
