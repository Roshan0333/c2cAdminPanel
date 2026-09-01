"use client";

import { useEffect, useState } from "react";
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
import { Plus, Trash2, Upload, X } from "lucide-react";
import { getBrands } from "@/apiService/brandApi";

// --- helpers ---------------------------------------------------------------

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toNumberOrDefault(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

// ----------------------------------------------------------------------------

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
  featuredimg: null,
  images: [],
  variants: [emptyVariant],
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
  amazonLink: "",
  flipkartLink: "",
  cost2cost: "",
  hsnCode: "",
};

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return [];
  }

  return [value];
}

function normalizeVariant(variant) {
  return {
    id: variant?.id,
    productId: variant?.productId,
    size: variant?.size ?? "",
    flavour: variant?.flavour ?? "",
    price: variant?.price ?? "",
    discountedPrice: variant?.discountedPrice ?? "",
    stockQuantity: variant?.stockQuantity ?? "",
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
    return emptyForm;
  }

  return {
    ...emptyForm,
    ...product,
    categoryId: product.categoryId != null ? String(product.categoryId) : "",
    brandId: product.brandId != null ? String(product.brandId) : "",
    taxRate: product.taxRate != null ? String(product.taxRate) : "0",
    featuredimg: product.featuredimg || null,
    images: Array.isArray(product.images) ? product.images : [],
    variants:
      Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants.map(normalizeVariant)
        : [{ ...emptyVariant }],
    keyBenefits: normalizeArray(product.keyBenefits),
    howToUse: normalizeArray(product.howToUse),
    safetyInformation: normalizeArray(product.safetyInformation),
    whatToAvoid: normalizeArray(product.whatToAvoid),
    whoShouldUse: normalizeArray(product.whoShouldUse),
    whychooseus: normalizeArray(product.whychooseus),
    faqs: Array.isArray(product.faqs) ? product.faqs : [],
    tags: normalizeArray(product.tags),
    seo: {
      ...emptyForm.seo,
      ...(product.seo || {}),
    },
    amazonLink: product.amazonLink || "",
    flipkartLink: product.flipkartLink || "",
    cost2cost: product.cost2cost || "",
    hsnCode: product.hsnCode || "",
  };
}

