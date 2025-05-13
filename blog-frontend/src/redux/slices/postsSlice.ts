import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/services/api'; // Import our API service
import { toast } from 'sonner';
import type { RootState } from '../store';

// Types
export interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  userId: number;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PostsState {
  posts: Post[];
  post: Post | null;
  loading: boolean;
  error: string | null;
  userPosts: Post[];
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  imageFile?: File; // Changed from imageUrl to imageFile
}

export interface UpdatePostData extends Omit<CreatePostData, 'imageFile'> {
  id: number;
  imageUrl?: string;
}

// Async Thunks
export const fetchAllPosts = createAsyncThunk('posts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/posts');
    console.log('Fetched all posts:', response.data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
  }
});

export const fetchPostById = createAsyncThunk(
  'posts/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log(`Fetching post with ID: ${id}`);
      const response = await api.get(`/posts/${id}`);
      console.log('Fetched post data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching post:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      console.log('Creating post with data:', postData);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      // Add tags as JSON string
      if (postData.tags && postData.tags.length > 0) {
        formData.append('tags', JSON.stringify(postData.tags));
      }
      
      // Add image file if present
      if (postData.imageFile) {
        formData.append('image', postData.imageFile);
        console.log('Added image to form data:', postData.imageFile.name);
      }
      
      console.log('Sending FormData to server');
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async (postData: UpdatePostData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postData.id}`, postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data.posts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

const initialState: PostsState = {
  posts: [],
  post: null,
  loading: false,
  error: null,
  userPosts: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    resetPost: (state) => {
      state.post = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch post by id
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [action.payload, ...state.posts];
        state.userPosts = [action.payload, ...state.userPosts];
        state.post = action.payload; // Set the current post to the newly created post
        toast.success('Post created successfully!');
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Failed to create post');
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        );
        state.userPosts = state.userPosts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        );
        state.post = action.payload;
        toast.success('Post updated successfully!');
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Failed to update post');
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        state.userPosts = state.userPosts.filter((post) => post.id !== action.payload);
        toast.success('Post deleted successfully!');
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string || 'Failed to delete post');
      })
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPostError, resetPost } = postsSlice.actions;

export default postsSlice.reducer;