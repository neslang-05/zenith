import Cookies from 'js-cookie';

export const setToken = (token) => {
  Cookies.set('auth_token', token, { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production' 
  });
};

export const getToken = (request) => {
  if (request && request.cookies) {
    // Use the Next.js cookies API for middleware
    if (typeof request.cookies.get === 'function') {
      return request.cookies.get('auth_token')?.value; // For Next.js middleware
    }
    return request.cookies['auth_token']; // For other environments
  }
  return Cookies.get('auth_token'); // For client-side
};

export const signOut = () => {
  Cookies.remove('auth_token');
};

export const createAccount = async (userData) => {
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Account creation failed');
    }

    const { token } = await response.json();
    setToken(token);

    return true;
  } catch (error) {
    console.error('Account creation error', error);
    return false;
  }
};

export default getToken;