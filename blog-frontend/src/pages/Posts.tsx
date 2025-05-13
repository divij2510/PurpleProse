import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllPosts } from '@/redux/slices/postsSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AuthModal from '@/components/AuthModal';
import { X } from 'lucide-react';

const Posts = () => {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector((state) => state.posts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []).filter(Boolean))
  );
  
  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);
  
  // Filter posts based on search term and selected tags
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => post.tags?.includes(tag));
      
    return matchesSearch && matchesTags;
  });
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20">
        <AuthModal />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gradient mb-8">Discover Stories</h1>
            
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 mb-8">
              <div className="w-full md:w-2/3">
                <Input
                  type="text"
                  placeholder="Search posts by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
            </div>
            
            {allTags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Filter by tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-blog-purple hover:bg-blog-purple-light'
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTags.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-blog-pink hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-800"></div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No posts found.</p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Posts;
