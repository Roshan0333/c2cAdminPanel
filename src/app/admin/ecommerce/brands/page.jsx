"use client";

import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Share2,
  Code2,
  Info,
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
    type: "Product",
    customJson: "",
  },
});

const createEmptyBrand = () => ({
  name: "",
  slug: "",
  description: "",
  displayOrder: 0,
  isActive: true,
  bgColor: "",
  seo: createEmptySeo(),
});

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

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Brand details",
    icon: Info,
  },
  {
    id: 2,
    title: "SEO",
    description: "Search settings",
    icon: Search,
  },
  {
    id: 3,
    title: "Social SEO",
    description: "Facebook & X",
    icon: Share2,
  },
  {
    id: 4,
    title: "Schema",
    description: "JSON-LD",
    icon: Code2,
  },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [brandForm, setBrandForm] = useState(
    createEmptyBrand()
  );

  const [currentStep, setCurrentStep] = useState(1);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
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
      console.error("Failed to fetch brands:", err);

      setError(
        err?.message || "Failed to load brands"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setBrandForm(createEmptyBrand());
    setLogoFile(null);
    setLogoPreview("");
    setCurrentStep(1);
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
      displayOrder: brand.displayOrder ?? 0,
      isActive: brand.isActive !== false,
      bgColor: brand.bgColor || "",
      seo: normalizeSeo(brand.seo),
    });

    setLogoFile(null);
    setLogoPreview(brand.logo || "");
    setCurrentStep(1);
    setFormOpen(true);
  }

  function handleInputChange(field, value) {
    setBrandForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSeoChange(field, value) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  }

  function handleFacebookChange(field, value) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        facebook: {
          ...prev.seo.facebook,
          [field]: value,
        },
      },
    }));
  }

  function handleTwitterChange(field, value) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        twitter: {
          ...prev.seo.twitter,
          [field]: value,
        },
      },
    }));
  }

  function handleSchemaChange(field, value) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        schema: {
          ...prev.seo.schema,
          [field]: value,
        },
      },
    }));
  }

  function handleKeywordInput(value) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywordsInput: value,
      },
    }));
  }

  function addKeyword(value) {
    setBrandForm((prev) => {
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

      const mergedKeywords = [...existingKeywords];

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
  }

  function handleKeywordKeyDown(e) {
    if (
      e.key === "Enter" ||
      e.key === "," ||
      e.key === "Tab"
    ) {
      e.preventDefault();
      addKeyword();
    }
  }

  function removeKeyword(keywordToRemove) {
    setBrandForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: Array.isArray(prev.seo.keywords)
          ? prev.seo.keywords.filter(
              (keyword) => keyword !== keywordToRemove
            )
          : [],
      },
    }));
  }

  function handleKeywordBlur() {
    addKeyword();
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value) {
    setBrandForm((prev) => ({
      ...prev,
      name: value,
      slug:
        !editingBrand ||
        prev.slug === generateSlug(prev.name)
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
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
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

  function validateStep(step) {
    if (step === 1) {
      if (!brandForm.name.trim()) {
        toast.error("Brand name is required.");
        return false;
      }

      if (!brandForm.slug.trim()) {
        toast.error("Brand slug is required.");
        return false;
      }
    }

    if (step === 2) {
      if (
        brandForm.seo.title &&
        brandForm.seo.title.length > 60
      ) {
        toast.error(
          "SEO title should be 60 characters or less."
        );
        return false;
      }

      if (
        brandForm.seo.description &&
        brandForm.seo.description.length > 160
      ) {
        toast.error(
          "SEO description should be 160 characters or less."
        );
        return false;
      }
    }

    if (step === 4) {
      const customJson =
        brandForm.seo.schema.customJson?.trim();

      if (customJson) {
        try {
          JSON.parse(customJson);
        } catch {
          toast.error(
            "Custom Schema JSON-LD contains invalid JSON."
          );
          return false;
        }
      }
    }

    return true;
  }

  function handleNextStep() {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePreviousStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleStepClick(stepId) {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  }

  function buildSeoPayload() {
    const keywords = Array.isArray(
      brandForm.seo.keywords
    )
      ? brandForm.seo.keywords
          .map((keyword) => String(keyword).trim())
          .filter(Boolean)
      : [];

    return {
      title: brandForm.seo.title?.trim() || "",

      description:
        brandForm.seo.description?.trim() || "",

      keywords,

      canonical:
        brandForm.seo.canonical?.trim() || "",

      author:
        brandForm.seo.author?.trim() || "",

      robots:
        brandForm.seo.robots || "index, follow",

      facebook: {
        title:
          brandForm.seo.facebook.title?.trim() || "",

        description:
          brandForm.seo.facebook.description?.trim() || "",

        card:
          brandForm.seo.facebook.card ||
          "summary_large_image",

        url:
          brandForm.seo.facebook.url?.trim() || "",

        image_path:
          brandForm.seo.facebook.image_path?.trim() || "",
      },

      twitter: {
        title:
          brandForm.seo.twitter.title?.trim() || "",

        description:
          brandForm.seo.twitter.description?.trim() || "",

        card:
          brandForm.seo.twitter.card ||
          "summary_large_image",

        redirect_url:
          brandForm.seo.twitter.redirect_url?.trim() || "",

        image_path:
          brandForm.seo.twitter.image_path?.trim() || "",
      },

      schema: {
        enabled: Boolean(
          brandForm.seo.schema.enabled
        ),

        type:
          brandForm.seo.schema.type ||
          "Product",

        customJson:
          brandForm.seo.schema.customJson?.trim() || "",
      },
    };
  }

  async function handleSave() {
    if (!validateStep(currentStep)) {
      return;
    }

    for (
      let step = 1;
      step <= currentStep;
      step++
    ) {
      if (!validateStep(step)) {
        return;
      }
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
        brandForm.description?.trim() || ""
      );

      formData.append(
        "bgColor",
        brandForm.bgColor?.trim() || "#000000"
      );

      formData.append(
        "displayOrder",
        String(
          Number(brandForm.displayOrder) || 0
        )
      );

      formData.append(
        "isActive",
        String(Boolean(brandForm.isActive))
      );

      formData.append(
        "seo",
        JSON.stringify(buildSeoPayload())
      );

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (editingBrand?.id) {
        const res = await updateBrand(
          editingBrand.id,
          formData
        );

        if (!res?.success) {
          throw new Error(
            res?.message || "Failed to update brand"
          );
        }

        const updated =
          res.brand ||
          res.data ||
          res;

        setBrands((prev) =>
          prev.map((brand) =>
            brand.id === editingBrand.id
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
        const res = await createBrand(formData);

        if (!res?.success) {
          throw new Error(
            res?.message || "Failed to create brand"
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
      const res = await deleteBrand(
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
                      {brand._count?.products ?? 0}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {brand.displayOrder ?? 0}
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
                          <Pencil size={16} />
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
                          <Trash2 size={16} />
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
        <DialogContent className="flex max-h-[92vh] w-[calc(100%-1rem)] flex-col overflow-hidden p-0 sm:max-w-[720px]">
          <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
            <DialogTitle className="text-lg sm:text-xl">
              {editingBrand
                ? "Update Brand"
                : "Add Brand"}
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Complete each step to configure
              your brand.
            </p>
          </DialogHeader>

          <div className="shrink-0 border-b bg-muted/20 px-3 py-3 sm:px-6">
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-[650px] items-center">
                {steps.map((step, index) => {
                  const active =
                    currentStep === step.id;

                  const completed =
                    currentStep > step.id;

                  const StepIcon =
                    step.icon;

                  return (
                    <div
                      key={step.id}
                      className="flex min-w-0 flex-1 items-center"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleStepClick(
                            step.id
                          )
                        }
                        disabled={
                          step.id >
                          currentStep
                        }
                        className={`flex min-w-0 items-center gap-2 text-left ${
                          step.id >
                          currentStep
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : completed
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-muted-foreground/30 bg-background text-muted-foreground"
                          }`}
                        >
                          {completed ? (
                            <Check size={16} />
                          ) : (
                            <StepIcon size={16} />
                          )}
                        </div>

                        <div className="hidden min-w-0 sm:block">
                          <p
                            className={`truncate text-xs font-medium ${
                              active
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {step.title}
                          </p>

                          <p className="truncate text-[11px] text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </button>

                      {index <
                        steps.length - 1 && (
                        <div
                          className={`mx-2 h-px flex-1 ${
                            currentStep >
                            step.id
                              ? "bg-green-500"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold">
                    Basic Information
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add the main information
                    for your brand.
                  </p>
                </div>

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
                  <Label htmlFor="brand-bg-color">
                    Background Colour
                  </Label>

                  <Input
                    id="brand-bg-color"
                    value={
                      brandForm.bgColor
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "bgColor",
                        e.target.value
                      )
                    }
                    placeholder="#000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Brand Logo</Label>

                  <div className="flex flex-col gap-3">
                    {logoPreview ? (
                      <div className="relative w-fit">
                        <img
                          src={logoPreview}
                          alt="Brand logo preview"
                          className="h-28 w-28 rounded-xl border bg-white object-contain p-2"
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
                      <ImagePlus size={16} />

                      {logoPreview
                        ? "Change Logo"
                        : "Upload Logo"}
                    </label>

                    <input
                      id="brand-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
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
                      brand.
                    </p>
                  </div>

                  <Switch
                    checked={
                      brandForm.isActive
                    }
                    onCheckedChange={(value) =>
                      handleInputChange(
                        "isActive",
                        value
                      )
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold">
                    SEO Settings
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure search engine
                    metadata.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-title">
                      SEO Title
                    </Label>

                    <span className="text-xs text-muted-foreground">
                      {
                        brandForm.seo.title
                          .length
                      }
                      /60
                    </span>
                  </div>

                  <Input
                    id="seo-title"
                    value={
                      brandForm.seo.title
                    }
                    onChange={(e) =>
                      handleSeoChange(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Enter SEO title"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-description">
                      SEO Description
                    </Label>

                    <span className="text-xs text-muted-foreground">
                      {
                        brandForm.seo.description
                          .length
                      }
                      /160
                    </span>
                  </div>

                  <Textarea
                    id="seo-description"
                    value={
                      brandForm.seo
                        .description
                    }
                    onChange={(e) =>
                      handleSeoChange(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Enter SEO description"
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-keywords">
                      Keywords
                    </Label>

                    <span className="text-xs text-muted-foreground">
                      {Array.isArray(
                        brandForm.seo.keywords
                      )
                        ? brandForm.seo
                            .keywords.length
                        : 0}{" "}
                      keyword
                      {Array.isArray(
                        brandForm.seo.keywords
                      ) &&
                      brandForm.seo.keywords
                        .length === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  <Input
                    id="seo-keywords"
                    value={
                      brandForm.seo
                        .keywordsInput || ""
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
                  />

                  {Array.isArray(
                    brandForm.seo.keywords
                  ) &&
                    brandForm.seo.keywords
                      .length > 0 && (
                      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-3">
                        {brandForm.seo.keywords.map(
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
                    Press Enter, comma, or Tab
                    to add a keyword. Duplicate
                    keywords are ignored.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-canonical">
                    Canonical URL
                  </Label>

                  <Input
                    id="seo-canonical"
                    value={
                      brandForm.seo.canonical
                    }
                    onChange={(e) =>
                      handleSeoChange(
                        "canonical",
                        e.target.value
                      )
                    }
                    placeholder="https://example.com/brands/brand-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-author">
                    Author
                  </Label>

                  <Input
                    id="seo-author"
                    value={
                      brandForm.seo.author
                    }
                    onChange={(e) =>
                      handleSeoChange(
                        "author",
                        e.target.value
                      )
                    }
                    placeholder="Brand or company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-robots">
                    Robots
                  </Label>

                  <select
                    id="seo-robots"
                    value={
                      brandForm.seo.robots
                    }
                    onChange={(e) =>
                      handleSeoChange(
                        "robots",
                        e.target.value
                      )
                    }
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="index, follow">
                      index, follow
                    </option>

                    <option value="noindex, follow">
                      noindex, follow
                    </option>

                    <option value="index, nofollow">
                      index, nofollow
                    </option>

                    <option value="noindex, nofollow">
                      noindex, nofollow
                    </option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold">
                    Social SEO
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure Facebook and
                    Twitter/X metadata.
                  </p>
                </div>

                <div className="rounded-xl border">
                  <div className="border-b bg-muted/20 p-4">
                    <h3 className="font-semibold">
                      Facebook
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Open Graph metadata.
                    </p>
                  </div>

                  <div className="space-y-5 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook-title">
                        Title
                      </Label>

                      <Input
                        id="facebook-title"
                        value={
                          brandForm.seo.facebook.title
                        }
                        onChange={(e) =>
                          handleFacebookChange(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Facebook title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook-description">
                        Description
                      </Label>

                      <Textarea
                        id="facebook-description"
                        value={
                          brandForm.seo.facebook.description
                        }
                        onChange={(e) =>
                          handleFacebookChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Facebook description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook-card">
                        Card Type
                      </Label>

                      <select
                        id="facebook-card"
                        value={
                          brandForm.seo.facebook.card
                        }
                        onChange={(e) =>
                          handleFacebookChange(
                            "card",
                            e.target.value
                          )
                        }
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="summary_large_image">
                          Summary Large Image
                        </option>

                        <option value="summary">
                          Summary
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook-url">
                        URL
                      </Label>

                      <Input
                        id="facebook-url"
                        value={
                          brandForm.seo.facebook.url
                        }
                        onChange={(e) =>
                          handleFacebookChange(
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://example.com/brands/brand-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook-image">
                        Image Path
                      </Label>

                      <Input
                        id="facebook-image"
                        value={
                          brandForm.seo.facebook.image_path
                        }
                        onChange={(e) =>
                          handleFacebookChange(
                            "image_path",
                            e.target.value
                          )
                        }
                        placeholder="/uploads/seo/facebook-image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border">
                  <div className="border-b bg-muted/20 p-4">
                    <h3 className="font-semibold">
                      Twitter / X
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Twitter/X card metadata.
                    </p>
                  </div>

                  <div className="space-y-5 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter-title">
                        Title
                      </Label>

                      <Input
                        id="twitter-title"
                        value={
                          brandForm.seo.twitter.title
                        }
                        onChange={(e) =>
                          handleTwitterChange(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Twitter/X title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter-description">
                        Description
                      </Label>

                      <Textarea
                        id="twitter-description"
                        value={
                          brandForm.seo.twitter.description
                        }
                        onChange={(e) =>
                          handleTwitterChange(
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Twitter/X description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter-card">
                        Card Type
                      </Label>

                      <select
                        id="twitter-card"
                        value={
                          brandForm.seo.twitter.card
                        }
                        onChange={(e) =>
                          handleTwitterChange(
                            "card",
                            e.target.value
                          )
                        }
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="summary_large_image">
                          Summary Large Image
                        </option>

                        <option value="summary">
                          Summary
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter-redirect">
                        Redirect URL
                      </Label>

                      <Input
                        id="twitter-redirect"
                        value={
                          brandForm.seo.twitter.redirect_url
                        }
                        onChange={(e) =>
                          handleTwitterChange(
                            "redirect_url",
                            e.target.value
                          )
                        }
                        placeholder="https://example.com/brands/brand-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter-image">
                        Image Path
                      </Label>

                      <Input
                        id="twitter-image"
                        value={
                          brandForm.seo.twitter.image_path
                        }
                        onChange={(e) =>
                          handleTwitterChange(
                            "image_path",
                            e.target.value
                          )
                        }
                        placeholder="/uploads/seo/twitter-image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold">
                    JSON-LD Structured Data
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure structured data for
                    search engines.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div className="pr-4">
                    <p className="text-sm font-medium">
                      Enable Schema
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Add JSON-LD structured data to
                      the brand page.
                    </p>
                  </div>

                  <Switch
                    checked={
                      brandForm.seo.schema.enabled
                    }
                    onCheckedChange={(value) =>
                      handleSchemaChange(
                        "enabled",
                        value
                      )
                    }
                  />
                </div>

                {brandForm.seo.schema.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schema-type">
                        Schema Type
                      </Label>

                      <select
                        id="schema-type"
                        value={
                          brandForm.seo.schema.type
                        }
                        onChange={(e) =>
                          handleSchemaChange(
                            "type",
                            e.target.value
                          )
                        }
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="Product">
                          Product
                        </option>

                        <option value="Organization">
                          Organization
                        </option>

                        <option value="Brand">
                          Brand
                        </option>

                        <option value="WebPage">
                          WebPage
                        </option>

                        <option value="Article">
                          Article
                        </option>

                        <option value="CollectionPage">
                          CollectionPage
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schema-json">
                        Custom JSON-LD
                      </Label>

                      <Textarea
                        id="schema-json"
                        value={
                          brandForm.seo.schema.customJson
                        }
                        onChange={(e) =>
                          handleSchemaChange(
                            "customJson",
                            e.target.value
                          )
                        }
                        placeholder={`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Brand Name"
}`}
                        rows={14}
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Schema Status
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {brandForm.seo.schema.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Schema Type
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {brandForm.seo.schema.type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-4 py-3 sm:px-6 mb-1 mx-1">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handlePreviousStep
                    }
                    disabled={saving}
                  >
                    <ChevronLeft
                      size={16}
                      className="mr-1"
                    />
                    Previous
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={saving}
                  >
                    Next
                    <ChevronRight
                      size={16}
                      className="ml-1"
                    />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingBrand
                        ? "Update Brand"
                        : "Create Brand"}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
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