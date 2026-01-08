import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/gym-and-fitness-plan";
const gymAndFitnessSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getGymAndFitnessPlans: builder.query({
            query: ({ query }: { query?: Record<string, any> }) => ({
                url: LS_API,
                params: query || {},
                method: "GET",
            }),
            providesTags: [TagTypes.gymAndFitnessPlan],
        }),
        createGymAndFitnessPlan: builder.mutation({
            query: (formData: FormData) => ({
                url: LS_API,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [TagTypes.gymAndFitnessPlan],
        }),
        updateGymAndFitnessPlan: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                method: "PATCH",
                url: `${LS_API}/${id}`,
                body: data,
            }),
            invalidatesTags: [TagTypes.gymAndFitnessPlan],
        }),
        deleteGymAndFitnessPlan: builder.mutation({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TagTypes.gymAndFitnessPlan],
        }),
    }),
});

export const {
    useGetGymAndFitnessPlansQuery,
    useCreateGymAndFitnessPlanMutation,
    useUpdateGymAndFitnessPlanMutation,
    useDeleteGymAndFitnessPlanMutation
} = gymAndFitnessSlice;