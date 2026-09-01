"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import CouponTable from "@/app/components/ui/CouponTable";
import CouponForm from "@/app/components/ui/CouponForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getCoupon,
  updateCoupon,
  createCoupon,
  deleteCoupon,
} from "@/apiService/couponApi";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [couponToDelete, setCouponToDelete] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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

        setCoupons(
          res.coupons ||
            res.data ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to fetch coupons:",
          err
        );

        setError(
          err?.message ||
            "Failed to load coupons"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCoupons();
  }, []);

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
      return;
    }

    setDeleting(true);

    try {
      const res = await deleteCoupon(
        couponToDelete.id
      );

      if (!res?.success) {
        throw new Error(
          res?.message ||
            "Deletion failed"
        );
      }

      setCoupons((prev) =>
        prev.filter(
          (coupon) =>
            coupon.id !==
            couponToDelete.id
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
        `Failed to delete coupon: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(coupon) {
    try {
      if (coupon?.id) {
        const res =
          await updateCoupon(
            coupon.id,
            coupon
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
          coupon;

        setCoupons((prev) =>
          prev.map((item) =>
            item.id === coupon.id
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

        setFormOpen(false);
        setEditingCoupon(null);

        return;
      }

      const res =
        await createCoupon(coupon);

      if (!res?.success) {
        throw new Error(
          res?.message ||
            "Failed to create coupon"
        );
      }

      const created =
        res.coupon ||
        res.data ||
        res;

      setCoupons((prev) => [
        created,
        ...prev,
      ]);

      toast.success(
        "Coupon created successfully!"
      );

      setFormOpen(false);
      setEditingCoupon(null);
    } catch (err) {
      console.error(
        "Save coupon failed:",
        err
      );

      toast.error(
        `Failed to ${
          coupon?.id
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
        onOpenChange={
          setDeleteDialogOpen
        }
        title="Delete Coupon"
        description={
          couponToDelete
            ? `Are you sure you want to delete "${couponToDelete.code}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}