import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const plan = user?.subscription?.plan ?? 'FREE';

  return {
    plan,
    isPro: plan === 'PRO' || plan === 'GYM',
    isGym: plan === 'GYM',
    aiEnabled: user?.subscription?.aiAnalysisEnabled ?? false,
  };
}
