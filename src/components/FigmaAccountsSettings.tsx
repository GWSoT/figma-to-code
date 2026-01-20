import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Figma, Plus, Star, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "~/components/ui/panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import {
  useFigmaAccounts,
  useConnectFigma,
  useUpdateFigmaAccountLabel,
  useSetDefaultFigmaAccount,
  useDisconnectFigmaAccount,
} from "~/hooks/useFigmaAccounts";
import type { FigmaAccountPublic } from "~/data-access/figma-accounts";

function FigmaAccountCard({
  account,
  onSetDefault,
  onDisconnect,
  isSettingDefault,
  isDisconnecting,
}: {
  account: FigmaAccountPublic;
  onSetDefault: () => void;
  onDisconnect: () => void;
  isSettingDefault: boolean;
  isDisconnecting: boolean;
}) {
  const [label, setLabel] = useState(account.label || "");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const updateLabel = useUpdateFigmaAccountLabel();

  const handleSaveLabel = () => {
    updateLabel.mutate(
      { accountId: account.id, label: label || undefined },
      {
        onSuccess: () => setIsEditingLabel(false),
      }
    );
  };

  const isTokenExpired = new Date(account.accessTokenExpiresAt) < new Date();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        {/* Figma avatar */}
        <div className="relative">
          {account.figmaImgUrl ? (
            <img
              src={account.figmaImgUrl}
              alt={account.figmaHandle || account.figmaEmail}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Figma className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {account.isDefault && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isEditingLabel ? (
              <div className="flex items-center gap-2">
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Account label"
                  className="h-7 w-40"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveLabel}
                  disabled={updateLabel.isPending}
                >
                  {updateLabel.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingLabel(true)}
                className="font-medium hover:text-primary transition-colors text-left"
              >
                {account.label || account.figmaHandle || "Figma Account"}
              </button>
            )}
            {account.isDefault && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
            {isTokenExpired && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{account.figmaEmail}</p>
          {account.figmaHandle && (
            <p className="text-xs text-muted-foreground">@{account.figmaHandle}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!account.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSetDefault}
            disabled={isSettingDefault}
          >
            {isSettingDefault ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Star className="w-4 h-4 mr-1" />
                Set Default
              </>
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Figma Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect this Figma account? You can
                reconnect it at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDisconnect}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDisconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function FigmaAccountsSettings() {
  const { data: accounts, isLoading } = useFigmaAccounts();
  const connectFigma = useConnectFigma();
  const setDefault = useSetDefaultFigmaAccount();
  const disconnect = useDisconnectFigmaAccount();

  // Handle OAuth callback messages
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const figmaSuccess = searchParams.get("figma_success");
  const figmaError = searchParams.get("figma_error");

  useEffect(() => {
    if (figmaSuccess === "true") {
      toast.success("Figma account connected successfully!");
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("figma_success");
      window.history.replaceState({}, "", url.toString());
    }
    if (figmaError) {
      toast.error(`Failed to connect Figma: ${figmaError}`);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("figma_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [figmaSuccess, figmaError]);

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center justify-between w-full">
          <PanelTitle className="flex items-center gap-2">
            <Figma className="h-5 w-5" />
            Figma Accounts
          </PanelTitle>
          <Button
            onClick={() => connectFigma.mutate()}
            disabled={connectFigma.isPending}
            size="sm"
          >
            {connectFigma.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Connect Figma
          </Button>
        </div>
      </PanelHeader>
      <PanelContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => (
              <FigmaAccountCard
                key={account.id}
                account={account}
                onSetDefault={() => setDefault.mutate(account.id)}
                onDisconnect={() => disconnect.mutate(account.id)}
                isSettingDefault={setDefault.isPending}
                isDisconnecting={disconnect.isPending}
              />
            ))}
            <p className="text-xs text-muted-foreground mt-4">
              Connect multiple Figma accounts for agencies or teams. The default
              account will be used automatically when accessing Figma designs.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Figma className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Figma accounts connected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Figma account to import designs and convert them to
              code.
            </p>
            <Button
              onClick={() => connectFigma.mutate()}
              disabled={connectFigma.isPending}
            >
              {connectFigma.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Connect Figma Account
            </Button>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
