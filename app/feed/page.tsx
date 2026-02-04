'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { posts, getMusicianById } from '@/lib/mock-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, MessageCircle, Share2, ImageIcon, 
  Video, Music, MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function FeedPage() {
  const { currentUser } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'Только что';
  };

  const PostCard = ({ post }: { post: typeof posts[0] }) => {
    const author = getMusicianById(post.authorId);
    const [isLiked, setIsLiked] = useState(currentUser ? post.likes.includes(currentUser.id) : false);
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);

    if (!author) return null;

    const handleLike = () => {
      if (!currentUser) return;
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${author.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
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
                <DropdownMenuItem className="text-destructive">Пожаловаться</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-foreground whitespace-pre-wrap mb-4">
            {post.content}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={isLiked ? 'text-warning' : ''}
            >
              <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? 'fill-warning' : ''}`} />
              {likesCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              {post.comments.length}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1.5" />
              Поделиться
            </Button>
          </div>

          {/* Comments */}
          {showComments && post.comments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {post.comments.map(comment => {
                const commentAuthor = getMusicianById(comment.userId);
                if (!commentAuthor) return null;
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(commentAuthor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {commentAuthor.name}
                      </p>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
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
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={`Что нового, ${currentUser.name.split(' ')[0]}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
                />
                <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4 mr-1.5 text-primary" />
                      Фото
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4 mr-1.5 text-warning" />
                      Видео
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Music className="h-4 w-4 mr-1.5 text-accent" />
                      Аудио
                    </Button>
                  </div>
                  <Button disabled={!newPostContent.trim()}>
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
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
