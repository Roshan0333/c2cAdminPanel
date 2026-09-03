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
  FolderTree,
  AlertCircle,
  Sparkles,
  Star,
  TrendingUp,
  Clock,
  Award,
  Code2,
  Braces,
  Share2,
  Link2,
  AtSign,
  Copy,
  CheckCheck,
  Globe,
  MessageCircle,
} from "lucide-react";
import { getBrands } from "@/apiService/brandApi";
import { getCategory } from "@/apiService/categoryApi";
import { getAttribute } from "@/apiService/attributeApi";

const emptyVariant = {
  size: "",
  price: "",
  discountedPrice: "",
  stockQuantity: "",
  weight: "",
  length: "",
  height: "",
  breadth: "",
  image: null,
  imageFile: null,
  attributes: [],
};

const emptyForm = {
  name: "",
  title: "",
  slug: "",
  sku: "",
  description: "",
  categoryId: "",
  parentCategoryId: "",
  subCategoryId: "",
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
    keywords: [],
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
  },

  hsnCode: "",
};

const steps = [
  {
    id: 1,
    title: "Basic Info",
    description: "Product information",
    icon: Package,
    accent: {
      icon: "text-sky-600 dark:text-sky-400",
      chip: "bg-sky-50 dark:bg-sky-950/40",
      solid: "bg-sky-500",
      ring: "ring-sky-500/30",
      border: "border-sky-200 dark:border-sky-900",
      activeBorder: "border-sky-500",
      activeBg: "bg-sky-50 dark:bg-sky-950/30",
      activeText: "text-sky-700 dark:text-sky-400",
    },
  },
  {
    id: 2,
    title: "Images",
    description: "Product gallery",
    icon: Images,
    accent: {
      icon: "text-indigo-600 dark:text-indigo-400",
      chip: "bg-indigo-50 dark:bg-indigo-950/40",
      solid: "bg-indigo-500",
      ring: "ring-indigo-500/30",
      border: "border-indigo-200 dark:border-indigo-900",
      activeBorder: "border-indigo-500",
      activeBg: "bg-indigo-50 dark:bg-indigo-950/30",
      activeText: "text-indigo-700 dark:text-indigo-400",
    },
  },
  {
    id: 3,
    title: "Variants",
    description: "Pricing & stock",
    icon: Layers3,
    accent: {
      icon: "text-violet-600 dark:text-violet-400",
      chip: "bg-violet-50 dark:bg-violet-950/40",
      solid: "bg-violet-500",
      ring: "ring-violet-500/30",
      border: "border-violet-200 dark:border-violet-900",
      activeBorder: "border-violet-500",
      activeBg: "bg-violet-50 dark:bg-violet-950/30",
      activeText: "text-violet-700 dark:text-violet-400",
    },
  },
  {
    id: 4,
    title: "Details",
    description: "Product details",
    icon: FileText,
    accent: {
      icon: "text-amber-600 dark:text-amber-400",
      chip: "bg-amber-50 dark:bg-amber-950/40",
      solid: "bg-amber-500",
      ring: "ring-amber-500/30",
      border: "border-amber-200 dark:border-amber-900",
      activeBorder: "border-amber-500",
      activeBg: "bg-amber-50 dark:bg-amber-950/30",
      activeText: "text-amber-700 dark:text-amber-400",
    },
  },
  {
    id: 5,
    title: "Settings",
    description: "Visibility",
    icon: Settings2,
    accent: {
      icon: "text-emerald-600 dark:text-emerald-400",
      chip: "bg-emerald-50 dark:bg-emerald-950/40",
      solid: "bg-emerald-500",
      ring: "ring-emerald-500/30",
      border: "border-emerald-200 dark:border-emerald-900",
      activeBorder: "border-emerald-500",
      activeBg: "bg-emerald-50 dark:bg-emerald-950/30",
      activeText: "text-emerald-700 dark:text-emerald-400",
    },
  },
  {
    id: 6,
    title: "SEO",
    description: "Search optimization",
    icon: Search,
    accent: {
      icon: "text-rose-600 dark:text-rose-400",
      chip: "bg-rose-50 dark:bg-rose-950/40",
      solid: "bg-rose-500",
      ring: "ring-rose-500/30",
      border: "border-rose-200 dark:border-rose-900",
      activeBorder: "border-rose-500",
      activeBg: "bg-rose-50 dark:bg-rose-950/30",
      activeText: "text-rose-700 dark:text-rose-400",
    },
  },
];

function getStepAccent(stepId) {
  return steps.find((step) => step.id === stepId)?.accent || steps[0].accent;
}

function toNumberOrNull(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
}

function toNumberOrDefault(value, fallback = 0) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isNaN(number) ? fallback : number;
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

  if (typeof value === "string") {
    let current = value;

    for (let i = 0; i < 6; i++) {
      try {
        const parsed = JSON.parse(current);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        if (typeof parsed === "string") {
          current = parsed;
          continue;
        }

        return [parsed];
      } catch {
        break;
      }
    }

    return [value];
  }

  return [value];
}

function normalizeSeo(value) {
  const defaultSeo = {
    ...emptyForm.seo,

    facebook: {
      ...emptyForm.seo.facebook,
    },

    twitter: {
      ...emptyForm.seo.twitter,
    },

    schema: {
      ...emptyForm.seo.schema,
    },
  };

  if (!value) {
    return defaultSeo;
  }

  let seo = value;

  if (typeof value === "string") {
    let current = value;

    for (let i = 0; i < 6; i++) {
      try {
        const parsed = JSON.parse(current);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          seo = parsed;
          break;
        }

        if (typeof parsed === "string") {
          current = parsed;
          continue;
        }

        break;
      } catch {
        break;
      }
    }
  }

  if (
    !seo ||
    typeof seo !== "object" ||
    Array.isArray(seo)
  ) {
    return defaultSeo;
  }

  let keywords = seo.keywords;

  if (Array.isArray(keywords)) {
    keywords = keywords
      .map((keyword) => String(keyword).trim())
      .filter(Boolean);
  } else if (typeof keywords === "string") {
    keywords = keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  } else {
    keywords = [];
  }

  return {
    ...defaultSeo,
    ...seo,

    keywords,

    facebook: {
      ...defaultSeo.facebook,
      ...(seo.facebook || {}),
    },

    twitter: {
      ...defaultSeo.twitter,
      ...(seo.twitter || {}),
    },

    schema: {
      ...defaultSeo.schema,
      ...(seo.schema || {}),
    },
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

function normalizeAttributeItem(item) {
  if (!item) {
    return null;
  }

  const id =
    item.attributeId ??
    item.attribute?.id ??
    item.id ??
    null;

  const name =
    item.attribute?.name ??
    item.attributeName ??
    item.name ??
    "";

  const unit =
    item.attribute?.unit ??
    item.unit ??
    "";

  const value =
    item.value ??
    item.attributeValue ??
    "";

  if (!id && !name) {
    return null;
  }

  return {
    id: id ? Number(id) : null,
    name: String(name),
    unit: String(unit ?? ""),
    value: String(value ?? ""),
  };
}

function normalizeVariant(variant) {
  let attributes = [];

  if (Array.isArray(variant?.attributes)) {
    attributes = variant.attributes
      .map(normalizeAttributeItem)
      .filter(Boolean);
  } else if (Array.isArray(variant?.attribute)) {
    attributes = variant.attribute
      .map(normalizeAttributeItem)
      .filter(Boolean);
  } else if (
    variant?.attributeId ||
    variant?.attributeValue
  ) {
    const attribute = normalizeAttributeItem({
      attributeId: variant.attributeId,
      attribute:
        variant.attribute ||
        null,
      attributeName:
        variant.attributeName ||
        "",
      attributeValue:
        variant.attributeValue,
    });

    if (attribute) {
      attributes = [attribute];
    }
  }

  return {
    id: variant?.id,
    productId: variant?.productId,

    size: variant?.size ?? "",
    // flavour: variant?.flavour ?? null,

    price: variant?.price ?? "",
    discountedPrice:
      variant?.discountedPrice ?? null,

    stockQuantity:
      variant?.stockQuantity ?? 0,

    weight: variant?.weight ?? "",
    length: variant?.length ?? "",
    height: variant?.height ?? "",

    breadth:
      variant?.breadth ??
      variant?.wide ??
      "",

    image:
      variant?.image ?? null,

    imageFile: null,

    attributes,
  };
}

function normalizeCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: Number(category.id),
    name: category.name || "",
    slug: category.slug || "",
    image: category.image || null,

    parentId:
      category.parentId === null ||
        category.parentId === undefined
        ? null
        : Number(category.parentId),

    createdAt:
      category.createdAt || null,

    children: Array.isArray(
      category.children
    )
      ? category.children
        .map(normalizeCategory)
        .filter(Boolean)
      : [],
  };
}

