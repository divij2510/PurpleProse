import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { openAuthModal } from '@/redux/slices/uiSlice';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal('login'));
      navigate('/');
      return;
    }

    if (isAuthenticated && !user) {
      // User is authenticated but profile not loaded yet
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
