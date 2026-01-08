import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

const LS_API = "/notification";
const notificationSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get notifications with optional query
        getNotifications: builder.query({
            query: (query?: Record<string, any>) => ({
                url: LS_API,
                method: "GET",
                params: query || {},
            }),
            providesTags: [TagTypes.notification],
        }),
        // Update details for a specific notification (unchanged)
        updateNotification: builder.mutation({
            query: ({ id, data }: { id: string, data: Record<string, any> }) => ({
                url: `${LS_API}/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TagTypes.notification,
                { type: TagTypes.notification, id }
            ],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useUpdateNotificationMutation,
} = notificationSlice;