import { ApolloCache, gql } from "@apollo/client";
import { PlusSquareIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  UpdatePostMutation,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";
import { withApollo } from "../../../utils/withApollo";
import { useDropzone } from "react-dropzone";

const updateAfter = (
  values: {
    title: string;
    text: string;
    image: string | null | undefined;
    postId: number;
  },
  cache: ApolloCache<UpdatePostMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    text: string;
    title: string;
    image: string | null;
  }>({
    id: "Post:" + values.postId,
    fragment: gql`
      fragment _ on Post {
        id
        text
        title
        image
      }
    `,
  });

  if (data) {
    cache.writeFragment({
      id: "Post:" + values.postId,
      fragment: gql`
        fragment __ on Post {
          text
          title
          image
        }
      `,
      data: { ...values },
    });
  }
};

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: { id: intId },
  });
  const [updatePost] = useUpdatePostMutation();

  const [fileToUpload, setFileToUpload] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const onDrop = useCallback(
    (file) => {
      setFileToUpload(file[0]);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file[0]));
    },
    [updatePost]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const dropText = isDragActive
    ? "Drop the files here ..."
    : "Drag 'n' drop .torrent file here, or click to select files";

  const activeBg = useColorModeValue("gray.100", "gray.600");
  const borderColor = useColorModeValue(
    isDragActive ? "teal.300" : "gray.300",
    isDragActive ? "teal.500" : "gray.500"
  );

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
    <Layout variant="small">
      <Head>
        <title>Update Post - {data.post.title} - Ternoa - Test</title>
      </Head>

      <Center
        p={10}
        mb={4}
        cursor="pointer"
        bg={isDragActive ? activeBg : "transparent"}
        _hover={{ bg: activeBg }}
        transition="background-color 0.2s ease"
        borderRadius={4}
        border="3px dashed"
        borderColor={borderColor}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <PlusSquareIcon mr={2} />
        <p>{dropText}</p>
      </Center>

      <Image maxW={"100px"} mb={4} src={previewUrl || data.post.image || ""} />
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({
            variables: { id: intId, image: fileToUpload, ...values },
            update: (cache) => {
              updateAfter(
                {
                  image: fileToUpload
                    ? `http://localhost:4000/images/${fileToUpload.name}`
                    : data.post?.image,
                  postId: intId,
                  ...values,
                },
                cache
              );
            },
          });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="Title"
            ></InputField>
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Text"
                height={200}
              ></InputField>
            </Box>

            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="purple"
            >
              update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
