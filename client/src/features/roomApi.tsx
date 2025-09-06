import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Room, QueryResponse } from "../app/types";
import { errorToast, successToast } from "../helper";

type responseType = { room: Room; authToken: string };
interface roomResponse extends QueryResponse<responseType> {}
interface roomsResponse extends QueryResponse<{ rooms: Room[] }> {}

export const userApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/user",
    credentials: "include",
  }),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    fetchRooms: builder.query<
      Room[],
      { page: number; size: number; search: string }
    >({
      query: ({ page, size, search }) => ({
        url: `/fetch?page=${page}&size=${size}&search=${search}`,
        method: "get",
      }),
      transformResponse: (res: roomsResponse) => res?.data,
    }),
  }),
});

export const { useLazyFetchRoomsQuery } = userApi;
