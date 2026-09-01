"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Package,
  Settings2,
  FileText,
  Search,
  Images,
  Layers3,
} from "lucide-react";
import { getBrands } from "@/apiService/brandApi";

const emptyVariant = {
  size: "",
  flavour: "",
  price: "",
  discountedPrice: "",
  stockQuantity: "",
  weight: "",
  length: "",
  height: "",
  breadth: "",
  image: null,
  imageFile: null,
};

const emptyForm = {
  name: "",
  title: "",
  slug: "",
  sku: "",
  description: "",
  categoryId: "",
  brandId: "",
  status: "active",
  taxRate: "0",

  isFeatured: false,
  isPopular: false,
  isRecent: false,
  isTopRated: false,
  isTrending: false,

  featuredimg: null,
  images: [],

  variants: [{ ...emptyVariant }],

  keyBenefits: [],
  howToUse: [],
  safetyInformation: [],
  whatToAvoid: [],
  whoShouldUse: [],
  whychooseus: [],

  faqs: [],
  tags: [],

  seo: {
    title: "",
    description: "",
    keywords: "",
    canonical: "",
    author: "",
  },

  hsnCode: "",
};

const steps = [
  {
    id: 1,
    title: "Basic Info",
    description: "Product information",
    icon: Package,
  },
  {
    id: 2,
    title: "Images",
    description: "Product gallery",
    icon: Images,
  },
  {
    id: 3,
    title: "Variants",
    description: "Pricing & stock",
    icon: Layers3,
  },
  {
    id: 4,
    title: "Details",
    description: "Product details",
    icon: FileText,
  },
  {
    id: 5,
    title: "Settings",
    description: "Visibility",
    icon: Settings2,
  },
  {
    id: 6,
    title: "SEO",
    description: "Search optimization",
    icon: Search,
  },
];

function toNumberOrNull(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

function toNumberOrDefault(
  value,
  fallback = 0
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? fallback
    : number;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return [value];
}

function normalizeSeo(value) {
  if (!value) {
    return {
      ...emptyForm.seo,
    };
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return {
      ...emptyForm.seo,
      ...value,
    };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return {
          ...emptyForm.seo,
          ...parsed,
        };
      }
    } catch {
      return {
        ...emptyForm.seo,
      };
    }
  }

  return {
    ...emptyForm.seo,
  };
}

