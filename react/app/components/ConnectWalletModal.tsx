import { Box, Modal, Typography, Button } from "@mui/material";
import { useUserContext } from "../hooks/useUserContext";
import Image from "next/image";
import { useState } from "react";
import phantomIcon from "../assets/phantom.svg";
import styles from "./ConnectWalletModal.module.scss";

export default function ConnectWalletModal() {
  const { login } = useUserContext();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage("");

    try {
      if (!window.phantom?.ethereum) {
        setErrorMessage("Phantom wallet is not installed. Please install it first.");
        window.open("https://phantom.app/download", "_blank");
        return;
      }

      await login();
    } catch (error: any) {
      console.error("Connection error:", error);
      setErrorMessage(error.message || "Failed to connect to wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Modal open={true} aria-labelledby="connect-wallet-modal" aria-describedby="connect-wallet-modal-description" className={styles.connectDialog}>
      <Box className={styles.modal}>
        <Typography variant="h1" className={styles.modalTitle}>
          WELCOME
        </Typography>

        <Typography className={styles.modalDescription}>Connect your wallet to use the platform</Typography>

        <Button variant="contained" onClick={handleConnect} disabled={isConnecting} className={styles.modalButton}>
          <Box className={styles.modalButtonContent}>
            <Image src={phantomIcon} alt="Phantom" width={24} height={24} />
            <span>Connect with Phantom</span>
          </Box>
        </Button>

        {errorMessage && <Typography className={styles.modalError}>{errorMessage}</Typography>}

        <Box className={styles.modalHelp}>
          <span>I'm new to Crypto, </span>
          <a href="https://phantom.app/learn/beginners-guide" target="_blank" rel="noopener noreferrer" className={styles.modalHelpLink}>
            what is a wallet?
          </a>
        </Box>
      </Box>
    </Modal>
  );
}
