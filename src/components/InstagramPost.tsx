'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InstagramPostProps {
  id: string;
  username: string;
  userAvatar?: string;
  postImage?: string; // Made optional since we'll use shortCode instead
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  aiSummary?: string;
  aiAnalysis?: string;
  shortCode?: string; // Instagram post shortCode for linking
}

export function InstagramPost({
  username,
  userAvatar,
  postImage,
  caption,
  likes,
  comments,
  timestamp,
  isLiked = false,
  isSaved = false,
  aiSummary,
  aiAnalysis,
  shortCode,
}: InstagramPostProps) {
  const [showPostDetails, setShowPostDetails] = useState(false);

  // Construct Instagram URL from shortCode
  const instagramUrl = shortCode
    ? `https://www.instagram.com/p/${shortCode}/`
    : null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm mb-4">
      {/* AI ESSENCE - PRIMARY (Always Visible) */}
      {aiSummary && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-purple-900 dark:text-purple-100">AI Essence</h3>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {aiSummary}
          </p>

          {/* Post metadata preview */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {comments}
            </span>
            <span>•</span>
            <span>@{username}</span>
            <span>•</span>
            <span>{timestamp}</span>
          </div>
        </div>
      )}

      {/* POST DETAILS - SECONDARY (Collapsible) */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPostDetails(!showPostDetails)}
          className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <ImageIcon className="w-4 h-4" />
            <span>View Original Post</span>
          </div>
          {showPostDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showPostDetails && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userAvatar} alt={username} />
                  <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{username}</span>
              </div>
            </div>

            {/* Post Details */}
            <div className="p-4 space-y-3">
              {/* Likes */}
              <div className="font-semibold text-sm">
                {likes.toLocaleString()} likes
              </div>

              {/* Caption */}
              <div className="text-sm">
                <span className="font-semibold mr-2">{username}</span>
                <span className="text-gray-700 dark:text-gray-300">{caption}</span>
              </div>

              {/* Comments Count */}
              {comments > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {comments} comments
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                {timestamp}
              </div>

              {/* View on Instagram Button */}
              {instagramUrl && (
                <Button
                  asChild
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Instagram</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
