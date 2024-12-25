// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { notification } from 'antd';
// import { EmployeeType } from '@/pages/management/employee/entity';
// import employeeTypeAPI from '../api/services/employeeTypeAPI';
// import { RootState } from '../stores/store';

// interface EmployeeTypeState {
//    employeeTypes: EmployeeType[];
//    selectedEmployeeType: EmployeeType | null;
//    loading: boolean;
//    error: string | null;
// }

// const initialState: EmployeeTypeState = {
//    employeeTypes: [],
//    selectedEmployeeType: null,
//    loading: false,
//    error: null,
// };

// export const fetchEmployeeTypes = createAsyncThunk(
//    'employeeType/fetchEmployeeTypes',
//    async (_, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.getEmployeeTypes();
//          if (response.success) {
//             return response.data;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const createEmployeeType = createAsyncThunk(
//    'employeeType/createEmployeeType',
//    async (data: Omit<EmployeeType, 'employee_type_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.createEmployeeType(data);
//          if (response.success) {
//             notification.success({ message: 'Tạo loại nhân viên thành công!' });
//             return response.data;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const updateEmployeeType = createAsyncThunk(
//    'employeeType/updateEmployeeType',
//    async (data: Partial<EmployeeType> & { employee_type_id: number }, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.updateEmployeeType(data);
//          if (response.success) {
//             notification.success({ message: 'Cập nhật loại nhân viên thành công!' });
//             return response.data;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const deleteEmployeeType = createAsyncThunk(
//    'employeeType/deleteEmployeeType',
//    async (employee_type_id: number, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.deleteEmployeeType(employee_type_id);
//          if (response.success) {
//             notification.success({ message: 'Xóa loại nhân viên thành công!' });
//             return employee_type_id;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// const employeeTypeSlice = createSlice({
//    name: 'employeeType',
//    initialState,
//    reducers: {
//       setSelectedEmployeeType: (state, action) => {
//          state.selectedEmployeeType = action.payload;
//       },
//       clearSelectedEmployeeType: (state) => {
//          state.selectedEmployeeType = null;
//       },
//       clearError: (state) => {
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Fetch employee types
//       builder
//          .addCase(fetchEmployeeTypes.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(fetchEmployeeTypes.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes = action.payload;
//          })
//          .addCase(fetchEmployeeTypes.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Create employee type
//       builder
//          .addCase(createEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(createEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes.push(action.payload);
//          })
//          .addCase(createEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Update employee type
//       builder
//          .addCase(updateEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(updateEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             const index = state.employeeTypes.findIndex(
//                (type) => type.employee_type_id === action.payload.employee_type_id,
//             );
//             if (index !== -1) {
//                state.employeeTypes[index] = action.payload;
//             }
//          })
//          .addCase(updateEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Delete employee type
//       builder
//          .addCase(deleteEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(deleteEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes = state.employeeTypes.filter((type) => type.employee_type_id !== action.payload);
//          })
//          .addCase(deleteEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//    },
// });

// export const { setSelectedEmployeeType, clearSelectedEmployeeType, clearError } = employeeTypeSlice.actions;

// export const selectEmployeeTypes = (state: RootState) => state.employeeType.employeeTypes;
// export const selectSelectedEmployeeType = (state: RootState) => state.employeeType.selectedEmployeeType;
// export const selectEmployeeTypeLoading = (state: RootState) => state.employeeType.loading;
// export const selectEmployeeTypeError = (state: RootState) => state.employeeType.error;

// export default employeeTypeSlice.reducer;

// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { notification } from 'antd';
// import { EmployeeType } from '@/pages/management/employee/entity';
// import employeeTypeAPI from '../api/services/employeeTypeAPI';
// import { RootState } from '../stores/store';

// interface EmployeeTypeState {
//    employeeTypes: EmployeeType[];
//    selectedEmployeeType: EmployeeType | null;
//    loading: boolean;
//    error: string | null;
// }

// const initialState: EmployeeTypeState = {
//    employeeTypes: [],
//    selectedEmployeeType: null,
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { EmployeeType } from '@/pages/management/employeeType/entity';

