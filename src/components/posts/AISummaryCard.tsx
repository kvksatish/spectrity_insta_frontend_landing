"use client";

import { Sparkles, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/api/posts";

interface AISummaryCardProps {
  post: Post;
}

export function AISummaryCard({ post }: AISummaryCardProps) {
  if (!post.has_summary || !post.combined_summary) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">AI Summary</h3>
            <p className="text-xs text-muted-foreground">
              Generated insights
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {post.summary_status}
        </Badge>
      </div>

      {/* Combined Summary */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.combined_summary}
        </p>
      </div>

      {/* Visual Analysis (if available) */}
      {post.ai_visual_analysis && (
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Visual Analysis</h4>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {post.ai_visual_analysis}
            </p>
          </div>
        </div>
      )}

      {/* Post Metadata */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>@{post.owner_username}</span>
          <span>•</span>
          <span>{post.post_type}</span>
          <span>•</span>
          <span>{new Date(post.timestamp).toLocaleDateString()}</span>
          {post.like_count > 0 && (
            <>
              <span>•</span>
              <span>{post.like_count.toLocaleString()} likes</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