function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      if (image?.url) {
        return image.url;
      }

      if (image?.image) {
        return image.image;
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeVariant(variant) {
  return {
    id: variant?.id,
    productId: variant?.productId,

    size: variant?.size ?? "",
    flavour: variant?.flavour ?? "",

    price: variant?.price ?? "",
    discountedPrice:
      variant?.discountedPrice ?? "",
    stockQuantity:
      variant?.stockQuantity ?? "",

    weight: variant?.weight ?? "",
    length: variant?.length ?? "",
    height: variant?.height ?? "",
    breadth: variant?.breadth ?? "",

    image: variant?.image ?? null,
    imageFile: null,
  };
}

function normalizeProduct(product) {
  if (!product) {
    return {
      ...emptyForm,
      variants: [{ ...emptyVariant }],
      seo: {
        ...emptyForm.seo,
      },
    };
  }

  return {
    ...emptyForm,
    ...product,

    categoryId:
      product.categoryId !== null &&
      product.categoryId !== undefined
        ? String(product.categoryId)
        : "",

    brandId:
      product.brandId !== null &&
      product.brandId !== undefined
        ? String(product.brandId)
        : "",

    taxRate:
      product.taxRate !== null &&
      product.taxRate !== undefined
        ? String(product.taxRate)
        : "0",

    isFeatured: Boolean(
      product.isFeatured
    ),
    isPopular: Boolean(
      product.isPopular
    ),
    isRecent: Boolean(
      product.isRecent
    ),
    isTopRated: Boolean(
      product.isTopRated
    ),
    isTrending: Boolean(
      product.isTrending
    ),

    featuredimg:
      product.featuredimg || null,

    images: normalizeImages(
      product.images
    ),

    variants:
      Array.isArray(product.variants) &&
      product.variants.length
        ? product.variants.map(
            normalizeVariant
          )
        : [{ ...emptyVariant }],

    keyBenefits: normalizeArray(
      product.keyBenefits
    ),
    howToUse: normalizeArray(
      product.howToUse
    ),
    safetyInformation:
      normalizeArray(
        product.safetyInformation
      ),
    whatToAvoid: normalizeArray(
      product.whatToAvoid
    ),
    whoShouldUse: normalizeArray(
      product.whoShouldUse
    ),
    whychooseus: normalizeArray(
      product.whychooseus
    ),

    faqs: Array.isArray(product.faqs)
      ? product.faqs
      : [],

    tags: normalizeArray(
      product.tags
    ),

    seo: normalizeSeo(product.seo),

    hsnCode: product.hsnCode || "",
  };
}

function getFilePreview(file) {
  if (!file) {
    return null;
  }

  if (
    typeof File !== "undefined" &&
    file instanceof File
  ) {
    return URL.createObjectURL(file);
  }

  return null;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
  saving,
}) {
  const [form, setForm] =
    useState(emptyForm);

  const [brands, setBrands] =
    useState([]);

  const [loadingBrands, setLoadingBrands] =
    useState(false);

  const [currentStep, setCurrentStep] =
    useState(1);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      normalizeProduct(product)
    );

    setCurrentStep(1);

    loadBrands();
  }, [product, open]);

  async function loadBrands() {
    try {
      setLoadingBrands(true);

      const response =
        await getBrands();

      if (response?.success) {
        setBrands(
          response.brands || []
        );
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error(
        "Failed to load brands:",
        error
      );

      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }

  function handleChange(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSeoChange(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      seo: {
        ...previous.seo,
        [field]: value,
      },
    }));
  }

  function handleArrayChange(
    field,
    index,
    value
  ) {
    setForm((previous) => {
      const values = [
        ...(previous[field] || []),
      ];

      values[index] = value;

      return {
        ...previous,
        [field]: values,
      };
    });
  }

  function addArrayItem(field) {
    setForm((previous) => ({
      ...previous,
      [field]: [
        ...(previous[field] || []),
        "",
      ],
    }));
  }

  function removeArrayItem(
    field,
    index
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: (
        previous[field] || []
      ).filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  function handleVariantChange(
    index,
    field,
    value
  ) {
    setForm((previous) => {
      const variants = [
        ...previous.variants,
      ];

      variants[index] = {
        ...variants[index],
        [field]: value,
      };

      return {
        ...previous,
        variants,
      };
    });
  }

  function addVariant() {
    setForm((previous) => ({
      ...previous,
      variants: [
        ...previous.variants,
        {
          ...emptyVariant,
        },
      ],
    }));
  }

  function removeVariant(index) {
    setForm((previous) => {
      if (
        previous.variants.length <= 1
      ) {
        return previous;
      }

      return {
        ...previous,
        variants:
          previous.variants.filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
      };
    });
  }

  function handleFeaturedImage(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      featuredimg: file,
    }));

    event.target.value = "";
  }

  function removeFeaturedImage() {
    setForm((previous) => ({
      ...previous,
      featuredimg: null,
    }));
  }

  function handleGalleryImages(
    event
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      images: [
        ...(previous.images || []),
        ...files,
      ],
    }));

    event.target.value = "";
  }

  function removeGalleryImage(
    index
  ) {
    setForm((previous) => ({
      ...previous,
      images: (
        previous.images || []
      ).filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  function handleVariantImage(
    event,
    index
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((previous) => {
      const variants = [
        ...previous.variants,
      ];

      variants[index] = {
        ...variants[index],
        image: file,
        imageFile: file,
      };

      return {
        ...previous,
        variants,
      };
    });

    event.target.value = "";
  }

  function removeVariantImage(
    index
  ) {
    setForm((previous) => {
      const variants = [
        ...previous.variants,
      ];

      variants[index] = {
        ...variants[index],
        image: null,
        imageFile: null,
      };

      return {
        ...previous,
        variants,
      };
    });
  }

  function getImagePreview(image) {
    if (!image) {
      return null;
    }

    if (typeof image === "string") {
      return image;
    }

    return getFilePreview(image);
  }

  function goToStep(step) {
    setCurrentStep(step);
  }

  function nextStep() {
    if (
      currentStep === 1 &&
      !form.name?.trim()
    ) {
      alert(
        "Product name is required."
      );
      return;
    }

    if (
      currentStep < steps.length
    ) {
      setCurrentStep(
        (previous) =>
          previous + 1
      );
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep(
        (previous) =>
          previous - 1
      );
    }
  }

  function handleSubmit() {
    if (!form.name?.trim()) {
      setCurrentStep(1);

      alert(
        "Product name is required."
      );

      return;
    }

    const payload = {
      ...(product?.id
        ? {
            id: product.id,
          }
        : {}),

      name: form.name || "",
      title: form.title || "",
      slug: form.slug || "",
      sku: form.sku || "",
      description:
        form.description || "",

      categoryId: toNumberOrNull(
        form.categoryId
      ),

      brandId: toNumberOrNull(
        form.brandId
      ),

      status:
        form.status || "active",

      taxRate:
        form.taxRate === "" ||
        form.taxRate === null ||
        form.taxRate === undefined
          ? "0"
          : String(form.taxRate),

      isFeatured: Boolean(
        form.isFeatured
      ),

      isPopular: Boolean(
        form.isPopular
      ),

      isRecent: Boolean(
        form.isRecent
      ),

      isTopRated: Boolean(
        form.isTopRated
      ),

      isTrending: Boolean(
        form.isTrending
      ),

      featuredimg:
        form.featuredimg,

      images:
        form.images || [],

      keyBenefits:
        form.keyBenefits || [],

      howToUse:
        form.howToUse || [],

      safetyInformation:
        form.safetyInformation ||
        [],

      whatToAvoid:
        form.whatToAvoid || [],

      whoShouldUse:
        form.whoShouldUse || [],

      whychooseus:
        form.whychooseus || [],

      faqs: form.faqs || [],

      tags: form.tags || [],

      seo: form.seo || {},

      hsnCode:
        form.hsnCode || null,

      variants: (
        form.variants || []
      ).map((variant) => ({
        ...(variant.id
          ? {
              id: variant.id,
            }
          : {}),

        size: variant.size || "",
        flavour:
          variant.flavour || "",

        price: toNumberOrDefault(
          variant.price,
          0
        ),

        discountedPrice:
          toNumberOrNull(
            variant.discountedPrice
          ),

        stockQuantity:
          toNumberOrDefault(
            variant.stockQuantity,
            0
          ),

        weight:
          variant.weight || "",

        length:
          variant.length || "",

        height:
          variant.height || "",

        breadth:
          variant.breadth || "",

        image:
          variant.image instanceof
          File
            ? null
            : variant.image || null,

        imageFile:
          variant.imageFile instanceof
          File
            ? variant.imageFile
            : null,
      })),
    };

    onSave(payload);
  }

  const progress = useMemo(
    () =>
      Math.round(
        (currentStep /
          steps.length) *
          100
      ),
    [currentStep]
  );

  function renderStepIndicator() {
    return (
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              Product Setup
            </p>

            <p className="text-xs text-muted-foreground">
              Step {currentStep} of{" "}
              {steps.length}
            </p>
          </div>

          <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
            {progress}%
          </div>
        </div>

        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2 px-1">
            {steps.map((step) => {
              const Icon = step.icon;

              const active =
                currentStep ===
                step.id;

              const completed =
                currentStep >
                step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    goToStep(
                      step.id
                    )
                  }
                  className={`flex min-w-[145px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all sm:min-w-[155px] ${
                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : completed
                      ? "border-primary/20 bg-primary/5 hover:border-primary/40"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : completed
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {completed ? (
                      <Check
                        size={17}
                      />
                    ) : (
                      <Icon
                        size={17}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-xs font-semibold sm:text-sm ${
                        active
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {step.title}
                    </p>

                    <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                      {
                        step.description
                      }
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderBasicInfo() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">
            Basic Information
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the primary information
            for your product.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>
              Product Name{" "}
              <span className="text-red-500">
                *
              </span>
            </Label>

            <Input
              value={form.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target
                    .value
                )
              }
              placeholder="e.g. Test Product 5"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Product Title
            </Label>

            <Input
              value={form.title}
              onChange={(event) =>
                handleChange(
                  "title",
                  event.target
                    .value
                )
              }
              placeholder="Product title"
            />
          </div>

          <div className="grid gap-2">
            <Label>Slug</Label>

            <Input
              value={form.slug}
              onChange={(event) =>
                handleChange(
                  "slug",
                  event.target
                    .value
                )
              }
              placeholder="product-slug"
            />
          </div>

          <div className="grid gap-2">
            <Label>SKU</Label>

            <Input
              value={form.sku}
              onChange={(event) =>
                handleChange(
                  "sku",
                  event.target
                    .value
                )
              }
              placeholder="SKU-001"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Category ID
            </Label>

            <Input
              type="number"
              value={
                form.categoryId
              }
              onChange={(event) =>
                handleChange(
                  "categoryId",
                  event.target
                    .value
                )
              }
              placeholder="1"
            />
          </div>

          <div className="grid gap-2">
            <Label>Brand</Label>

            <Select
              value={
                form.brandId ||
                "none"
              }
              onValueChange={(
                value
              ) =>
                handleChange(
                  "brandId",
                  value ===
                    "none"
                    ? ""
                    : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingBrands
                      ? "Loading brands..."
                      : "Select brand"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">
                  No Brand
                </SelectItem>

                {brands.map(
                  (brand) => (
                    <SelectItem
                      key={
                        brand.id
                      }
                      value={String(
                        brand.id
                      )}
                    >
                      {
                        brand.name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>
            Description
          </Label>

          <Textarea
            value={
              form.description
            }
            onChange={(event) =>
              handleChange(
                "description",
                event.target
                  .value
              )
            }
            placeholder="Write a detailed product description..."
            rows={6}
            className="min-h-[140px] resize-y"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>
              HSN Code
            </Label>

            <Input
              value={form.hsnCode}
              onChange={(event) =>
                handleChange(
                  "hsnCode",
                  event.target
                    .value
                )
              }
              placeholder="HSN code"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Tax Rate (%)
            </Label>

            <Input
              type="number"
              value={form.taxRate}
              onChange={(event) =>
                handleChange(
                  "taxRate",
                  event.target
                    .value
                )
              }
              placeholder="0"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderImages() {
    const featuredPreview =
      getImagePreview(
        form.featuredimg
      );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">
            Product Images
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Add your main product image
            and gallery images.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
          <div className="mb-5">
            <h4 className="font-semibold">
              Featured Image
            </h4>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              The main image shown on
              product cards and product
              pages.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {featuredPreview ? (
              <div className="relative w-fit">
                <img
                  src={
                    featuredPreview
                  }
                  alt="Featured product"
                  className="h-36 w-36 rounded-2xl border bg-background object-cover shadow-sm sm:h-44 sm:w-44"
                />

                <button
                  type="button"
                  onClick={
                    removeFeaturedImage
                  }
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-background text-center transition hover:border-primary hover:bg-primary/5 sm:h-44 sm:w-44">
                <ImagePlus
                  size={32}
                  className="mb-2 text-muted-foreground"
                />

                <span className="text-sm font-semibold">
                  Add Image
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WEBP
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleFeaturedImage
                  }
                />
              </label>
            )}

            <div>
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted sm:w-auto">
                <Upload size={16} />

                {featuredPreview
                  ? "Change Image"
                  : "Upload Image"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleFeaturedImage
                  }
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold">
                Product Gallery
              </h4>

              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Upload multiple images
                for the product gallery.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <Plus size={16} />
              Add Images

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={
                  handleGalleryImages
                }
              />
            </label>
          </div>

          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-background px-5 text-center transition hover:border-primary hover:bg-primary/5 sm:min-h-[220px]">
            <Images
              size={40}
              className="mb-3 text-muted-foreground"
            />

            <p className="font-semibold">
              Add product gallery images
            </p>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Select multiple images at
              once
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={
                handleGalleryImages
              }
            />
          </label>

          {form.images?.length >
            0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {form.images.map(
                (
                  image,
                  index
                ) => {
                  const preview =
                    getImagePreview(
                      image
                    );

                  return (
                    <div
                      key={`${index}-${typeof image === "string" ? image : image?.name}`}
                      className="group relative overflow-hidden rounded-2xl border bg-background"
                    >
                      {preview && (
                        <img
                          src={
                            preview
                          }
                          alt={`Product image ${
                            index +
                            1
                          }`}
                          className="aspect-square w-full object-cover"
                        />
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                        <span className="text-xs font-semibold text-white">
                          Image{" "}
                          {index +
                            1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderVariants() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl">
              Product Variants
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Configure pricing, stock,
              dimensions and images.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="w-full sm:w-auto"
          >
            <Plus
              size={16}
              className="mr-2"
            />
            Add Variant
          </Button>
        </div>

        <div className="space-y-5">
          {form.variants.map(
            (
              variant,
              index
            ) => {
              const preview =
                getImagePreview(
                  variant.image
                );

              return (
                <div
                  key={
                    variant.id ||
                    index
                  }
                  className="overflow-hidden rounded-2xl border bg-muted/20"
                >
                  <div className="flex items-center justify-between border-b bg-background px-4 py-4 sm:px-5">
                    <div>
                      <p className="font-semibold">
                        Variant{" "}
                        {index +
                          1}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Variant configuration
                      </p>
                    </div>

                    {form
                      .variants
                      .length >
                      1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeVariant(
                            index
                          )
                        }
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={
                            17
                          }
                        />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>
                          Size
                        </Label>

                        <Input
                          value={
                            variant.size
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "size",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="100g"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Flavour
                        </Label>

                        <Input
                          value={
                            variant.flavour
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "flavour",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Unflavoured"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Price
                        </Label>

                        <Input
                          type="number"
                          value={
                            variant.price ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "price",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="499"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Discounted Price
                        </Label>

                        <Input
                          type="number"
                          value={
                            variant.discountedPrice ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "discountedPrice",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="399"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Stock Quantity
                        </Label>

                        <Input
                          type="number"
                          value={
                            variant.stockQuantity ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "stockQuantity",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="20"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Weight
                        </Label>

                        <Input
                          value={
                            variant.weight ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "weight",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold">
                        Dimensions
                      </p>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                          <Label>
                            Length
                          </Label>

                          <Input
                            value={
                              variant.length ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleVariantChange(
                                index,
                                "length",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>
                            Height
                          </Label>

                          <Input
                            value={
                              variant.height ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleVariantChange(
                                index,
                                "height",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>
                            Breadth
                          </Label>

                          <Input
                            value={
                              variant.breadth ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleVariantChange(
                                index,
                                "breadth",
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold">
                        Variant Image
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        {preview && (
                          <div className="relative">
                            <img
                              src={
                                preview
                              }
                              alt={`Variant ${
                                index +
                                1
                              }`}
                              className="h-28 w-28 rounded-xl border bg-background object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeVariantImage(
                                  index
                                )
                              }
                              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            >
                              <X
                                size={
                                  14
                                }
                              />
                            </button>
                          </div>
                        )}

                        <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium hover:bg-muted sm:w-auto">
                          <Upload
                            size={
                              16
                            }
                          />

                          {preview
                            ? "Change Image"
                            : "Upload Image"}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleVariantImage(
                                event,
                                index
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  }

  function renderDetails() {
    const fields = [
      [
        "keyBenefits",
        "Key Benefits",
        "Add product benefits.",
      ],
      [
        "howToUse",
        "How To Use",
        "Add usage instructions.",
      ],
      [
        "safetyInformation",
        "Safety Information",
        "Add safety instructions.",
      ],
      [
        "whatToAvoid",
        "What To Avoid",
        "Add things customers should avoid.",
      ],
      [
        "whoShouldUse",
        "Who Should Use",
        "Describe the ideal customer.",
      ],
      [
        "whychooseus",
        "Why Choose Us",
        "Add reasons to choose this product.",
      ],
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">
            Product Details
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Add detailed information
            about your product.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {fields.map(
            ([
              field,
              label,
              description,
            ]) => (
              <div
                key={field}
                className="rounded-2xl border bg-muted/20 p-4 sm:p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">
                      {label}
                    </h4>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        description
                      }
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addArrayItem(
                        field
                      )
                    }
                  >
                    <Plus
                      size={
                        14
                      }
                      className="mr-1"
                    />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {(
                    form[
                      field
                    ] || []
                  ).map(
                    (
                      value,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="flex gap-2"
                      >
                        <Input
                          value={
                            value
                          }
                          onChange={(
                            event
                          ) =>
                            handleArrayChange(
                              field,
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder={`${label} ${index + 1}`}
                        />

                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            removeArrayItem(
                              field,
                              index
                            )
                          }
                          className="shrink-0 text-red-500 hover:text-red-600"
                        >
                          <X
                            size={
                              16
                            }
                          />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold">
                Tags
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                Add searchable product
                tags.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                addArrayItem(
                  "tags"
                )
              }
            >
              <Plus
                size={14}
                className="mr-1"
              />
              Add
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(form.tags || []).map(
              (tag, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >
                  <Input
                    value={tag}
                    onChange={(
                      event
                    ) =>
                      handleArrayChange(
                        "tags",
                        index,
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="e.g. protein"
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      removeArrayItem(
                        "tags",
                        index
                      )
                    }
                  >
                    <X
                      size={16}
                    />
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderSettings() {
    const switches = [
      [
        "isFeatured",
        "Featured Product",
        "Show this product as featured.",
      ],
      [
        "isPopular",
        "Popular Product",
        "Mark this product as popular.",
      ],
      [
        "isRecent",
        "Recent Product",
        "Mark this product as recently added.",
      ],
      [
        "isTopRated",
        "Top Rated",
        "Mark this product as top rated.",
      ],
      [
        "isTrending",
        "Trending Product",
        "Show this product as trending.",
      ],
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">
            Product Settings
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Control product visibility
            and merchandising.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Status</Label>

            <Select
              value={form.status}
              onValueChange={(value) =>
                handleChange(
                  "status",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>
              Tax Rate (%)
            </Label>

            <Input
              type="number"
              value={form.taxRate}
              onChange={(event) =>
                handleChange(
                  "taxRate",
                  event.target
                    .value
                )
              }
            />
          </div>
        </div>

        <div className="grid gap-3">
          {switches.map(
            ([
              field,
              label,
              description,
            ]) => (
              <div
                key={field}
                className="flex items-center justify-between gap-4 rounded-2xl border bg-muted/20 p-4 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {label}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {
                      description
                    }
                  </p>
                </div>

                <Switch
                  checked={Boolean(
                    form[field]
                  )}
                  onCheckedChange={(
                    value
                  ) =>
                    handleChange(
                      field,
                      Boolean(
                        value
                      )
                    )
                  }
                />
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  function renderSeo() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">
            SEO Information
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Optimize your product for
            search engines.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
          <div className="space-y-5">
            <div className="grid gap-2">
              <Label>
                SEO Title
              </Label>

              <Input
                value={
                  form.seo.title
                }
                onChange={(event) =>
                  handleSeoChange(
                    "title",
                    event.target
                      .value
                  )
                }
                placeholder="SEO title"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                SEO Description
              </Label>

              <Textarea
                value={
                  form.seo.description
                }
                onChange={(event) =>
                  handleSeoChange(
                    "description",
                    event.target
                      .value
                  )
                }
                placeholder="SEO description"
                rows={5}
                className="resize-y"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                SEO Keywords
              </Label>

              <Input
                value={
                  form.seo.keywords
                }
                onChange={(event) =>
                  handleSeoChange(
                    "keywords",
                    event.target
                      .value
                  )
                }
                placeholder="keyword, product, supplement"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Canonical URL
              </Label>

              <Input
                value={
                  form.seo.canonical
                }
                onChange={(event) =>
                  handleSeoChange(
                    "canonical",
                    event.target
                      .value
                  )
                }
                placeholder="https://example.com/product/..."
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Author
              </Label>

              <Input
                value={
                  form.seo.author
                }
                onChange={(event) =>
                  handleSeoChange(
                    "author",
                    event.target
                      .value
                  )
                }
                placeholder="Author"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-primary/5 p-4 sm:p-5">
          <div className="flex gap-3">
            <Search
              size={20}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                SEO Preview
              </p>

              <p className="mt-2 break-words text-sm font-medium">
                {form.seo.title ||
                  form.name ||
                  "Product title"}
              </p>

              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {form.seo
                  .description ||
                  form.description ||
                  "Product description will appear here."}
              </p>

              <p className="mt-2 break-all text-xs text-primary">
                {form.slug
                  ? `/product/${form.slug}`
                  : "/product/product-slug"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCurrentStep() {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();

      case 2:
        return renderImages();

      case 3:
        return renderVariants();

      case 4:
        return renderDetails();

      case 5:
        return renderSettings();

      case 6:
        return renderSeo();

      default:
        return null;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          flex
          h-[100dvh]
          max-h-[100dvh]
          w-full
          flex-col
          gap-0
          overflow-hidden
          rounded-none
          p-0
          sm:h-[95vh]
          sm:max-h-[95vh]
          sm:w-[calc(100%-2rem)]
          sm:max-w-6xl
          sm:rounded-2xl
        "
      >
        <DialogHeader className="shrink-0 border-b bg-background px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg sm:text-2xl">
                {product?.id
                  ? "Edit Product"
                  : "Create Product"}
              </DialogTitle>

              <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
                Complete each step to
                configure your product.
              </p>
            </div>

            <div className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
              {currentStep}/
              {steps.length}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-5 sm:px-7 sm:py-6">
            {renderStepIndicator()}

            <div className="mt-6 rounded-2xl border bg-background p-4 shadow-sm sm:p-6">
              {renderCurrentStep()}
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-4 py-3 sm:px-7 sm:py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden text-xs text-muted-foreground sm:block">
              {currentStep ===
              steps.length
                ? "Review your information and save the product."
                : `Step ${currentStep} of ${steps.length}`}
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    previousStep
                  }
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft
                    size={17}
                    className="mr-1"
                  />
                  Previous
                </Button>
              )}

              {currentStep <
              steps.length ? (
                <Button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className="flex-1 sm:flex-none"
                >
                  Next
                  <ChevronRight
                    size={17}
                    className="ml-1"
                  />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onOpenChange(
                        false
                      )
                    }
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={
                      handleSubmit
                    }
                    disabled={saving}
                    className="flex-1 sm:flex-none"
                  >
                    {saving
                      ? "Saving..."
                      : product?.id
                      ? "Update Product"
                      : "Create Product"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}