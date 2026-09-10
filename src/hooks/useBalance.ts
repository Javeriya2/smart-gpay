import { useState } from 'react';
import { useUserStore } from '../store/userStore';

export const useBalance = () => {
  const { user, refreshBalance } = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isLowBalance = user.balance < 500;
  const isHealthyBalance = user.balance >= 5000;

  return {
    balance: user.balance,
    isRefreshing,
    refreshBalance: handleRefresh,
    isLowBalance,
    isHealthyBalance,
  };
};
