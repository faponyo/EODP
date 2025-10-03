import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";
import {buildQueryParam} from "./CheckIn.ts";
import {buildQueryParams} from "./Users.ts";


const API_URL = `${config.API_URL}/subsidiaries`


function subsidiaryService() {
    return {
        createSubsidiary(data: { name: string; code: string; description: string }) {


            return HttpClient.post(API_URL,
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },
        getSubsidiaryPaginated: (page: number, size: number) => {
            return HttpClient.get(API_URL, {
                params: buildQueryParam(page, size, undefined, undefined, undefined)
            })
        },

        getSubsidiaries: () => {
            return HttpClient.get(API_URL + '/non-paginated')
        },

        approveSubsidiary(data: { id: string; remarks: string; approved: boolean }) {

            return HttpClient.post(API_URL + "/approve",
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },


        uploadEmployees(id: string, newEmployees: {
            pfNumber: string;
            name: string;
            email: string;
            department: string
        }[]) {
            return HttpClient.post(API_URL + "/employees/upload?subsidiaryId=" + id, newEmployees
                , {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },
        getSubsidiarySubsidiaryPaginated(page: number, pageSize: number, subsidiaryId: number, filterBy: any, filterValue: any) {
            return HttpClient.get(API_URL + '/employees/' + subsidiaryId, {
                params: buildQueryParams(page, pageSize, filterBy, filterValue)
            })

        }
    }
}

export default subsidiaryService()
