import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Select, MenuItem, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { useUserContext } from "../hooks/useUserContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const pathname = usePathname();
  const { networks, activeNetwork, isLoggedIn, truncatedAddress, setActiveNetwork, logout } = useUserContext();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const navigationItems = [
    { path: "/", text: "Chat", icon: "mdi-home" },
    { path: "/wallet", text: "Wallet", icon: "mdi-wallet" },
  ];

  const getIconColor = (path: string) => {
    if (pathname === path) return "#FFFFFF";
    if (hoveredPath === path) return "rgba(255, 255, 255, 0.8)";
    return "#505050";
  };

  const handleNetworkChange = async (event: any) => {
    const networkId = event.target.value;
    await setActiveNetwork(networkId);
  };

  const handleLogout = () => {
    logout();
  };

  const getActiveItemIndex = navigationItems.findIndex((item) => item.path === pathname);
  const indicatorStyle = {
    transform: `translateY(${getActiveItemIndex * 56 + 8}px)`,
  };

  return (
    <Drawer variant="permanent" anchor="left" className={styles.sidebar}>
      <Box className={styles.logo}>
        <Image src="/logo.svg" alt="Logo" width={24} height={24} className={styles.logoIcon} />
        <Typography className={styles.logoText}>
          Crypto<span className={styles.logoTextBold}>Chat</span>
        </Typography>
      </Box>

      <Box className={styles.nav}>
        <Box className={styles.navActiveIndicator} style={indicatorStyle} />
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <Link href={item.path} className={styles.navItem}>
                <ListItemButton
                  className={`${styles.navLink} ${pathname === item.path ? styles.navItemActive : ""}`}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                >
                  <ListItemIcon className={styles.navIcon}>
                    <Typography className={styles.styledIcon} style={{ color: getIconColor(item.path) }}>
                      {item.icon}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary={item.text} className={styles.navText} style={{ color: pathname === item.path ? "#fff" : "#505050" }} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>

      {isLoggedIn && (
        <Box className={styles.footer}>
          <Box className={styles.networkSelect}>
            <Select value={activeNetwork.id} onChange={handleNetworkChange} fullWidth className={styles.networkSelectField}>
              {networks.map((network) => (
                <MenuItem key={network.id} value={network.id} className={styles.networkSelectItem}>
                  <Box className={styles.networkSelectValue}>
                    <Image src={network.icon} alt={network.name} width={24} height={24} className={styles.networkSelectIcon} />
                    <Typography>{network.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>

            <Typography className={styles.walletAddress}>Connected: {truncatedAddress}</Typography>

            <Box className={styles.footerMenu}>
              <ListItemButton onClick={handleLogout} className={styles.footerMenuButton}>
                <ListItemIcon className={styles.footerMenuIcon}>
                  <Typography className={styles.styledIcon}>mdi-logout</Typography>
                </ListItemIcon>
                <ListItemText primary="Log Out" className={styles.footerMenuText} />
              </ListItemButton>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
