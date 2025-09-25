import config from "../config.ts";
import HttpClient from "../common/httpClient.ts";



const API_URL = `${config.API_URL}/users`
export const buildQueryParams = (page: number, size: number, filterKey: any, filterValue: any) => {

    const query: Record<string, any> = {
        page: page-1,
        size,
    };

    if (filterKey && filterKey !=='') {
        query.filterKey = filterKey;
    }

    if (filterValue) {
        query.filterValue = filterValue;
    }


    return query;
};


function apiUserService() {
    return {
        getUserGroups: () => {
            return HttpClient.get(API_URL + '/usergroups');
        },


        createUser(data: never) {


            return HttpClient.post(API_URL,
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },

        approveUser(data: never) {


            return HttpClient.post(API_URL+'/approval',
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },

        manageUser(data: never) {


            return HttpClient.post(API_URL+'/manage',
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },

        assignUserEvents(data: never) {


            return HttpClient.post(API_URL+'/assign-events',
                data, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },

        updatePassword(currentPassword: string, newPassword: string) {


            return HttpClient.post(API_URL+'/update-password',
                {currentPassword: currentPassword, newPassword: newPassword}, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
        },

        getUsersPaginated: (page: number, size: number, filterKey: any, filterValue: any) => {
            return HttpClient.get(API_URL, {
                params: buildQueryParams(page, size, filterKey, filterValue)
            })
        },


    }
}

export default apiUserService()
