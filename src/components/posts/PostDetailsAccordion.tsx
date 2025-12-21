"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Heart, MessageCircle, Eye, ExternalLink, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/api/posts";

interface PostDetailsAccordionProps {
  post: Post;
}

export function PostDetailsAccordion({ post }: PostDetailsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-border/40">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {post.owner_username[0].toUpperCase()}
            </span>
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">{post.owner_full_name}</p>
            <p className="text-xs text-muted-foreground">@{post.owner_username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {post.post_type}
          </Badge>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-border/40">
          {/* Media Gallery */}
          {post.media_items && post.media_items.length > 0 && (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {post.media_items.map((media, index) => (
                  <div
                    key={index}
                    className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted"
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.url}
                        alt={post.alt_text || `Post image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized // Since using CDN URLs
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <p className="text-sm text-muted-foreground">Video content</p>
                      </div>
                    )}
                    {post.media_items.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1} / {post.media_items.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="px-4 pb-4">
              <h4 className="font-semibold text-sm mb-2">Caption</h4>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </p>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                  <p className="font-semibold text-sm">
                    {post.like_count.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Comments</p>
                  <p className="font-semibold text-sm">
                    {post.comments_count.toLocaleString()}
                  </p>
                </div>
              </div>
              {post.video_view_count !== null && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-semibold text-sm">
                      {post.video_view_count.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Metadata */}
          <div className="px-4 pb-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Posted: {new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Quality: {post.scrape_quality}
              </Badge>
              {post.is_sponsored && (
                <Badge variant="outline" className="text-xs">
                  Sponsored
                </Badge>
              )}
              {post.summary_status === "COMPLETED" && (
                <Badge variant="default" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                  AI Analyzed
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <a
                href={post.input_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Instagram
              </a>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
