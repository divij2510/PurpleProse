import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { login, signup, googleLogin, clearError, LoginCredentials, SignupCredentials } from '@/redux/slices/authSlice';
import { closeAuthModal, setAuthMode } from '@/redux/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

// Using the existing Window interface from types.d.ts which already includes the callback property

const AuthModal = () => {
  const { showAuthModal, authMode } = useAppSelector((state) => state.ui);
  const { loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [formKey, setFormKey] = useState(Date.now()); // Add a key to force re-render
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Only log auth modal state changes once when component mounts or when auth state changes
  useEffect(() => {
    console.log(`Auth Modal - Current Mode: ${authMode}, Visible: ${showAuthModal}`);
  }, [authMode, showAuthModal]);

  useEffect(() => {
    // Clear form errors when switching modes, but only when auth mode changes
    if (showAuthModal) {
      loginForm.reset();
      signupForm.reset();
      dispatch(clearError());
      // Force re-render forms when switching modes
      setFormKey(Date.now());
      console.log(`Auth mode changed to: ${authMode}, resetting forms`);
    }
  }, [authMode, dispatch, loginForm, signupForm, showAuthModal]);

  const handleClose = () => {
    console.log('Closing auth modal');
    dispatch(closeAuthModal());
    loginForm.reset();
    signupForm.reset();
    setGoogleButtonRendered(false);
  };

  const onLoginSubmit = async (values: LoginValues) => {
    console.log('Login attempt with:', values);
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password
    };
    await dispatch(login(credentials));
    console.log('Login dispatch completed, error state:', error);
    if (!error) {
      handleClose();
    }
  };

  const onSignupSubmit = async (values: SignupValues) => {
    console.log('Signup attempt with:', values);
    const credentials: SignupCredentials = {
      name: values.name,
      email: values.email,
      password: values.password
    };
    await dispatch(signup(credentials));
    console.log('Signup dispatch completed, error state:', error);
    if (!error) {
      handleClose();
    }
  };

  const toggleMode = () => {
    dispatch(setAuthMode(authMode === 'login' ? 'signup' : 'login'));
  };

  // Handle Google Sign-In response
  const handleGoogleCredentialResponse = (response: GoogleCredentialResponse) => {
    console.log('Google Sign In response received:', response);
    if (response.credential) {
      dispatch(googleLogin(response.credential));
      handleClose();
    }
  };

  // Initialize Google Sign In - moved to a stable ref to prevent re-initialization
  const initializeGoogleSignIn = useCallback(() => {
    if (window.google && showAuthModal && !googleButtonRendered) {
      console.log('Initializing Google Sign-In');
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1074559025939-4khfpvlq56p5mrmalai9ejopj55np1pe.apps.googleusercontent.com', 
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      // Render the button
      const googleButtonDiv = document.getElementById('googleSignInButton');
      if (googleButtonDiv) {
        console.log('Rendering Google Sign In button');
        window.google.accounts.id.renderButton(googleButtonDiv, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          text: authMode === 'login' ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
        setGoogleButtonRendered(true);
      } else {
        console.error('Google sign-in button container not found');
      }
    }
  }, [authMode, showAuthModal, googleButtonRendered]);

  // Load Google API script - only once when modal opens if not already loaded
  useEffect(() => {
    if (showAuthModal) {
      if (!window.google) {
        console.log('Loading Google Sign-In API script');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google Sign-In API script loaded');
          initializeGoogleSignIn(); // Ensure initialization after script loads
        };
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } else if (!googleButtonRendered) {
        console.log('Google Sign-In API already loaded, initializing');
        initializeGoogleSignIn(); // Ensure initialization if script is already loaded
      }
    }
  }, [showAuthModal, initializeGoogleSignIn, googleButtonRendered]);

  // Only reinitialize when authMode changes AND googleButtonRendered is false
  useEffect(() => {
    if (showAuthModal && window.google && !googleButtonRendered) {
      console.log('Auth mode changed, initializing Google Sign In');
      initializeGoogleSignIn();
    }
  }, [authMode, showAuthModal, googleButtonRendered, initializeGoogleSignIn]);

  // Manual input handlers for direct debugging - simplified to reduce re-renders
  const handleDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'login' | 'signup', field: string) => {
    if (formType === 'login') {
      loginForm.setValue(field as keyof LoginValues, e.target.value, { shouldValidate: true, shouldDirty: true });
    } else {
      signupForm.setValue(field as keyof SignupValues, e.target.value, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-blog-purple-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gradient">
            {authMode === 'login' ? 'Welcome Back' : 'Join PurpleProse'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {authMode === 'login' 
              ? 'Sign in to continue to your account' 
              : 'Create an account to start sharing your stories'}
          </DialogDescription>
        </DialogHeader>

        {authMode === 'login' ? (
          <Form {...loginForm} key={`login-${formKey}`}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="your@email.com"
                          className="pl-10"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          autoComplete="current-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blog-purple hover:bg-blog-purple-light"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm} key={`signup-${formKey}`}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Your Name"
                          className="pl-10"
                          autoComplete="name"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="your@email.com"
                          className="pl-10"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          autoComplete="new-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blog-purple hover:bg-blog-purple-light"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <Button variant="link" onClick={toggleMode} className="ml-1 text-blog-pink">
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </Button>
          </p>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div id="googleSignInButton" className="w-full flex justify-center"></div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;