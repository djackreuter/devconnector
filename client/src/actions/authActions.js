import { TEST_DISPATCH } from './types';

export const registerUser = (data) => ({
  type: TEST_DISPATCH,
  payload: data
});