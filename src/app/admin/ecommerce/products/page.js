"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import ProductTable from "@/app/components/ui/ProductTable";
import ProductForm from "@/app/components/ui/ProductForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getProduct,
  deleteProduct,
  updateProduct,
  createProduct,
} from "@/apiService/productApi.js";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [productToDelete, setProductToDelete] =
    useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProduct();

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Failed to load products"
          );
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error(
          "Failed to fetch products:",
          err
        );

        setError(
          err?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEditClick(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleDelete(product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!productToDelete?.id) {
      return;
    }

    setDeleting(true);

    try {
      const res = await deleteProduct(
        productToDelete.id
      );

      if (!res?.success) {
        throw new Error(
          res?.message ||
            "Deletion failed"
        );
      }

      setProducts((prev) =>
        prev.filter(
          (p) =>
            p.id !== productToDelete.id
        )
      );

      toast.success(
        "Product deleted successfully!"
      );

      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error(
        "Delete product failed:",
        err
      );

      toast.error(
        `Failed to delete product: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(product) {
    setSaving(true);

    try {
      if (product?.id) {
        const {
          id,
          createdAt,
          updatedAt,
          category,
          brand,
          reviews,
          servings,
          ...productData
        } = product;

        const body = {
          ...productData,

          categoryId:
            productData.categoryId
              ? Number(
                  productData.categoryId
                )
              : undefined,

          brandId:
            productData.brandId
              ? Number(
                  productData.brandId
                )
              : undefined,

          variants:
            productData.variants ||
            [],

          faqs:
            productData.faqs || [],
        };

        const res =
          await updateProduct(
            id,
            body
          );

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Product update failed"
          );
        }

        const updated =
          res.product ||
          res.data ||
          res;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updated,
                }
              : p
          )
        );

        toast.success(
          "Product updated successfully!"
        );
      } else {
        const body = {
          ...product,

          brandId:
            product.brandId
              ? Number(
                  product.brandId
                )
              : undefined,

          categoryId:
            product.categoryId
              ? Number(
                  product.categoryId
                )
              : undefined,

          variants:
            product.variants ||
            [],

          faqs:
            product.faqs || [],
        };

        delete body.id;
        delete body.createdAt;
        delete body.updatedAt;
        delete body.category;
        delete body.brand;
        delete body.reviews;

        const res =
          await createProduct(body);

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Product creation failed"
          );
        }

        const created =
          res.product ||
          res.data ||
          res;

        setProducts((prev) => [
          created,
          ...prev,
        ]);

        toast.success(
          "Product created successfully!"
        );
      }

      setFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(
        "Save product failed:",
        err
      );

      toast.error(
        `Failed to ${
          product?.id
            ? "update"
            : "create"
        } product: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-44" />

          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
        </div>

        <TableSkeleton
          rows={6}
          columns={7}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load products: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product
            {products.length === 1
              ? ""
              : "s"}{" "}
            in your catalog.
          </p>
        </div>

        <Button
          onClick={handleAddClick}
          className="w-full sm:w-auto"
          disabled={saving}
        >
          <Plus
            size={16}
            className="mr-1"
          />

          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="w-full rounded-lg border bg-white p-10 text-center text-sm text-muted-foreground">
          No products yet. Click "Add
          Product" to create your first
          one.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <ProductTable
              products={products}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={
          setDeleteDialogOpen
        }
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}