import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import theme from "../theme";
import { Mainnet, DAppProvider } from "@usedapp/core";

function MyApp({ Component, pageProps }: any) {
  return (
    <DAppProvider
      config={{
        readOnlyChainId: Mainnet.chainId,
        readOnlyUrls: {
          [Mainnet.chainId]:
            "https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934",
        },
      }}
    >
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </DAppProvider>
  );
}

export default MyApp;
