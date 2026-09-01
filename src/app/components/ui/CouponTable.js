"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
} from "lucide-react";

function formatDiscount(coupon) {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}%`
    : `₹${coupon.discountValue}`;
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return "No expiry";

  return new Date(
    expiresAt
  ).toLocaleDateString();
}

export default function CouponTable({
  coupons,
  onEdit,
  onDelete,
}) {
  if (!coupons.length) {
    return (
      <p className="p-6 text-center text-muted-foreground">
        No coupons yet.
      </p>
    );
  }

  return (
    <table
      className="
        w-full
        min-w-[900px]
        text-sm
      "
    >
      <thead className="border-b bg-muted/40">
        <tr className="text-left">
          <th className="whitespace-nowrap p-3">
            Code
          </th>

          <th className="whitespace-nowrap p-3">
            Discount
          </th>

          <th className="whitespace-nowrap p-3">
            Min Cart
          </th>

          <th className="whitespace-nowrap p-3">
            Usage
          </th>

          <th className="whitespace-nowrap p-3">
            Status
          </th>

          <th className="whitespace-nowrap p-3">
            Show on Checkout
          </th>

          <th className="whitespace-nowrap p-3">
            Expires
          </th>

          <th className="whitespace-nowrap p-3 text-right">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {coupons.map((coupon) => (
          <tr
            key={coupon.id}
            className="border-b last:border-0"
          >
            {/* CODE */}

            <td className="whitespace-nowrap p-3 font-medium">
              {coupon.code}
            </td>

            {/* DISCOUNT */}

            <td className="whitespace-nowrap p-3">
              {formatDiscount(coupon)}
            </td>

            {/* MIN CART */}

            <td className="whitespace-nowrap p-3">
              {coupon.minCartValue ?? "—"}
            </td>

            {/* USAGE */}

            <td className="whitespace-nowrap p-3">
              {coupon.usedCount ?? 0}

              {coupon.usageLimit
                ? ` / ${coupon.usageLimit}`
                : ""}
            </td>

            {/* STATUS */}

            <td className="whitespace-nowrap p-3">
              <Badge
                variant={
                  coupon.isActive
                    ? "default"
                    : "secondary"
                }
              >
                {coupon.isActive
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </td>

            {/* SHOW ON CHECKOUT */}

            <td className="whitespace-nowrap p-3">
              <Badge
                variant={
                  coupon.showOnCheckout
                    ? "default"
                    : "secondary"
                }
              >
                {coupon.showOnCheckout
                  ? "Yes"
                  : "No"}
              </Badge>
            </td>

            {/* EXPIRES */}

            <td className="whitespace-nowrap p-3">
              {formatExpiry(
                coupon.expiresAt
              )}
            </td>

            {/* ACTIONS */}

            <td className="whitespace-nowrap p-3">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onEdit(coupon)
                  }
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onDelete(coupon)
                  }
                >
                  <Trash2
                    size={16}
                    className="text-red-500"
                  />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}