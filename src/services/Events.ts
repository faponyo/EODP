import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";
import {buildQueryParam} from "./CheckIn.ts";


const API_URL = `${config.API_URL}/events`


function eventService() {
    return {
        createEvents(data: never) {


            return HttpClient.post(API_URL,
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },
        getEventsPaginated: (page: number, size: number,eventId: never) => {
            return HttpClient.get(API_URL, {
                params: buildQueryParam(page, size, undefined, undefined,eventId)
            })
        },



        getEventsWithVouchers: () => {
            return HttpClient.get(API_URL + '/checkedIn/has-vouchers')
        },

        getEventsWithAttendees: () => {
            return HttpClient.get(API_URL + '/checkedIn')
        },

        getEventsByStatus: (status: never) => {
            return HttpClient.get(API_URL + '/' + status)
        },




        approveEvent(data: { id: string; remarks: string; approved: boolean }) {
            return HttpClient.post(API_URL + "/approveEvent",
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        }
    }
}

export default eventService()
