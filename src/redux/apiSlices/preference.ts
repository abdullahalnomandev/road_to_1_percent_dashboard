import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/preference";
const preferenceSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getPreferences: builder.query({
            query: ({ query }: { query?: Record<string, any> }) => ({
                url: LS_API,
                params: query || {},
                method: "GET",
            }),
            providesTags: [TagTypes.preference],
        }),
        createPreference: builder.mutation({
            query: (data: Record<string, any>) => ({
                url: LS_API,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TagTypes.preference],
        }),
        updatePreference: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                method: "PATCH",
                url: `${LS_API}/${id}`,
                body: data,
            }),
            invalidatesTags: [TagTypes.preference],
        }),
        deletePreference: builder.mutation({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TagTypes.preference],
        }),
        getPreferenceStatistics: builder.query({
            query: () => ({
                url: `${LS_API}/statistics`,
                method: "GET",
            }),
            providesTags: [TagTypes.preference],
        }),
    }),
});

export const {
    useGetPreferencesQuery,
    useCreatePreferenceMutation,
    useUpdatePreferenceMutation,
    useDeletePreferenceMutation,
    useGetPreferenceStatisticsQuery,
} = preferenceSlice;