// const initialState: {
//    employeeTypes: EmployeeType[];
//    loading: boolean;
//    error: string | null;
// } = {
//    employeeTypes: [],
//    loading: false,
//    error: null,
// };

// export const fetchEmployeeTypes = createAsyncThunk(
//    'employeeType/fetchEmployeeTypes',
//    async (_, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.getEmployeeTypes();
//          if (response.success && response.data) {
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Không thể lấy danh sách loại nhân viên');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const createEmployeeType = createAsyncThunk(
//    'employeeType/createEmployeeType',
//    async (data: Omit<EmployeeType, 'employee_type_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.createEmployeeType(data);
//          if (response.success && response.data) {
//             notification.success({ message: response.message });
//             return response.data;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const updateEmployeeType = createAsyncThunk(
//    'employeeType/updateEmployeeType',
//    async (data: Partial<EmployeeType> & { employee_type_id: number }, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.updateEmployeeType(data);
//          if (response.success && response.data) {
//             notification.success({ message: response.message });
//             return response.data;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const deleteEmployeeType = createAsyncThunk(
//    'employeeType/deleteEmployeeType',
//    async (employee_type_id: number, { rejectWithValue }) => {
//       try {
//          const response = await employeeTypeAPI.deleteEmployeeType(employee_type_id);
//          if (response.success) {
//             notification.success({ message: response.message });
//             return employee_type_id;
//          }
//          return rejectWithValue(response.message);
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// const employeeTypeSlice = createSlice({
//    name: 'employeeType',
//    initialState,
//    reducers: {
//       setSelectedEmployeeType: (state, action: PayloadAction<EmployeeType | null>) => {
//          state.selectedEmployeeType = action.payload;
//       },
//       clearSelectedEmployeeType: (state) => {
//          state.selectedEmployeeType = null;
//       },
//       clearError: (state) => {
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Fetch employee types
//       builder
//          .addCase(fetchEmployeeTypes.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(fetchEmployeeTypes.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes = action.payload;
//          })
//          .addCase(fetchEmployeeTypes.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Create employee type
//       builder
//          .addCase(createEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(createEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes.push(action.payload);
//          })
//          .addCase(createEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Update employee type
//       builder
//          .addCase(updateEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(updateEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             const index = state.employeeTypes.findIndex(
//                (type) => type.employee_type_id === action.payload.employee_type_id,
//             );
//             if (index !== -1) {
//                state.employeeTypes[index] = action.payload;
//             }
//          })
//          .addCase(updateEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });

//       // Delete employee type
//       builder
//          .addCase(deleteEmployeeType.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(deleteEmployeeType.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employeeTypes = state.employeeTypes.filter((type) => type.employee_type_id !== action.payload);
//          })
//          .addCase(deleteEmployeeType.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//    },
// });

// export const { setSelectedEmployeeType, clearSelectedEmployeeType, clearError } = employeeTypeSlice.actions;

// // Selectors
// export const selectEmployeeTypes = (state: RootState) => state.employeeType.employeeTypes;
// export const selectSelectedEmployeeType = (state: RootState) => state.employeeType.selectedEmployeeType;
// export const selectEmployeeTypeLoading = (state: RootState) => state.employeeType.loading;
// export const selectEmployeeTypeError = (state: RootState) => state.employeeType.error;

// export default employeeTypeSlice.reducer;
//       setEmployeeTypesSlice: (state, action: PayloadAction<EmployeeType[]>) => {
//          state.employeeTypes = action.payload;
//       },
//       clearEmployeeTypes: (state) => {
//          state.employeeTypes = [];
//       },
//       setLoading: (state, action: PayloadAction<boolean>) => {
//          state.loading = action.payload;
//       },
//       setError: (state, action: PayloadAction<string | null>) => {
//          state.error = action.payload;
//       },
//    },
// });

// export const { setEmployeeTypesSlice, clearEmployeeTypes, setLoading, setError } = employeeTypeSlice.actions;
// export const employeeTypeReducer = employeeTypeSlice.reducer;
