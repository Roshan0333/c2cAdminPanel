"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function OrderEditForm({
  open,
  onOpenChange,
  order,
  onSave,
}) {
  const [paymentStatus, setPaymentStatus] =
    useState("pending");

  const [status, setStatus] =
    useState("pending");

  useEffect(() => {
    if (order) {
      setPaymentStatus(
        order.paymentStatus || "pending"
      );

      setStatus(
        order.status || "pending"
      );
    }
  }, [order, open]);

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...order,
      paymentStatus,
      status,
    });

    onOpenChange(false);
  }

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Edit Order{" "}
            {order.orderNumber ||
              `#${order.id}`}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Customer */}
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <div className="break-words font-medium text-slate-800">
              {order.user?.name ||
                order.shippingFullName ||
                "-"}
            </div>

            <div className="break-all text-slate-500">
              {order.user?.email || "-"}
            </div>

            <div className="text-slate-500">
              {order.shippingMobile || "-"}
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label htmlFor="paymentStatus">
              Payment Status
            </Label>

            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value
                )
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>
            </select>
          </div>

          {/* Order Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">
              Order Status
            </Label>

            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="shipped">
                Shipped
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          {/* Order Information */}
          <div className="space-y-2 rounded-md border p-3 text-sm">
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <span className="text-slate-500">
                Order Number
              </span>

              <span className="break-all text-right font-medium">
                {order.orderNumber || "-"}
              </span>
            </div>

            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <span className="text-slate-500">
                Total Amount
              </span>

              <span className="text-right font-medium">
                ₹
                {Number(
                  order.totalAmount || 0
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <span className="text-slate-500">
                Payment Method
              </span>

              <span className="text-right font-medium">
                {order.paymentMethod || "-"}
              </span>
            </div>

            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <span className="text-slate-500">
                Items
              </span>

              <span className="text-right font-medium">
                {order.items?.length || 0}
              </span>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}