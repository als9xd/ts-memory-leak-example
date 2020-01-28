import { createSlice } from './createSlice';

export const testSlice = createSlice({
  name: 'test',
  initialState: null as Element | null,
  reducers: {
    load: (state) => {
      return null;
    },
  },
});