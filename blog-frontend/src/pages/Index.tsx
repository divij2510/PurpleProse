import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllPosts } from '@/redux/slices/postsSlice';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import AuthModal from '@/components/AuthModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import PostCard from '@/components/PostCard';

const Index = () => {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.posts);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllPosts());

    // Fetch user profile if authenticated but no user data
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  // Get featured posts (most recent 3 posts)
  const featuredPosts = posts.slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16">
        <AuthModal />
        
        <Hero />
        
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-8">Latest Posts</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-800"></div>
                ))}
              </div>
            ) : featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No posts yet.</p>
                <p className="text-gray-500 mt-2">Be the first to share your story!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Index;