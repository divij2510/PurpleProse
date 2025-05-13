import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { fetchUserPosts } from '@/redux/slices/postsSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RequireAuth from '@/components/RequireAuth';
import PostCard from '@/components/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userPosts, loading } = useAppSelector((state) => state.posts);
  
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserPosts());
  }, [dispatch]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <RequireAuth>
      <Navbar />
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {user ? (
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-xl p-8 mb-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="bg-blog-purple text-white text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <p className="text-gray-400 mb-4">{user.email}</p>
                    
                    {user.bio ? (
                      <p className="text-gray-300">{user.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic">No bio provided</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gradient">Your Posts</h2>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-800"></div>
                    ))}
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-card rounded-lg">
                    <p className="text-xl text-gray-400">You haven't created any posts yet.</p>
                    <p className="text-gray-500 mt-2">Start writing to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
              <div className="h-40 bg-gray-800 rounded-xl"></div>
              <div className="h-10 bg-gray-800 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </RequireAuth>
  );
};

export default Profile;
