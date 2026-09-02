"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  X,
  Loader2,
  FolderTree,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
} from "@/apiService/categoryApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyCategory = {
  name: "",
  slug: "",
  parentId: "",
  image: null,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategory);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState({});

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null,
  });

  const getApiErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.details ||
      error?.message ||
      fallback
    );
  };

  const isApiFailure = (response) => {
    if (response === undefined || response === null) {
      return true;
    }

    if (response?.success === false) {
      return true;
    }

    if (response?.data?.success === false) {
      return true;
    }

    return false;
  };

  const getApiResponseMessage = (response, fallback) => {
    return (
      response?.message ||
      response?.data?.message ||
      response?.data?.error ||
      fallback
    );
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategory();

      if (isApiFailure(response)) {
        throw new Error(
          getApiResponseMessage(
            response,
            "Failed to load categories"
          )
        );
      }

      const rawCategories =
        response?.categories ||
        response?.data?.categories ||
        response?.data ||
        [];

      const normalizeCategory = (category) => ({
        id: Number(category.id),
        name: category.name || "",
        slug: category.slug || "",
        image: category.image || null,
        parentId:
          category.parentId === null ||
          category.parentId === undefined
            ? null
            : Number(category.parentId),
        createdAt: category.createdAt || null,
        children: Array.isArray(category.children)
          ? category.children.map(normalizeCategory)
          : [],
      });

      setCategories(
        Array.isArray(rawCategories)
          ? rawCategories.map(normalizeCategory)
          : []
      );
    } catch (error) {
      console.error("Fetch categories failed:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load categories"
        )
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const resetForm = () => {
    setCategoryForm({
      ...emptyCategory,
    });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    resetForm();
  };

  const handleNameChange = (value) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: editingCategory
        ? prev.slug
        : generateSlug(value),
    }));
  };

  const handleAddCategory = () => {
    resetForm();

    setCategoryForm({
      name: "",
      slug: "",
      parentId: "",
      image: null,
    });

    setFormOpen(true);
  };

  const handleAddSubCategory = (parentCategory) => {
    resetForm();

    setCategoryForm({
      name: "",
      slug: "",
      parentId: String(parentCategory.id),
      image: null,
    });

    setExpandedCategories((prev) => ({
      ...prev,
      [parentCategory.id]: true,
    }));

    setFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      slug: category.slug || "",
      parentId:
        category.parentId === null ||
        category.parentId === undefined
          ? ""
          : String(category.parentId),
      image: category.image || null,
    });

    setImageFile(null);
    setImagePreview(category.image || null);

    setFormOpen(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);

    setCategoryForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);

    setCategoryForm((prev) => ({
      ...prev,
      image: null,
    }));
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const flattenCategories = (
    items,
    level = 0,
    result = []
  ) => {
    items.forEach((category) => {
      result.push({
        ...category,
        level,
      });

      if (
        Array.isArray(category.children) &&
        category.children.length
      ) {
        flattenCategories(
          category.children,
          level + 1,
          result
        );
      }
    });

    return result;
  };

  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const getDescendantIds = (category) => {
    let ids = [];

    if (category?.children?.length) {
      category.children.forEach((child) => {
        ids.push(child.id);
        ids = ids.concat(getDescendantIds(child));
      });
    }

    return ids;
  };

  const availableParents = useMemo(() => {
    if (!editingCategory) {
      return flatCategories;
    }

    const invalidIds = new Set([
      editingCategory.id,
      ...getDescendantIds(editingCategory),
    ]);

    return flatCategories.filter(
      (category) => !invalidIds.has(category.id)
    );
  }, [flatCategories, editingCategory]);

  const getParentName = (parentId) => {
    if (!parentId) return "No Parent";

    const parent = flatCategories.find(
      (item) => item.id === Number(parentId)
    );

    return parent?.name || "No Parent";
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      const name = categoryForm.name.trim();
      const slug = categoryForm.slug.trim();

      if (!name) {
        toast.error("Category name is required");
        return;
      }

      if (!slug) {
        toast.error("Slug is required");
        return;
      }

      const parentId =
        categoryForm.parentId === "" ||
        categoryForm.parentId === null
          ? null
          : Number(categoryForm.parentId);

      if (
        parentId !== null &&
        (!Number.isInteger(parentId) || parentId <= 0)
      ) {
        toast.error("Invalid parent category");
        return;
      }

      setSaving(true);

      const payload = {
        name,
        slug,
        parentId,
        image: imageFile || null,
      };

      let response;

      if (editingCategory) {
        response = await updateCategory(
          editingCategory.id,
          payload
        );
      } else {
        response = await createCategory(payload);
      }

      if (isApiFailure(response)) {
        throw new Error(
          getApiResponseMessage(
            response,
            editingCategory
              ? "Failed to update category"
              : "Failed to create category"
          )
        );
      }

      toast.success(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );

      setFormOpen(false);
      resetForm();

      await fetchCategories();
    } catch (error) {
      console.error("Save category failed:", error);

      toast.error(
        getApiErrorMessage(
          error,
          editingCategory
            ? "Failed to update category"
            : "Failed to create category"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (saving) return;

    const category = deleteDialog.category;

    if (!category?.id) {
      toast.error("Invalid category");
      return;
    }

    try {
      setSaving(true);

      const response = await deleteCategory(
        Number(category.id)
      );

      if (isApiFailure(response)) {
        throw new Error(
          getApiResponseMessage(
            response,
            "Failed to delete category"
          )
        );
      }

      toast.success(
        "Category deleted successfully"
      );

      setDeleteDialog({
        open: false,
        category: null,
      });

      await fetchCategories();
    } catch (error) {
      console.error(
        "Delete category failed:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete category"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderCategoryRows = (items, level = 0) => {
    return items.map((category) => {
      const hasChildren =
        category.children &&
        category.children.length > 0;

      const isExpanded =
        expandedCategories[category.id];

      return (
        <React.Fragment key={category.id}>
          <tr className="border-b hover:bg-muted/40 transition">
            <td className="px-4 py-4">
              <div
                className="flex items-center gap-3"
                style={{
                  paddingLeft: `${level * 28}px`,
                }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() =>
                      toggleCategory(category.id)
                    }
                    className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted"
                  >
                    {isExpanded ? (
                      <ChevronDown size={17} />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                ) : (
                  <div className="w-7" />
                )}

                <div className="h-11 w-11 rounded-lg border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      size={18}
                      className="text-muted-foreground"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {category.name}
                  </p>

                  <p className="text-xs text-muted-foreground truncate">
                    /{category.slug}
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-4">
              {category.parentId ? (
                <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  Sub Category
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                  Parent
                </span>
              )}
            </td>

            <td className="px-4 py-4">
              <span className="text-sm text-muted-foreground">
                {getParentName(category.parentId)}
              </span>
            </td>

            <td className="px-4 py-4">
              <code className="rounded bg-muted px-2 py-1 text-xs">
                {category.slug}
              </code>
            </td>

            <td className="px-4 py-4 text-sm text-muted-foreground">
              {category.createdAt
                ? new Date(
                    category.createdAt
                  ).toLocaleDateString()
                : "-"}
            </td>

            <td className="px-4 py-4">
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddSubCategory(category)
                  }
                  className="gap-1.5"
                  disabled={saving}
                >
                  <Plus size={15} />
                  <span className="hidden lg:inline">
                    Add Sub
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleEditCategory(category)
                  }
                  disabled={saving}
                >
                  <Pencil size={16} />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    setDeleteDialog({
                      open: true,
                      category,
                    })
                  }
                  disabled={saving}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>

          {hasChildren &&
            isExpanded &&
            renderCategoryRows(
              category.children,
              level + 1
            )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderTree size={24} />

              <h1 className="text-2xl md:text-3xl font-bold">
                Categories
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage parent categories and sub categories.
            </p>
          </div>

          <Button
            onClick={handleAddCategory}
            className="gap-2"
            disabled={saving}
          >
            <Plus size={17} />
            Add Category
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Parent
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Created
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-40 text-center"
                    >
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-40 text-center text-muted-foreground"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  renderCategoryRows(categories)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingCategory
                    ? "Edit Category"
                    : categoryForm.parentId
                    ? "Add Sub Category"
                    : "Add Category"}
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  {categoryForm.parentId
                    ? `Sub category of ${getParentName(
                        categoryForm.parentId
                      )}`
                    : "Create a top-level category"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <Label>Category Name</Label>

                <Input
                  value={categoryForm.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  placeholder="e.g. Pre-Workout"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>

                <Input
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      slug: generateSlug(
                        e.target.value
                      ),
                    }))
                  }
                  placeholder="pre-workout"
                  disabled={saving}
                />

                <p className="text-xs text-muted-foreground">
                  Slug must be unique.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Parent Category</Label>

                {categoryForm.parentId &&
                !editingCategory ? (
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Parent Category
                        </p>

                        <p className="font-medium">
                          {getParentName(
                            categoryForm.parentId
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCategoryForm(
                            (prev) => ({
                              ...prev,
                              parentId: "",
                            })
                          )
                        }
                        className="text-xs text-destructive hover:underline"
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={categoryForm.parentId}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        parentId: e.target.value,
                      }))
                    }
                    disabled={saving}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">
                      No Parent — Top Level
                    </option>

                    {availableParents.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {"— ".repeat(category.level)}
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category Image</Label>

                <div className="rounded-xl border border-dashed p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="h-48 w-full rounded-lg object-cover"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={saving}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center py-8 text-center">
                      <Upload
                        size={28}
                        className="mb-3 text-muted-foreground"
                      />

                      <p className="text-sm font-medium">
                        Upload category image
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, WEBP — max 5MB
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={
                          handleImageChange
                        }
                        disabled={saving}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Preview
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-lg border bg-background flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={20}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {categoryForm.name ||
                        "Category Name"}
                    </p>

                    <p className="text-xs text-muted-foreground truncate">
                      /{categoryForm.slug ||
                        "category-slug"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Parent:{" "}
                      {getParentName(
                        categoryForm.parentId
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background px-5 py-4">
              <Button
                variant="outline"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {editingCategory
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={20} />
            </div>

            <h2 className="text-lg font-semibold">
              Delete Category?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>
                {deleteDialog.category?.name}
              </strong>
              ?
            </p>

            {deleteDialog.category?.children
              ?.length > 0 && (
              <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 text-sm text-yellow-800 dark:text-yellow-300">
                This category contains sub categories.
                Make sure you handle the related
                categories before deleting.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    category: null,
                  })
                }
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? (
                  <Loader2
                    size={16}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <Trash2
                    size={16}
                    className="mr-2"
                  />
                )}

                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}