
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createPost } from '@/redux/slices/postsSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostEditor from '@/components/PostEditor';
import RequireAuth from '@/components/RequireAuth';
import type { PostFormValues } from '@/components/PostEditor';

const CreatePost = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.posts);
  
  const handleSubmit = async (data: PostFormValues) => {
    console.log('CreatePost: Submitting post with data:', {
      title: data.title,
      contentLength: data.content.length,
      tags: data.tags,
      hasImage: !!data.imageFile
    });
    
    // Prepare post data
    const postData = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      imageFile: data.imageFile
    };
    
    const result = await dispatch(createPost(postData));
    if (createPost.fulfilled.match(result)) {
      console.log('Post created successfully:', result.payload);
      // Use timeout to ensure post state is updated before navigation
      setTimeout(() => {
        navigate(`/post/${result.payload.id}`);
      }, 100);
    } else {
      console.error('Failed to create post:', result.error);
    }
  };

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">Create New Post</h1>
            <p className="text-gray-400">
              Share your thoughts, stories, and ideas with the world
            </p>
          </div>
          
          <PostEditor onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
      <Footer />
    </RequireAuth>
  );
};

export default CreatePost;