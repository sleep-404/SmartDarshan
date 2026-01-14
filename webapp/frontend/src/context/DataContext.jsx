import { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { data, isConnected } = useWebSocket();

  return (
    <DataContext.Provider value={{ data, isConnected }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
