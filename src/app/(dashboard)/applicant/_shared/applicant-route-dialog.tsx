"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/patterns/dialog";

type ApplicantRouteDialogProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  backHref?: string;
  closeMode?: "back" | "href";
};

export function ApplicantRouteDialog({
  title,
  description,
  children,
  backHref = "/applicant",
  closeMode = "href",
}: ApplicantRouteDialogProps) {
  const router = useRouter();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          if (closeMode === "back" && window.history.length > 1) {
            router.back();
          } else {
            router.push(backHref);
          }
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
