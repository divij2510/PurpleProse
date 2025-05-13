import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openAuthModal } from '@/redux/slices/uiSlice';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/create');
    } else {
      dispatch(openAuthModal('signup'));
    }
  };

  return (
    <div className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blog-purple-dark via-black to-black opacity-90 z-0"
        aria-hidden="true"
      />
      
      {/* Purple glow effects */}
      <div 
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-blog-purple-light rounded-full filter blur-3xl opacity-20 animate-pulse z-0"
        style={{ animationDuration: '8s' }} 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blog-pink rounded-full filter blur-3xl opacity-10 animate-pulse z-0"
        style={{ animationDuration: '12s' }} 
      />

      <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
          Express yourself with{' '}
          <span className="text-gradient">PurpleProse</span>
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
          Create beautiful blog posts, share your thoughts, and connect with readers
          from around the world. Your stories deserve to be heard.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button 
            onClick={handleGetStarted} 
            size="lg"
            className="bg-blog-purple hover:bg-blog-purple-light text-white px-8 py-6 rounded-full text-lg"
          >
            {isAuthenticated ? 'Create New Post' : 'Get Started'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => navigate('/posts')}
            className="text-gray-200 hover:text-white py-6"
          >
            Browse Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;