import {AxiosRequestConfig} from 'axios'

import axiosInstance from "./Interseptors.ts";
import * as _ from "lodash";


const ErrorCodeMessages: { [key: number]: string } = {
    401: 'Access Denied',
    403: 'Access Forbidden',
    404: 'Resource or page not found',
}


function HttpClient() {
    const _errorHandler = (error: any) => {
        //error associated with invalid data excels

        // if (error?.response?.status === 424) {
        //     return Promise.reject(error)
        // }
        //
        //
        // if (error?.response?.status === 401
        // ) {
        //
        //     return Promise.reject('Access Denied')
        // }

        // const {message} = error?.response?.data
        // Extract the error message from the response data
        const errorMessage = error?.response?.data?.data // Check if the `data` field exists in the response
            ? Object.values(error.response.data.data).join(', ') // Join all error messages in the `data` object
            : error?.response?.data?.message || // Fallback to `message` field
            (!error.message ? ErrorCodeMessages[error?.response?.status] : error.message) || // Use predefined error messages

            'An unexpected error occurred' // Default fallback message

        return Promise.reject(errorMessage)
    }

    const _httpClient = axiosInstance

    // _httpClient.interceptors.request.use(
    //     (config) => {
    //         // Get auth token from localStorage
    //         const authToken = localStorage.getItem(TOKEN_KEY); // Get the token using a utility function (non-hook based)
    //         console.log(authToken);
    //
    //         if (authToken) {
    //             config.headers['Authorization'] = `Bearer ${authToken}`;
    //         }
    //
    //         // Add request timestamp for debugging
    //         config.metadata = {startTime: new Date()};
    //
    //         return config;
    //
    //
    //     },
    //     (error) => {
    //         return Promise.reject(error)
    //     }
    // )

    _httpClient.interceptors.response.use((response) => {


            // Log response time in development
            if (import.meta.env.DEV && response.config.metadata) {
                const endTime = new Date();
                const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
                console.log(`API Request to ${response.config.url} took ${duration}ms`);
            }

            const contentType = response.headers['content-type'] || '';
            //
            // if (response.data instanceof ArrayBuffer) {
            //     const decoder = new TextDecoder('utf-8');
            //     const text = decoder.decode(response.data);
            //     return JSON.parse(text);
            // }

            if (contentType.includes('application/json')) {
                // If the response is JSON, parse and return it

                try {
                    const decoder = new TextDecoder('utf-8');
                    const text = decoder.decode(response.data);
                    return JSON.parse(text);
                } catch (err) {
                    return response.data
                }
            }


            return response.data
        }, (error) => {
            if (error.request) {
                if ((error.request.status == 400 || error.request.status == 500)
                    && error.request.responseType === 'arraybuffer') {
                    try {
                        const decoder = new TextDecoder('utf-8');
                        const text = decoder.decode(error.request.response);
                        const response = JSON.parse(text);
                        if (!_.isNil(response?.message)) {
                            return Promise.reject(response?.message);
                        }

                        return Promise.reject(response);
                    } catch (err) {

                    }
                }

            }

            if (error.response) {
                // Extract HTTP 424 and return it instead of routing to error handler
                if (error.response.status === 424) {

                    return Promise.reject(error.response); // Return response directly
                } else if (error.response.status === 400 || error.response.status === 500) {
                    return Promise.reject(error?.response?.data?.message); // Return message

                }
            }

            // Handle common error scenarios
            if (error.response) {
                // Server responded with error status
                const {status, data} = error.response;

                switch (status) {
                    case 401:
                        // Unauthorized - redirect to login
                        // localStorage.removeItem('currentUser');
                        // window.location.href = '/login';
                        break;
                    case 403:
                        // Forbidden - show access denied message
                        console.error('Access denied:', data.message || 'Insufficient permissions');
                        break;
                    case 404:
                        // Not found
                        console.error('Resource not found:', error.config.url);
                        break;
                    case 500:
                        // Server error
                        console.error('Server error:', data.message || 'Internal server error');
                        break;
                    default:
                        console.error('API Error:', data.message || error.message);
                }
            } else if (error.request) {
                // Network error
                console.error('Network error:', error.message);
            } else {
                // Other error
                console.error('Request error:', error.message);
            }


            // Call the global error handler for other errors
            return _errorHandler(error);

        }

        // _errorHandler
    );

    // Helper to merge headers
    const mergeHeaders = (
        config: AxiosRequestConfig,
        customHeaders?: Record<string, string>
    ) => {
        return {
            ...config,
            headers: {
                ...config.headers,
                ...(customHeaders || {}), // Merge custom headers
            },
        }
    }

    return {
        getAlt2: (
            url: string,
            config: AxiosRequestConfig = {},
            headers?: Record<string, string>
        ) => _httpClient.get(url, mergeHeaders(config, headers)),
        get: (url: string, config = {}) => _httpClient.get(url, config),
        post: (url: string, data?: any, config = {}) => {
            return _httpClient.post(url, data, config)
        },
        patch: (url: string, config = {}) => _httpClient.patch(url, config),
        put: (url: string, config = {}, p0: { headers: { "Content-Type": string } }) => _httpClient.put(url, config),
        delete: (url: string, config = {}) => _httpClient.delete(url, config),
        client: _httpClient,
    }
}

export default HttpClient()
