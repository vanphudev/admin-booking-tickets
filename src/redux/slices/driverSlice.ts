// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Driver } from '@/pages/management/way/entity';

// const initialState: {
//    drivers: Driver[];
//    loading: boolean;
//    error: string | null;
// } = {
//    drivers: [],
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { notification } from 'antd';
// import { Driver } from '@/pages/management/driver/entity';
// import driverAPI from '../api/services/driverAPI';
// import { RootState } from '../stores/store';

// interface DriverState {
//    drivers: Driver[];
//    selectedDriver: Driver | null;
//    driverInfo: Driver | null;
//    loading: boolean;
//    error: string | null;
// }

// const initialState: DriverState = {
//    drivers: [],
//    selectedDriver: null,
//    driverInfo: null,
//    loading: false,
//    error: null,
// };

// // Async thunks
// export const fetchDrivers = createAsyncThunk('driver/fetchDrivers', async (_, { rejectWithValue }) => {
//    try {
//       const response = await driverAPI.getDrivers();
//       if (response) {
//          return response;
//       }
//       return rejectWithValue('Không thể tải danh sách tài xế');
//    } catch (error: any) {
//       return rejectWithValue(error.message);
//    }
// });

// export const createDriver = createAsyncThunk(
//    'driver/createDriver',
//    async (data: Omit<Driver, 'driver_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
//       try {
//          const response = await driverAPI.createDriver(data);
//          if (response.success && response.data) {
//             notification.success({ message: 'Tạo tài xế thành công' });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Tạo tài xế thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const updateDriver = createAsyncThunk(
//    'driver/updateDriver',
//    async (data: Partial<Driver> & { driver_id: number }, { rejectWithValue }) => {
//       try {
//          const response = await driverAPI.updateDriver(data);
//          if (response.success && response.data) {
//             notification.success({ message: 'Cập nhật tài xế thành công' });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Cập nhật tài xế thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    },
// );

// export const deleteDriver = createAsyncThunk('driver/deleteDriver', async (driverId: string, { rejectWithValue }) => {
//    try {
//       const response = await driverAPI.deleteDriver(Number(driverId));
//       if (response.success) {
//          notification.success({ message: response.message });
//          return driverId;
//       }
//       return rejectWithValue(response.message || 'Xóa tài xế thất bại');
//    } catch (error: any) {
//       return rejectWithValue(error.message);
//    }
// });

// const driverSlice = createSlice({
//    name: 'driver',
//    initialState,
//    reducers: {
//       setDriverSlice: (state, action: PayloadAction<Driver[]>) => {
//          state.drivers = action.payload;
//       },
//       clearDrivers: (state) => {
//          state.drivers = [];
//       },
//       setLoading: (state, action: PayloadAction<boolean>) => {
//          state.loading = action.payload;
//       },
//       setError: (state, action: PayloadAction<string | null>) => {
//          state.error = action.payload;
//       },
//    },
// });

// export const { setDriverSlice, clearDrivers, setLoading, setError } = driverSlice.actions;
// export const driverReducer = driverSlice.reducer;
//       clearDrivers: (state) => {
//          state.drivers = [];
//       },
//       setSelectedDriver: (state, action) => {
//          state.selectedDriver = action.payload;
//       },
//       setDriverInfo: (state, action) => {
//          state.driverInfo = action.payload;
//       },
//       clearDriverInfo: (state) => {
//          state.driverInfo = null;
//       },
//       clearError: (state) => {
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Fetch drivers
//       builder
//          .addCase(fetchDrivers.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(fetchDrivers.fulfilled, (state, action) => {
//             state.loading = false;
//             state.drivers = action.payload;
//          })
//          .addCase(fetchDrivers.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//       // Create driver
//       builder
//          .addCase(createDriver.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(createDriver.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                state.drivers.push(action.payload);
//             }
//          })
//          .addCase(createDriver.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//       // Update driver
//       builder
//          .addCase(updateDriver.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(updateDriver.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                const index = state.drivers.findIndex((d) => d.driver_id === action.payload?.driver_id);
//                if (index !== -1) {
//                   state.drivers[index] = action.payload;
//                }
//             }
//          })
//          .addCase(updateDriver.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//       // Delete driver
//       builder
//          .addCase(deleteDriver.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(deleteDriver.fulfilled, (state, action) => {
//             state.loading = false;
//             state.drivers = state.drivers.filter((d) => d.driver_id.toString() !== action.payload);
//          })
//          .addCase(deleteDriver.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//    },
// });

// // Actions
// export const { clearDrivers, setSelectedDriver, setDriverInfo, clearDriverInfo, clearError } = driverSlice.actions;

// // Selectors
// export const selectDrivers = (state: RootState) => state.driver.drivers;
// export const selectSelectedDriver = (state: RootState) => state.driver.selectedDriver;
// export const selectDriverInfo = (state: RootState) => state.driver.driverInfo;
// export const selectDriverLoading = (state: RootState) => state.driver.loading;
// export const selectDriverError = (state: RootState) => state.driver.error;

// export default driverSlice.reducer;
