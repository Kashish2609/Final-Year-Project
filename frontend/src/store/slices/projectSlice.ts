import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { api } from '../../services/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentStats: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  currentStats: null,
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (params: any = {}, { rejectWithValue }) => {
  try {
    const res: any = await api.get('/projects', { params });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const res: any = await api.get(`/projects/${id}`);
    return res;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (data: any, { rejectWithValue }) => {
  try {
    const res: any = await api.post('/projects', data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const res: any = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    updateProjectMemberRoleInState: (state, action: PayloadAction<{ members: any[] }>) => {
      if (state.currentProject) {
        state.currentProject.members = action.payload.members;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProject = action.payload.data;
        state.currentStats = action.payload.stats;
        state.isLoading = false;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const { setCurrentProject, updateProjectMemberRoleInState } = projectSlice.actions;
export default projectSlice.reducer;
