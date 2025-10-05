import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Message, QueryResponse, pagination } from "../app/types";
import { errorToast, successToast } from "../helper";

type messageListType = {
  messages: { _id: string; messages: Message[] }[];
  pagination: pagination;
};
interface messagesResponse extends QueryResponse<messageListType> {}
interface singleMessageResponse extends QueryResponse<Message> {}

export const messageApi = createApi({
  reducerPath: "message",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/message",
    credentials: "include",
  }),
  tagTypes: ["Message"],

  endpoints: (builder) => ({
    // ✅ Fetch paginated messages
    fetchMessages: builder.query<
      messageListType,
      { roomId: string; page: number; size: number }
    >({
      query: ({ roomId, page, size }) => ({
        url: `/${roomId}?page=${page}&size=${size}`,
        method: "get",
      }),
      transformResponse: (res: messagesResponse) => res?.data,
      providesTags: (result, error, { roomId }) =>
        result
          ? [
              ...result.messages.map(({ _id }) => ({
                type: "Message" as const,
                id: _id,
              })),
              { type: "Message", id: `ROOM-${roomId}` },
            ]
          : [{ type: "Message", id: `ROOM-${roomId}` }],
    }),

    // ✅ Edit message
    editMessage: builder.mutation<
      Message,
      { messageId: string; content: string }
    >({
      query: ({ messageId, content }) => ({
        url: `/${messageId}`,
        method: "put",
        body: { content },
      }),
      transformResponse: (res: singleMessageResponse) => res?.data,
      invalidatesTags: (result, error, { messageId }) => [
        { type: "Message", id: messageId },
      ],
      async onQueryStarted({ messageId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          successToast("Message updated");
        } catch {
          errorToast("Failed to update message");
        }
      },
    }),

    // ✅ Delete message
    deleteMessage: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/${messageId}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: "Message", id: messageId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          successToast("Message deleted");
        } catch {
          errorToast("Failed to delete message");
        }
      },
    }),
    updateMessageStatus: builder.mutation<
      Message,
      { messageId: string; status: "delivered" | "read" }
    >({
      query: ({ messageId, status }) => ({
        url: `/${messageId}/status`,
        method: "put",
        body: { status },
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: "Message", id: messageId },
      ],
    }),
  }),
});

export const {
  useLazyFetchMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useUpdateMessageStatusMutation,
} = messageApi;
