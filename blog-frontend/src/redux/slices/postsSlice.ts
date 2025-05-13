import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';
import { toast } from 'sonner';
import type { RootState } from '../store';

// Post type
export interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  userId: number;
  author?: { id: number; name: string; avatar?: string };
  createdAt: string;
  updatedAt: string;
}

// State shape
interface PostsState {
  posts: Post[];
  post: Post | null;
  loading: boolean;
  error: string | null;
  userPosts: Post[];
}

// Create payload
export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  imageFile?: File;
}

// Update payload extends Create, adds id
export interface UpdatePostData extends CreatePostData {
  id: number;
}

// Thunks
export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/posts');
      return res.data as Post[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await api.get(`/posts/${id}`);
      return res.data as Post;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.tags?.length) formData.append('tags', JSON.stringify(postData.tags));
      if (postData.imageFile) formData.append('image', postData.imageFile);

      const res = await api.post('/posts', formData);
      return res.data as Post;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async (postData: UpdatePostData, { rejectWithValue }) => {
    try {
      let res;
      if (postData.imageFile) {
        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        if (postData.tags?.length) formData.append('tags', JSON.stringify(postData.tags));
        formData.append('image', postData.imageFile);
        res = await api.put(`/posts/${postData.id}`, formData);
      } else {
        res = await api.put(`/posts/${postData.id}`, {
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
        });
      }
      return res.data as Post;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/me');
      return res.data.posts as Post[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

// Slice
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
    clearPostError: (state) => { state.error = null; },
    resetPost: (state) => { state.post = null; },
  },
  extraReducers(builder) {
    builder
      // Fetch all
      .addCase(fetchAllPosts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAllPosts.fulfilled, (s, a) => { s.loading = false; s.posts = a.payload; })
      .addCase(fetchAllPosts.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Fetch by id
      .addCase(fetchPostById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPostById.fulfilled, (s, a) => { s.loading = false; s.post = a.payload; })
      .addCase(fetchPostById.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Create
      .addCase(createPost.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createPost.fulfilled, (s, a) => {
        s.loading = false;
        s.posts.unshift(a.payload);
        s.userPosts.unshift(a.payload);
        s.post = a.payload;
        toast.success('Post created successfully!');
      })
      .addCase(createPost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; toast.error(a.payload as string); })

      // Update
      .addCase(updatePost.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updatePost.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.posts.findIndex(p => p.id === a.payload.id);
        if (idx > -1) s.posts[idx] = a.payload;
        s.userPosts = s.userPosts.map(p => p.id === a.payload.id ? a.payload : p);
        s.post = a.payload;
        toast.success('Post updated successfully!');
      })
      .addCase(updatePost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; toast.error(a.payload as string); })

      // Delete
      .addCase(deletePost.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deletePost.fulfilled, (s, a) => {
        s.loading = false;
        s.posts = s.posts.filter(p => p.id !== a.payload);
        s.userPosts = s.userPosts.filter(p => p.id !== a.payload);
        toast.success('Post deleted successfully!');
      })
      .addCase(deletePost.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; toast.error(a.payload as string); })

      // Fetch user
      .addCase(fetchUserPosts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUserPosts.fulfilled, (s, a) => { s.loading = false; s.userPosts = a.payload; })
      .addCase(fetchUserPosts.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
  }
});

export const { clearPostError, resetPost } = postsSlice.actions;
export default postsSlice.reducer;
