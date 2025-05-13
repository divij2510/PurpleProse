import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPostById, updatePost } from '@/redux/slices/postsSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostEditor from '@/components/PostEditor';
import RequireAuth from '@/components/RequireAuth';
import type { PostFormValues } from '@/components/PostEditor';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { post, loading } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    // Redirect if not the author of the post
    if (post && user && post.userId !== user.id) {
      navigate('/');
    }
  }, [post, user, navigate]);
  
  const handleSubmit = async (data: PostFormValues) => {
    if (id) {
      console.log('EditPost: Submitting updated post data:', {
        id: Number(id),
        title: data.title,
        contentLength: data.content.length,
        tags: data.tags
      });
      
      // For edit, we don't use multipart form data yet
      // (would need to update backend to handle partial updates with image)
      const postData = {
        id: Number(id),
        title: data.title,
        content: data.content,
        tags: data.tags,
        imageUrl: post?.imageUrl
      };
      
      const result = await dispatch(updatePost(postData));
      if (updatePost.fulfilled.match(result)) {
        navigate(`/post/${id}`);
      }
    }
  };
  
  // Convert post data to form values
  const initialValues = post
    ? {
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        imageUrl: post.imageUrl || '',
      }
    : undefined;

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">Edit Post</h1>
            <p className="text-gray-400">
              Make changes to your post
            </p>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-800 rounded w-3/4"></div>
              <div className="h-40 bg-gray-800 rounded"></div>
              <div className="h-60 bg-gray-800 rounded"></div>
            </div>
          ) : post ? (
            <PostEditor
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={loading}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">Post not found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </RequireAuth>
  );
};

export default EditPost;