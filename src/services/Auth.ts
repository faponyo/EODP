import HttpClient from "../common/httpClient.ts";
import config from "../config.ts";


const API_URL = `${config.API_URL}/auth`

export const TOKEN_KEY = 'EV_X-KEY'


const authService = {
    requestToken(param: { username: string; password: string }) {

        return HttpClient.post(API_URL + '/token', param, {
                headers: {
                    "Content-Type": "application/json",
                }, withCredentials: true // crucial for sending/receiving HttpOnly cookies
            }
        );
    },
    requestRefreshToken() {

        return HttpClient.post(API_URL + '/refresh', {},{
                headers: {
                    "Content-Type": "application/json",
                }, withCredentials: true // crucial for sending/receiving HttpOnly cookies
            }
        );
    },


    // Logout method
    logout: () => {
        return HttpClient.post(API_URL + '/logout', {
                headers: {
                    "Content-Type": "application/json",
                }, withCredentials: true // crucial for sending/receiving HttpOnly cookies
            }
        );
    },




}

export default authService
