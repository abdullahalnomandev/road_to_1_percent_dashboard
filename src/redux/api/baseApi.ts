import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TagTypesList } from "../tag-types";

// Read API endpoint from Vite environment variable
const baseApiUrl = import.meta.env.VITE_API_END_POINT;

// Note: Only read token at runtime inside baseQuery for SSR/client accuracy
export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: baseApiUrl,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: TagTypesList,
    endpoints: () => ({}),
});

// export const imageUrl = "http://206.189.231.81:5000";
// export const imageUrl = "http://10.10.7.72:5000";
export const imageUrl = baseApiUrl.replace(/\/api\/v1$/, "");

