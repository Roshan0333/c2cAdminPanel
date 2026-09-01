"use client";

import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { getBrands } from "@/apiService/brandApi";

import {
  ImagePlus,
  Images,
  Plus,
  Star,
  X,
  Upload,
  Trash2,
} from "lucide-react";

import StringListEditor from "./product-form/StringListEditor";
import FaqsEditor from "./product-form/FaqsEditor";

const emptySeo = {
  title: "",
  description: "",
  keywords: "",
  canonical: "",
  author: "",
  publisher: "",
  language: "English",
  robots: "index, follow",
  geo: {
    region: "",
    placename: "",
  },
  og: {
    title: "",
    type: "website",
    image: "",
    image_alt: "",
    locale: "",
    site_name: "",
    description: "",
    url: "",
  },
  twitter: {
    card: "summary_large_image",
    title: "",
    site: "",
    description: "",
    image: "",
    image_alt: "",
  },
};

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
  imagePreview: "",
};

const emptyForm = {
  slug: "",
  name: "",
  sku: "",
  status: "active",

  brandId: "",
  categoryId: "",

  title: "",
  description: "",

  flipkartLink: "",
  amazonLink: "",
  cost2cost: "",

  featuredimg: "",
  images: [],

  length: "",
  wide: "",
  height: "",
  weight: "",
  hsnCode: "",
  taxRate: "0",
  isFeatured: false,

  variants: [],

  keyBenefits: [],
  whychooseus: [],
  whoShouldUse: [],
  howToUse: [],
  whatToAvoid: [],
  safetyInformation: [],

  faqs: [],

  seo: emptySeo,
};

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getPlainDescription(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/<p\b[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();
}

function createHtmlDescription(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return paragraphs
    .map((paragraph) => {
      const escaped = paragraph
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\n/g, "<br />");

      return `<p>${escaped}</p>`;
    })
    .join("");
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.src ||
      image.path ||
      image.image ||
      ""
    );
  }

  return "";
}

function getVariantImageUrl(variant) {
  if (!variant) {
    return "";
  }

  if (variant.imageFile) {
    return variant.imagePreview || "";
  }

  return getImageUrl(variant.image);
}

function normalizeVariant(variant) {
  return {
    ...emptyVariant,
    ...variant,

    id: variant?.id,

    size: variant?.size ?? "",
    flavour: variant?.flavour ?? "",

    price:
      variant?.price == null
        ? ""
        : String(variant.price),

    discountedPrice:
      variant?.discountedPrice == null
        ? ""
        : String(variant.discountedPrice),

    stockQuantity:
      variant?.stockQuantity == null
        ? ""
        : String(variant.stockQuantity),

    weight:
      variant?.weight == null
        ? ""
        : String(variant.weight),

    length:
      variant?.length == null
        ? ""
        : String(variant.length),

    height:
      variant?.height == null
        ? ""
        : String(variant.height),

    breadth:
      variant?.breadth == null
        ? ""
        : String(variant.breadth),

    image: variant?.image ?? null,
    imageFile: null,
    imagePreview: getVariantImageUrl(variant),
  };
}

