import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/business-and-mindset-plan";
const businessAndMindsetPlanSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessAndMindsetPlans: builder.query({
            query: ({ query }: { query?: Record<string, any> }) => ({
                url: LS_API,
                params: query || {},
                method: "GET",
            }),
            providesTags: [TagTypes.businessAndMindsetPlan],
        }),
        getBusinessAndMindsetPlanDetails: builder.query({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [
                { type: TagTypes.businessAndMindsetPlan, id },
            ],
        }),
        createBusinessAndMindsetPlan: builder.mutation({
            query: (data: Record<string, any>) => ({
                url: LS_API,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TagTypes.businessAndMindsetPlan],
        }),
        updateBusinessAndMindsetPlan: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                method: "PATCH",
                url: `${LS_API}/${id}`,
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [TagTypes.businessAndMindsetPlan],
        }),
        deleteBusinessAndMindsetPlan: builder.mutation({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TagTypes.businessAndMindsetPlan],
        }),
    }),
});

export const {
    useGetBusinessAndMindsetPlansQuery,
    useGetBusinessAndMindsetPlanDetailsQuery,
    useCreateBusinessAndMindsetPlanMutation,
    useUpdateBusinessAndMindsetPlanMutation,
    useDeleteBusinessAndMindsetPlanMutation
} = businessAndMindsetPlanSlice;