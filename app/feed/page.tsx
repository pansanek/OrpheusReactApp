"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  posts as initialPosts,
  getMusicianById,
  type Post,
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  Share2,
  ImageIcon,
  Video,
  Music as MusicIcon,
  MoreHorizontal,
  X,
  Send,
  Film,
  FileAudio,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Extend Post type locally with media
type PostWithMedia = Post & {
  media?: { type: "image" | "video" | "audio"; url: string; name?: string }[];
};

export default function FeedPage() {
  const { currentUser } = useAuth();
  const [feedPosts, setFeedPosts] = useState<PostWithMedia[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<
    { type: "image" | "video" | "audio"; url: string; name: string }[]
  >([]);
  const { allUsers } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor(diff / 36e5);
    const minutes = Math.floor(diff / 6e4);
    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return "Только что";
  };

  const handleMediaAttach = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "image" | "video" | "audio",
    ) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        setAttachedMedia((prev) => [...prev, { type, url, name: file.name }]);
      });
      e.target.value = "";
    },
    [],
  );

  const removeAttachment = (idx: number) => {
    setAttachedMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = () => {
    if (!currentUser || (!newPostContent.trim() && attachedMedia.length === 0))
      return;
    const newPost: PostWithMedia = {
      id: Date.now(),
      authorId: currentUser.id,
      content: newPostContent.trim(),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
      groupId: null,
      media: attachedMedia.length > 0 ? [...attachedMedia] : undefined,
    };
    setFeedPosts((prev) => [newPost, ...prev]);
    setNewPostContent("");
    setAttachedMedia([]);
  };

  // Per-post component
  const PostCard = ({ post }: { post: PostWithMedia }) => {
    const author = getMusicianById(post.authorId);
    const [isLiked, setIsLiked] = useState(
      currentUser ? post.likes.includes(currentUser.id) : false,
    );
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.comments);
    const [commentText, setCommentText] = useState("");

    if (!author) return null;

    const handleLike = () => {
      if (!currentUser) return;
      setIsLiked((v) => !v);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    };

    const handleComment = () => {
      if (!currentUser || !commentText.trim()) return;
      const newComment = {
        id: Date.now(),
        userId: currentUser.id,
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${author.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      allUsers.find((u) => u.id === author.id)?.avatar ??
                      undefined
                    }
                    alt={author.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(author.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/profile/${author.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {author.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.timestamp)}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Сохранить</DropdownMenuItem>
                <DropdownMenuItem>Скопировать ссылку</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Пожаловаться
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {post.content && (
            <p className="text-foreground whitespace-pre-wrap mb-4">
              {post.content}
            </p>
          )}

          {/* Attached media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.media.map((m, idx) => {
                if (m.type === "image") {
                  return (
                    <img
                      key={idx}
                      src={m.url}
                      alt="Вложение"
                      className="rounded-lg max-h-96 w-full object-cover border border-border"
                    />
                  );
                }
                if (m.type === "video") {
                  return (
                    <video
                      key={idx}
                      src={m.url}
                      controls
                      className="rounded-lg max-h-72 w-full border border-border"
                    />
                  );
                }
                if (m.type === "audio") {
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border"
                    >
                      <FileAudio className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {m.name ?? "Аудиофайл"}
                        </p>
                        <audio
                          src={m.url}
                          controls
                          className="w-full h-8 mt-1"
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart
                className={`h-4 w-4 mr-1.5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              {likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments((v) => !v)}
            >
              <MessageCircle
                className={`h-4 w-4 mr-1.5 ${showComments ? "text-primary" : ""}`}
              />
              {comments.length}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1.5" />
              Поделиться
            </Button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 space-y-3">
              {comments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3 pt-1">
                    {comments.map((comment) => {
                      const commentAuthor = getMusicianById(comment.userId);
                      if (!commentAuthor) return null;
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Link href={`/profile/${commentAuthor.id}`}>
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage
                                src={
                                  allUsers.find(
                                    (u) => u.id === commentAuthor.id,
                                  )?.avatar ?? undefined
                                }
                                alt={commentAuthor.name}
                              />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {getInitials(commentAuthor.name)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 bg-muted rounded-xl px-3 py-2">
                            <Link
                              href={`/profile/${commentAuthor.id}`}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {commentAuthor.name}
                            </Link>
                            <p className="text-sm text-foreground mt-0.5">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Comment input */}
              {currentUser && (
                <div className="flex gap-2 items-start pt-1">
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarImage
                      src={currentUser.avatar ?? undefined}
                      alt={currentUser.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Написать комментарий..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      disabled={!commentText.trim()}
                      onClick={handleComment}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Лента</h1>

      {/* Create Post */}
      {currentUser && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={currentUser.avatar ?? undefined}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={`Что нового, ${currentUser.name.split(" ")[0]}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
                />

                {/* Attached media previews */}
                {attachedMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {attachedMedia.map((m, idx) => (
                      <div key={idx} className="relative group">
                        {m.type === "image" && (
                          <img
                            src={m.url}
                            alt={m.name}
                            className="h-20 w-20 object-cover rounded-lg border border-border"
                          />
                        )}
                        {m.type === "video" && (
                          <div className="h-20 w-20 rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-1">
                            <Film className="h-6 w-6 text-warning" />
                            <span className="text-xs text-muted-foreground truncate w-16 text-center">
                              {m.name}
                            </span>
                          </div>
                        )}
                        {m.type === "audio" && (
                          <div className="h-20 w-20 rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-1">
                            <FileAudio className="h-6 w-6 text-accent" />
                            <span className="text-xs text-muted-foreground truncate w-16 text-center">
                              {m.name}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <div className="flex gap-1">
                    {/* Hidden file inputs */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleMediaAttach(e, "image")}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleMediaAttach(e, "video")}
                    />
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleMediaAttach(e, "audio")}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-1.5 text-primary" />
                      Фото
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="h-4 w-4 mr-1.5 text-warning" />
                      Видео
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <MusicIcon className="h-4 w-4 mr-1.5 text-accent" />
                      Аудио
                    </Button>
                  </div>
                  <Button
                    disabled={
                      !newPostContent.trim() && attachedMedia.length === 0
                    }
                    onClick={handlePublish}
                  >
                    Опубликовать
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {feedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
