import { createContext, useState, useCallback, type ReactNode } from "react";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connect: () => void;
  disconnect: () => void;
}

const MOCK_ADDRESS = "0.0.4515612";
const MOCK_BALANCE = 245_320;

export const WalletContext = createContext<WalletState>({
  isConnected: false,
  address: null,
  balance: 0,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => setIsConnected(true), []);
  const disconnect = useCallback(() => setIsConnected(false), []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: isConnected ? MOCK_ADDRESS : null,
        balance: isConnected ? MOCK_BALANCE : 0,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
