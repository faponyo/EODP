import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";


const API_URL = `${config.API_URL}/util`


function apiUtilityService() {
    return {
        getStaffDetails: (pfNumber:never) => {
            return HttpClient.get(API_URL + '/staffDetails/'+ pfNumber);
        },





    }
}

export default apiUtilityService()
