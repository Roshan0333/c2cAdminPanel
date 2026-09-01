"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import CouponTable from "@/app/components/ui/CouponTable";
import CouponForm from "@/app/components/ui/CouponForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";

import {
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/apiService/couponApi";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      setError(null);

      const res = await getCoupon();

      if (!res?.success) {
        throw new Error(
          res?.message || "Failed to load coupons"
        );
      }

      const list = Array.isArray(res.coupons)
        ? res.coupons
        : Array.isArray(res.data)
          ? res.data
          : [];

      setCoupons(list);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);

      setError(
        err?.message || "Failed to load coupons"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAddClick() {
    setEditingCoupon(null);
    setFormOpen(true);
  }

  function handleEditClick(coupon) {
    setEditingCoupon(coupon);
    setFormOpen(true);
  }

  function handleDelete(coupon) {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!couponToDelete?.id) {
      toast.error("Invalid coupon selected");
      return;
    }

    try {
      setDeleting(true);

      const res = await deleteCoupon(
        couponToDelete.id
      );

      if (!res?.success) {
        throw new Error(
          res?.message || "Failed to delete coupon"
        );
      }

      setCoupons((prev) =>
        prev.filter(
          (item) =>
            item.id !== couponToDelete.id
        )
      );

      toast.success(
        "Coupon deleted successfully!"
      );

      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    } catch (err) {
      console.error(
        "Delete coupon failed:",
        err
      );

      toast.error(
        err?.message ||
          "Failed to delete coupon"
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(formData) {
    if (!formData) {
      toast.error("Coupon data is missing");
      return;
    }

    const payload = {
      code: String(formData.code || "")
        .trim()
        .toUpperCase(),

      discountType:
        formData.discountType || "PERCENTAGE",

      discountValue:
        formData.discountValue === "" ||
        formData.discountValue === null ||
        formData.discountValue === undefined
          ? null
          : Number(formData.discountValue),

      applicableProductIds:
        Array.isArray(
          formData.applicableProductIds
        )
          ? formData.applicableProductIds
              .map(Number)
              .filter(
                (id) => !Number.isNaN(id)
              )
          : [],

      applicableCategoryIds:
        Array.isArray(
          formData.applicableCategoryIds
        )
          ? formData.applicableCategoryIds
              .map(Number)
              .filter(
                (id) => !Number.isNaN(id)
              )
          : [],

      applicableBrands:
        Array.isArray(
          formData.applicableBrands
        )
          ? formData.applicableBrands.filter(
              Boolean
            )
          : [],

      minCartValue:
        formData.minCartValue === "" ||
        formData.minCartValue === null ||
        formData.minCartValue === undefined
          ? null
          : Number(formData.minCartValue),

      maxDiscount:
        formData.maxDiscount === "" ||
        formData.maxDiscount === null ||
        formData.maxDiscount === undefined
          ? null
          : Number(formData.maxDiscount),

      usageLimit:
        formData.usageLimit === "" ||
        formData.usageLimit === null ||
        formData.usageLimit === undefined
          ? null
          : Number(formData.usageLimit),

      expiresAt:
        formData.expiresAt || null,

      isActive:
        Boolean(formData.isActive),

      showOnCheckout:
        Boolean(formData.showOnCheckout),
    };

    if (!payload.code) {
      toast.error("Coupon code is required");
      return;
    }

    if (
      payload.discountValue === null ||
      Number.isNaN(payload.discountValue)
    ) {
      toast.error(
        "Discount value is required"
      );
      return;
    }

    try {
      if (formData.id) {
        const res = await updateCoupon(
          formData.id,
          payload
        );

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Failed to update coupon"
          );
        }

        const updated =
          res.coupon ||
          res.data ||
          {
            ...formData,
            ...payload,
            id: formData.id,
          };

        setCoupons((prev) =>
          prev.map((item) =>
            item.id === formData.id
              ? {
                  ...item,
                  ...updated,
                }
              : item
          )
        );

        toast.success(
          "Coupon updated successfully!"
        );
      } else {
        const res =
          await createCoupon(payload);

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Failed to create coupon"
          );
        }

        const created =
          res.coupon ||
          res.data;

        if (!created) {
          throw new Error(
            "Coupon was created but no coupon was returned"
          );
        }

        setCoupons((prev) => [
          created,
          ...prev,
        ]);

        toast.success(
          "Coupon created successfully!"
        );
      }

      setFormOpen(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error(
        "Save coupon failed:",
        err
      );

      toast.error(
        `Failed to ${
          formData.id
            ? "update"
            : "create"
        } coupon: ${
          err?.message ||
          "Unknown error"
        }`
      );
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-44" />

          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
        </div>

        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <TableSkeleton
              rows={6}
              columns={8}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load coupons: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Coupons
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {coupons.length} coupon
            {coupons.length === 1
              ? ""
              : "s"}{" "}
            in your catalog.
          </p>
        </div>

        <Button
          onClick={handleAddClick}
          className="w-full sm:w-auto"
        >
          <Plus
            size={16}
            className="mr-1"
          />
          Add Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="w-full rounded-lg border bg-white p-10 text-center text-sm text-muted-foreground">
          No coupons yet. Click "Add Coupon"
          to create your first one.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <CouponTable
              coupons={coupons}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <CouponForm
        open={formOpen}
        onOpenChange={setFormOpen}
        coupon={editingCoupon}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Coupon"
        description={
          couponToDelete
            ? `Are you sure you want to delete "${couponToDelete.code}"? This action cannot be undone.`
            : "Are you sure you want to delete this coupon?"
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}