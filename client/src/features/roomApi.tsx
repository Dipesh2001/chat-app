import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Room, QueryResponse, pagination } from "../app/types";
import { errorToast, successToast } from "../helper";

type responseType = { room: Room; authToken: string };
type responseListType = { rooms: Room[]; pagination: pagination };
interface roomResponse extends QueryResponse<responseType> {}
interface roomsResponse extends QueryResponse<responseListType> {}

export const roomApi = createApi({
  reducerPath: "room",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/room",
    credentials: "include",
  }),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    fetchRooms: builder.query<responseListType, pagination>({
      query: ({ page, size, search }) => ({
        url: `/?page=${page}&size=${size}&search=${search}`,
        method: "get",
      }),
      transformResponse: (res: roomsResponse) => res?.data,
    }),
    fetchRoom: builder.query<responseType, string>({
      query: (roomId: string) => ({
        url: `/${roomId}`,
        method: "get",
      }),
      transformResponse: (res: roomResponse) => res?.data,
    }),
  }),
});

export const { useLazyFetchRoomsQuery, useLazyFetchRoomQuery } = roomApi;
