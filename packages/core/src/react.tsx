import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClient } from './client';

const QuanticContext = createContext<ApiClient | null>(null);

export interface QuanticProviderProps {
  client: ApiClient;
  children: ReactNode;
}

export function QuanticProvider({ client, children }: QuanticProviderProps) {
  return (
    <QuanticContext.Provider value={client}>{children}</QuanticContext.Provider>
  );
}

export function useClient(): ApiClient {
  const client = useContext(QuanticContext);
  if (!client) {
    throw new Error('useClient must be used within a <QuanticProvider>');
  }
  return client;
}
