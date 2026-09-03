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
  Search,
  Share2,
  Code2,
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

const createEmptySeo = () => ({
  title: "",
  description: "",
  keywords: [],
  keywordsInput: "",
  canonical: "",
  author: "",
  robots: "index, follow",
  facebook: {
    title: "",
    description: "",
    card: "summary_large_image",
    url: "",
    image_path: "",
  },
  twitter: {
    title: "",
    description: "",
    card: "summary_large_image",
    redirect_url: "",
    image_path: "",
  },
  schema: {
    enabled: true,
    type: "CollectionPage",
    customJson: "",
  },
});

const emptyCategory = {
  name: "",
  slug: "",
  parentId: "",
  image: null,
  seo: createEmptySeo(),
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState(
    emptyCategory
  );

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState(
    {}
  );

  const [seoStep, setSeoStep] = useState(1);

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

  const normalizeSeo = (seo) => {
    const defaults = createEmptySeo();

    return {
      ...defaults,
      ...(seo || {}),
      keywordsInput: "",
      keywords: Array.isArray(seo?.keywords)
        ? seo.keywords
            .map((keyword) => String(keyword).trim())
            .filter(Boolean)
        : typeof seo?.keywords === "string"
        ? seo.keywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        : [],
      facebook: {
        ...defaults.facebook,
        ...(seo?.facebook || {}),
      },
      twitter: {
        ...defaults.twitter,
        ...(seo?.twitter || {}),
      },
      schema: {
        ...defaults.schema,
        ...(seo?.schema || {}),
      },
    };
  };

  const normalizeCategory = (category) => {
    if (!category) {
      return null;
    }

    const normalizedId = Number(category.id);

    return {
      id: Number.isFinite(normalizedId)
        ? normalizedId
        : category.id,
      name: category.name || "",
      slug: category.slug || "",
      image: category.image || null,
      parentId:
        category.parentId === null ||
        category.parentId === undefined ||
        category.parentId === ""
          ? null
          : Number(category.parentId),
      createdAt: category.createdAt || null,
      seo: normalizeSeo(category.seo),
      children: Array.isArray(category.children)
        ? category.children
            .map(normalizeCategory)
            .filter(Boolean)
        : [],
    };
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

      const normalizedCategories = Array.isArray(
        rawCategories
      )
        ? rawCategories
            .map(normalizeCategory)
            .filter(Boolean)
        : [];

      setCategories(normalizedCategories);
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
      seo: createEmptySeo(),
    });

    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setSeoStep(1);
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
      seo: createEmptySeo(),
    });

    setFormOpen(true);
  };

  const handleAddSubCategory = (parentCategory) => {
    if (!parentCategory?.id) {
      toast.error("Invalid parent category");
      return;
    }

    resetForm();

    setCategoryForm({
      name: "",
      slug: "",
      parentId: String(parentCategory.id),
      image: null,
      seo: createEmptySeo(),
    });

    setExpandedCategories((prev) => ({
      ...prev,
      [parentCategory.id]: true,
    }));

    setFormOpen(true);
  };

  const handleEditCategory = (category) => {
    if (!category?.id) {
      toast.error("Invalid category");
      return;
    }

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
      seo: normalizeSeo(category.seo),
    });

    setImageFile(null);
    setImagePreview(category.image || null);
    setSeoStep(1);

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

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
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
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
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
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const flattenCategories = (
    items,
    level = 0,
    result = [],
    parentPath = ""
  ) => {
    if (!Array.isArray(items)) {
      return result;
    }

    items.forEach((category, index) => {
      if (!category) {
        return;
      }

      const currentPath = parentPath
        ? `${parentPath}-${category.id}-${index}`
        : `${category.id}-${index}`;

      result.push({
        ...category,
        level,
        reactPath: currentPath,
      });

      if (
        Array.isArray(category.children) &&
        category.children.length
      ) {
        flattenCategories(
          category.children,
          level + 1,
          result,
          currentPath
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

    if (
      category &&
      Array.isArray(category.children) &&
      category.children.length
    ) {
      category.children.forEach((child) => {
        if (child?.id !== undefined) {
          ids.push(child.id);

          ids = ids.concat(
            getDescendantIds(child)
          );
        }
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
      (category) =>
        !invalidIds.has(category.id)
    );
  }, [flatCategories, editingCategory]);

  const getParentName = (parentId) => {
    if (
      parentId === null ||
      parentId === undefined ||
      parentId === ""
    ) {
      return "No Parent";
    }

    const parent = flatCategories.find(
      (item) =>
        Number(item.id) === Number(parentId)
    );

    return parent?.name || "No Parent";
  };

  const handleSeoChange = (field, value) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  const handleFacebookSeoChange = (
    field,
    value
  ) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        facebook: {
          ...prev.seo.facebook,
          [field]: value,
        },
      },
    }));
  };

  const handleTwitterSeoChange = (
    field,
    value
  ) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        twitter: {
          ...prev.seo.twitter,
          [field]: value,
        },
      },
    }));
  };

  const handleSchemaChange = (
    field,
    value
  ) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        schema: {
          ...prev.seo.schema,
          [field]: value,
        },
      },
    }));
  };

  const handleKeywordInput = (value) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywordsInput: value,
      },
    }));
  };

  const addKeyword = (value) => {
    setCategoryForm((prev) => {
      const inputValue =
        typeof value === "string"
          ? value
          : prev.seo.keywordsInput || "";

      const input = inputValue.trim();

      if (!input) {
        return prev;
      }

      const newKeywords = input
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      const existingKeywords = Array.isArray(
        prev.seo.keywords
      )
        ? prev.seo.keywords
        : [];

      const mergedKeywords = [
        ...existingKeywords,
      ];

      newKeywords.forEach((keyword) => {
        const exists = mergedKeywords.some(
          (existingKeyword) =>
            existingKeyword.toLowerCase() ===
            keyword.toLowerCase()
        );

        if (!exists) {
          mergedKeywords.push(keyword);
        }
      });

      return {
        ...prev,
        seo: {
          ...prev.seo,
          keywords: mergedKeywords,
          keywordsInput: "",
        },
      };
    });
  };

  const handleKeywordKeyDown = (event) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();
      addKeyword();
    }
  };

  const handleKeywordBlur = () => {
    addKeyword();
  };

  const removeKeyword = (keywordToRemove) => {
    setCategoryForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: Array.isArray(
          prev.seo.keywords
        )
          ? prev.seo.keywords.filter(
              (keyword) =>
                keyword !== keywordToRemove
            )
          : [],
      },
    }));
  };

  const buildSeoPayload = () => {
    const keywords = Array.isArray(
      categoryForm.seo.keywords
    )
      ? categoryForm.seo.keywords
          .map((keyword) =>
            String(keyword).trim()
          )
          .filter(Boolean)
      : [];

    return {
      title:
        categoryForm.seo.title?.trim() || "",
      description:
        categoryForm.seo.description?.trim() ||
        "",
      keywords,
      canonical:
        categoryForm.seo.canonical?.trim() ||
        "",
      author:
        categoryForm.seo.author?.trim() || "",
      robots:
        categoryForm.seo.robots ||
        "index, follow",
      facebook: {
        title:
          categoryForm.seo.facebook.title?.trim() ||
          "",
        description:
          categoryForm.seo.facebook.description?.trim() ||
          "",
        card:
          categoryForm.seo.facebook.card ||
          "summary_large_image",
        url:
          categoryForm.seo.facebook.url?.trim() ||
          "",
        image_path:
          categoryForm.seo.facebook.image_path?.trim() ||
          "",
      },
      twitter: {
        title:
          categoryForm.seo.twitter.title?.trim() ||
          "",
        description:
          categoryForm.seo.twitter.description?.trim() ||
          "",
        card:
          categoryForm.seo.twitter.card ||
          "summary_large_image",
        redirect_url:
          categoryForm.seo.twitter.redirect_url?.trim() ||
          "",
        image_path:
          categoryForm.seo.twitter.image_path?.trim() ||
          "",
      },
      schema: {
        enabled: Boolean(
          categoryForm.seo.schema.enabled
        ),
        type:
          categoryForm.seo.schema.type ||
          "CollectionPage",
        customJson:
          categoryForm.seo.schema.customJson?.trim() ||
          "",
      },
    };
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
        categoryForm.parentId === null ||
        categoryForm.parentId === undefined
          ? null
          : Number(categoryForm.parentId);

      if (
        parentId !== null &&
        (!Number.isInteger(parentId) ||
          parentId <= 0)
      ) {
        toast.error(
          "Invalid parent category"
        );
        return;
      }

      if (
        editingCategory &&
        parentId === Number(editingCategory.id)
      ) {
        toast.error(
          "A category cannot be its own parent"
        );
        return;
      }

      setSaving(true);

      const payload = {
        name,
        slug,
        parentId,
        image: imageFile || null,
        seo: buildSeoPayload(),
      };

      let response;

      if (editingCategory) {
        response = await updateCategory(
          Number(editingCategory.id),
          payload
        );
      } else {
        response = await createCategory(
          payload
        );
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
      console.error(
        "Save category failed:",
        error
      );

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
    if (
      id === null ||
      id === undefined
    ) {
      return;
    }

    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderCategoryRows = (
    items,
    level = 0,
    parentKey = "root"
  ) => {
    if (!Array.isArray(items)) {
      return null;
    }

    return items.map(
      (category, index) => {
        if (!category) {
          return null;
        }

        const hasChildren =
          Array.isArray(category.children) &&
          category.children.length > 0;

        const isExpanded =
          expandedCategories[category.id];

        const rowKey = `${parentKey}-${category.id}-${index}`;

        return (
          <React.Fragment key={rowKey}>
            <tr className="border-b transition hover:bg-muted/40">
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
                        toggleCategory(
                          category.id
                        )
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                      aria-label={
                        isExpanded
                          ? "Collapse category"
                          : "Expand category"
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </button>
                  ) : (
                    <div className="h-7 w-7 shrink-0" />
                  )}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={
                          category.name ||
                          "Category"
                        }
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
                    <p className="truncate font-semibold">
                      {category.name ||
                        "Unnamed Category"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      /
                      {category.slug ||
                        "category-slug"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-4">
                {category.parentId ? (
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Sub Category
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    Parent
                  </span>
                )}
              </td>

              <td className="px-4 py-4">
                <span className="text-sm text-muted-foreground">
                  {getParentName(
                    category.parentId
                  )}
                </span>
              </td>

              <td className="px-4 py-4">
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {category.slug || "-"}
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
                      handleAddSubCategory(
                        category
                      )
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
                      handleEditCategory(
                        category
                      )
                    }
                    disabled={saving}
                    aria-label="Edit category"
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
                    aria-label="Delete category"
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
                level + 1,
                rowKey
              )}
          </React.Fragment>
        );
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderTree size={24} />

              <h1 className="text-2xl font-bold md:text-3xl">
                Categories
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage parent categories and sub
              categories.
            </p>
          </div>

          <Button
            onClick={handleAddCategory}
            className="w-full gap-2 sm:w-auto"
            disabled={saving}
          >
            <Plus size={17} />
            Add Category
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold sm:text-xl">
                  {editingCategory
                    ? "Edit Category"
                    : categoryForm.parentId
                    ? "Add Sub Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {categoryForm.parentId
                    ? `Sub category of ${getParentName(
                        categoryForm.parentId
                      )}`
                    : "Create a top-level category"}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex shrink-0 gap-1 overflow-x-auto border-b px-3 py-2 sm:px-5">
              {[
                {
                  id: 1,
                  label: "Basic",
                  icon: FolderTree,
                },
                {
                  id: 2,
                  label: "SEO",
                  icon: Search,
                },
                {
                  id: 3,
                  label: "Social SEO",
                  icon: Share2 ,
                },
                {
                  id: 4,
                  label: "Schema",
                  icon: Code2,
                },
              ].map((step) => {
                const Icon = step.icon;
                const active =
                  seoStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() =>
                      setSeoStep(step.id)
                    }
                    disabled={saving}
                    className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={15} />
                    {step.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {seoStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>
                      Category Name
                    </Label>

                    <Input
                      value={categoryForm.name}
                      onChange={(e) =>
                        handleNameChange(
                          e.target.value
                        )
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
                        setCategoryForm(
                          (prev) => ({
                            ...prev,
                            slug: generateSlug(
                              e.target.value
                            ),
                          })
                        )
                      }
                      placeholder="pre-workout"
                      disabled={saving}
                    />

                    <p className="text-xs text-muted-foreground">
                      Slug must be unique.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Parent Category
                    </Label>

                    {categoryForm.parentId &&
                    !editingCategory ? (
                      <div className="rounded-lg border bg-muted/40 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Parent Category
                            </p>

                            <p className="truncate font-medium">
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
                            className="shrink-0 text-xs text-destructive hover:underline"
                            disabled={saving}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={
                          categoryForm.parentId
                        }
                        onChange={(e) =>
                          setCategoryForm(
                            (prev) => ({
                              ...prev,
                              parentId:
                                e.target.value,
                            })
                          )
                        }
                        disabled={saving}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">
                          No Parent — Top Level
                        </option>

                        {availableParents.map(
                          (
                            category,
                            index
                          ) => (
                            <option
                              key={`parent-option-${category.id}-${category.level}-${index}`}
                              value={category.id}
                            >
                              {"— ".repeat(
                                category.level
                              )}
                              {category.name}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Category Image
                    </Label>

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
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/80"
                            aria-label="Remove image"
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
                            PNG, JPG, WEBP — max
                            5MB
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
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
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
                        <p className="truncate font-semibold">
                          {categoryForm.name ||
                            "Category Name"}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          /
                          {categoryForm.slug ||
                            "category-slug"}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Parent:{" "}
                          {getParentName(
                            categoryForm.parentId
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {seoStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Search size={19} />

                      <h3 className="text-lg font-semibold">
                        SEO Settings
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure search engine metadata
                      for this category.
                    </p>
                  </div>

                  <div className="grid gap-5">
                    <div className="space-y-2">
                      <Label>
                        SEO Title
                      </Label>

                      <Input
                        value={
                          categoryForm.seo.title
                        }
                        onChange={(e) =>
                          handleSeoChange(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Best Pre-Workout Supplements | Your Store"
                        disabled={saving}
                        maxLength={60}
                      />

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Recommended: 50–60 characters
                        </span>

                        <span>
                          {
                            categoryForm.seo.title
                              .length
                          }
                          /60
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Meta Description
                      </Label>

                      <textarea
                        value={
                          categoryForm.seo
                            .description
                        }
                        onChange={(e) =>
                          handleSeoChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Explore the best products in this category..."
                        disabled={saving}
                        maxLength={160}
                        className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Recommended: 120–160 characters
                        </span>

                        <span>
                          {
                            categoryForm.seo
                              .description
                              .length
                          }
                          /160
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>
                          Keywords
                        </Label>

                        <span className="text-xs text-muted-foreground">
                          {Array.isArray(
                            categoryForm.seo
                              .keywords
                          )
                            ? categoryForm.seo
                                .keywords.length
                            : 0}{" "}
                          keyword
                          {Array.isArray(
                            categoryForm.seo
                              .keywords
                          ) &&
                          categoryForm.seo
                            .keywords
                            .length === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <Input
                        value={
                          categoryForm.seo
                            .keywordsInput ||
                          ""
                        }
                        onChange={(e) =>
                          handleKeywordInput(
                            e.target.value
                          )
                        }
                        onKeyDown={
                          handleKeywordKeyDown
                        }
                        onBlur={
                          handleKeywordBlur
                        }
                        placeholder="Type keyword and press Enter"
                        disabled={saving}
                      />

                      {Array.isArray(
                        categoryForm.seo.keywords
                      ) &&
                        categoryForm.seo.keywords
                          .length > 0 && (
                          <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-3">
                            {categoryForm.seo.keywords.map(
                              (
                                keyword,
                                index
                              ) => (
                                <div
                                  key={`${keyword}-${index}`}
                                  className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm"
                                >
                                  <span className="max-w-[250px] break-words">
                                    {keyword}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeKeyword(
                                        keyword
                                      )
                                    }
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                                    aria-label={`Remove ${keyword}`}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      <p className="text-xs text-muted-foreground">
                        Press Enter or comma to add
                        multiple keywords. Duplicate
                        keywords are ignored.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Canonical URL
                        </Label>

                        <Input
                          value={
                            categoryForm.seo
                              .canonical
                          }
                          onChange={(e) =>
                            handleSeoChange(
                              "canonical",
                              e.target.value
                            )
                          }
                          placeholder="https://example.com/category/..."
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Author
                        </Label>

                        <Input
                          value={
                            categoryForm.seo.author
                          }
                          onChange={(e) =>
                            handleSeoChange(
                              "author",
                              e.target.value
                            )
                          }
                          placeholder="Your Store"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Robots
                      </Label>

                      <select
                        value={
                          categoryForm.seo
                            .robots ||
                          "index, follow"
                        }
                        onChange={(e) =>
                          handleSeoChange(
                            "robots",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="index, follow">
                          index, follow
                        </option>

                        <option value="index, nofollow">
                          index, nofollow
                        </option>

                        <option value="noindex, follow">
                          noindex, follow
                        </option>

                        <option value="noindex, nofollow">
                          noindex, nofollow
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {seoStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Share2  size={19} />

                      <h3 className="text-lg font-semibold">
                        Social SEO
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure social sharing metadata.
                    </p>
                  </div>

                  <div className="rounded-xl border p-4 sm:p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Share2  size={18} />

                      <h4 className="font-semibold">
                        Facebook
                      </h4>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label>
                          Facebook Title
                        </Label>

                        <Input
                          value={
                            categoryForm.seo
                              .facebook.title
                          }
                          onChange={(e) =>
                            handleFacebookSeoChange(
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Category title for Facebook"
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Facebook Description
                        </Label>

                        <textarea
                          value={
                            categoryForm.seo
                              .facebook
                              .description
                          }
                          onChange={(e) =>
                            handleFacebookSeoChange(
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description shown when shared on Facebook"
                          disabled={saving}
                          className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>
                            Card Type
                          </Label>

                          <select
                            value={
                              categoryForm.seo
                                .facebook
                                .card
                            }
                            onChange={(e) =>
                              handleFacebookSeoChange(
                                "card",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="summary">
                              Summary
                            </option>

                            <option value="summary_large_image">
                              Summary Large Image
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Facebook URL
                          </Label>

                          <Input
                            value={
                              categoryForm.seo
                                .facebook.url
                            }
                            onChange={(e) =>
                              handleFacebookSeoChange(
                                "url",
                                e.target.value
                              )
                            }
                            placeholder="https://example.com/category/..."
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Facebook Image Path
                        </Label>

                        <Input
                          value={
                            categoryForm.seo
                              .facebook
                              .image_path
                          }
                          onChange={(e) =>
                            handleFacebookSeoChange(
                              "image_path",
                              e.target.value
                            )
                          }
                          placeholder="/uploads/categories/facebook-image.jpg"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 sm:p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Share2  size={18} />

                      <h4 className="font-semibold">
                        Twitter / X
                      </h4>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label>
                          Twitter Title
                        </Label>

                        <Input
                          value={
                            categoryForm.seo
                              .twitter.title
                          }
                          onChange={(e) =>
                            handleTwitterSeoChange(
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Category title for Twitter/X"
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Twitter Description
                        </Label>

                        <textarea
                          value={
                            categoryForm.seo
                              .twitter
                              .description
                          }
                          onChange={(e) =>
                            handleTwitterSeoChange(
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description shown when shared on Twitter/X"
                          disabled={saving}
                          className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>
                            Card Type
                          </Label>

                          <select
                            value={
                              categoryForm.seo
                                .twitter
                                .card
                            }
                            onChange={(e) =>
                              handleTwitterSeoChange(
                                "card",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="summary">
                              Summary
                            </option>

                            <option value="summary_large_image">
                              Summary Large Image
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Redirect URL
                          </Label>

                          <Input
                            value={
                              categoryForm.seo
                                .twitter
                                .redirect_url
                            }
                            onChange={(e) =>
                              handleTwitterSeoChange(
                                "redirect_url",
                                e.target.value
                              )
                            }
                            placeholder="https://example.com/category/..."
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Twitter Image Path
                        </Label>

                        <Input
                          value={
                            categoryForm.seo
                              .twitter
                              .image_path
                          }
                          onChange={(e) =>
                            handleTwitterSeoChange(
                              "image_path",
                              e.target.value
                            )
                          }
                          placeholder="/uploads/categories/twitter-image.jpg"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {seoStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Code2 size={19} />

                      <h3 className="text-lg font-semibold">
                        JSON-LD Schema
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure structured data for this
                      category page.
                    </p>
                  </div>

                  <div className="rounded-xl border p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          Enable Schema
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Add structured data to the category
                          page.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSchemaChange(
                            "enabled",
                            !categoryForm.seo
                              .schema.enabled
                          )
                        }
                        disabled={saving}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          categoryForm.seo
                            .schema.enabled
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                        aria-label="Toggle schema"
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            categoryForm.seo
                              .schema.enabled
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {categoryForm.seo.schema
                    .enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>
                          Schema Type
                        </Label>

                        <select
                          value={
                            categoryForm.seo
                              .schema.type
                          }
                          onChange={(e) =>
                            handleSchemaChange(
                              "type",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="CollectionPage">
                            CollectionPage
                          </option>

                          <option value="ItemList">
                            ItemList
                          </option>

                          <option value="WebPage">
                            WebPage
                          </option>

                          <option value="Product">
                            Product
                          </option>

                          <option value="BreadcrumbList">
                            BreadcrumbList
                          </option>

                          <option value="Custom">
                            Custom
                          </option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>
                            Custom JSON-LD
                          </Label>

                          <span className="text-xs text-muted-foreground">
                            JSON format
                          </span>
                        </div>

                        <textarea
                          value={
                            categoryForm.seo
                              .schema
                              .customJson
                          }
                          onChange={(e) =>
                            handleSchemaChange(
                              "customJson",
                              e.target.value
                            )
                          }
                          placeholder={`{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Category Name",
  "url": "https://example.com/category/category-slug"
}`}
                          disabled={saving}
                          className="min-h-[260px] w-full rounded-md border bg-background px-3 py-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                        />

                        <p className="text-xs text-muted-foreground">
                          Leave empty if your backend
                          generates JSON-LD automatically.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-background px-4 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {seoStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSeoStep((prev) =>
                        Math.max(1, prev - 1)
                      )
                    }
                    disabled={saving}
                  >
                    Previous
                  </Button>
                )}

                {seoStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setSeoStep((prev) =>
                        Math.min(4, prev + 1)
                      )
                    }
                    disabled={saving}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
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
                )}
              </div>
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
                {deleteDialog.category?.name ||
                  "this category"}
              </strong>
              ?
            </p>

            {deleteDialog.category?.children
              ?.length > 0 && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                This category contains sub
                categories. Make sure you handle
                the related categories before
                deleting.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
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
                type="button"
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