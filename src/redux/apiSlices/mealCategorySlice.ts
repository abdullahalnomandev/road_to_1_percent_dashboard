import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/meal-and-recipe-category";
const mealCategorySlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getMealCategories: builder.query({
            query: ({ query }: { query?: Record<string, any> }) => ({
                url: LS_API,
                params: query || {},
                method: "GET",
            }),
            providesTags: [TagTypes.mealCategory],
        }),
        createMealCategory: builder.mutation({
            query: (formData: FormData) => ({
                url: LS_API,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [TagTypes.mealCategory],
        }),
        updateMealCategory: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                method: "PATCH",
                url: `${LS_API}/${id}`,
                body: data,
            }),
            invalidatesTags: [TagTypes.mealCategory],
        }),
        deleteMealCategory: builder.mutation({
            query: (id: string) => ({
                url: `${LS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TagTypes.mealCategory],
        }),
    }),
});

export const {
    useGetMealCategoriesQuery,
    useCreateMealCategoryMutation,
    useUpdateMealCategoryMutation,
    useDeleteMealCategoryMutation
} = mealCategorySlice;