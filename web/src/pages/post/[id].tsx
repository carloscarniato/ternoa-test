import { Box, Heading, Image } from "@chakra-ui/react";
import React from "react";
import EditDeletePostButton from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

export const Post = ({}) => {
  const { data, loading } = useGetPostFromUrl();
  const { data: meData } = useMeQuery();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }
  return (
    <Layout>
      <Image mb={4} src={data.post.image} objectFit={"fill"}></Image>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>{data.post.text}</Box>
      {meData?.me?.id !== data.post.creator.id ? null : (
        <Box ml={"auto"}>
          <EditDeletePostButton id={data.post.id}></EditDeletePostButton>
        </Box>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
