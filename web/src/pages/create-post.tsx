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
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";
import { useDropzone } from "react-dropzone";
import { PlusSquareIcon } from "@chakra-ui/icons";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [createPost] = useCreatePostMutation();
  const [fileToUpload, setFileToUpload] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const onDrop = useCallback(
    (file) => {
      setFileToUpload(file[0]);
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file[0]));
    },
    [createPost]
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
  return (
    <Layout variant="small">
      <Head>
        <title>Create Post - Ternoa - Test</title>
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

      {previewUrl.length > 0 && (
        <Image maxW={"100px"} mb={4} src={previewUrl} />
      )}

      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: values, image: fileToUpload },
            update: (cache) => {
              cache.evict({ fieldName: "posts:{}" });
            },
          });
          if (!errors) {
            router.push("/");
          }
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
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
