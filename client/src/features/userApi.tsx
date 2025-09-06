import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User, QueryResponse } from "../app/types";
import { errorToast, successToast } from "../helper";

type responseType = { user: User; authToken: string };

interface userResponse extends QueryResponse<responseType> {}
interface usersResponse extends QueryResponse<{ users: User[] }> {}

export const userApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/user",
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation<responseType, Partial<User>>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body: body,
      }),
      transformResponse: (res: userResponse) => res?.data,
    }),
    fetchUsers: builder.query<
      User[],
      { page: number; size: number; search: string }
    >({
      query: ({ page, size, search }) => ({
        url: `/fetch?page=${page}&size=${size}&search=${search}`,
        method: "get",
      }),
      transformResponse: (res: { users: User[] }) => res?.data,
    }),
    loginUser: builder.mutation<responseType, Partial<User>>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["User"],
      transformResponse: (res: userResponse) => {
        console.log({ res });
        if (res.success) {
          console.log("here");
          successToast(res.message || "User logged in successfully.");
        } else {
          errorToast(res.message || "Something went wrong.");
        }
        return res.data;
      },
    }),
    logoutUser: builder.mutation<responseType, void>({
      query: () => "/logout",
      invalidatesTags: ["User"],
    }),
    validateUser: builder.query<responseType, void>({
      query: () => "/validate-auth",
      providesTags: ["User"],
      transformResponse: (res: userResponse) => res?.data,
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useValidateUserQuery,
  useLogoutUserMutation,
  useLazyFetchUsersQuery,
} = userApi;
