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

  seo: {
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
  },
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
    .trim();
}

function createHtmlDescription(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

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
  if (typeof image === "string") {
    return image;
  }

  if (image && typeof image === "object") {
    return (
      image.url ||
      image.src ||
      image.path ||
      image.imagePath ||
      ""
    );
  }

  return "";
}

function createGalleryItem(image, index) {
  if (typeof image === "string") {
    return {
      id: `existing-${index}-${image}`,
      url: image,
      preview: image,
      file: null,
      isNew: false,
    };
  }

  if (image && typeof image === "object") {
    const url = getImageUrl(image);

    return {
      id:
        image.id ||
        `existing-${index}-${url}`,
      url,
      preview: image.preview || url,
      file: image.file || null,
      isNew: Boolean(image.file),
    };
  }

  return null;
}

function getVariantImageUrl(variant) {
  if (!variant) {
    return "";
  }

  if (variant.imagePreview) {
    return variant.imagePreview;
  }

  if (variant.imageUrl) {
    return variant.imageUrl;
  }

  if (variant.image) {
    return getImageUrl(variant.image);
  }

  return "";
}

function validateForm(
  form,
  featuredImagePreview,
  galleryImages
) {
  const errors = [];

  if (!String(form.name ?? "").trim()) {
    errors.push("Name is required");
  }

  if (!String(form.slug ?? "").trim()) {
    errors.push("Slug is required");
  }

  if (!String(form.sku ?? "").trim()) {
    errors.push("SKU is required");
  }

  if (!form.brandId) {
    errors.push("Brand ID is required");
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
    errors.push(
      "At least one gallery image is required"
    );
  }

  if (
    !Array.isArray(form.variants) ||
    form.variants.length === 0
  ) {
    errors.push(
      "At least one variant is required"
    );
  } else {
    form.variants.forEach((v, i) => {
      const label = `Variant ${i + 1}`;

      if (!String(v.flavour ?? "").trim()) {
        errors.push(
          `${label}: flavour is required`
        );
      }

      if (!String(v.size ?? "").trim()) {
        errors.push(
          `${label}: size is required`
        );
      }

      if (
        v.price === "" ||
        v.price == null
      ) {
        errors.push(
          `${label}: price is required`
        );
      }

      if (
        v.stockQuantity === "" ||
        v.stockQuantity == null
      ) {
        errors.push(
          `${label}: stock quantity is required`
        );
      }
    });
  }

  if (
    !Array.isArray(form.keyBenefits) ||
    form.keyBenefits.length === 0
  ) {
    errors.push(
      "At least one key benefit is required"
    );
  }

  if (
    !Array.isArray(form.faqs) ||
    form.faqs.length === 0
  ) {
    errors.push(
      "At least one FAQ is required"
    );
  }

  if (
    !String(form.seo?.title ?? "").trim()
  ) {
    errors.push(
      "SEO title is required"
    );
  }

  if (
    !String(
      form.seo?.description ?? ""
    ).trim()
  ) {
    errors.push(
      "SEO description is required"
    );
  }

  if (
    !String(
      form.seo?.canonical ?? ""
    ).trim()
  ) {
    errors.push(
      "SEO canonical URL is required"
    );
  }

  return errors;
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
}) {
  const [form, setForm] = useState(
    emptyForm
  );

  const [errors, setErrors] = useState([]);

  const featuredImageInputRef =
    useRef(null);

  const galleryInputRef =
    useRef(null);

  const variantImageInputRefs =
    useRef({});

  const [featuredImageFile, setFeaturedImageFile] =
    useState(null);

  const [featuredImagePreview, setFeaturedImagePreview] =
    useState("");

  const [galleryImages, setGalleryImages] =
    useState([]);

  useEffect(() => {
    if (product) {
      const variants =
        normalizeArray(
          product.variants
        ).map((variant) => ({
          ...variant,
          imageFile: null,
          imagePreview:
            getVariantImageUrl(
              variant
            ),
        }));

      setForm({
        ...emptyForm,

        ...product,

        brandId:
          product.brandId ?? "",

        categoryId:
          product.categoryId ?? "",

        slug:
          product.slug ?? "",

        name:
          product.name ?? "",

        sku:
          product.sku ?? "",

        status:
          product.status ?? "active",

        title:
          product.title ?? "",

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

        images:
          normalizeArray(
            product.images
          ),

        length:
          product.length ?? "",

        wide:
          product.wide ?? "",

        height:
          product.height ?? "",

        weight:
          product.weight ?? "",

        hsnCode:
          product.hsnCode ?? "",

        taxRate:
          product.taxRate ?? "0",

        isFeatured:
          Boolean(
            product.isFeatured
          ),

        variants,

        keyBenefits:
          normalizeArray(
            product.keyBenefits
          ),

        whychooseus:
          normalizeArray(
            product.whychooseus
          ),

        whoShouldUse:
          normalizeArray(
            product.whoShouldUse
          ),

        howToUse:
          normalizeArray(
            product.howToUse
          ),

        whatToAvoid:
          normalizeArray(
            product.whatToAvoid
          ),

        safetyInformation:
          normalizeArray(
            product.safetyInformation
          ),

        faqs:
          normalizeArray(
            product.faqs
          ),

        seo: {
          ...emptyForm.seo,

          ...(product.seo || {}),

          title:
            product.seo?.title ?? "",

          description:
            product.seo?.description ?? "",

          keywords:
            product.seo?.keywords ?? "",

          canonical:
            product.seo?.canonical ?? "",

          author:
            product.seo?.author ?? "",

          publisher:
            product.seo?.publisher ?? "",

          language:
            product.seo?.language ??
            "English",

          robots:
            product.seo?.robots ??
            "index, follow",

          geo: {
            ...emptyForm.seo.geo,
            ...(product.seo?.geo || {}),
          },

          og: {
            ...emptyForm.seo.og,
            ...(product.seo?.og || {}),
          },

          twitter: {
            ...emptyForm.seo.twitter,
            ...(product.seo?.twitter || {}),
          },
        },
      });

      setFeaturedImageFile(null);

      setFeaturedImagePreview(
        product.featuredimg || ""
      );

      setGalleryImages(
        normalizeArray(product.images)
          .map(
            (image, index) =>
              createGalleryItem(
                image,
                index
              )
          )
          .filter(Boolean)
      );
    } else {
      setForm({
        ...emptyForm,

        images: [],

        variants: [],

        keyBenefits: [],

        whychooseus: [],

        whoShouldUse: [],

        howToUse: [],

        whatToAvoid: [],

        safetyInformation: [],

        faqs: [],
      });

      setFeaturedImageFile(null);

      setFeaturedImagePreview("");

      setGalleryImages([]);
    }

    setErrors([]);
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

  function addGalleryFiles(files) {
    const selectedFiles =
      Array.from(files || []).filter(
        (file) =>
          file.type.startsWith(
            "image/"
          )
      );

    if (!selectedFiles.length) {
      return;
    }

    const newItems =
      selectedFiles.map(
        (file, index) => ({
          id: `new-${Date.now()}-${index}-${Math.random()}`,

          url: "",

          preview:
            URL.createObjectURL(
              file
            ),

          file,

          isNew: true,
        })
      );

    setGalleryImages((prev) => [
      ...prev,
      ...newItems,
    ]);
  }

  function handleGalleryChange(e) {
    addGalleryFiles(
      e.target.files
    );

    e.target.value = "";
  }

  function handleFeaturedImageChange(
    e
  ) {
    const file =
      e.target.files?.[0];

    if (
      !file ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      e.target.value = "";
      return;
    }

    if (
      featuredImagePreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        featuredImagePreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setFeaturedImageFile(file);

    setFeaturedImagePreview(
      preview
    );

    set(
      "featuredimg",
      ""
    );

    e.target.value = "";
  }

  function removeFeaturedImage() {
    if (
      featuredImagePreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        featuredImagePreview
      );
    }

    setFeaturedImageFile(null);

    setFeaturedImagePreview("");

    set(
      "featuredimg",
      ""
    );
  }

  function removeGalleryImage(id) {
    const image =
      galleryImages.find(
        (item) => item.id === id
      );

    if (
      image?.preview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        image.preview
      );
    }

    setGalleryImages((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  }

  function removeAllGalleryImages() {
    galleryImages.forEach(
      (image) => {
        if (
          image.preview?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      }
    );

    setGalleryImages([]);
  }

  function updateVariant(
    index,
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (
            variant,
            variantIndex
          ) =>
            variantIndex === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        ),
    }));
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,

      variants: [
        ...prev.variants,

        {
          flavour: "",
          size: "",
          price: "",
          discountedPrice: "",
          stockQuantity: "",
          imageFile: null,
          imagePreview: "",
        },
      ],
    }));
  }

  function removeVariant(index) {
    const variant =
      form.variants[index];

    if (
      variant?.imagePreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        variant.imagePreview
      );
    }

    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.filter(
          (_, variantIndex) =>
            variantIndex !== index
        ),
    }));
  }

  function handleVariantImageChange(
    index,
    file
  ) {
    if (
      !file ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    const oldPreview =
      form.variants[index]
        ?.imagePreview;

    if (
      oldPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        oldPreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (
            variant,
            variantIndex
          ) =>
            variantIndex === index
              ? {
                  ...variant,

                  imageFile: file,

                  imagePreview:
                    preview,
                }
              : variant
        ),
    }));
  }

  function removeVariantImage(
    index
  ) {
    const preview =
      form.variants[index]
        ?.imagePreview;

    if (
      preview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        preview
      );
    }

    setForm((prev) => ({
      ...prev,

      variants:
        prev.variants.map(
          (
            variant,
            variantIndex
          ) =>
            variantIndex === index
              ? {
                  ...variant,

                  imageFile:
                    null,

                  imagePreview:
                    "",

                  imageUrl:
                    "",
                }
              : variant
        ),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors =
      validateForm(
        form,
        featuredImagePreview,
        galleryImages
      );

    if (
      validationErrors.length > 0
    ) {
      setErrors(
        validationErrors
      );
      return;
    }

    setErrors([]);

    const payload = {
      ...form,

      brandId:
        Number(form.brandId),

      categoryId:
        Number(form.categoryId),

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
        String(
          form.hsnCode ?? ""
        ).trim() || null,

      taxRate:
        form.taxRate === ""
          ? "0"
          : String(form.taxRate),

      isFeatured:
        Boolean(
          form.isFeatured
        ),

      featuredimg:
        String(
          form.featuredimg ?? ""
        ).trim() || null,

      images:
        galleryImages
          .filter(
            (image) =>
              !image.file
          )
          .map(
            (image) =>
              image.url ||
              image.preview
          )
          .filter(Boolean),

      featuredImageFile,

      imageFiles:
        galleryImages
          .filter(
            (image) =>
              image.file
          )
          .map(
            (image) =>
              image.file
          ),

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
        normalizeArray(
          form.faqs
        ),

      variants:
        normalizeArray(
          form.variants
        ).map(
          ({
            imageFile,
            imagePreview,
            imagePath,
            imageUrl,
            image,
            ...variant
          }) => ({
            ...(variant.id
              ? {
                  id: variant.id,
                }
              : {}),

            flavour:
              variant.flavour ?? "",

            size:
              variant.size ?? "",

            price:
              variant.price === "" ||
              variant.price == null
                ? variant.price
                : String(
                    variant.price
                  ),

            discountedPrice:
              variant.discountedPrice ===
                "" ||
              variant.discountedPrice ==
                null
                ? variant.discountedPrice
                : String(
                    variant.discountedPrice
                  ),

            stockQuantity:
              variant.stockQuantity ===
                "" ||
              variant.stockQuantity ==
                null
                ? 0
                : Number(
                    variant.stockQuantity
                  ),
          })
        ),

      variantImageFiles:
        normalizeArray(
          form.variants
        )
          .map(
            (
              variant,
              index
            ) => ({
              index,
              file:
                variant.imageFile ||
                null,
            })
          )
          .filter(
            (item) =>
              item.file
          ),
    };

    onSave(
      product
        ? {
            ...product,
            ...payload,
          }
        : payload
    );

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
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
          onSubmit={
            handleSubmit
          }
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
                  <Label>
                    Product Name
                  </Label>

                  <Input
                    value={
                      form.name ?? ""
                    }
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
                  <Label>
                    Slug
                  </Label>

                  <Input
                    value={
                      form.slug ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    SKU
                  </Label>

                  <Input
                    value={
                      form.sku ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "sku",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Status
                  </Label>

                  <Input
                    value={
                      form.status ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "status",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Brand ID
                  </Label>

                  <Input
                    type="number"
                    value={
                      form.brandId ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "brandId",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label>
                    Category ID
                  </Label>

                  <Input
                    type="number"
                    value={
                      form.categoryId ??
                      ""
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

              <div className="space-y-1.5">
                <Label>
                  Title
                </Label>

                <Input
                  value={
                    form.title ?? ""
                  }
                  onChange={(e) =>
                    set(
                      "title",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Description
                </Label>

                <Textarea
                  value={
                    form.description ??
                    ""
                  }
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                    )
                  }
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>
                    Flipkart Link
                  </Label>

                  <Input
                    value={
                      form.flipkartLink ??
                      ""
                    }
                    onChange={(e) =>
                      set(
                        "flipkartLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Amazon Link
                  </Label>

                  <Input
                    value={
                      form.amazonLink ??
                      ""
                    }
                    onChange={(e) =>
                      set(
                        "amazonLink",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Cost2Cost Link
                  </Label>

                  <Input
                    value={
                      form.cost2cost ??
                      ""
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

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>
                    Length
                  </Label>

                  <Input
                    value={
                      form.length ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "length",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Width
                  </Label>

                  <Input
                    value={
                      form.wide ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "wide",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Height
                  </Label>

                  <Input
                    value={
                      form.height ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "height",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Weight
                  </Label>

                  <Input
                    value={
                      form.weight ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    HSN Code
                  </Label>

                  <Input
                    value={
                      form.hsnCode ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "hsnCode",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Tax Rate
                  </Label>

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.taxRate ?? ""
                    }
                    onChange={(e) =>
                      set(
                        "taxRate",
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>
                      Featured Image
                    </Label>

                    <p className="mt-1 text-xs text-slate-400">
                      Upload the main product image.
                    </p>
                  </div>

                  {featuredImagePreview && (
                    <button
                      type="button"
                      onClick={
                        removeFeaturedImage
                      }
                      className="text-xs font-medium text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={
                    featuredImageInputRef
                  }
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleFeaturedImageChange
                  }
                />

                {featuredImagePreview ? (
                  <div className="relative h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={
                        featuredImagePreview
                      }
                      alt="Featured"
                      className="h-full w-full object-contain"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Star
                        size={12}
                        className="fill-current"
                      />
                      Featured
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        featuredImageInputRef.current?.click()
                      }
                      className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <Upload size={13} />
                      Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      featuredImageInputRef.current?.click()
                    }
                    className="flex h-52 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50"
                  >
                    <ImagePlus
                      size={24}
                      className="text-slate-400"
                    />

                    <span className="mt-3 text-sm font-semibold text-slate-700">
                      Upload Featured Image
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      Choose from your gallery
                    </span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>
                      Gallery Images
                    </Label>

                    <p className="mt-1 text-xs text-slate-400">
                      Upload multiple product images.
                    </p>
                  </div>

                  <input
                    ref={
                      galleryInputRef
                    }
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={
                      handleGalleryChange
                    }
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      galleryInputRef.current?.click()
                    }
                    className="h-9 gap-2"
                  >
                    <Plus size={14} />
                    Add Images
                  </Button>
                </div>

                {galleryImages.length ===
                0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      galleryInputRef.current?.click()
                    }
                    className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50"
                  >
                    <Images
                      size={25}
                      className="text-slate-400"
                    />

                    <span className="mt-3 text-sm font-semibold text-slate-700">
                      Add Gallery Images
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      Select multiple images from your gallery
                    </span>
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {galleryImages.map(
                        (
                          image,
                          index
                        ) => (
                          <div
                            key={
                              image.id
                            }
                            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={
                                image.preview
                              }
                              alt={`Gallery ${
                                index +
                                1
                              }`}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                              {index +
                                1}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeGalleryImage(
                                  image.id
                                )
                              }
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm"
                            >
                              <X
                                size={14}
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-xs text-slate-500">
                        {
                          galleryImages.length
                        }{" "}
                        images selected
                      </span>

                      <button
                        type="button"
                        onClick={
                          removeAllGalleryImages
                        }
                        className="text-xs font-medium text-red-500"
                      >
                        Remove all
                      </button>
                    </div>
                  </>
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
                  stock, flavour, size and
                  image are configured per
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
                    configure pricing and
                    image.
                  </p>

                  <Button
                    type="button"
                    onClick={
                      addVariant
                    }
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
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                {index +
                                  1}
                              </span>

                              <div>
                                <p className="text-xs font-semibold text-slate-800">
                                  Variant{" "}
                                  {index +
                                    1}
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  Variant details
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeVariant(
                                  index
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Mango"
                              />
                            </div>

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
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. 500g"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Price
                              </Label>

                              <Input
                                type="number"
                                min="0"
                                step="0.01"
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
                                    e.target.value
                                  )
                                }
                                placeholder="Price"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Discounted Price
                              </Label>

                              <Input
                                type="number"
                                min="0"
                                step="0.01"
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
                                    e.target.value
                                  )
                                }
                                placeholder="Discounted price"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Stock Quantity
                              </Label>

                              <Input
                                type="number"
                                min="0"
                                step="1"
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
                                    e.target.value
                                  )
                                }
                                placeholder="Stock quantity"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label>
                                Variant Image
                              </Label>

                              <input
                                ref={(
                                  element
                                ) => {
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
                                  const file =
                                    e.target
                                      .files?.[0];

                                  if (
                                    file
                                  ) {
                                    handleVariantImageChange(
                                      index,
                                      file
                                    );
                                  }

                                  e.target.value =
                                    "";
                                }}
                              />

                              {imageUrl ? (
                                <div className="group relative h-[120px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                  <img
                                    src={
                                      imageUrl
                                    }
                                    alt={`Variant ${
                                      index +
                                      1
                                    }`}
                                    className="h-full w-full object-contain"
                                  />

                                  <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[9px] font-semibold text-white">
                                    Variant{" "}
                                    {index +
                                      1}
                                  </div>

                                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2 pt-7">
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
                                      <X
                                        size={
                                          13
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
                        </div>
                      );
                    }
                  )}

                  <button
                    type="button"
                    onClick={
                      addVariant
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-3 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                  >
                    <Plus size={14} />
                    Add Another Variant
                  </button>
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
                  set(
                    "faqs",
                    v
                  )
                }
              />
            </TabsContent>

            <TabsContent
              value="seo"
              className="space-y-4 pt-4"
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
                  required
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
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  SEO Keywords
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
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>
                    Author
                  </Label>

                  <Input
                    value={
                      form.seo.author
                    }
                    onChange={(e) =>
                      setSeo(
                        "author",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Publisher
                  </Label>

                  <Input
                    value={
                      form.seo.publisher
                    }
                    onChange={(e) =>
                      setSeo(
                        "publisher",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700">
                  Geo
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    value={
                      form.seo.geo
                        .region
                    }
                    onChange={(e) =>
                      setSeoNested(
                        "geo",
                        "region",
                        e.target.value
                      )
                    }
                    placeholder="Region"
                  />

                  <Input
                    value={
                      form.seo.geo
                        .placename
                    }
                    onChange={(e) =>
                      setSeoNested(
                        "geo",
                        "placename",
                        e.target.value
                      )
                    }
                    placeholder="Place name"
                  />
                </div>
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
                    form.seo.og.locale
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "locale",
                      e.target.value
                    )
                  }
                  placeholder="OG Locale"
                />

                <Input
                  value={
                    form.seo.og.site_name
                  }
                  onChange={(e) =>
                    setSeoNested(
                      "og",
                      "site_name",
                      e.target.value
                    )
                  }
                  placeholder="OG Site Name"
                />

                <Textarea
                  value={
                    form.seo.og
                      .description
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
                    form.seo.twitter
                      .card
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
                    form.seo.twitter
                      .title
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
                    form.seo.twitter
                      .site
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