export default function ProductForm({ open, onOpenChange, product, onSave, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(normalizeProduct(product));
      loadBrands();
    }
  }, [product, open]);

  async function loadBrands() {
    try {
      setLoadingBrands(true);

      const res = await getBrands();

      if (res?.success) {
        setBrands(res.brands || []);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSeoChange(field, value) {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  }

  function handleArrayChange(field, index, value) {
    setForm((prev) => {
      const values = [...(prev[field] || [])];
      values[index] = value;

      return {
        ...prev,
        [field]: values,
      };
    });
  }

  function addArrayItem(field) {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  }

  function removeArrayItem(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  }

  function handleVariantChange(index, field, value) {
    setForm((prev) => {
      const variants = [...prev.variants];

      variants[index] = {
        ...variants[index],
        [field]: value,
      };

      return {
        ...prev,
        variants,
      };
    });
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  }

  function removeVariant(index) {
    setForm((prev) => {
      if (prev.variants.length === 1) {
        return prev;
      }

      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      };
    });
  }

  function handleFeaturedImage(event) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      featuredimg: file,
    }));
  }

  function removeFeaturedImage() {
    setForm((prev) => ({
      ...prev,
      featuredimg: null,
    }));
  }

  function handleVariantImage(event, index) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setForm((prev) => {
      const variants = [...prev.variants];

      variants[index] = {
        ...variants[index],
        imageFile: file,
        image: file,
      };

      return {
        ...prev,
        variants,
      };
    });
  }

  function removeVariantImage(index) {
    setForm((prev) => {
      const variants = [...prev.variants];

      variants[index] = {
        ...variants[index],
        image: null,
        imageFile: null,
      };

      return {
        ...prev,
        variants,
      };
    });
  }

  function getImagePreview(image) {
    if (!image) {
      return null;
    }

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    if (typeof image === "string") {
      return image;
    }

    return null;
  }

  function handleSubmit() {
    // Basic required-field guard
    if (!form.name?.trim()) {
      alert("Product name is required.");
      return;
    }

    const payload = {
      ...(product?.id ? { id: product.id } : {}),

      name: form.name || "",
      title: form.title || "",
      slug: form.slug || "",
      sku: form.sku || "",
      description: form.description || "",

      categoryId: toNumberOrNull(form.categoryId),
      brandId: toNumberOrNull(form.brandId),

      status: form.status || "active",

      taxRate:
        form.taxRate === "" || form.taxRate == null
          ? "0"
          : String(form.taxRate),

      isFeatured: Boolean(form.isFeatured),

      featuredimg: form.featuredimg,

      images: form.images || [],

      keyBenefits: form.keyBenefits || [],
      howToUse: form.howToUse || [],
      safetyInformation: form.safetyInformation || [],
      whatToAvoid: form.whatToAvoid || [],
      whoShouldUse: form.whoShouldUse || [],
      whychooseus: form.whychooseus || [],

      faqs: form.faqs || [],
      tags: form.tags || [],

      seo: form.seo || {},

      amazonLink: form.amazonLink || "",
      flipkartLink: form.flipkartLink || "",
      cost2cost: form.cost2cost || "",

      hsnCode: form.hsnCode || null,

      variants: (form.variants || []).map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),

        size: variant.size || "",
        flavour: variant.flavour || "",

        price: toNumberOrDefault(variant.price, 0),
        discountedPrice: toNumberOrNull(variant.discountedPrice),
        stockQuantity: toNumberOrDefault(variant.stockQuantity, 0),

        weight: variant.weight || "",
        length: variant.length || "",
        height: variant.height || "",
        breadth: variant.breadth || "",

        image: variant.image instanceof File ? null : variant.image || null,

        imageFile:
          variant.imageFile instanceof File ? variant.imageFile : null,
      })),
    };

    onSave(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Product name"
              />
            </div>

            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Product title"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="product-slug"
              />
            </div>

            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="SKU"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Category ID</Label>
              <Input
                type="number"
                value={form.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                placeholder="Category ID"
              />
            </div>

            <div className="grid gap-2">
              <Label>Brand</Label>
              <Select
                value={form.brandId || "none"}
                onValueChange={(value) =>
                  handleChange("brandId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingBrands ? "Loading brands..." : "Select brand"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">No Brand</SelectItem>

                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Product description"
              rows={5}
            />
          </div>

          <div className="grid gap-3">
            <Label>Featured Image</Label>

            <div className="rounded-lg border border-dashed p-4">
              {form.featuredimg ? (
                <div className="relative w-fit">
                  <img
                    src={getImagePreview(form.featuredimg)}
                    alt="Featured"
                    className="h-32 w-32 rounded-lg border object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Upload size={24} />
                  <span>Upload featured image</span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFeaturedImage}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Variants</h3>
                <p className="text-sm text-muted-foreground">
                  Price, stock, dimensions and image are managed per variant.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={addVariant}>
                <Plus size={16} className="mr-1" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {form.variants.map((variant, index) => {
                const preview = getImagePreview(variant.image);

                return (
                  <div
                    key={variant.id || index}
                    className="rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>

                      {form.variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>Size</Label>
                        <Input
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                          placeholder="100g"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Flavour</Label>
                        <Input
                          value={variant.flavour}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "flavour",
                              e.target.value
                            )
                          }
                          placeholder="Unflavoured"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={variant.price ?? ""}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          placeholder="499"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Discounted Price</Label>
                        <Input
                          type="number"
                          value={variant.discountedPrice ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "discountedPrice",
                              e.target.value
                            )
                          }
                          placeholder="399"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Stock Quantity</Label>
                        <Input
                          type="number"
                          value={variant.stockQuantity ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stockQuantity",
                              e.target.value
                            )
                          }
                          placeholder="20"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Weight</Label>
                        <Input
                          value={variant.weight ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "weight",
                              e.target.value
                            )
                          }
                          placeholder="0.15"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Length</Label>
                        <Input
                          value={variant.length ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "length",
                              e.target.value
                            )
                          }
                          placeholder="8"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Height</Label>
                        <Input
                          value={variant.height ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "height",
                              e.target.value
                            )
                          }
                          placeholder="12"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Breadth</Label>
                        <Input
                          value={variant.breadth ?? ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "breadth",
                              e.target.value
                            )
                          }
                          placeholder="8"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Label>Variant Image</Label>

                      <div className="flex flex-wrap items-center gap-4">
                        {preview && (
                          <div className="relative">
                            <img
                              src={preview}
                              alt={`Variant ${index + 1}`}
                              className="h-24 w-24 rounded-lg border object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeVariantImage(index)}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        <label className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
                          <Upload size={16} />
                          {preview ? "Change Image" : "Upload Image"}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleVariantImage(e, index)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tax Rate</Label>
              <Input
                type="number"
                value={form.taxRate}
                onChange={(e) => handleChange("taxRate", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-4">
              <Label>Featured Product</Label>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(value) => handleChange("isFeatured", value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Amazon Link</Label>
              <Input
                value={form.amazonLink}
                onChange={(e) => handleChange("amazonLink", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Flipkart Link</Label>
              <Input
                value={form.flipkartLink}
                onChange={(e) => handleChange("flipkartLink", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Cost2Cost</Label>
              <Input
                value={form.cost2cost}
                onChange={(e) => handleChange("cost2cost", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["keyBenefits", "Key Benefits"],
              ["howToUse", "How To Use"],
              ["safetyInformation", "Safety Information"],
              ["whatToAvoid", "What To Avoid"],
              ["whoShouldUse", "Who Should Use"],
              ["whychooseus", "Why Choose Us"],
            ].map(([field, label]) => (
              <div key={field} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label>{label}</Label>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem(field)}
                  >
                    <Plus size={14} className="mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {(form[field] || []).map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={value}
                        onChange={(e) =>
                          handleArrayChange(field, index, e.target.value)
                        }
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => removeArrayItem(field, index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 font-semibold">SEO</h3>

            <div className="grid gap-4">
              <Input
                placeholder="SEO Title"
                value={form.seo.title}
                onChange={(e) => handleSeoChange("title", e.target.value)}
              />

              <Textarea
                placeholder="SEO Description"
                value={form.seo.description}
                onChange={(e) =>
                  handleSeoChange("description", e.target.value)
                }
              />

              <Input
                placeholder="SEO Keywords"
                value={form.seo.keywords}
                onChange={(e) => handleSeoChange("keywords", e.target.value)}
              />

              <Input
                placeholder="Canonical URL"
                value={form.seo.canonical}
                onChange={(e) => handleSeoChange("canonical", e.target.value)}
              />

              <Input
                placeholder="Author"
                value={form.seo.author}
                onChange={(e) => handleSeoChange("author", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Saving..."
              : product
              ? "Update Product"
              : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}