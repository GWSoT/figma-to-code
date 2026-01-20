import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFigmaAuthUrlFn,
  updateFigmaAccountLabelFn,
  setDefaultFigmaAccountFn,
  disconnectFigmaAccountFn,
} from "~/fn/figma-accounts";
import { getFigmaAccountsQuery } from "~/queries/figma-accounts";
import { authClient } from "~/lib/auth-client";

/**
 * Hook to get all Figma accounts for the current user
 */
export function useFigmaAccounts() {
  const { data: session } = authClient.useSession();

  return useQuery({
    ...getFigmaAccountsQuery(),
    enabled: !!session?.user,
  });
}

/**
 * Hook to initiate Figma OAuth connection
 */
export function useConnectFigma() {
  return useMutation({
    mutationFn: async () => {
      const result = await getFigmaAuthUrlFn();
      return result.url;
    },
    onSuccess: (url) => {
      // Redirect to Figma OAuth page
      window.location.href = url;
    },
    onError: () => {
      toast.error("Failed to start Figma connection");
    },
  });
}

/**
 * Hook to update a Figma account's label
 */
export function useUpdateFigmaAccountLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { accountId: string; label?: string }) =>
      updateFigmaAccountLabelFn({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma-accounts"] });
      toast.success("Account label updated");
    },
    onError: () => {
      toast.error("Failed to update account label");
    },
  });
}

/**
 * Hook to set a Figma account as default
 */
export function useSetDefaultFigmaAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      setDefaultFigmaAccountFn({ data: { accountId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma-accounts"] });
      toast.success("Default account updated");
    },
    onError: () => {
      toast.error("Failed to set default account");
    },
  });
}

/**
 * Hook to disconnect a Figma account
 */
export function useDisconnectFigmaAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      disconnectFigmaAccountFn({ data: { accountId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma-accounts"] });
      toast.success("Figma account disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect Figma account");
    },
  });
}