function normalizeCategoryResponse(response) {
  const rawCategories =
    response?.categories ||
    response?.data?.categories ||
    response?.data ||
    [];

  if (!Array.isArray(rawCategories)) {
    return [];
  }

  return rawCategories
    .map(normalizeCategory)
    .filter(Boolean);
}

function normalizeAttributes(response) {
  const rawAttributes =
    response?.attributes ||
    response?.data?.attributes ||
    response?.data ||
    [];

  if (!Array.isArray(rawAttributes)) {
    return [];
  }

  return rawAttributes
    .map((attribute) => {
      if (!attribute) {
        return null;
      }

      return {
        id: Number(attribute.id),
        name: attribute.name || "",
        slug: attribute.slug || "",
        unit: attribute.unit || "",
        displayOrder:
          attribute.displayOrder ===
            null ||
            attribute.displayOrder ===
            undefined
            ? 0
            : Number(
              attribute.displayOrder
            ),
        isActive:
          attribute.isActive ===
            undefined ||
            attribute.isActive === null
            ? true
            : Boolean(
              attribute.isActive
            ),
      };
    })
    .filter(
      (attribute) =>
        attribute &&
        Number.isInteger(attribute.id) &&
        attribute.id > 0
    );
}

function findCategoryById(
  categories,
  id
) {
  if (!id) {
    return null;
  }

  const numericId = Number(id);

  for (const category of categories) {
    if (
      Number(category.id) ===
      numericId
    ) {
      return category;
    }

    if (
      Array.isArray(category.children) &&
      category.children.length
    ) {
      const found =
        findCategoryById(
          category.children,
          id
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function normalizeProduct(
  product,
  categories = []
) {
  if (!product) {
    return {
      ...emptyForm,
      variants: [
        {
          ...emptyVariant,
          attributes: [],
        },
      ],
      seo: {
        ...emptyForm.seo,
      },
    };
  }

  const categoryId =
    product.categoryId ??
    product.category?.id ??
    "";

  const brandId =
    product.brandId ??
    product.brand?.id ??
    "";

  let parentCategoryId = "";
  let subCategoryId = "";

  if (categoryId) {
    const selectedCategory =
      findCategoryById(
        categories,
        categoryId
      );

    if (selectedCategory) {
      if (
        selectedCategory.parentId !==
        null &&
        selectedCategory.parentId !==
        undefined
      ) {
        subCategoryId = String(
          selectedCategory.id
        );

        parentCategoryId = String(
          selectedCategory.parentId
        );
      } else {
        parentCategoryId = String(
          selectedCategory.id
        );
      }
    }
  }

  return {
    ...emptyForm,
    ...product,

    id: product.id,

    name: product.name || "",
    title: product.title || "",
    slug: product.slug || "",
    sku: product.sku || "",
    description:
      product.description || "",

    categoryId:
      categoryId !== null &&
        categoryId !== undefined &&
        categoryId !== ""
        ? String(categoryId)
        : "",

    parentCategoryId,

    subCategoryId,

    brandId:
      brandId !== null &&
        brandId !== undefined &&
        brandId !== ""
        ? String(brandId)
        : "",

    status:
      product.status || "active",

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
        : [
          {
            ...emptyVariant,
            attributes: [],
          },
        ],

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

    faqs: Array.isArray(
      product.faqs
    )
      ? product.faqs
      : [],

    tags: normalizeArray(
      product.tags
    ),

    seo: normalizeSeo(
      product.seo
    ),

    hsnCode:
      product.hsnCode || "",
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

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const SLUG_REGEX =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidSlug(value) {
  return SLUG_REGEX.test(value);
}

function buildAutoJsonLd(form, selectedBrand) {
  const images = [
    ...(typeof form.featuredimg === "string"
      ? [form.featuredimg]
      : []),
    ...(Array.isArray(form.images)
      ? form.images.filter(
        (image) => typeof image === "string"
      )
      : []),
  ];

  const variants = Array.isArray(form.variants)
    ? form.variants
    : [];

  const prices = variants
    .map((variant) =>
      Number(
        variant?.discountedPrice ||
        variant?.price ||
        0
      )
    )
    .filter((price) => !Number.isNaN(price) && price > 0);

  const inStock = variants.some(
    (variant) => Number(variant?.stockQuantity) > 0
  );

  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: form.name || form.title || undefined,
    description: form.description || undefined,
    sku: form.sku || undefined,
    image: images.length ? images : undefined,
    brand: selectedBrand?.name
      ? { "@type": "Brand", name: selectedBrand.name }
      : undefined,
    offers: prices.length
      ? {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: variants.length,
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: form.seo?.canonical || undefined,
      }
      : undefined,
  };

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    }
  });

  if (data.offers) {
    Object.keys(data.offers).forEach((key) => {
      if (data.offers[key] === undefined) {
        delete data.offers[key];
      }
    });
  }

  return data;
}

function validateBasicInfo(
  form,
  subCategories
) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name =
      "Product name is required.";
  }

  if (
    form.slug?.trim() &&
    !isValidSlug(
      form.slug.trim()
    )
  ) {
    errors.slug =
      "Slug can only contain lowercase letters, numbers and hyphens.";
  }

  if (!form.parentCategoryId) {
    errors.parentCategoryId =
      "Please select a parent category.";
  } else if (
    subCategories.length > 0 &&
    !form.subCategoryId
  ) {
    errors.subCategoryId =
      "This category has subcategories — please select one.";
  }

  if (
    form.taxRate !== "" &&
    form.taxRate !== null
  ) {
    const taxRate = Number(
      form.taxRate
    );

    if (
      Number.isNaN(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      errors.taxRate =
        "Tax rate must be a number between 0 and 100.";
    }
  }

  return errors;
}

function validateVariants(
  variants
) {
  return (variants || []).map(
    (variant) => {
      const errors = {};

      const price =
        variant.price === "" ||
          variant.price === null
          ? NaN
          : Number(variant.price);

      if (
        Number.isNaN(price) ||
        price <= 0
      ) {
        errors.price =
          "Price must be greater than 0.";
      }

      if (
        variant.discountedPrice !==
        "" &&
        variant.discountedPrice !==
        null &&
        variant.discountedPrice !==
        undefined
      ) {
        const discounted =
          Number(
            variant.discountedPrice
          );

        if (
          Number.isNaN(
            discounted
          ) ||
          discounted < 0
        ) {
          errors.discountedPrice =
            "Discounted price must be a valid, non-negative number.";
        } else if (
          !Number.isNaN(price) &&
          discounted >= price
        ) {
          errors.discountedPrice =
            "Discounted price must be less than the price.";
        }
      }

      const stock =
        variant.stockQuantity ===
          "" ||
          variant.stockQuantity ===
          null
          ? NaN
          : Number(
            variant.stockQuantity
          );

      if (
        Number.isNaN(stock) ||
        stock < 0
      ) {
        errors.stockQuantity =
          "Stock quantity is required and cannot be negative.";
      }

      return errors;
    }
  );
}

function variantsHaveErrors(
  variantErrors
) {
  return (variantErrors || []).some(
    (errors) =>
      Object.keys(
        errors || {}
      ).length > 0
  );
}

function validateSeo(seo) {
  const errors = {};

  if (
    seo?.canonical?.trim() &&
    !isValidUrl(
      seo.canonical.trim()
    )
  ) {
    errors.canonical =
      "Enter a valid URL.";
  }

  const customJson =
    seo?.schema?.customJson;

  if (
    seo?.schema?.enabled &&
    customJson &&
    customJson.trim()
  ) {
    try {
      JSON.parse(customJson);
    } catch {
      errors.schemaJson =
        "Custom JSON-LD must be valid JSON.";
    }
  }

  return errors;
}

function stepForErrors(
  basicErrors,
  variantErrors,
  seoErrors
) {
  if (
    Object.keys(
      basicErrors
    ).length > 0
  ) {
    return 1;
  }

  if (
    variantsHaveErrors(
      variantErrors
    )
  ) {
    return 3;
  }

  if (
    Object.keys(
      seoErrors
    ).length > 0
  ) {
    return 6;
  }

  return null;
}

function FieldError({
  message,
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
      <AlertCircle
        size={12}
        className="shrink-0"
      />
      {message}
    </p>
  );
}

function SectionHeading({ icon: Icon, accent, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}
      >
        <Icon size={19} className={accent.icon} />
      </div>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}


function CardHeading({ icon: Icon, accent, title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent ? accent.chip : "bg-muted"
              }`}
          >
            <Icon
              size={15}
              className={accent ? accent.icon : "text-muted-foreground"}
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default function ProductForm({
  open,
  onOpenChange,
  product,
  onSave,
  saving,
}) {
  const [form, setForm] =
    useState({
      ...emptyForm,
    });

  const [brands, setBrands] =
    useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    attributes,
    setAttributes,
  ] = useState([]);

  const [
    loadingBrands,
    setLoadingBrands,
  ] = useState(false);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(false);

  const [
    loadingAttributes,
    setLoadingAttributes,
  ] = useState(false);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  const [errors, setErrors] =
    useState({
      variants: [],
    });

  const [
    schemaCopied,
    setSchemaCopied,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadBrands();
    loadCategories();
    loadAttributes();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      product &&
      categories.length > 0
    ) {
      setForm(
        normalizeProduct(
          product,
          categories
        )
      );
    } else if (!product) {
      setForm({
        ...emptyForm,
        variants: [
          {
            ...emptyVariant,
            attributes: [],
          },
        ],
        seo: {
          ...emptyForm.seo,
        },
      });
    }

    setCurrentStep(1);

    setErrors({
      variants: [],
    });
  }, [
    product,
    categories,
    open,
  ]);

  async function loadBrands() {
    try {
      setLoadingBrands(true);

      const response =
        await getBrands();

      if (response?.success) {
        setBrands(
          Array.isArray(
            response.brands
          )
            ? response.brands
            : []
        );
      } else {
        setBrands([]);
      }
    } catch {
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }

  async function loadCategories() {
    try {
      setLoadingCategories(
        true
      );

      const response =
        await getCategory();

      if (!response?.success) {
        setCategories([]);
        return;
      }

      setCategories(
        normalizeCategoryResponse(
          response
        )
      );
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(
        false
      );
    }
  }

  async function loadAttributes() {
    try {
      setLoadingAttributes(
        true
      );

      const response =
        await getAttribute();

      if (!response?.success) {
        setAttributes([]);
        return;
      }

      setAttributes(
        normalizeAttributes(
          response
        )
      );
    } catch {
      setAttributes([]);
    } finally {
      setLoadingAttributes(
        false
      );
    }
  }

  const parentCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parentId ===
            null
        ),
      [categories]
    );

  const selectedParentCategory =
    useMemo(() => {
      if (
        !form.parentCategoryId
      ) {
        return null;
      }

      return parentCategories.find(
        (category) =>
          Number(category.id) ===
          Number(
            form.parentCategoryId
          )
      );
    }, [
      parentCategories,
      form.parentCategoryId,
    ]);

  const subCategories =
    useMemo(() => {
      if (
        !selectedParentCategory
      ) {
        return [];
      }

      return Array.isArray(
        selectedParentCategory.children
      )
        ? selectedParentCategory.children
        : [];
    }, [
      selectedParentCategory,
    ]);

  const selectedSubCategory =
    useMemo(() => {
      if (
        !form.subCategoryId
      ) {
        return null;
      }

      return subCategories.find(
        (category) =>
          Number(category.id) ===
          Number(
            form.subCategoryId
          )
      );
    }, [
      subCategories,
      form.subCategoryId,
    ]);

  const selectedBrand =
    useMemo(() => {
      if (!form.brandId) {
        return null;
      }

      return brands.find(
        (brand) =>
          Number(brand.id) ===
          Number(form.brandId)
      );
    }, [
      brands,
      form.brandId,
    ]);

  // The JSON-LD that will actually be emitted: the user's custom override
  // when they've supplied one, otherwise an auto-generated Product schema
  // kept in sync with the rest of the form.
  const effectiveJsonLd = useMemo(() => {
    const customJson = form.seo?.schema?.customJson;

    if (customJson && customJson.trim()) {
      try {
        return {
          value: JSON.parse(customJson),
          isCustom: true,
          isValid: true,
        };
      } catch {
        return {
          value: null,
          isCustom: true,
          isValid: false,
        };
      }
    }

    return {
      value: buildAutoJsonLd(form, selectedBrand),
      isCustom: false,
      isValid: true,
    };
  }, [form, selectedBrand]);

  function clearFieldError(
    field
  ) {
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = {
        ...previous,
      };

      delete next[field];

      return next;
    });
  }

  function clearVariantFieldError(
    index,
    field
  ) {
    setErrors((previous) => {
      if (
        !previous.variants?.[
        index
        ]?.[field]
      ) {
        return previous;
      }

      const variants = [
        ...(previous.variants ||
          []),
      ];

      const variantErrors = {
        ...variants[index],
      };

      delete variantErrors[
        field
      ];

      variants[index] =
        variantErrors;

      return {
        ...previous,
        variants,
      };
    });
  }

  function handleChange(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearFieldError(field);
  }

  function handleParentCategoryChange(
    value
  ) {
    if (value === "none") {
      setForm((previous) => ({
        ...previous,
        parentCategoryId: "",
        subCategoryId: "",
        categoryId: "",
      }));

      clearFieldError(
        "parentCategoryId"
      );

      clearFieldError(
        "subCategoryId"
      );

      return;
    }

    const parent =
      parentCategories.find(
        (category) =>
          Number(category.id) ===
          Number(value)
      );

    setForm((previous) => ({
      ...previous,

      parentCategoryId: value,

      subCategoryId: "",

      categoryId:
        parent?.children?.length
          ? ""
          : value,
    }));

    clearFieldError(
      "parentCategoryId"
    );

    clearFieldError(
      "subCategoryId"
    );
  }

  function handleSubCategoryChange(
    value
  ) {
    if (value === "none") {
      setForm((previous) => ({
        ...previous,
        subCategoryId: "",
        categoryId:
          subCategories.length ===
            0
            ? previous.parentCategoryId
            : "",
      }));

      clearFieldError(
        "subCategoryId"
      );

      return;
    }

    setForm((previous) => ({
      ...previous,
      subCategoryId: value,
      categoryId: value,
    }));

    clearFieldError(
      "subCategoryId"
    );
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

    if (
      field === "canonical"
    ) {
      clearFieldError(
        "canonical"
      );
    }
  }

  function handleSeoNestedChange(
    section,
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      seo: {
        ...previous.seo,
        [section]: {
          ...previous.seo[section],
          [field]: value,
        },
      },
    }));

    if (
      section === "schema" &&
      field === "customJson"
    ) {
      clearFieldError("schemaJson");
    }
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

    clearVariantFieldError(
      index,
      field
    );
  }

  function handleVariantAttributeChange(
    index,
    attributeId
  ) {
    if (
      !attributeId ||
      attributeId === "none"
    ) {
      setForm((previous) => {
        const variants = [
          ...previous.variants,
        ];

        variants[index] = {
          ...variants[index],
          attributes: [],
        };

        return {
          ...previous,
          variants,
        };
      });

      return;
    }

    const attribute =
      attributes.find(
        (item) =>
          Number(item.id) ===
          Number(attributeId)
      );

    if (!attribute) {
      return;
    }

    setForm((previous) => {
      const variants = [
        ...previous.variants,
      ];

      const currentVariant =
        variants[index];

      const currentValue =
        currentVariant
          ?.attributes?.[0]
          ?.value ?? "";

      variants[index] = {
        ...currentVariant,

        attributes: [
          {
            id: Number(
              attribute.id
            ),
            name:
              attribute.name,
            unit:
              attribute.unit || "",
            value:
              currentValue,
          },
        ],
      };

      return {
        ...previous,
        variants,
      };
    });
  }

  function handleVariantAttributeValueChange(
    index,
    value
  ) {
    setForm((previous) => {
      const variants = [
        ...previous.variants,
      ];

      const currentVariant =
        variants[index];

      const currentAttribute =
        currentVariant
          ?.attributes?.[0];

      if (!currentAttribute) {
        return previous;
      }

      variants[index] = {
        ...currentVariant,

        attributes: [
          {
            ...currentAttribute,
            value,
          },
        ],
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
          attributes: [],
        },
      ],
    }));

    setErrors((previous) => ({
      ...previous,
      variants: [
        ...(previous.variants ||
          []),
        {},
      ],
    }));
  }

  function removeVariant(index) {
    setForm((previous) => {
      if (
        previous.variants.length <=
        1
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

    setErrors((previous) => ({
      ...previous,
      variants: (
        previous.variants || []
      ).filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  function handleFeaturedImage(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be less than 5MB."
      );

      event.target.value = "";

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

    const validFiles =
      files.filter((file) => {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          return false;
        }

        if (
          file.size >
          5 * 1024 * 1024
        ) {
          return false;
        }

        return true;
      });

    setForm((previous) => ({
      ...previous,
      images: [
        ...(previous.images || []),
        ...validFiles,
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

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be less than 5MB."
      );

      event.target.value = "";

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

  function getImagePreview(
    image
  ) {
    if (!image) {
      return null;
    }

    if (
      typeof image === "string"
    ) {
      return image;
    }

    return getFilePreview(image);
  }

  function goToStep(step) {
    setCurrentStep(step);
  }

  function nextStep() {
    if (currentStep === 1) {
      const basicErrors =
        validateBasicInfo(
          form,
          subCategories
        );

      if (
        Object.keys(
          basicErrors
        ).length > 0
      ) {
        setErrors((previous) => ({
          ...previous,
          ...basicErrors,
        }));

        return;
      }
    }

    if (currentStep === 3) {
      const variantErrors =
        validateVariants(
          form.variants
        );

      if (
        variantsHaveErrors(
          variantErrors
        )
      ) {
        setErrors((previous) => ({
          ...previous,
          variants:
            variantErrors,
        }));

        return;
      }
    }

    if (
      currentStep <
      steps.length
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

  function buildVariantAttributes(
    variant
  ) {
    if (
      !Array.isArray(
        variant?.attributes
      )
    ) {
      return [];
    }

    return variant.attributes
      .map((attribute) => ({
        attributeId:
          attribute?.id
            ? Number(
              attribute.id
            )
            : null,
        value:
          attribute?.value ??
          "",
      }))
      .filter(
        (attribute) =>
          attribute.attributeId !==
          null
      );
  }

  async function copySchemaToClipboard() {
    if (
      !effectiveJsonLd.isValid ||
      !effectiveJsonLd.value
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          effectiveJsonLd.value,
          null,
          2
        )
      );

      setSchemaCopied(true);

      setTimeout(
        () => setSchemaCopied(false),
        1500
      );
    } catch {
      // Clipboard access can fail (permissions, insecure context) —
      // silently ignore, the JSON is still visible in the preview.
    }
  }

  function handleSubmit() {
    const basicErrors =
      validateBasicInfo(
        form,
        subCategories
      );

    const variantErrors =
      validateVariants(
        form.variants
      );

    const seoErrors =
      validateSeo(form.seo);

    const hasErrors =
      Object.keys(
        basicErrors
      ).length > 0 ||
      variantsHaveErrors(
        variantErrors
      ) ||
      Object.keys(
        seoErrors
      ).length > 0;

    if (hasErrors) {
      setErrors({
        ...basicErrors,
        ...seoErrors,
        variants: variantErrors,
      });

      const targetStep =
        stepForErrors(
          basicErrors,
          variantErrors,
          seoErrors
        );

      if (targetStep) {
        setCurrentStep(
          targetStep
        );
      }

      return;
    }

    const finalCategoryId =
      form.subCategoryId ||
      form.categoryId ||
      form.parentCategoryId;

    const numericCategoryId =
      Number(finalCategoryId);

    if (
      !numericCategoryId ||
      Number.isNaN(
        numericCategoryId
      )
    ) {
      setErrors({
        categoryId:
          "Please select a category",
      });

      setCurrentStep(1);

      return;
    }

    const seoPayload = {
      ...form.seo,
      schema: {
        ...form.seo.schema,
        // Persist the resolved JSON-LD (custom override if present,
        // otherwise the auto-generated schema) so the backend/storefront
        // doesn't need to regenerate it from scratch.
        resolvedJson:
          effectiveJsonLd.isValid
            ? effectiveJsonLd.value
            : null,
      },
    };

    const payload = {
      ...(product?.id
        ? {
          id: Number(
            product.id
          ),
        }
        : {}),

      name: form.name || "",
      title: form.title || "",
      slug: form.slug || "",
      sku: form.sku || "",
      description:
        form.description || "",

      categoryId:
        numericCategoryId,

      brandId:
        toNumberOrNull(
          form.brandId
        ),

      status:
        form.status || "active",

      taxRate:
        form.taxRate === "" ||
          form.taxRate === null ||
          form.taxRate ===
          undefined
          ? "0"
          : String(
            form.taxRate
          ),

      isFeatured:
        Boolean(
          form.isFeatured
        ),

      isPopular:
        Boolean(
          form.isPopular
        ),

      isRecent:
        Boolean(
          form.isRecent
        ),

      isTopRated:
        Boolean(
          form.isTopRated
        ),

      isTrending:
        Boolean(
          form.isTrending
        ),

      featuredimg:
        form.featuredimg || null,

      images:
        Array.isArray(
          form.images
        )
          ? form.images
          : [],

      keyBenefits:
        Array.isArray(
          form.keyBenefits
        )
          ? form.keyBenefits
          : [],

      howToUse:
        Array.isArray(
          form.howToUse
        )
          ? form.howToUse
          : [],

      safetyInformation:
        Array.isArray(
          form.safetyInformation
        )
          ? form.safetyInformation
          : [],

      whatToAvoid:
        Array.isArray(
          form.whatToAvoid
        )
          ? form.whatToAvoid
          : [],

      whoShouldUse:
        Array.isArray(
          form.whoShouldUse
        )
          ? form.whoShouldUse
          : [],

      whychooseus:
        Array.isArray(
          form.whychooseus
        )
          ? form.whychooseus
          : [],

      faqs:
        Array.isArray(
          form.faqs
        )
          ? form.faqs
          : [],

      tags:
        Array.isArray(
          form.tags
        )
          ? form.tags
          : [],

      seo: seoPayload,

      hsnCode:
        form.hsnCode || null,

      variants: (
        Array.isArray(
          form.variants
        )
          ? form.variants
          : []
      ).map((variant) => ({
        ...(variant?.id
          ? {
            id: Number(
              variant.id
            ),
          }
          : {}),

        size:
          variant?.size || "",

        // flavour:
        //   variant?.flavour ||
        //   null,

        price:
          toNumberOrDefault(
            variant?.price,
            0
          ),

        discountedPrice:
          toNumberOrNull(
            variant?.discountedPrice
          ),

        stockQuantity:
          toNumberOrDefault(
            variant?.stockQuantity,
            0
          ),

        weight:
          variant?.weight || "",

        length:
          variant?.length || "",

        height:
          variant?.height || "",

        breadth:
          variant?.breadth || "",

        image:
          variant?.image instanceof
            File
            ? null
            : variant?.image ||
            null,

        imageFile:
          variant?.imageFile instanceof
            File
            ? variant.imageFile
            : null,

        attributes:
          buildVariantAttributes(
            variant
          ),
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

  const stepHasError =
    useMemo(() => {
      return {
        1:
          Boolean(errors.name) ||
          Boolean(errors.slug) ||
          Boolean(
            errors.parentCategoryId
          ) ||
          Boolean(
            errors.subCategoryId
          ) ||
          Boolean(errors.taxRate),

        3: variantsHaveErrors(
          errors.variants
        ),

        6:
          Boolean(
            errors.canonical
          ) ||
          Boolean(
            errors.schemaJson
          ),
      };
    }, [errors]);

  function renderErrorSummary() {
    const messages = [];

    if (errors.name) {
      messages.push(
        errors.name
      );
    }

    if (errors.slug) {
      messages.push(
        errors.slug
      );
    }

    if (
      errors.parentCategoryId
    ) {
      messages.push(
        errors.parentCategoryId
      );
    }

    if (errors.subCategoryId) {
      messages.push(
        errors.subCategoryId
      );
    }

    if (errors.taxRate) {
      messages.push(
        errors.taxRate
      );
    }

    if (errors.canonical) {
      messages.push(
        errors.canonical
      );
    }

    if (errors.schemaJson) {
      messages.push(
        errors.schemaJson
      );
    }

    (
      errors.variants || []
    ).forEach(
      (
        variantErrors,
        index
      ) => {
        Object.values(
          variantErrors || {}
        ).forEach(
          (message) => {
            messages.push(
              `Variant ${index + 1
              }: ${message}`
            );
          }
        );
      }
    );

    if (!messages.length) {
      return null;
    }

    return (
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0 text-red-500"
        />

        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Fix the following before continuing
          </p>

          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-red-600 dark:text-red-400/90">
            {messages.map(
              (message, index) => (
                <li key={index}>
                  {message}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    );
  }

  function renderCategorySelection() {
    const accent = getStepAccent(1);

    return (
      <div className="space-y-3 sm:col-span-2">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${accent.solid}`}
            >
              1
            </div>

            <div>
              <p className="text-sm font-semibold">
                Parent Category
              </p>

              <p className="text-xs text-muted-foreground">
                Select the parent category first
              </p>
            </div>
          </div>

          <Select
            value={
              form.parentCategoryId ||
              "none"
            }
            onValueChange={
              handleParentCategoryChange
            }
            disabled={
              loadingCategories
            }
          >
            <SelectTrigger
              className={`h-11 bg-background ${errors.parentCategoryId
                ? "border-red-400 focus:ring-red-400"
                : ""
                }`}
            >
              <SelectValue
                placeholder={
                  loadingCategories
                    ? "Loading categories..."
                    : "Select parent category"
                }
              />
            </SelectTrigger>

            <SelectContent className="max-h-[320px]">
              <SelectItem value="none">
                Select parent category
              </SelectItem>

              {parentCategories.map(
                (category) => (
                  <SelectItem
                    key={category.id}
                    value={String(
                      category.id
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <FolderTree
                        size={14}
                        className={accent.icon}
                      />

                      {category.name}

                      {category.children
                        ?.length >
                        0 && (
                          <span className="text-xs text-muted-foreground">
                            (
                            {
                              category
                                .children
                                .length
                            }{" "}
                            sub)
                          </span>
                        )}
                    </span>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <FieldError
            message={
              errors.parentCategoryId
            }
          />

          {selectedParentCategory && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border bg-background p-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                {selectedParentCategory.image ? (
                  <img
                    src={
                      selectedParentCategory.image
                    }
                    alt={
                      selectedParentCategory.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FolderTree
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">
                  Parent selected
                </p>

                <p className="truncate text-sm font-semibold">
                  {
                    selectedParentCategory.name
                  }
                </p>
              </div>

              <Check
                size={17}
                className="ml-auto shrink-0 text-emerald-500"
              />
            </div>
          )}
        </div>

        <div
          className={`rounded-xl border bg-muted/20 p-4 transition-opacity ${!form.parentCategoryId ? "opacity-60" : ""
            }`}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${form.parentCategoryId
                ? `text-white ${accent.solid}`
                : "bg-muted text-muted-foreground"
                }`}
            >
              2
            </div>

            <div>
              <p className="text-sm font-semibold">
                Sub Category
              </p>

              <p className="text-xs text-muted-foreground">
                Select the child category
              </p>
            </div>
          </div>

          <Select
            value={
              form.subCategoryId ||
              "none"
            }
            onValueChange={
              handleSubCategoryChange
            }
            disabled={
              !form.parentCategoryId ||
              loadingCategories ||
              subCategories.length ===
              0
            }
          >
            <SelectTrigger
              className={`h-11 bg-background ${errors.subCategoryId
                ? "border-red-400 focus:ring-red-400"
                : ""
                }`}
            >
              <SelectValue
                placeholder={
                  !form.parentCategoryId
                    ? "Select parent first"
                    : subCategories.length ===
                      0
                      ? "No subcategories"
                      : "Select sub category"
                }
              />
            </SelectTrigger>

            <SelectContent className="max-h-[320px]">
              <SelectItem value="none">
                Select sub category
              </SelectItem>

              {subCategories.map(
                (category) => (
                  <SelectItem
                    key={category.id}
                    value={String(
                      category.id
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        └
                      </span>

                      {category.name}
                    </span>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <FieldError
            message={
              errors.subCategoryId
            }
          />

          {!form.parentCategoryId && (
            <p className="mt-2 text-xs text-muted-foreground">
              First select a parent category.
            </p>
          )}

          {form.parentCategoryId &&
            subCategories.length ===
            0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle size={12} className="shrink-0" />
                No subcategories here, so the parent category will be used directly.
              </p>
            )}

          {selectedSubCategory && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border bg-background p-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                {selectedSubCategory.image ? (
                  <img
                    src={
                      selectedSubCategory.image
                    }
                    alt={
                      selectedSubCategory.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FolderTree
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">
                  Sub category selected
                </p>

                <p className="truncate text-sm font-semibold">
                  {
                    selectedParentCategory?.name
                  }{" "}
                  →{" "}
                  {
                    selectedSubCategory.name
                  }
                </p>
              </div>

              <Check
                size={17}
                className="ml-auto shrink-0 text-emerald-500"
              />
            </div>
          )}
        </div>

        {(selectedParentCategory ||
          selectedSubCategory) && (
            <div className={`rounded-xl border p-4 ${accent.border} ${accent.chip}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Final Product Category
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedSubCategory
                      ? `${selectedParentCategory?.name} → ${selectedSubCategory.name}`
                      : selectedParentCategory?.name}
                  </p>
                </div>

                <div className="rounded-lg bg-background px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Category ID:{" "}
                  </span>

                  <span className="font-semibold">
                    {form.categoryId ||
                      form.parentCategoryId}
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  function renderBasicInfo() {
    const accent = getStepAccent(1);

    return (
      <div className="space-y-6">
        <SectionHeading
          icon={Package}
          accent={accent}
          title="Basic Information"
          description="Add the primary information for your product."
        />

        {renderErrorSummary()}

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
                  event.target.value
                )
              }
              placeholder="e.g. Test Product"
              className={
                errors.name
                  ? "border-red-400"
                  : ""
              }
            />

            <FieldError
              message={errors.name}
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
                  event.target.value
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
                  event.target.value
                )
              }
              placeholder="product-slug"
              className={
                errors.slug
                  ? "border-red-400"
                  : ""
              }
            />

            <FieldError
              message={errors.slug}
            />
          </div>

          <div className="grid gap-2">
            <Label>SKU</Label>

            <Input
              value={form.sku}
              onChange={(event) =>
                handleChange(
                  "sku",
                  event.target.value
                )
              }
              placeholder="SKU-001"
            />
          </div>

          {renderCategorySelection()}

          <div className="grid gap-2 sm:col-span-2">
            <Label>Brand</Label>

            <Select
              value={
                form.brandId ||
                "none"
              }
              onValueChange={(value) =>
                handleChange(
                  "brandId",
                  value === "none"
                    ? ""
                    : value
                )
              }
              disabled={
                loadingBrands
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={
                    loadingBrands
                      ? "Loading brands..."
                      : "Select brand"
                  }
                />
              </SelectTrigger>

              <SelectContent className="max-h-[320px]">
                <SelectItem value="none">
                  No Brand
                </SelectItem>

                {brands.map(
                  (brand) => (
                    <SelectItem
                      key={brand.id}
                      value={String(
                        brand.id
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {brand.logo ? (
                          <img
                            src={
                              brand.logo
                            }
                            alt=""
                            className="h-6 w-6 rounded-md border object-contain"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold">
                            {brand.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase()}
                          </div>
                        )}

                        <span>
                          {
                            brand.name
                          }
                        </span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {selectedBrand && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
                  {selectedBrand.logo ? (
                    <img
                      src={
                        selectedBrand.logo
                      }
                      alt={
                        selectedBrand.name
                      }
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {selectedBrand.name
                        ?.charAt(
                          0
                        )
                        ?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    Selected Brand
                  </p>

                  <p className="truncate text-sm font-semibold">
                    {
                      selectedBrand.name
                    }
                  </p>
                </div>

                <Check
                  size={17}
                  className="ml-auto shrink-0 text-emerald-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>
            Description
          </Label>

          <Textarea
            value={form.description}
            onChange={(event) =>
              handleChange(
                "description",
                event.target.value
              )
            }
            placeholder="Write a detailed product description..."
            rows={6}
            className="min-h-[140px] resize-y"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>HSN Code</Label>

            <Input
              value={form.hsnCode}
              onChange={(event) =>
                handleChange(
                  "hsnCode",
                  event.target.value
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
                  event.target.value
                )
              }
              placeholder="0"
              className={
                errors.taxRate
                  ? "border-red-400"
                  : ""
              }
            />

            <FieldError
              message={errors.taxRate}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderImages() {
    const accent = getStepAccent(2);

    const featuredPreview =
      getImagePreview(
        form.featuredimg
      );

    return (
      <div className="space-y-6">
        <SectionHeading
          icon={Images}
          accent={accent}
          title="Product Images"
          description="Add your main product image and gallery images."
        />

        <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
          <div className="mb-5">
            <h4 className="font-semibold">
              Featured Image
            </h4>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              The main image shown on product cards and product pages.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {featuredPreview ? (
              <div className="group relative w-fit">
                <img
                  src={featuredPreview}
                  alt="Featured product"
                  className="h-36 w-36 rounded-2xl border bg-background object-cover shadow-sm sm:h-44 sm:w-44"
                />

                <button
                  type="button"
                  onClick={
                    removeFeaturedImage
                  }
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label
                className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-background text-center transition-colors hover:border-current sm:h-44 sm:w-44 ${accent.icon}`}
              >
                <ImagePlus
                  size={30}
                  className="mb-2"
                />

                <span className="text-sm font-semibold text-foreground">
                  Add Image
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WEBP · up to 5MB
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

            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:w-auto">
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

        <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold">
                Product Gallery
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                Add additional product images.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <Upload size={15} />
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

          {form.images?.length >
            0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {form.images.map(
                (image, index) => {
                  const preview =
                    getImagePreview(
                      image
                    );

                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-2xl border bg-background"
                    >
                      {preview && (
                        <img
                          src={preview}
                          alt={`Product image ${index + 1
                            }`}
                          className="aspect-square w-full object-cover"
                        />
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                        <span className="text-xs font-semibold text-white">
                          Image{" "}
                          {index + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 sm:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center ${accent.icon}`}>
              <Images size={28} />
              <p className="text-sm font-medium text-foreground">
                No gallery images yet
              </p>
              <p className="text-xs text-muted-foreground">
                Use "Add Images" above to upload a few.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderVariants() {
    const accent = getStepAccent(3);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            icon={Layers3}
            accent={accent}
            title="Product Variants"
            description="Configure pricing, stock, dimensions, attributes and images."
          />

          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus
              size={16}
              className="mr-2"
            />
            Add Variant
          </Button>
        </div>

        {renderErrorSummary()}

        <div className="space-y-5">
          {form.variants.map(
            (variant, index) => {
              const preview =
                getImagePreview(
                  variant.image
                );

              const variantErrors =
                errors.variants?.[
                index
                ] || {};

              const hasVariantError =
                Object.keys(variantErrors).length > 0;

              const selectedAttribute =
                variant.attributes?.[0] ||
                null;

              const selectedAttributeDefinition =
                selectedAttribute?.id
                  ? attributes.find(
                    (attribute) =>
                      Number(
                        attribute.id
                      ) ===
                      Number(
                        selectedAttribute.id
                      )
                  )
                  : null;

              const attributeName =
                selectedAttribute
                  ?.name ||
                selectedAttributeDefinition
                  ?.name ||
                "";

              const attributeUnit =
                selectedAttribute
                  ?.unit ||
                selectedAttributeDefinition
                  ?.unit ||
                "";

              return (
                <div
                  key={
                    variant.id ||
                    index
                  }
                  className={`overflow-hidden rounded-xl border-l-4 bg-muted/20 ${hasVariantError
                    ? "border-l-red-400 border-y-red-200 border-r-red-200"
                    : `${accent.border} border-l-current ${accent.icon}`
                    }`}
                >
                  <div className="flex items-center justify-between border-b bg-background px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${hasVariantError ? "bg-red-500" : accent.solid
                          }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          Variant{" "}
                          {index + 1}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {hasVariantError
                            ? "Needs attention"
                            : "Variant configuration"}
                        </p>
                      </div>
                    </div>

                    {form.variants
                      .length > 1 && (
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
                          <X size={17} />
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
                            variant.size ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "size",
                              event.target
                                .value
                            )
                          }
                          placeholder="100g"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Attribute
                        </Label>

                        <Select
                          value={
                            selectedAttribute?.id
                              ? String(
                                selectedAttribute.id
                              )
                              : "none"
                          }
                          onValueChange={(
                            value
                          ) =>
                            handleVariantAttributeChange(
                              index,
                              value
                            )
                          }
                          disabled={
                            loadingAttributes
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue
                              placeholder={
                                loadingAttributes
                                  ? "Loading attributes..."
                                  : "Select attribute"
                              }
                            />
                          </SelectTrigger>

                          <SelectContent className="max-h-[320px]">
                            <SelectItem value="none">
                              Select attribute
                            </SelectItem>

                            {attributes.map(
                              (
                                attribute
                              ) => (
                                <SelectItem
                                  key={
                                    attribute.id
                                  }
                                  value={String(
                                    attribute.id
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {
                                        attribute.name
                                      }
                                    </span>

                                    {attribute.unit && (
                                      <span className="text-xs text-muted-foreground">
                                        (
                                        {
                                          attribute.unit
                                        }
                                        )
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          {attributeName
                            ? `${attributeName} Value`
                            : "Attribute Value"}
                        </Label>

                        <div className="relative">
                          <Input
                            value={
                              selectedAttribute?.value ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              handleVariantAttributeValueChange(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder={
                              attributeName
                                ? `Enter ${attributeName.toLowerCase()}`
                                : "Enter attribute value"
                            }
                            disabled={
                              !selectedAttribute
                            }
                            className={
                              attributeUnit
                                ? "pr-16"
                                : ""
                            }
                          />

                          {attributeUnit && (
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                              {
                                attributeUnit
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Price{" "}
                          <span className="text-red-500">
                            *
                          </span>
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
                              event.target
                                .value
                            )
                          }
                          placeholder="495"
                          className={
                            variantErrors.price
                              ? "border-red-400"
                              : ""
                          }
                        />

                        <FieldError
                          message={
                            variantErrors.price
                          }
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
                              event.target
                                .value
                            )
                          }
                          placeholder="399"
                          className={
                            variantErrors.discountedPrice
                              ? "border-red-400"
                              : ""
                          }
                        />

                        <FieldError
                          message={
                            variantErrors.discountedPrice
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>
                          Stock Quantity{" "}
                          <span className="text-red-500">
                            *
                          </span>
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
                              event.target
                                .value
                            )
                          }
                          placeholder="20"
                          min="0"
                          className={
                            variantErrors.stockQuantity
                              ? "border-red-400"
                              : ""
                          }
                        />

                        <FieldError
                          message={
                            variantErrors.stockQuantity
                          }
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
                              event.target
                                .value
                            )
                          }
                          placeholder="0.1"
                        />
                      </div>
                    </div>

                    {selectedAttribute && (
                      <div className={`rounded-xl border p-4 ${accent.border} ${accent.chip}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              Selected Attribute
                            </p>

                            <p className="mt-1 text-base font-semibold">
                              {
                                attributeName
                              }
                            </p>
                          </div>

                          <div className="w-fit rounded-xl border bg-background px-4 py-2.5">
                            <span className="text-sm font-semibold">
                              {selectedAttribute.value ||
                                "—"}
                            </span>

                            {attributeUnit && (
                              <span className="ml-1 text-sm text-muted-foreground">
                                {
                                  attributeUnit
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-background/70 px-3 py-2.5">
                          <p className="text-[11px] font-medium text-muted-foreground">
                            Display value
                          </p>

                          <p className="mt-0.5 text-sm font-semibold">
                            {
                              attributeName
                            }
                            :{" "}
                            {selectedAttribute.value ||
                              "—"}
                            {attributeUnit
                              ? ` ${attributeUnit}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    )}

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
                                event.target
                                  .value
                              )
                            }
                            placeholder="10"
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
                                event.target
                                  .value
                              )
                            }
                            placeholder="10"
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
                                event.target
                                  .value
                              )
                            }
                            placeholder="10"
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
                              src={preview}
                              alt={`Variant ${index + 1
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

                        <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted sm:w-auto">
                          <Upload
                            size={16}
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
  const accent = getStepAccent(4);

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
      <SectionHeading
        icon={FileText}
        accent={accent}
        title="Product Details"
        description="Add detailed information about your product."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map(
          ([field, label, description]) => (
            <div
              key={field}
              className="rounded-xl border bg-muted/20 p-4 sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {label}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addArrayItem(field)
                  }
                  className="shrink-0"
                >
                  <Plus
                    size={14}
                    className="mr-1.5"
                  />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {(form[field] || []).length ===
                0 ? (
                  <div className="rounded-lg border border-dashed bg-background p-5 text-center">
                    <p className="text-xs text-muted-foreground">
                      No {label.toLowerCase()} added yet.
                    </p>
                  </div>
                ) : (
                  (form[field] || []).map(
                    (value, index) => (
                      <div
                        key={`${field}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-semibold text-muted-foreground">
                          {index + 1}
                        </div>

                        <Textarea
                          value={value ?? ""}
                          onChange={(event) =>
                            handleArrayChange(
                              field,
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Enter ${label.toLowerCase()}...`}
                          rows={3}
                          className="min-h-[80px] resize-y bg-background"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem(
                              field,
                              index
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          aria-label={`Remove ${label} ${index + 1}`}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5 lg:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}
            >
              <MessageCircle
                size={19}
                className={accent.icon}
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-lg font-semibold">
                Frequently Asked Questions
              </h4>

              <p className="mt-1 text-sm text-muted-foreground">
                Add common customer questions and their answers.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              setForm((previous) => ({
                ...previous,
                faqs: [
                  ...(previous.faqs || []),
                  {
                    question: "",
                    answer: "",
                  },
                ],
              }));
            }}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus
              size={16}
              className="mr-2"
            />
            Add Question
          </Button>
        </div>

        {(!form.faqs ||
          form.faqs.length === 0) && (
          <div className="rounded-xl border-2 border-dashed bg-background p-8 text-center">
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${accent.chip}`}
            >
              <MessageCircle
                size={22}
                className={accent.icon}
              />
            </div>

            <p className="text-sm font-semibold">
              No FAQs added yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Click "Add Question" to create your first FAQ.
            </p>
          </div>
        )}

        {Array.isArray(form.faqs) &&
          form.faqs.length > 0 && (
            <div className="space-y-4">
              {form.faqs.map(
                (faq, index) => (
                  <div
                    key={
                      faq?.id
                        ? `faq-${faq.id}`
                        : `faq-new-${index}`
                    }
                    className="rounded-xl border bg-background p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${accent.solid}`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            Question {index + 1}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Add a customer question and answer.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((previous) => ({
                            ...previous,
                            faqs: (
                              previous.faqs ||
                              []
                            ).filter(
                              (_, faqIndex) =>
                                faqIndex !==
                                index
                            ),
                          }));
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid gap-2">
                      <Label>
                        Question
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </Label>

                      <Input
                        value={
                          faq?.question ||
                          ""
                        }
                        onChange={(event) => {
                          const value =
                            event.target
                              .value;

                          setForm(
                            (previous) => {
                              const faqs = [
                                ...(previous.faqs ||
                                  []),
                              ];

                              faqs[index] = {
                                ...faqs[
                                  index
                                ],
                                question:
                                  value,
                              };

                              return {
                                ...previous,
                                faqs,
                              };
                            }
                          );
                        }}
                        placeholder="e.g. What are the key benefits of this product?"
                        className="h-11"
                      />
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Label>
                        Answer
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </Label>

                      <Textarea
                        value={
                          faq?.answer ||
                          ""
                        }
                        onChange={(event) => {
                          const value =
                            event.target
                              .value;

                          setForm(
                            (previous) => {
                              const faqs = [
                                ...(previous.faqs ||
                                  []),
                              ];

                              faqs[index] = {
                                ...faqs[
                                  index
                                ],
                                answer:
                                  value,
                              };

                              return {
                                ...previous,
                                faqs,
                              };
                            }
                          );
                        }}
                        placeholder="Write a clear and helpful answer..."
                        rows={5}
                        className="min-h-[120px] resize-y"
                      />
                    </div>
                    {(faq?.question ||
                      faq?.answer) && (
                      <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Preview
                        </p>

                        {faq?.question && (
                          <p className="text-sm font-semibold">
                            Q.{" "}
                            {
                              faq.question
                            }
                          </p>
                        )}

                        {faq?.answer && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            A.{" "}
                            {
                              faq.answer
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}
  function renderSettings() {
    const accent = getStepAccent(5);

    const switches = [
      [
        "isFeatured",
        "Featured Product",
        "Show this product as featured.",
        Sparkles,
      ],
      [
        "isPopular",
        "Popular Product",
        "Show this product as popular.",
        TrendingUp,
      ],
      [
        "isRecent",
        "Recent Product",
        "Mark this product as recent.",
        Clock,
      ],
      [
        "isTopRated",
        "Top Rated",
        "Mark this product as top rated.",
        Star,
      ],
      [
        "isTrending",
        "Trending Product",
        "Show this product as trending.",
        Award,
      ],
    ];

    return (
      <div className="space-y-6">
        <SectionHeading
          icon={Settings2}
          accent={accent}
          title="Product Settings"
          description="Configure product visibility."
        />

        <div className="grid gap-3">
          {switches.map(
            ([
              field,
              label,
              description,
              Icon,
            ]) => {
              const checked = Boolean(form[field]);

              return (
                <div
                  key={field}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors sm:p-5 ${checked ? `${accent.border} ${accent.chip}` : "bg-muted/20"
                    }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${checked ? "bg-background" : "bg-muted"
                        }`}
                    >
                      <Icon
                        size={16}
                        className={checked ? accent.icon : "text-muted-foreground"}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {label}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        {description}
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={checked}
                    onCheckedChange={(
                      value
                    ) =>
                      handleChange(
                        field,
                        Boolean(value)
                      )
                    }
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  }

  function renderSeo() {
    const accent = getStepAccent(6);

    const schemaEnabled = Boolean(
      form.seo.schema?.enabled
    );

    const customJson =
      form.seo.schema?.customJson || "";

    const prettyJson =
      effectiveJsonLd.isValid &&
        effectiveJsonLd.value
        ? JSON.stringify(
          effectiveJsonLd.value,
          null,
          2
        )
        : null;

    return (
      <div className="space-y-6">
        <SectionHeading
          icon={Search}
          accent={accent}
          title="SEO Information"
          description="Optimize your product for search engines and social sharing."
        />

        {renderErrorSummary()}

        <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
          <CardHeading
            icon={Globe}
            accent={accent}
            title="Search Engine Meta"
            description="Controls how this product appears in search results."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label>SEO Title</Label>

              <Input
                value={form.seo.title}
                onChange={(event) =>
                  handleSeoChange(
                    "title",
                    event.target.value
                  )
                }
                placeholder="SEO title"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
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
                    event.target.value
                  )
                }
                placeholder="SEO description"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seo-keywords">SEO Keywords</Label>

              <div className="rounded-xl border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(form.seo?.keywords || []).map((keyword, index) => (
                    <div
                      key={`${keyword}-${index}`}
                      className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1.5 text-sm"
                    >
                      <span>{keyword}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            seo: {
                              ...prev.seo,
                              keywords: (prev.seo?.keywords || []).filter(
                                (_, keywordIndex) => keywordIndex !== index
                              ),
                            },
                          }));
                        }}
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${keyword}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <Input
                    id="seo-keywords"
                    type="text"
                    placeholder="Type keyword and press Enter"
                    className="min-w-[220px] flex-1 border-0 shadow-none focus-visible:ring-0"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== ",") {
                        return;
                      }

                      event.preventDefault();

                      const value = event.currentTarget.value
                        .trim()
                        .replace(/,$/, "");

                      if (!value) {
                        return;
                      }

                      setForm((prev) => {
                        const currentKeywords = Array.isArray(prev.seo?.keywords)
                          ? prev.seo.keywords
                          : [];

                        const alreadyExists = currentKeywords.some(
                          (item) => item.toLowerCase() === value.toLowerCase()
                        );

                        if (alreadyExists) {
                          return prev;
                        }

                        return {
                          ...prev,
                          seo: {
                            ...prev.seo,
                            keywords: [...currentKeywords, value],
                          },
                        };
                      });

                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Type a keyword and press Enter or comma to add it.
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Author</Label>

              <Input
                value={form.seo.author}
                onChange={(event) =>
                  handleSeoChange(
                    "author",
                    event.target.value
                  )
                }
                placeholder="Author"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
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
                    event.target.value
                  )
                }
                placeholder="https://example.com/product/..."
                className={
                  errors.canonical
                    ? "border-red-400"
                    : ""
                }
              />

              <FieldError
                message={errors.canonical}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label>
                Robots Meta Tag
              </Label>

              <Select
                value={
                  form.seo.robots ||
                  "index, follow"
                }
                onValueChange={(value) =>
                  handleSeoChange(
                    "robots",
                    value
                  )
                }
              >
                <SelectTrigger className="h-11 sm:w-[280px]">
                  <SelectValue placeholder="Select robots configuration" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="index, follow">
                    Index, Follow (Recommended)
                  </SelectItem>

                  <SelectItem value="noindex, nofollow">
                    No-Index, No-Follow
                  </SelectItem>

                  <SelectItem value="noindex, follow">
                    No-Index, Follow
                  </SelectItem>

                  <SelectItem value="index, nofollow">
                    Index, No-Follow
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
          <CardHeading
            icon={Code2}
            accent={accent}
            title="Structured Data (JSON-LD)"
            description="Helps search engines understand this product for rich results."
            action={
              <Switch
                checked={schemaEnabled}
                onCheckedChange={(value) =>
                  handleSeoNestedChange(
                    "schema",
                    "enabled",
                    Boolean(value)
                  )
                }
              />
            }
          />

          {schemaEnabled ? (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>
                    Schema Type
                  </Label>

                  <Select
                    value={
                      form.seo.schema
                        ?.type ||
                      "Product"
                    }
                    onValueChange={(
                      value
                    ) =>
                      handleSeoNestedChange(
                        "schema",
                        "type",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select schema type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Product">
                        Product
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-muted-foreground">
                    Auto-generated from the product's name, images, brand and variant pricing.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>
                    Custom JSON-LD (optional)
                  </Label>

                  {customJson.trim() && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSeoNestedChange(
                          "schema",
                          "customJson",
                          ""
                        )
                      }
                      className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Reset to auto-generated
                    </button>
                  )}
                </div>

                <Textarea
                  value={customJson}
                  onChange={(event) =>
                    handleSeoNestedChange(
                      "schema",
                      "customJson",
                      event.target.value
                    )
                  }
                  placeholder='Paste a custom JSON-LD object to override the auto-generated schema, e.g. { "@context": "https://schema.org/", "@type": "Product", ... }'
                  rows={6}
                  className={`font-mono text-xs ${errors.schemaJson
                    ? "border-red-400"
                    : ""
                    }`}
                />

                <FieldError
                  message={errors.schemaJson}
                />
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Braces
                      size={15}
                      className={accent.icon}
                    />

                    <p className="text-xs font-semibold">
                      {effectiveJsonLd.isCustom
                        ? "Custom schema preview"
                        : "Auto-generated preview"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={
                      copySchemaToClipboard
                    }
                    disabled={
                      !effectiveJsonLd.isValid
                    }
                    className="h-8 px-2.5 text-xs"
                  >
                    {schemaCopied ? (
                      <>
                        <CheckCheck
                          size={13}
                          className="mr-1.5 text-emerald-500"
                        />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy
                          size={13}
                          className="mr-1.5"
                        />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {prettyJson ? (
                  <pre className="max-h-64 overflow-auto rounded-lg bg-muted/40 p-3 text-[11px] leading-relaxed">
                    <code>{prettyJson}</code>
                  </pre>
                ) : (
                  <p className="flex items-center gap-1.5 rounded-lg border border-dashed border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle
                      size={12}
                      className="shrink-0"
                    />
                    Fix the custom JSON above to see a preview.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
              Structured data is disabled — this product won't emit a JSON-LD schema.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 sm:p-6">
          <CardHeading
            icon={Share2}
            accent={accent}
            title="Social Sharing"
            description="Configure how this product looks when shared on social platforms."
          />

          <div className="grid gap-6">
            <div className="rounded-xl border bg-background p-4 sm:p-5">
              <CardHeading
                icon={Link2}
                title="Facebook (Open Graph)"
                description="Used by Facebook and other platforms that read OG tags."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>
                    Facebook Title
                  </Label>

                  <Input
                    value={
                      form.seo.facebook
                        ?.title || ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "facebook",
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Facebook Open Graph Title"
                  />
                </div>

                {/*test*/}
                <div className="grid gap-2">
                  <Label>
                    Facebook Card
                  </Label>

                  <Select
                    value={
                      form.seo.facebook
                        ?.card ||
                      "summary_large_image"
                    }
                    onValueChange={(
                      value
                    ) =>
                      handleSeoNestedChange(
                        "facebook",
                        "card",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="h-11 w-[250px]">
                      <SelectValue placeholder="Select Twitter card" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="summary">
                        Summary
                      </SelectItem>

                      <SelectItem value="summary_large_image">
                        Summary Large Image
                      </SelectItem>

                      <SelectItem value="player">
                        Player
                      </SelectItem>

                      <SelectItem value="app">
                        App
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>
                    Facebook URL
                  </Label>

                  <Input
                    value={
                      form.seo.facebook
                        ?.url || ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "facebook",
                        "url",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/product/product-slug"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    Facebook Image Path
                  </Label>

                  <Input
                    value={
                      form.seo.facebook
                        ?.image_path || ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "facebook",
                        "image_path",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/images/product-share.jpg"
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label>
                    Facebook Description
                  </Label>

                  <Textarea
                    value={
                      form.seo.facebook
                        ?.description ||
                      ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "facebook",
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Facebook Open Graph Description"
                    rows={3}
                  />
                </div>


              </div>
            </div>

            <div className="rounded-xl border bg-background p-4 sm:p-5">
              <CardHeading
                icon={AtSign}
                title="Twitter / X"
                description="Configure the Twitter/X card for this product."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>
                    Twitter Title
                  </Label>

                  <Input
                    value={
                      form.seo.twitter
                        ?.title || ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "twitter",
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Twitter Display Card Title"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    Twitter Card
                  </Label>

                  <Select
                    value={
                      form.seo.twitter
                        ?.card ||
                      "summary_large_image"
                    }
                    onValueChange={(
                      value
                    ) =>
                      handleSeoNestedChange(
                        "twitter",
                        "card",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Twitter card" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="summary">
                        Summary
                      </SelectItem>

                      <SelectItem value="summary_large_image">
                        Summary Large Image
                      </SelectItem>

                      <SelectItem value="player">
                        Player
                      </SelectItem>

                      <SelectItem value="app">
                        App
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label>
                    Twitter Description
                  </Label>

                  <Textarea
                    value={
                      form.seo.twitter
                        ?.description ||
                      ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "twitter",
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Twitter Description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    Twitter Redirect URL
                  </Label>

                  <Input
                    value={
                      form.seo.twitter
                        ?.redirect_url ||
                      ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "twitter",
                        "redirect_url",
                        event.target.value
                      )
                    }
                    placeholder="https://site.com/target-path"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>
                    Twitter Image Path
                  </Label>

                  <Input
                    value={
                      form.seo.twitter
                        ?.image_path || ""
                    }
                    onChange={(event) =>
                      handleSeoNestedChange(
                        "twitter",
                        "image_path",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/images/product-share.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 sm:p-5 ${accent.border} ${accent.chip}`}
        >
          <div className="flex gap-3">
            <Search
              size={20}
              className={`mt-0.5 shrink-0 ${accent.icon}`}
            />

            <div className="min-w-0">
              <p className="font-semibold">
                SEO Preview
              </p>

              <p className="mt-2 break-words text-sm font-medium text-sky-700 dark:text-sky-400">
                {form.seo.title ||
                  form.name ||
                  "Product title"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {form.seo.description ||
                  form.description ||
                  "Product description will appear here."}
              </p>

              <p className="mt-2 break-all text-xs text-emerald-600 dark:text-emerald-400">
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

  function renderStepIndicator() {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">
              Product Setup
            </p>

            <p className="text-xs text-muted-foreground">
              Step {currentStep} of{" "}
              {steps.length} · {steps[currentStep - 1]?.title}
            </p>
          </div>

          <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold tabular-nums">
            {progress}%
          </div>
        </div>

        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getStepAccent(currentStep).solid}`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2 px-1">
            {steps.map((step) => {
              const Icon =
                step.icon;

              const active =
                currentStep ===
                step.id;

              const completed =
                currentStep >
                step.id;

              const invalid =
                Boolean(
                  stepHasError[
                  step.id
                  ]
                );

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    goToStep(
                      step.id
                    )
                  }
                  className={`flex min-w-[145px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all sm:min-w-[155px] ${invalid
                    ? "border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
                    : active
                      ? `${step.accent.activeBorder} ${step.accent.activeBg} shadow-sm`
                      : completed
                        ? `${step.accent.border} bg-background`
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${invalid
                      ? "bg-red-500 text-white"
                      : active
                        ? `text-white ${step.accent.solid}`
                        : completed
                          ? `${step.accent.chip} ${step.accent.icon}`
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {invalid ? (
                      <AlertCircle
                        size={17}
                      />
                    ) : completed ? (
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
                      className={`truncate text-xs font-semibold sm:text-sm ${invalid
                        ? "text-red-600 dark:text-red-400"
                        : active
                          ? step.accent.activeText
                          : ""
                        }`}
                    >
                      {step.title}
                    </p>

                    <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                      {invalid
                        ? "Needs attention"
                        : step.description}
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
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${getStepAccent(currentStep).chip}`}
              >
                <Package size={19} className={getStepAccent(currentStep).icon} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg sm:text-2xl">
                  {product?.id
                    ? "Edit Product"
                    : "Create Product"}
                </DialogTitle>

                <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
                  Complete each step to configure your product.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold tabular-nums">
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