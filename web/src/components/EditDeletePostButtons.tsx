import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonProps {
  id: number;
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
  id,
}) => {
  const [deletePost] = useDeletePostMutation();
  const router = useRouter();

  return (
    <Stack direction={"row"} justifyContent={"space-between"}>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          aria-label="Edit Post"
          icon={<EditIcon />}
        ></IconButton>
      </NextLink>
      <IconButton
        aria-label="Delete Post"
        icon={<DeleteIcon />}
        onClick={async () => {
          await deletePost({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: "Post:" + id });
            },
          });

          router.push("/");
        }}
      ></IconButton>
    </Stack>
  );
};

export default EditDeletePostButton;
