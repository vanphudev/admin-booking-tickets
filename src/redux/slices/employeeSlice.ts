import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@/pages/users/employee/entity';

const initialState: {
   employees: Employee[];
   loading: boolean;
   error: string | null;
} = {
   employees: [],
   loading: false,
   error: null,
};

const employeeSlice = createSlice({
   name: 'employee',
   initialState,
   reducers: {
      setEmployeeSlice: (state, action: PayloadAction<Employee[]>) => {
         state.employees = action.payload;
      },
      clearEmployee: (state) => {
         state.employees = [];
      },
   },
});

export const { setEmployeeSlice, clearEmployee } = employeeSlice.actions;
export const employeeReducer = employeeSlice.reducer;
