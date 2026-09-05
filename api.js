import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000';
const TOKEN_KEY = 'mnemio_token';

export const api = axios.create({ baseURL: API_URL });

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  await setToken(data.access_token);
  return data.user;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  await setToken(data.access_token);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function logout() {
  await clearToken();
}
