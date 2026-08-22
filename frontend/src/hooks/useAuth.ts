import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    logout: () => dispatch(logout()),
  };
};
