
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import api from '@/services/api';

// Types
interface User {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

interface JwtPayload {
  user: {
    id: number;
  };
  exp: number;
}

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000';
const API_URL = BASE_URL+'/api';
// Check if token exists in localStorage
const token = localStorage.getItem('token');
let initialUser = null;

if (token) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
    }
  } catch (err) {
    localStorage.removeItem('token');
  }
}

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin', 
  async (tokenId: string, { rejectWithValue }) => {
    try {
      console.log('Attempting Google login with token');
      const response = await api.post('/auth/google', { tokenId });
      console.log('Google login response:', response.data);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error: any) {
      console.error('Google login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      console.log('Attempting signup with credentials:', { 
        name: credentials.name, 
        email: credentials.email 
      });
      const response = await api.post('/auth/signup', credentials);
      console.log('Signup response:', response.data);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error: any) {
      console.error('Signup error:', error);
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await api.get('/users/me');
      console.log('Fetched user profile:', response.data.user);
      return response.data.user;
    } catch (error: any) {
      console.error('Fetch user profile error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const initialState: AuthState = {
  token: token || null,
  user: initialUser,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Login failed');
      })
      // Google login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        toast.success('Logged in with Google successfully!');
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Google login failed');
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        toast.success('Account created successfully!');
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Signup failed');
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;