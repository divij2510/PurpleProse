import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/redux/slices/postsSlice';

interface PostCardProps {
  post: Post;
  className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Extract a preview of the content (stripped of HTML)
  const contentPreview = post.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 150)
    .trim();

  return (
    <div
      className={cn(
        'glass-card rounded-lg p-5 hover-glow transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <Link to={`/post/${post.id}`}>
        <div className="space-y-4">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}

          <h2 className="text-xl font-bold text-white hover:text-blog-purple-light transition-colors line-clamp-2">
            {post.title}
          </h2>

          <p className="text-gray-300 line-clamp-3">{contentPreview}...</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags &&
              post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-blog-purple/20 hover:bg-blog-purple/30">
                  {tag}
                </Badge>
              ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar || ''} alt={post.author?.name || ''} />
                <AvatarFallback className="bg-blog-purple text-white text-xs">
                  {post.author?.name ? getInitials(post.author.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400">{post.author?.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;