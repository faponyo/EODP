import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";
import {buildQueryParams} from "./Users.ts";


const API_URL = `${config.API_URL}/checkIn`
export const
    buildQueryParam = (page: number, size: number, filterKey: string, filterValue: string, eventId: string) => {

        const query: Record<string, any> = {
            page:page -1,
            size,
        };

        if (filterKey && filterKey !== '') {
            query.filterKey = filterKey;
        }

        if (filterValue) {
            query.filterValue = filterValue;
        }

        if (eventId) {
            query.eventId = eventId;
        }


        return query;
    };

function checkInService() {
    return {
        checkIntoEvent(data: never) {


            return HttpClient.post(API_URL,
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },
        getAttendeesPaginated: (page: number, size: number, eventId:string,selectedFilterBy:string,filterValue:string) => {
            return HttpClient.get(API_URL, {
                params: buildQueryParam(page, size, selectedFilterBy, filterValue,eventId)
            })
        },

        getRecentAttendees: () => {
            return HttpClient.get(API_URL+"/attendees/recent")
        },
        getGeneralStats: () => {
            return HttpClient.get(API_URL+"/stats")
        },
        getVouchersPaginated: (page: number, size: number, eventId: never, selectedFilterBy: never, filterValue: never) => {
            return HttpClient.get(API_URL + "/vouchers", {
                params: buildQueryParam(page, size, selectedFilterBy, filterValue, eventId)
            })
        },


        claimVoucher(data: { itemName: string; itemCount: string, voucherId: number }) {
            return HttpClient.post(API_URL + "/vouchers/claim",
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

        }
    }
}

export default checkInService()
