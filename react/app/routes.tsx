import ChatView from "./views/ChatView";
import WalletView from "./views/WalletView";

export const routes = [
  {
    path: "/",
    element: <ChatView />,
  },
  {
    path: "/wallet",
    element: <WalletView />,
  },
];
