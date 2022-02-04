import { ApolloClient, InMemoryCache } from "@apollo/client";
import { withApollo as createWithApollo } from "next-apollo";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";
import { isServer } from "./isServer";
import { createUploadLink } from "apollo-upload-client";

const createClient = (ctx: NextPageContext | undefined) =>
  new ApolloClient({
    link: createUploadLink({
      uri: "http://localhost:4000/graphql",
      headers: {
        cookie: (isServer() ? ctx?.req?.headers.cookie : undefined) || "",
      },
      fetch,
      fetchOptions: { credentials: "include" },
    }),
    /* uri: "http://localhost:4000/graphql",
    credentials: "include",
    headers: {
      cookie: (isServer() ? ctx?.req?.headers.cookie : undefined) || "",
    }, */
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
