import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";


const API_URL = `${config.API_URL}/reports`


function reportsService() {
    return {
        exportData(eventId: any, reportType: any) {
            return HttpClient.get(API_URL + `/export/${eventId}?reportType=${reportType}`,

                {

                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    responseType: "arraybuffer",
                }
            );

        },
    }
}

export default reportsService()
