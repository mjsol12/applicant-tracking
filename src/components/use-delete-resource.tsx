"use client";

import * as React from "react";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/patterns/dialog";

type ErrorBody = { error?: string };

type UseDeleteResourceOptions = {
  confirmMessage?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmCancelLabel?: string;
  confirmActionLabel?: string;
  failedMessage?: string;
  networkMessage?: string;
  onSuccess?: () => void;
};

type UseDeleteResourceReturn = {
  pending: boolean;
  confirmDialog: ReactNode;
  deleteById: (rowId: string) => Promise<void>;
};

export function useDeleteResource(
  endpoint: string,
  options: UseDeleteResourceOptions = {},
): UseDeleteResourceReturn {
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmResolver = useRef<((confirmed: boolean) => void) | null>(null);

  const {
    confirmMessage = "Are you sure you want to delete this item?",
    confirmTitle = "Confirm delete",
    confirmDescription = "This action cannot be undone.",
    confirmCancelLabel = "Cancel",
    confirmActionLabel = "Delete",
    failedMessage = "Delete failed",
    networkMessage = "Network error",
    onSuccess,
  } = options;

  function resolveConfirm(confirmed: boolean) {
    confirmResolver.current?.(confirmed);
    confirmResolver.current = null;
    setConfirmOpen(false);
  }

  function requestConfirm() {
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
      // Let menu/popover teardown finish before opening another modal layer.
      setTimeout(() => setConfirmOpen(true), 0);
    });
  }

  async function deleteById(rowId: string) {
    if (!(await requestConfirm())) return;

    setPending(true);
    try {
      const res = await fetch(`${endpoint}?rowId=${encodeURIComponent(rowId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = (await res.json().catch(() => ({}))) as ErrorBody;
      if (!res.ok) {
        window.alert(json.error ?? failedMessage);
        return;
      }

      onSuccess?.();
    } catch {
      window.alert(networkMessage);
    } finally {
      setPending(false);
    }
  }

  const confirmDialog = (
    <Dialog
      open={confirmOpen}
      onOpenChange={(open) => {
        setConfirmOpen(open);
        if (!open && confirmResolver.current) {
          resolveConfirm(false);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogDescription>
            {confirmMessage} {confirmDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => resolveConfirm(false)}>
            {confirmCancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => resolveConfirm(true)}
          >
            {confirmActionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { pending, confirmDialog, deleteById };
}
