"use client";

/**
 * Share Target Handler
 * Receives shared links from Instagram and other apps via Web Share Target API
 * Supported Instagram URL formats:
 * - https://www.instagram.com/p/POST_ID/
 * - https://www.instagram.com/reel/REEL_ID/
 * - https://www.instagram.com/reels/REEL_ID/
 * - https://www.instagram.com/tv/TV_ID/
 * - https://instagram.com/p/POST_ID/
 * - https://instagr.am/p/POST_ID/
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Instagram, CheckCircle2, AlertCircle } from "lucide-react";
import {
  parseInstagramUrl,
  getContentTypeLabel,
  type ParsedInstagramLink
} from "@/utils/instagramLinks";

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [parsedLink, setParsedLink] = useState<ParsedInstagramLink | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

        // Parse the Instagram URL
        const parsed = parseInstagramUrl(instagramUrl);

        if (!parsed.isValid) {
          throw new Error("Invalid Instagram link format");
        }

        setParsedLink(parsed);
        setStatus("success");

        console.log("[SHARE] Successfully parsed Instagram link:", parsed);

        // TODO: Send to backend for processing
        // For now, redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard?instagram_link=${encodeURIComponent(parsed.url)}&type=${parsed.type}&id=${parsed.id}`);
        }, 2000);
      } catch (error: any) {
        console.error("[SHARE] Error processing shared content:", error);
        setErrorMessage(error.message || "Failed to process Instagram link");
        setStatus("error");
      }
    };

    processSharedContent();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Instagram className="h-16 w-16 text-pink-600 dark:text-pink-400" />
            {status === "processing" && (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-8 w-8 text-green-600 absolute -bottom-2 -right-2" />
            )}
            {status === "error" && (
              <AlertCircle className="h-8 w-8 text-red-600 absolute -bottom-2 -right-2" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {status === "processing" && "Processing Instagram Link..."}
              {status === "success" && "Link Received!"}
              {status === "error" && "Oops! Something went wrong"}
            </h1>

            <p className="text-muted-foreground text-sm">
              {status === "processing" && "Please wait while we process your shared content"}
              {status === "success" && "We've successfully captured your Instagram link"}
              {status === "error" && errorMessage}
            </p>
          </div>

          {parsedLink && parsedLink.isValid && (
            <div className="w-full space-y-2 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{parsedLink.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{parsedLink.id}</span>
              </div>
              <div className="text-xs text-muted-foreground break-all">
                {parsedLink.url}
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full">
            {status === "success" && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            )}
            {status === "error" && (
              <>
                <Button
                  onClick={() => router.push("/dashboard")}
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
              </>
            )}
          </div>
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
