import { useApolloClient } from "@apollo/client";
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import ConnectButton from "./ConnectButton";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  let body = null;

  if (loading) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Flex align={"center"}>
        <ConnectButton></ConnectButton>
        <NextLink href={"/login"}>
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href={"/register"}>
          <Link>register</Link>
        </NextLink>
      </Flex>
    );
  } else {
    body = (
      <Flex align={"center"}>
        <ConnectButton></ConnectButton>

        <NextLink href="/create-post">
          <Button
            _hover={{ textDecoration: "none" }}
            colorScheme="purple"
            as={Link}
            mr={4}
            leftIcon={<AddIcon />}
          >
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant={"link"}
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex
      zIndex={1}
      position={"sticky"}
      top={0}
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      p={4}
    >
      <Flex flex={1} m={"auto"} align={"center"} maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>Ternoa - Test</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
