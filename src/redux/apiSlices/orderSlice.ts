import { api } from "../api/baseApi";

const LS_API = "/store";
const orderSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: ({ query }: { query?: Record<string, any> } = {}) => ({
                url: `${LS_API}/all-order`,
                params: query || {},
                method: "GET",
            }),
        }),
        getOrderHistory: builder.query({
            query: ({ id }: { id: string }) => ({
                url: `${LS_API}/order-history/${id}`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderHistoryQuery,
} = orderSlice;