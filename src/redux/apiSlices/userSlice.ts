import { api } from "../api/baseApi";

const userSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: ({query}:{query?:Record<string, any>}) => {
                return {
                    url: "/user",
                    params: query || {},
                    method: "GET",
                };
            },
        }),
        changeStatusUser: builder.mutation({
            query: ({id}:{id:string}) => {
                return {
                    method: "PATCH",
                    url: `/user/${id}`,
                };
            },
        }),
        updateUser: builder.mutation({
            query: (formData: FormData) => {
                return {
                    method: "PATCH",
                    url: `/user/profile`,
                    body: formData,
                    formData: true,
                };
            },
        }),
        changePassword: builder.mutation({
            query: ({
                currentPassword,
                newPassword,
                confirmPassword,
            }: {
                currentPassword: string;
                newPassword: string;
                confirmPassword: string;
            }) => {
                return {
                    method: "PATCH",
                    url: `/auth/change-password`,
                    body: {
                        currentPassword,
                        newPassword,
                        confirmPassword,
                    },
                    // no formData
                };
            },
        }),

        getHosts: builder.query({
            query: ({query}:{query?:string}) => {
                return {
                    url: "/user/host?"+query,
                };
            },
        }),
        getStatistics: builder.query({
            query: () => {
                return {
                    url: "/user/statistics",
                    method: "GET",
                };
            },
        }),
        getEarningStatistics: builder.query({
            query: ({year}:{year?:string}) => {
                return {
                    url: "/user/user-earning?year="+year,
                    method: "GET",
                };

            },
        }),
        getUserStatistics: builder.query({
            query: ({year}:{year?:string}) => {
                return {
                    url: "/user/user-statistics?year="+year,
                    method: "GET",
                };
            },
        }),
    }),
});
export const {useGetUsersQuery, useChangeStatusUserMutation,useGetHostsQuery, useGetStatisticsQuery, useGetEarningStatisticsQuery, useGetUserStatisticsQuery, useUpdateUserMutation,useChangePasswordMutation } = userSlice;