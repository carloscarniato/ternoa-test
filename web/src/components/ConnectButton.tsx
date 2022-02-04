import { Button, Box, Text, Link, Flex } from "@chakra-ui/react";
import { useEthers, useEtherBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

export default function ConnectButton() {
  const { activateBrowserWallet, account } = useEthers();
  const etherBalance = useEtherBalance(account);

  function handleConnectWallet() {
    activateBrowserWallet();
  }

  return account ? (
    <Flex
      align={"center"}
      backgroundColor={"purple.500"}
      borderRadius={"xl"}
      px={0}
      mr={4}
    >
      <Box px="3">
        <Text color={"white"} fontSize="md">
          {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH
        </Text>
      </Box>
      <Button
        bg="purple.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "purple.400",
          backgroundColor: "purple.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium">
          {account &&
            `${account.slice(0, 6)}...${account.slice(
              account.length - 4,
              account.length
            )}`}
        </Text>
      </Button>
    </Flex>
  ) : (
    <Button mr={4} colorScheme="purple" onClick={handleConnectWallet}>
      Connect to a wallet
    </Button>
  );
}
