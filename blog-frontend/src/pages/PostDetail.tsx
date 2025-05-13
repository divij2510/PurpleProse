import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPostById, deletePost } from '@/redux/slices/postsSlice';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { post, loading, error } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  
  const isAuthor = user && post && user.id === post.userId;
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      console.log(`PostDetail: Fetching post with ID ${id}`);
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id]);
  
  // Debug logging to track post data
  useEffect(() => {
    console.log('PostDetail current post state:', { post, loading, error });
    if (error) {
      console.error('Post fetch error:', error);
    }
  }, [post, loading, error]);
  
  const handleDelete = async () => {
    if (id) {
      await dispatch(deletePost(Number(id)));
      navigate('/');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16">
        <AuthModal />
        
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-800 max-w-xl rounded"></div>
              <div className="h-4 bg-gray-800 max-w-md rounded"></div>
              <div className="h-64 bg-gray-800 rounded mt-6"></div>
            </div>
          ) : post ? (
            <article className="max-w-3xl mx-auto">
              {post.imageUrl && (
                <div className="mb-8">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-72 md:h-96 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {post.title}
              </h1>
              
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage 
                    src={post.author?.avatar || ''} 
                    alt={post.author?.name || ''} 
                  />
                  <AvatarFallback className="bg-blog-purple text-white">
                    {post.author?.name ? getInitials(post.author.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="text-gray-300 font-medium">
                    {post.author?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                
                {isAuthor && (
                  <div className="ml-auto flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => navigate(`/edit/${post.id}`)}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently
                            delete your post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blog-purple/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg prose-invert max-w-none mt-8">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </article>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">Post not found</p>
              <p className="text-sm text-gray-500 mb-4">
                {error || "The post you're looking for doesn't exist or has been removed"}
              </p>
              <Button
                onClick={() => navigate('/')}
                className="mt-4 bg-blog-purple hover:bg-blog-purple-light"
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostDetail;