// function to sign in a user and return their profile data from the api
import api from './Client';
import { User } from '../types';

export const signIn = async (email: string, password: string): Promise<User | false> => {
  try {
    const response = await api.post('/users/login', { email, password });
    
    if (!response.data || !response.data.user) return false;

    const user: User = {
      id: response.data.user.userId,
      email: response.data.user.email,
      role: (response.data.user.role as string)?.toLowerCase(),
      phone: response.data.user.phone,
      firstName: response.data.user.firstName,
      lastName: response.data.user.lastName,
      businessName: response.data.user.businessName,
      joinedAt: response.data.user.joinedAt,
    };

    if (response.data.token) {
      localStorage.setItem('vv_token', response.data.token);
    }

    return user;
  } catch (err) {
    console.error(err);
    return false;
  }
};





