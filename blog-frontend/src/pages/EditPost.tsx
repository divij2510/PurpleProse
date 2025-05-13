// src/pages/EditPost.tsx
import { useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPostById, updatePost } from '@/redux/slices/postsSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostEditor from '@/components/PostEditor';
import RequireAuth from '@/components/RequireAuth';

export type PostFormValues = {
  id: number; // Ensure 'id' is required
  title: string;
  content: string;
  tags: string[];
  imageFile?: File;
};

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { post, loading } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);

  // Load post on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id]);

  // Redirect if current user isn't the author
  useEffect(() => {
    if (post && user && post.userId !== user.id) {
      navigate('/');
    }
  }, [post, user, navigate]);

  // Handle form submission
  const handleSubmit = async (data: PostFormValues) => {
    if (!id) return;

    // Build the update payload
    const payload: PostFormValues = {
      id: Number(id),
      title: data.title,
      content: data.content,
      tags: data.tags,
      // If the user selected a new file, pass it; otherwise omit imageFile
      ...(data.imageFile ? { imageFile: data.imageFile } : {})
    };

    console.log('EditPost: payload for update:', payload);

    const result = await dispatch(updatePost(payload));
    if (updatePost.fulfilled.match(result)) {
      navigate(`/post/${id}`);
    }
  };

  // Prepare initial values for the editor
  const initialValues = post
    ? {
        id: post.id,
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
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Edit Post
            </h1>
            <p className="text-gray-400">Make changes to your post</p>
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