function validateForm(form, featuredImagePreview, galleryImages) {
  const errors = [];

  if (!String(form.name ?? "").trim()) {
    errors.push("Name is required");
  }

  if (!String(form.slug ?? "").trim()) {
    errors.push("Slug is required");
  }

  if (!form.categoryId) {
    errors.push("Category ID is required");
  }

  if (!String(form.status ?? "").trim()) {
    errors.push("Status is required");
  }

  if (!String(form.title ?? "").trim()) {
    errors.push("Title is required");
  }

  if (!String(form.description ?? "").trim()) {
    errors.push("Description is required");
  }

  if (!String(form.length ?? "").trim()) {
    errors.push("Length is required");
  }

  if (!String(form.wide ?? "").trim()) {
    errors.push("Width is required");
  }

  if (!String(form.height ?? "").trim()) {
    errors.push("Height is required");
  }

  if (!String(form.weight ?? "").trim()) {
    errors.push("Weight is required");
  }

  if (!String(form.taxRate ?? "").trim()) {
    errors.push("Tax rate is required");
  }

  if (
    !String(form.featuredimg ?? "").trim() &&
    !featuredImagePreview
  ) {
    errors.push("Featured image is required");
  }

  if (
    !Array.isArray(galleryImages) ||
    galleryImages.length === 0
  ) {
    errors.push("At least one gallery image is required");
  }

  if (
    !Array.isArray(form.variants) ||
    form.variants.length === 0
  ) {
    errors.push("At least one variant is required");
  } else {
    form.variants.forEach((v, index) => {
      const label = `Variant ${index + 1}`;

      if (!String(v.flavour ?? "").trim()) {
        errors.push(`${label}: flavour is required`);
      }

      if (!String(v.size ?? "").trim()) {
        errors.push(`${label}: size is required`);
      }

      if (v.price === "" || v.price == null) {
        errors.push(`${label}: price is required`);
      }

      if (
        v.stockQuantity === "" ||
        v.stockQuantity == null
      ) {
        errors.push(`${label}: stock quantity is required`);
      }
    });
  }

  return errors;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  const featuredImageInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const variantImageInputRefs = useRef({});

  const [featuredImageFile, setFeaturedImageFile] =
    useState(null);

  const [featuredImagePreview, setFeaturedImagePreview] =
    useState("");

  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadBrands() {
      try {
        setBrandsLoading(true);

        const res = await getBrands();

        if (res?.success) {
          setBrands(
            Array.isArray(res.brands)
              ? res.brands
              : []
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
        setBrandsLoading(false);
      }
    }

    loadBrands();
  }, [open]);

  useEffect(() => {
    if (product) {
      const normalizedVariants =
        normalizeArray(product.variants).map(
          normalizeVariant
        );

      const existingGallery =
        normalizeArray(product.images)
          .map((image, index) => {
            const url = getImageUrl(image);

            if (!url) {
              return null;
            }

            return {
              id:
                image?.id ??
                `existing-${index}-${url}`,
              url,
              preview: url,
              file: null,
              isNew: false,
            };
          })
          .filter(Boolean);

      setForm({
        ...emptyForm,

        ...product,

        brandId:
          product.brandId == null
            ? ""
            : String(product.brandId),

        categoryId:
          product.categoryId == null
            ? ""
            : String(product.categoryId),

        slug: product.slug ?? "",
        name: product.name ?? "",
        sku: product.sku ?? "",
        status: product.status ?? "active",

        title: product.title ?? "",

        description:
          getPlainDescription(
            product.description
          ),

        flipkartLink:
          product.flipkartLink ?? "",

        amazonLink:
          product.amazonLink ?? "",

        cost2cost:
          product.cost2cost ?? "",

        featuredimg:
          product.featuredimg ?? "",

        images: normalizeArray(product.images),

        length: product.length ?? "",
        wide: product.wide ?? "",
        height: product.height ?? "",
        weight: product.weight ?? "",
        hsnCode: product.hsnCode ?? "",
        taxRate: product.taxRate ?? "0",

        isFeatured:
          Boolean(product.isFeatured),

        variants: normalizedVariants,

        keyBenefits:
          normalizeArray(product.keyBenefits),

        whychooseus:
          normalizeArray(product.whychooseus),

        whoShouldUse:
          normalizeArray(product.whoShouldUse),

        howToUse:
          normalizeArray(product.howToUse),

        whatToAvoid:
          normalizeArray(product.whatToAvoid),

        safetyInformation:
          normalizeArray(
            product.safetyInformation
          ),

        faqs: normalizeArray(product.faqs),

        seo: {
          ...emptySeo,
          ...(product.seo || {}),
          geo: {
            ...emptySeo.geo,
            ...(product.seo?.geo || {}),
          },
          og: {
            ...emptySeo.og,
            ...(product.seo?.og || {}),
          },
          twitter: {
            ...emptySeo.twitter,
            ...(product.seo?.twitter || {}),
          },
        },
      });

      setFeaturedImageFile(null);
      setFeaturedImagePreview(
        getImageUrl(product.featuredimg)
      );

      setGalleryImages(existingGallery);
    } else {
      setForm({
        ...emptyForm,
        seo: {
          ...emptySeo,
          geo: { ...emptySeo.geo },
          og: { ...emptySeo.og },
          twitter: { ...emptySeo.twitter },
        },
      });

      setFeaturedImageFile(null);
      setFeaturedImagePreview("");
      setGalleryImages([]);
      setErrors([]);
    }
  }, [product, open]);

  function set(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function setSeo(field, value) {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  }

  function setSeoNested(
    section,
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [section]: {
          ...prev.seo[section],
          [field]: value,
        },
      },
    }));
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          ...emptyVariant,
        },
      ],
    }));
  }

  function removeVariant(index) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter(
        (_, i) => i !== index
      ),
    }));

    delete variantImageInputRefs.current[index];
  }

  function updateVariant(
    index,
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map(
        (variant, i) =>
          i === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      ),
    }));
  }

  function handleVariantImage(
    index,
    file
  ) {
    if (!file) {
      return;
    }

    const preview =
      URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map(
        (variant, i) =>
          i === index
            ? {
                ...variant,
                imageFile: file,
                imagePreview: preview,
              }
            : variant
      ),
    }));
  }

  function removeVariantImage(index) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map(
        (variant, i) =>
          i === index
            ? {
                ...variant,
                image: null,
                imageFile: null,
                imagePreview: "",
              }
            : variant
      ),
    }));
  }

  function handleFeaturedImage(file) {
    if (!file) {
      return;
    }

    const preview =
      URL.createObjectURL(file);

    setFeaturedImageFile(file);
    setFeaturedImagePreview(preview);
  }

  function handleGalleryImages(files) {
    if (!files?.length) {
      return;
    }

    const newImages = Array.from(files).map(
      (file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: "",
        preview: URL.createObjectURL(file),
        file,
        isNew: true,
      })
    );

    setGalleryImages((prev) => [
      ...prev,
      ...newImages,
    ]);
  }

  function removeGalleryImage(id) {
    setGalleryImages((prev) =>
      prev.filter((image) => image.id !== id)
    );
  }

  function removeAllGalleryImages() {
    setGalleryImages([]);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors =
      validateForm(
        form,
        featuredImagePreview,
        galleryImages
      );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    const payload = {
      ...form,

      id: product?.id,

      brandId:
        form.brandId === ""
          ? null
          : Number(form.brandId),

      categoryId:
        form.categoryId === ""
          ? null
          : Number(form.categoryId),

      description:
        createHtmlDescription(
          form.description
        ),

      length:
        form.length === ""
          ? null
          : String(form.length),

      wide:
        form.wide === ""
          ? null
          : String(form.wide),

      height:
        form.height === ""
          ? null
          : String(form.height),

      weight:
        form.weight === ""
          ? null
          : String(form.weight),

      hsnCode:
        String(form.hsnCode ?? "").trim() ||
        null,

      taxRate:
        form.taxRate === ""
          ? "0"
          : String(form.taxRate),

      isFeatured:
        Boolean(form.isFeatured),

      featuredimg:
        featuredImageFile
          ? featuredImageFile
          : String(
              form.featuredimg ?? ""
            ).trim() || null,

      images: galleryImages,

      variants:
        normalizeArray(
          form.variants
        ).map((variant) => ({
          ...(variant.id
            ? { id: variant.id }
            : {}),

          size:
            String(
              variant.size ?? ""
            ).trim(),

          flavour:
            String(
              variant.flavour ?? ""
            ).trim(),

          price:
            variant.price === "" ||
            variant.price == null
              ? null
              : String(variant.price),

          discountedPrice:
            variant.discountedPrice ===
              "" ||
            variant.discountedPrice ==
              null
              ? null
              : String(
                  variant.discountedPrice
                ),

          stockQuantity:
            variant.stockQuantity === "" ||
            variant.stockQuantity == null
              ? 0
              : Number(
                  variant.stockQuantity
                ),

          weight:
            variant.weight === "" ||
            variant.weight == null
              ? null
              : String(
                  variant.weight
                ),

          length:
            variant.length === "" ||
            variant.length == null
              ? null
              : String(
                  variant.length
                ),

          height:
            variant.height === "" ||
            variant.height == null
              ? null
              : String(
                  variant.height
                ),

          breadth:
            variant.breadth === "" ||
            variant.breadth == null
              ? null
              : String(
                  variant.breadth
                ),

          image:
            variant.imageFile ||
            variant.image ||
            null,

          imageFile:
            variant.imageFile || null,
        })),

      keyBenefits:
        normalizeArray(
          form.keyBenefits
        ),

      whychooseus:
        normalizeArray(
          form.whychooseus
        ),

      whoShouldUse:
        normalizeArray(
          form.whoShouldUse
        ),

      howToUse:
        normalizeArray(
          form.howToUse
        ),

      whatToAvoid:
        normalizeArray(
          form.whatToAvoid
        ),

      safetyInformation:
        normalizeArray(
          form.safetyInformation
        ),

      faqs:
        normalizeArray(form.faqs),

      seo: form.seo || null,
    };

    onSave(
      product
        ? {
            ...product,
            ...payload,
          }
        : payload
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="
          max-w-[calc(100%-1rem)]
          max-h-[85vh]
          overflow-y-auto
          p-4
          sm:max-w-3xl
          sm:p-6
        "
      >
        <DialogHeader>
          <DialogTitle>
            {product
              ? "Edit Product"
              : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Tabs defaultValue="basic">
            <div
              className="
                max-w-full
                overflow-x-auto
                sm:overflow-visible
              "
            >
              <TabsList
                className="
                  flex
                  h-auto
                  flex-wrap
                  max-sm:w-max
                  max-sm:flex-nowrap
                "
              >
                <TabsTrigger value="basic">
                  Basic Info
                </TabsTrigger>

                <TabsTrigger value="images">
                  Images
                </TabsTrigger>

                <TabsTrigger value="pricing">
                  Pricing & Variants
                </TabsTrigger>

                <TabsTrigger value="content">
                  Content
                </TabsTrigger>

                <TabsTrigger value="faqs">
                  FAQs
                </TabsTrigger>

                <TabsTrigger value="seo">
                  SEO
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="basic"
              className="space-y-4 pt-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0 space-y-1.5">
                  <Label>Name</Label>

                  <Input
                    value={form.name}
                    onChange={(e) =>
                      set(
                        "name",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Slug</Label>

                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0 space-y-1.5">
                  <Label>SKU</Label>

                  <Input
                    value={form.sku}
                    onChange={(e) =>
                      set(
                        "sku",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Brand</Label>

                  <select
                    value={form.brandId}
                    onChange={(e) =>
                      set(
                        "brandId",
                        e.target.value
                      )
                    }
                    className="
                      flex
                      h-10
                      w-full
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                      py-2
                      text-sm
                      ring-offset-background
                      focus:outline-none
                      focus:ring-2
                      focus:ring-ring
                    "
                  >
                    <option value="">
                      {brandsLoading
                        ? "Loading brands..."
                        : "Select Brand"}
                    </option>

                    {brands.map(
                      (brand) => (
                        <option
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Category ID</Label>

                  <Input
                    type="number"
                    value={
                      form.categoryId
                    }
                    onChange={(e) =>
                      set(
                        "categoryId",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="min-w-0 space-y-1.5">
                  <Label>Length</Label>

                  <Input
                    type="number"
                    step="any"
                    value={form.length}
                    onChange={(e) =>
                      set(
                        "length",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Width</Label>

                  <Input
                    type="number"
                    step="any"
                    value={form.wide}
                    onChange={(e) =>
                      set(
                        "wide",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Height</Label>

                  <Input
                    type="number"
                    step="any"
                    value={form.height}
                    onChange={(e) =>
                      set(
                        "height",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Weight</Label>

                  <Input
                    type="number"
                    step="any"
                    value={form.weight}
                    onChange={(e) =>
                      set(
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0 space-y-1.5">
                  <Label>Status</Label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      set(
                        "status",
                        e.target.value
                      )
                    }
                    className="
                      flex
                      h-10
                      w-full
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                      py-2
                      text-sm
                    "
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>HSN Code</Label>

                  <Input
                    value={form.hsnCode}
                    onChange={(e) =>
                      set(
                        "hsnCode",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>Tax Rate</Label>

                  <Input
                    type="number"
                    step="any"
                    value={form.taxRate}
                    onChange={(e) =>
                      set(
                        "taxRate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={
                    form.isFeatured
                  }
                  onChange={(e) =>
                    set(
                      "isFeatured",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <Label
                  htmlFor="isFeatured"
                  className="cursor-pointer"
                >
                  Featured Product
                </Label>
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label>Title</Label>

                <Input
                  value={form.title}
                  onChange={(e) =>
                    set(
                      "title",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label>Description</Label>

                <Textarea
                  className="
                    min-w-0
                    min-h-32
                    resize-y
                  "
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Flipkart Link
                  </Label>

                  <Input
                    value={
                      form.flipkartLink
                    }
                    onChange={(e) =>
                      set(
                        "flipkartLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Amazon Link
                  </Label>

                  <Input
                    value={
                      form.amazonLink
                    }
                    onChange={(e) =>
                      set(
                        "amazonLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Cost2Cost Link
                  </Label>

                  <Input
                    value={
                      form.cost2cost
                    }
                    onChange={(e) =>
                      set(
                        "cost2cost",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="images"
              className="space-y-5 pt-4"
            >
              <input
                ref={featuredImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFeaturedImage(
                    e.target.files?.[0]
                  )
                }
              />

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleGalleryImages(
                    e.target.files
                  );

                  e.target.value = "";
                }}
              />

              <div className="space-y-3">
                <Label>Featured Image</Label>

                <button
                  type="button"
                  onClick={() =>
                    featuredImageInputRef.current?.click()
                  }
                  className="
                    flex
                    min-h-[180px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50/50
                  "
                >
                  {featuredImagePreview ? (
                    <img
                      src={
                        featuredImagePreview
                      }
                      alt="Featured"
                      className="h-44 w-full object-contain"
                    />
                  ) : (
                    <>
                      <ImagePlus
                        size={28}
                        className="text-slate-400"
                      />

                      <span className="mt-2 text-sm font-semibold text-slate-600">
                        Upload Featured Image
                      </span>

                      <span className="mt-1 text-xs text-slate-400">
                        Choose from gallery
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    Gallery Images
                  </Label>

                  {galleryImages.length >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        removeAllGalleryImages
                      }
                      className="text-xs font-medium text-red-500"
                    >
                      Remove all
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    galleryInputRef.current?.click()
                  }
                  className="
                    flex
                    min-h-[130px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50/50
                  "
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                    <Images
                      size={19}
                      className="text-slate-400"
                    />
                  </div>

                  <span className="mt-2 text-sm font-semibold text-slate-600">
                    Upload Gallery Images
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    Choose multiple images
                  </span>
                </button>

                {galleryImages.length >
                  0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {galleryImages.map(
                      (image) => (
                        <div
                          key={image.id}
                          className="relative overflow-hidden rounded-xl border bg-white"
                        >
                          <img
                            src={
                              image.preview
                            }
                            alt="Gallery"
                            className="h-28 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                image.id
                              )
                            }
                            className="
                              absolute
                              right-1.5
                              top-1.5
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                              rounded-md
                              bg-white
                              text-slate-600
                              shadow
                              hover:bg-red-50
                              hover:text-red-600
                            "
                          >
                            <X
                              size={14}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="pricing"
              className="space-y-4 pt-4"
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs leading-5 text-slate-500">
                  Price, discounted price,
                  stock, size, flavour,
                  weight and dimensions
                  are configured per
                  variant.
                </p>
              </div>

              {form.variants.length ===
              0 ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center">
                  <ImagePlus
                    size={25}
                    className="text-slate-400"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No variants added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a variant to
                    configure pricing
                    and image.
                  </p>

                  <Button
                    type="button"
                    onClick={addVariant}
                    className="mt-4 h-9 gap-2"
                  >
                    <Plus size={14} />
                    Add Variant
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.variants.map(
                    (
                      variant,
                      index
                    ) => {
                      const imageUrl =
                        getVariantImageUrl(
                          variant
                        );

                      return (
                        <div
                          key={
                            variant.id ??
                            `variant-${index}`
                          }
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                Variant{" "}
                                {index +
                                  1}
                              </p>

                              <p className="text-xs text-slate-400">
                                Configure
                                price,
                                stock,
                                dimensions
                                and image
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeVariant(
                                  index
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label>
                                Size
                              </Label>

                              <Input
                                value={
                                  variant.size ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "size",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="100g"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Flavour
                              </Label>

                              <Input
                                value={
                                  variant.flavour ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "flavour",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Unflavoured"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Price
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.price ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "price",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="499"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Discounted Price
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.discountedPrice ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "discountedPrice",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="399"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Stock Quantity
                              </Label>

                              <Input
                                type="number"
                                min="0"
                                value={
                                  variant.stockQuantity ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "stockQuantity",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Weight
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.weight ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "weight",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="0.15"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Length
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.length ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "length",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="8"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Height
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.height ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "height",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="12"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Breadth
                              </Label>

                              <Input
                                type="number"
                                step="any"
                                value={
                                  variant.breadth ??
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateVariant(
                                    index,
                                    "breadth",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="8"
                              />
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Label>
                              Variant Image
                            </Label>

                            <input
                              ref={(element) => {
                                variantImageInputRefs.current[
                                  index
                                ] =
                                  element;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(
                                e
                              ) => {
                                handleVariantImage(
                                  index,
                                  e
                                    .target
                                    .files?.[0]
                                );

                                e.target.value =
                                  "";
                              }}
                            />

                            {imageUrl ? (
                              <div className="relative overflow-hidden rounded-xl border bg-slate-50">
                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={`Variant ${
                                    index +
                                    1
                                  }`}
                                  className="h-40 w-full object-contain"
                                />

                                <div className="absolute bottom-2 right-2 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      variantImageInputRefs.current[
                                        index
                                      ]?.click()
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm"
                                  >
                                    <Upload
                                      size={
                                        11
                                      }
                                    />
                                    Replace
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeVariantImage(
                                        index
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2
                                      size={
                                        12
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  variantImageInputRefs.current[
                                    index
                                  ]?.click()
                                }
                                className="flex h-[120px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                                  <ImagePlus
                                    size={
                                      18
                                    }
                                    className="text-slate-400"
                                  />
                                </div>

                                <span className="mt-2 text-[11px] font-semibold text-slate-600">
                                  Upload Image
                                </span>

                                <span className="mt-0.5 text-[9px] text-slate-400">
                                  Choose from gallery
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="w-full gap-2"
                  >
                    <Plus size={14} />
                    Add Another Variant
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="content"
              className="space-y-5 pt-4"
            >
              <StringListEditor
                label="Key Benefits"
                items={
                  form.keyBenefits
                }
                onChange={(v) =>
                  set(
                    "keyBenefits",
                    v
                  )
                }
              />

              <StringListEditor
                label="Why Choose Us"
                items={
                  form.whychooseus
                }
                onChange={(v) =>
                  set(
                    "whychooseus",
                    v
                  )
                }
              />

              <StringListEditor
                label="Who Should Use"
                items={
                  form.whoShouldUse
                }
                onChange={(v) =>
                  set(
                    "whoShouldUse",
                    v
                  )
                }
              />

              <StringListEditor
                label="How To Use"
                items={
                  form.howToUse
                }
                onChange={(v) =>
                  set(
                    "howToUse",
                    v
                  )
                }
              />

              <StringListEditor
                label="What To Avoid"
                items={
                  form.whatToAvoid
                }
                onChange={(v) =>
                  set(
                    "whatToAvoid",
                    v
                  )
                }
              />

              <StringListEditor
                label="Safety Information"
                items={
                  form.safetyInformation
                }
                onChange={(v) =>
                  set(
                    "safetyInformation",
                    v
                  )
                }
              />
            </TabsContent>

            <TabsContent
              value="faqs"
              className="pt-4"
            >
              <FaqsEditor
                faqs={form.faqs}
                onChange={(v) =>
                  set("faqs", v)
                }
              />
            </TabsContent>

            <TabsContent
              value="seo"
              className="space-y-3 pt-4"
            >
              <div className="space-y-1.5">
                <Label>
                  SEO Title
                </Label>

                <Input
                  value={
                    form.seo.title
                  }
                  onChange={(e) =>
                    setSeo(
                      "title",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  SEO Description
                </Label>

                <Textarea
                  value={
                    form.seo.description
                  }
                  onChange={(e) =>
                    setSeo(
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Keywords
                </Label>

                <Input
                  value={
                    form.seo.keywords
                  }
                  onChange={(e) =>
                    setSeo(
                      "keywords",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Canonical URL
                </Label>

                <Input
                  value={
                    form.seo.canonical
                  }
                  onChange={(e) =>
                    setSeo(
                      "canonical",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Open Graph
                </p>

                <Input
                  value={
                    form.seo.og.title
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="OG Title"
                />

                <Input
                  value={
                    form.seo.og.type
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "type",
                      e.target.value
                    )
                  }
                  placeholder="OG Type"
                />

                <Textarea
                  value={
                    form.seo.og.description
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="OG Description"
                />

                <Input
                  value={
                    form.seo.og.image
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="OG Image"
                />

                <Input
                  value={
                    form.seo.og.image_alt
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "image_alt",
                      e.target.value
                    )
                  }
                  placeholder="OG Image Alt"
                />

                <Input
                  value={
                    form.seo.og.url
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "url",
                      e.target.value
                    )
                  }
                  placeholder="OG URL"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Twitter
                </p>

                <Input
                  value={
                    form.seo.twitter.card
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "card",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Card"
                />

                <Input
                  value={
                    form.seo.twitter.title
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Title"
                />

                <Input
                  value={
                    form.seo.twitter.site
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "site",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Site"
                />

                <Textarea
                  value={
                    form.seo.twitter
                      .description
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Description"
                />

                <Input
                  value={
                    form.seo.twitter
                      .image
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Image"
                />

                <Input
                  value={
                    form.seo.twitter
                      .image_alt
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "twitter",
                      "image_alt",
                      e.target.value
                    )
                  }
                  placeholder="Twitter Image Alt"
                />
              </div>
            </TabsContent>
          </Tabs>

          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-2 text-sm font-semibold text-red-700">
                Please fix the following:
              </p>

              <ul className="space-y-1">
                {errors.map(
                  (error, index) => (
                    <li
                      key={index}
                      className="text-xs text-red-600"
                    >
                      {error}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <DialogFooter
            className="
              flex-col-reverse
              gap-2
              sm:flex-row
              sm:justify-end
            "
          >
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
              {product
                ? "Save Changes"
                : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}