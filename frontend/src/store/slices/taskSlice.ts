import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, Comment } from '../../types';
import { api } from '../../services/api';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  selectedTask: Task | null;
  comments: Comment[];
  isLoading: boolean;
  isCommentsLoading: boolean;
  error: string | null;
  filterStatus: string;
  filterPriority: string;
  filterAssignee: string;
  searchQuery: string;
}

const initialState: TaskState = {
  tasks: [],
  myTasks: [],
  selectedTask: null,
  comments: [],
  isLoading: false,
  isCommentsLoading: false,
  error: null,
  filterStatus: 'ALL',
  filterPriority: 'ALL',
  filterAssignee: 'ALL',
  searchQuery: '',
};

export const fetchProjectTasks = createAsyncThunk('tasks/fetchProjectTasks', async (projectId: string, { rejectWithValue }) => {
  try {
    const res: any = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMyTasks', async (_, { rejectWithValue }) => {
  try {
    const res: any = await api.get('/my-tasks');
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async ({ projectId, data }: { projectId: string; data: any }, { rejectWithValue }) => {
  try {
    const res: any = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
  try {
    const res: any = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const res: any = await api.put(`/tasks/${id}`, data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchTaskComments = createAsyncThunk('tasks/fetchComments', async (taskId: string, { rejectWithValue }) => {
  try {
    const res: any = await api.get(`/tasks/${taskId}/comments`);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addComment = createAsyncThunk('tasks/addComment', async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
  try {
    const res: any = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<string>) => {
      state.filterPriority = action.payload;
    },
    setFilterAssignee: (state, action: PayloadAction<string>) => {
      state.filterAssignee = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    // Socket events real-time updates
    socketTaskCreated: (state, action: PayloadAction<Task>) => {
      if (!state.tasks.some((t) => t._id === action.payload._id)) {
        state.tasks.unshift(action.payload);
      }
    },
    socketTaskUpdated: (state, action: PayloadAction<Task>) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) {
        state.tasks[idx] = action.payload;
      }
      if (state.selectedTask?._id === action.payload._id) {
        state.selectedTask = action.payload;
      }
    },
    socketTaskDeleted: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      if (state.selectedTask?._id === action.payload) {
        state.selectedTask = null;
      }
    },
    socketCommentCreated: (state, action: PayloadAction<Comment>) => {
      if (state.selectedTask?._id === action.payload.task) {
        state.comments.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
        }
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
        }
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.selectedTask?._id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(fetchTaskComments.pending, (state) => {
        state.isCommentsLoading = true;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.isCommentsLoading = false;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      });
  },
});

export const {
  setSelectedTask,
  setFilterStatus,
  setFilterPriority,
  setFilterAssignee,
  setSearchQuery,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketCommentCreated,
} = taskSlice.actions;

export default taskSlice.reducer;
