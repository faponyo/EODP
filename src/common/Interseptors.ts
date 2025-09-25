import axios from 'axios';


import config from "../config.ts";
import authService, {TOKEN_KEY} from "../services/Auth.ts";

// let authToken: null = null;

// export const setAuthToken = (token) => {
//     if (authToken !== token) {
//         authToken = token;
//     }
// };
let navigateFn: ((arg0: string) => void) | null = null;
export const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}
export const setNavigate = (navigate) => {
    navigateFn = navigate;
};
const axiosInstance = axios.create({
    baseURL: config.API_URL,
    timeout: 1200000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const authToken = localStorage.getItem(TOKEN_KEY); // Get the token using a utility function (non-hook based)

        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response) {
            if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {

                // const refreshToken = getCookie('refreshToken');
                //
                // if (refreshToken) {
                originalRequest._retry = true;
                authService.requestRefreshToken()

                    .then((data) => {
                        const {id, type, token} = data;

                        localStorage.setItem(TOKEN_KEY, token);
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axios(originalRequest);


                    })
                    .catch((error) => {
                        // localStorage.removeItem(TOKEN_KEY);
                        // if (navigateFn) {
                        //     navigateFn('/invalid-session');
                        // }

                    })


            } else if (error.response.status === 419 && navigateFn) {
                // navigateFn('/invalid-session');

                // window.location.href = '/invalid-session';
            } else if (error.response.status === 403 && !originalRequest._retry
                && window.location.pathname !== '/login'
                && window.location.pathname !== '/'
            ) {
                // if (navigateFn) {
                //     navigateFn('/login');
                // }
                // clearSession(); // Function to handle session removal (non-hook)
                // window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
