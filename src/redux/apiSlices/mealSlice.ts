import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/meal";
const mealSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all meals (with optional query)
        getMeals: builder.query({
            query: ({ query }: { query?: Record<string, any> }) => ({
                url: LS_API + "/all",
                params: query || {},
                method: "GET",
            }),
            providesTags: [TagTypes.meal],
        }),
        // Get details for a single meal
        getMealDetails: builder.query({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: TagTypes.meal, id }],
        }),
        // Create a new meal
        createMeal: builder.mutation({
            query: (formData: FormData) => ({
                url: LS_API,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [TagTypes.meal],
        }),
        // Update details for a specific meal
        updateMeal: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                url: `${LS_API}/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TagTypes.meal,
                { type: TagTypes.meal, id }
            ],
        }),
        // Delete a meal
        deleteMeal: builder.mutation({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TagTypes.meal],
        }),
    }),
});

export const {
    useGetMealsQuery,
    useGetMealDetailsQuery,
    useCreateMealMutation,
    useUpdateMealMutation,
    useDeleteMealMutation
} = mealSlice;