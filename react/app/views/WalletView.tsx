import { Box, Typography } from "@mui/material";
import { useUserContext } from "../../app/hooks/useUserContext";

export default function WalletView() {
  const { walletAddress, activeNetwork } = useUserContext();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: "white", mb: 3 }}>
        Wallet
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ color: "white" }}>
          Address: {walletAddress}
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          Network: {activeNetwork.name}
        </Typography>
      </Box>
      {/* Add your wallet components here */}
    </Box>
  );
}
