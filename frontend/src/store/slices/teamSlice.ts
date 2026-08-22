import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProjectMember, User } from '../../types';
import { api } from '../../services/api';

interface TeamState {
  members: ProjectMember[];
  searchUsers: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  searchUsers: [],
  isLoading: false,
  error: null,
};

export const fetchProjectMembers = createAsyncThunk('team/fetchMembers', async (projectId: string, { rejectWithValue }) => {
  try {
    const res: any = await api.get(`/projects/${projectId}/members`);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addProjectMember = createAsyncThunk('team/addMember', async ({ projectId, email, role }: { projectId: string; email: string; role: string }, { rejectWithValue }) => {
  try {
    const res: any = await api.post(`/projects/${projectId}/members`, { email, role });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateProjectMemberRole = createAsyncThunk('team/updateMemberRole', async ({ projectId, userId, role }: { projectId: string; userId: string; role: string }, { rejectWithValue }) => {
  try {
    const res: any = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const removeProjectMember = createAsyncThunk('team/removeMember', async ({ projectId, userId }: { projectId: string; userId: string }, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${projectId}/members/${userId}`);
    return userId;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const searchPlatformUsers = createAsyncThunk('team/searchUsers', async (query: string, { rejectWithValue }) => {
  try {
    const res: any = await api.get(`/users`, { params: { search: query } });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectMembers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(updateProjectMemberRole.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.user._id !== action.payload);
      })
      .addCase(searchPlatformUsers.fulfilled, (state, action) => {
        state.searchUsers = action.payload;
      });
  },
});

export default teamSlice.reducer;
