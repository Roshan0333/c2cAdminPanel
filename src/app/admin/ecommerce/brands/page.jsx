"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  X,
} from "lucide-react";

import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/apiService/brandApi";

const emptyBrand = {
  name: "",
  slug: "",
  description: "",
  displayOrder: 0,
  isActive: true,
  seo: null,
};

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [brandForm, setBrandForm] =
    useState(emptyBrand);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] =
    useState("");

  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [brandToDelete, setBrandToDelete] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      setLoading(true);
      setError(null);

      const res = await getBrands();

      if (!res?.success) {
        throw new Error(
          res?.message || "Failed to load brands"
        );
      }

      setBrands(res.brands || []);
    } catch (err) {
      console.error(
        "Failed to fetch brands:",
        err
      );

      setError(
        err?.message || "Failed to load brands"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setBrandForm({
      ...emptyBrand,
    });

    setLogoFile(null);
    setLogoPreview("");
  }

  function handleAddClick() {
    setEditingBrand(null);
    resetForm();
    setFormOpen(true);
  }

  function handleEditClick(brand) {
    setEditingBrand(brand);

    setBrandForm({
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      displayOrder:
        brand.displayOrder ?? 0,
      isActive:
        brand.isActive !== false,
      seo: brand.seo || null,
    });

    setLogoFile(null);
    setLogoPreview(brand.logo || "");

    setFormOpen(true);
  }

  function handleInputChange(
    field,
    value
  ) {
    setBrandForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value) {
    setBrandForm((prev) => ({
      ...prev,
      name: value,
      slug:
        !editingBrand ||
        prev.slug ===
          generateSlug(prev.name)
          ? generateSlug(value)
          : prev.slug,
    }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image size must be less than 5MB."
      );
      return;
    }

    setLogoFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  }

  function removeLogo() {
    setLogoFile(null);

    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogoPreview("");
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingBrand(null);
    resetForm();
  }

  async function handleSave() {
    if (!brandForm.name.trim()) {
      toast.error(
        "Brand name is required."
      );
      return;
    }

    if (!brandForm.slug.trim()) {
      toast.error(
        "Brand slug is required."
      );
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append(
        "name",
        brandForm.name.trim()
      );

      formData.append(
        "slug",
        brandForm.slug.trim()
      );

      formData.append(
        "description",
        brandForm.description?.trim() ||
          ""
      );

      formData.append(
        "displayOrder",
        String(
          Number(
            brandForm.displayOrder
          ) || 0
        )
      );

      formData.append(
        "isActive",
        String(
          Boolean(
            brandForm.isActive
          )
        )
      );

      if (brandForm.seo) {
        formData.append(
          "seo",
          JSON.stringify(
            brandForm.seo
          )
        );
      }

      if (logoFile) {
        formData.append(
          "logo",
          logoFile
        );
      }

      if (editingBrand?.id) {
        const res =
          await updateBrand(
            editingBrand.id,
            formData
          );

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Failed to update brand"
          );
        }

        const updated =
          res.brand ||
          res.data ||
          res;

        setBrands((prev) =>
          prev.map((brand) =>
            brand.id ===
            editingBrand.id
              ? {
                  ...brand,
                  ...updated,
                }
              : brand
          )
        );

        toast.success(
          "Brand updated successfully!"
        );
      } else {
        const res =
          await createBrand(
            formData
          );

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Failed to create brand"
          );
        }

        const created =
          res.brand ||
          res.data ||
          res;

        setBrands((prev) => [
          created,
          ...prev,
        ]);

        toast.success(
          "Brand created successfully!"
        );
      }

      closeForm();
    } catch (err) {
      console.error(
        "Save brand failed:",
        err
      );

      toast.error(
        `Failed to ${
          editingBrand
            ? "update"
            : "create"
        } brand: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(brand) {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!brandToDelete?.id) {
      return;
    }

    setDeleting(true);

    try {
      const res =
        await deleteBrand(
          brandToDelete.id
        );

      if (!res?.success) {
        throw new Error(
          res?.message ||
            "Deletion failed"
        );
      }

      setBrands((prev) =>
        prev.filter(
          (brand) =>
            brand.id !==
            brandToDelete.id
        )
      );

      toast.success(
        "Brand deleted successfully!"
      );

      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (err) {
      console.error(
        "Delete brand failed:",
        err
      );

      toast.error(
        `Failed to delete brand: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setDeleting(false);
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
              columns={7}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load brands: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Brands
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {brands.length} brand
            {brands.length === 1
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
          Add Brand
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="w-full rounded-lg border bg-white p-10 text-center text-sm text-muted-foreground">
          No brands yet. Click "Add Brand"
          to create your first one.
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Brand
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Products
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Order
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 w-10 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
                            {brand.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {brand.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID: {brand.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {brand.slug || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {brand._count
                        ?.products ?? 0}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {brand.displayOrder ??
                        0}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          brand.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {brand.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleEditClick(
                              brand
                            )
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              brand
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingBrand
                ? "Update Brand"
                : "Add Brand"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="brand-name">
                Brand Name
              </Label>

              <Input
                id="brand-name"
                value={brandForm.name}
                onChange={(e) =>
                  handleNameChange(
                    e.target.value
                  )
                }
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-slug">
                Slug
              </Label>

              <Input
                id="brand-slug"
                value={brandForm.slug}
                onChange={(e) =>
                  handleInputChange(
                    "slug",
                    e.target.value
                  )
                }
                placeholder="brand-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-description">
                Description
              </Label>

              <Textarea
                id="brand-description"
                value={
                  brandForm.description
                }
                onChange={(e) =>
                  handleInputChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Enter brand description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Brand Logo
              </Label>

              <div className="flex flex-col gap-3">
                {logoPreview ? (
                  <div className="relative w-fit">
                    <img
                      src={logoPreview}
                      alt="Brand logo preview"
                      className="h-28 w-28 rounded-xl border object-contain bg-white p-2"
                    />

                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed bg-muted/30">
                    <ImagePlus
                      size={28}
                      className="text-muted-foreground"
                    />
                  </div>
                )}

                <label
                  htmlFor="brand-logo-upload"
                  className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <ImagePlus
                    size={16}
                  />
                  {logoPreview
                    ? "Change Logo"
                    : "Upload Logo"}
                </label>

                <input
                  id="brand-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleLogoChange
                  }
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP or other
                  image files. Maximum 5MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">
                Display Order
              </Label>

              <Input
                id="display-order"
                type="number"
                min="0"
                value={
                  brandForm.displayOrder
                }
                onChange={(e) =>
                  handleInputChange(
                    "displayOrder",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  Brand Status
                </p>

                <p className="text-xs text-muted-foreground">
                  Enable or disable this
                  brand
                </p>
              </div>

              <Switch
                checked={
                  brandForm.isActive
                }
                onCheckedChange={(
                  value
                ) =>
                  handleInputChange(
                    "isActive",
                    value
                  )
                }
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving
                ? "Saving..."
                : editingBrand
                ? "Update Brand"
                : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={
          setDeleteDialogOpen
        }
        title="Delete Brand"
        description={
          brandToDelete
            ? `Are you sure you want to delete "${brandToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}