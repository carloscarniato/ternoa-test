import { ApolloCache, gql } from "@apollo/client";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useMeQuery,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [vote] = useVoteMutation();
  const router = useRouter();
  const { data: meData } = useMeQuery();

  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems={"center"}
      position={"absolute"}
      right={4}
      top={4}
      backgroundColor={"gray.100"}
      borderRadius={"0.5rem"}
    >
      <IconButton
        borderRadius={"0.375rem 0.375rem 0 0"}
        onClick={async () => {
          if (!meData?.me) {
            return router.push("/login");
          }
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "updoot-loading"}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        aria-label="Updoot Post"
        icon={<ChevronUpIcon w={6} h={6} />}
      ></IconButton>

      <Text>{post.points}</Text>
      <IconButton
        borderRadius={"0 0 0.375rem 0.375rem"}
        onClick={async () => {
          if (!meData?.me) {
            return router.push("/login");
          }
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downdoot-loading"}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        aria-label="Downdoot Post"
        icon={<ChevronDownIcon w={6} h={6} />}
      ></IconButton>
    </Flex>
  );
};
