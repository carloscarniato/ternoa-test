import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";
import EditDeletePostButton from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data: meData } = useMeQuery();
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return (
      <div>
        <Head>
          <title>Ternoa - Test</title>
        </Head>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout variant="regular">
      <Head>
        <title>Ternoa - Test</title>
      </Head>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8} align={"center"}>
          {data!.posts.posts.map((p) =>
            !p ? null : (
              <Box
                key={p.id}
                maxW={"445px"}
                w={"full"}
                bg={useColorModeValue("white", "gray.900")}
                boxShadow={"2xl"}
                rounded={"md"}
                p={6}
                overflow={"hidden"}
              >
                <Box
                  h={"210px"}
                  bg={"gray.100"}
                  mt={-6}
                  mx={-6}
                  mb={6}
                  pos={"relative"}
                  overflow={"hidden"}
                >
                  <UpdootSection post={p}></UpdootSection>
                  <Image src={p.image} objectFit={"fill"}></Image>
                </Box>

                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Stack>
                      <Heading
                        color={useColorModeValue("gray.700", "white")}
                        fontSize={"2xl"}
                        fontFamily={"body"}
                      >
                        {p.title}
                      </Heading>
                      <Text color={"gray.500"}>{p.textSnippet + " ..."}</Text>
                    </Stack>
                  </Link>
                </NextLink>
                <Stack mt={6} spacing={4} align={"center"}>
                  <Stack direction={"column"} spacing={4} fontSize={"sm"}>
                    <Text fontWeight={600}>
                      created by {p.creator.username}
                    </Text>
                    {meData?.me?.id !== p.creator.id ? null : (
                      <Box ml={"auto"}>
                        <EditDeletePostButton id={p.id}></EditDeletePostButton>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Box>

              /* <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={p}></UpdootSection>
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>created by {p.creator.username}</Text>
                  <Flex align={"center"}>
                    <Text mt={4}>{p.textSnippet}</Text>
                    {meData?.me?.id !== p.creator.id ? null : (
                      <Box ml={"auto"}>
                        <EditDeletePostButton id={p.id}></EditDeletePostButton>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex> */
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (
                //   previousValue,
                //   { fetchMoreResult }
                // ): PostsQuery => {
                //   if (!fetchMoreResult) {
                //     return previousValue as PostsQuery;
                //   }

                //   return {
                //     __typename: "Query",
                //     posts: {
                //       __typename: "PaginatedPosts",
                //       hasMore: fetchMoreResult.posts.hasMore,
                //       posts: [
                //         ...previousValue.posts.posts,
                //         ...fetchMoreResult.posts.posts,
                //       ],
                //     },
                //   };
                // },
              });
            }}
            m={"auto"}
            isLoading={loading}
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
