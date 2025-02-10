import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { authStore } from '~/lib/stores/authStore';

const apiUrl: any = import.meta.env.VITE_API_URL + '/api';

export async function fetchUserData(token: any) {
  if (validateToken(token)) {
    try {
      authStore.setKey('isLoading', true);

      const response = await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if(response.status === 401){
        authStore.setKey('hasAccess', false);
        authStore.setKey('isLoading', false);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: any = await response.json();

      // Update the store with user data and the token
      authStore.setKey('user', userData);
      Cookies.set('userCsai', JSON.stringify(userData), { path: '/', secure: false });
      authStore.setKey('isLoading', false);
      authStore.setKey('hasAccess', true);
      authStore.setKey('accessToken', token);
    } catch (err: any) {
      authStore.setKey('error', err.message);
      authStore.setKey('isLoading', false);
    }
  }
}

export const getTokendetails = async () => {
  try {
    const response = await fetch(`${apiUrl}/token`, {
      method: 'GET',
      credentials: 'include', // Ensures cookies are sent with the request
      headers: {
        Accept: 'application/json',
      },
    });
    
    const output: any = await response.json();

    if (output.status) {
      authStore.setKey('hasAccess', true);
      authStore.setKey('accessToken', output.accessToken);
      Cookies.set('csai_access_token', output.data.accessToken, { path: '/', secure: false });
      Cookies.set('csai_refresh_token', output.data.refreshToken, { path: '/', secure: false });
      await fetchUserData(output.data.accessToken);
    } else {
      authStore.setKey('hasAccess', false);
      authStore.setKey('isLoading', false);
    }
  } catch (error) {
    console.log('error', error);
  }
};

export const isUserLoggedIn = async () => {
  try {
    const response = await fetch(`${apiUrl}/fetchuser`, {
      method: 'GET',
      credentials: 'include', // Ensures cookies are sent with the request
      headers: {
        Accept: 'application/json',
      },
    });
    const userData: any = await response.json();
    Cookies.set('userCsai', JSON.stringify(userData.data), { path: '/', secure: false });
    authStore.setKey('user', userData);
    authStore.setKey('isLoading', false);
    authStore.setKey('hasAccess', true);
  } catch (error) {
    console.log('error', error);
  }
};

export const validateToken = (token: any) => {
  if (!token) {
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;

    // Current time in seconds
    return decoded.exp > now; // Returns true if the token is valid (not expired)
  } catch (error) {
    console.log('error', error);
    return false; // Invalid token format
  }
};

export const updateToken = async (inputData: any) => {
  try {
    const response = await fetch(`${apiUrl}/updatetokens`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + Cookies.get('csai_access_token'),
        'Content-Type': 'application/json', // Add this header
      },
      body: JSON.stringify(inputData),
    });
    if(response.status === 401){
      authStore.setKey('hasAccess', false);
      authStore.setKey('isLoading', false);
    }
    const output: any = await response.json();
    Cookies.set('userCsai', JSON.stringify(output.userDetails), { path: '/', secure: false });
    authStore.setKey('user', output.userDetails);
  } catch (error) {
    console.log('error', error);
  }
};
