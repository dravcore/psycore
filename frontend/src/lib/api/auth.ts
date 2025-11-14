import axiosInstance from '../axios';

export interface UpdateProfileData {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ANALYST' | 'ADMIN';
}

const authApi = {
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },
};

export default authApi;
