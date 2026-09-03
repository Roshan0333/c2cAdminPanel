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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  X,
  Check,
  Search,
  Loader2,
  ChevronDown,
} from "lucide-react";

import { getBrands } from "@/apiService/brandApi";
import { getCategory } from "@/apiService/categoryApi";
import { searchProduct } from "@/apiService/productApi";

const emptyForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  applicableProductIds: [],
  applicableCategoryIds: [],
  applicableBrands: [],
  minCartValue: "",
  maxDiscount: "",
  usageLimit: "",
  isActive: true,
  showOnCheckout: true,
  expiresAt: "",
};

function getArray(response, keys = []) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getId(item) {
  const id =
    item?.id ??
    item?.productId ??
    item?.categoryId ??
    item?.brandId;

  const parsed = Number(id);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

function getName(item, fallback = "") {
  return (
    item?.name ??
    item?.title ??
    item?.productName ??
    item?.brandName ??
    fallback
  );
}

function getImage(item) {
  return (
    item?.logo ??
    item?.image ??
    item?.featuredimg ??
    item?.featuredImage ??
    item?.imageUrl ??
    item?.logoUrl ??
    item?.thumbnail ??
    item?.productImage ??
    null
  );
}

function getBrandValue(item) {
  return String(
    item?.name ??
      item?.brandName ??
      item?.slug ??
      item?.id ??
      ""
  );
}

function normalizeIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "object") {
        return getId(item);
      }

      const id = Number(item);

      return Number.isInteger(id) && id > 0
        ? id
        : null;
    })
    .filter(Boolean);
}

function SelectionImage({ item, type }) {
  const image = getImage(item);
  const name = getName(item, type);

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-md border bg-white object-contain"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium uppercase">
      {name?.charAt(0) || "?"}
    </div>
  );
}

function SelectedChip({ children, onRemove }) {
  return (
    <div className="flex max-w-full items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 text-xs">
      <span className="max-w-[180px] truncate">
        {children}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-red-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SelectorBox({
  placeholder,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  open,
  onToggle,
  loading,
  emptyText,
  children,
  selectedCount,
  label,
}) {
  const hasChildren = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted/40"
      >
        <span
          className={
            selectedCount > 0
              ? "font-medium"
              : "text-muted-foreground"
          }
        >
          {selectedCount > 0
            ? `${selectedCount} ${label.toLowerCase()} selected`
            : placeholder}
        </span>

        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-background shadow-lg">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                autoFocus
                value={searchValue}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : hasChildren ? (
              children
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CouponForm({
  open,
  onOpenChange,
  coupon,
  onSave,
  brands: brandsProp = [],
  categories: categoriesProp = [],
  products: productsProp = [],
  loadingOptions = false,
  onSearchProducts,
}) {
  const [form, setForm] = useState(emptyForm);

  const [localBrands, setLocalBrands] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);

  const [brandInput, setBrandInput] = useState("");
  const [productInput, setProductInput] = useState("");
  const [parentCategoryInput, setParentCategoryInput] =
    useState("");

  const [brandOpen, setBrandOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [parentCategoryOpen, setParentCategoryOpen] =
    useState(false);

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(false);
  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [selectedParentCategoryIds, setSelectedParentCategoryIds] =
    useState([]);

  const brands =
    Array.isArray(brandsProp) && brandsProp.length > 0
      ? brandsProp
      : localBrands;

  const categories =
    Array.isArray(categoriesProp) && categoriesProp.length > 0
      ? categoriesProp
      : localCategories;

  const products =
    Array.isArray(productsProp) && productsProp.length > 0
      ? productsProp
      : localProducts;

  const parentCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category?.parentId === null ||
        category?.parentId === undefined
    );
  }, [categories]);

  const selectedParentCategories = useMemo(() => {
    return parentCategories.filter((category) =>
      selectedParentCategoryIds.includes(
        getId(category)
      )
    );
  }, [
    parentCategories,
    selectedParentCategoryIds,
  ]);

  const selectedParentIdsSet = useMemo(() => {
    return new Set(
      selectedParentCategoryIds.map(Number)
    );
  }, [selectedParentCategoryIds]);

  const selectedSubCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category?.parentId !== null &&
        category?.parentId !== undefined &&
        selectedParentIdsSet.has(
          Number(category.parentId)
        )
    );
  }, [
    categories,
    selectedParentIdsSet,
  ]);

  const filteredParentCategories = useMemo(() => {
    const query =
      parentCategoryInput.trim().toLowerCase();

    if (!query) {
      return parentCategories;
    }

    return parentCategories.filter((category) =>
      getName(category)
        .toLowerCase()
        .includes(query)
    );
  }, [
    parentCategories,
    parentCategoryInput,
  ]);

  const filteredBrands = useMemo(() => {
    const query = brandInput
      .trim()
      .toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) =>
      getName(brand)
        .toLowerCase()
        .includes(query)
    );
  }, [brands, brandInput]);

  useEffect(() => {
    if (!open) {
      setBrandOpen(false);
      setProductOpen(false);
      setParentCategoryOpen(false);
      return;
    }

    if (coupon) {
      const categoryIds = normalizeIds(
        coupon.applicableCategoryIds
      );

      const parentIds = [];

      categoryIds.forEach((categoryId) => {
        const category = categories.find(
          (item) =>
            getId(item) === Number(categoryId)
        );

        if (!category) {
          return;
        }

        const parentId =
          category.parentId ??
          getId(category.parent);

        if (
          parentId !== null &&
          parentId !== undefined
        ) {
          const parsedParentId =
            Number(parentId);

          if (
            !parentIds.includes(
              parsedParentId
            )
          ) {
            parentIds.push(parsedParentId);
          }
        } else {
          const ownId = getId(category);

          if (
            ownId &&
            !parentIds.includes(ownId)
          ) {
            parentIds.push(ownId);
          }
        }
      });

      setSelectedParentCategoryIds(
        parentIds
      );

      setForm({
        ...emptyForm,
        ...coupon,
        applicableProductIds:
          normalizeIds(
            coupon.applicableProductIds
          ),
        applicableCategoryIds:
          categoryIds,
        applicableBrands:
          Array.isArray(
            coupon.applicableBrands
          )
            ? coupon.applicableBrands.map(String)
            : [],
        expiresAt: coupon.expiresAt
          ? String(coupon.expiresAt).slice(
              0,
              10
            )
          : "",
      });
    } else {
      setSelectedParentCategoryIds([]);

      setForm({
        ...emptyForm,
      });
    }

    setBrandInput("");
    setProductInput("");
    setParentCategoryInput("");
  }, [coupon, open]);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function loadBrands() {
    if (brands.length > 0) {
      return;
    }

    try {
      setLoadingBrands(true);

      const response = await getBrands();

      const data = getArray(response, [
        "brands",
        "items",
      ]);

      setLocalBrands(data);
    } catch (error) {
      console.error(
        "Failed to load brands:",
        error
      );

      setLocalBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }

  async function loadCategories() {
    if (categories.length > 0) {
      return;
    }

    try {
      setLoadingCategories(true);

      const response = await getCategory();

      const data = getArray(response, [
        "categories",
        "items",
      ]);

      setLocalCategories(data);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      setLocalCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleProductSearch(value) {
    setProductInput(value);

    const query = String(value || "").trim();

    if (!query) {
      setLocalProducts([]);
      return;
    }

    try {
      setLoadingProducts(true);

      if (
        typeof onSearchProducts ===
        "function"
      ) {
        const result =
          await onSearchProducts(query);

        if (Array.isArray(result)) {
          setLocalProducts(result);
        }

        return;
      }

      const response =
        await searchProduct(query);

      const data = getArray(response, [
        "products",
        "items",
      ]);

      setLocalProducts(data);
    } catch (error) {
      console.error(
        "Product search failed:",
        error
      );

      setLocalProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  function toggleParentCategory(category) {
    const parentId = getId(category);

    if (!parentId) {
      return;
    }

    const hasSubcategories = categories.some(
      (item) =>
        Number(item?.parentId) ===
        Number(parentId)
    );

    setSelectedParentCategoryIds((prev) => {
      const alreadySelected =
        prev.includes(parentId);

      if (alreadySelected) {
        return prev.filter(
          (id) => id !== parentId
        );
      }

      return [...prev, parentId];
    });

    if (!hasSubcategories) {
      setForm((prev) => {
        const exists =
          prev.applicableCategoryIds.includes(
            parentId
          );

        if (exists) {
          return prev;
        }

        return {
          ...prev,
          applicableCategoryIds: [
            ...prev.applicableCategoryIds,
            parentId,
          ],
        };
      });
    }
  }

  function toggleCategory(category) {
    const id = getId(category);

    if (!id) {
      return;
    }

    setForm((prev) => {
      const exists =
        prev.applicableCategoryIds.includes(id);

      return {
        ...prev,
        applicableCategoryIds: exists
          ? prev.applicableCategoryIds.filter(
              (item) => item !== id
            )
          : [
              ...prev.applicableCategoryIds,
              id,
            ],
      };
    });
  }

  function removeParentCategory(parentId) {
    const numericParentId =
      Number(parentId);

    setSelectedParentCategoryIds((prev) =>
      prev.filter(
        (id) =>
          Number(id) !== numericParentId
      )
    );

    const childIds = categories
      .filter(
        (category) =>
          Number(category?.parentId) ===
          numericParentId
      )
      .map(getId)
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      applicableCategoryIds:
        prev.applicableCategoryIds.filter(
          (id) =>
            Number(id) !== numericParentId &&
            !childIds.includes(Number(id))
        ),
    }));
  }

  function removeCategory(id) {
    setForm((prev) => ({
      ...prev,
      applicableCategoryIds:
        prev.applicableCategoryIds.filter(
          (item) =>
            Number(item) !== Number(id)
        ),
    }));
  }

  function toggleBrand(brand) {
    const value = getBrandValue(brand);

    if (!value) {
      return;
    }

    setForm((prev) => {
      const exists =
        prev.applicableBrands.some(
          (item) =>
            String(item).toLowerCase() ===
            value.toLowerCase()
        );

      return {
        ...prev,
        applicableBrands: exists
          ? prev.applicableBrands.filter(
              (item) =>
                String(item).toLowerCase() !==
                value.toLowerCase()
            )
          : [
              ...prev.applicableBrands,
              value,
            ],
      };
    });
  }

  function removeBrand(brand) {
    setForm((prev) => ({
      ...prev,
      applicableBrands:
        prev.applicableBrands.filter(
          (item) => item !== brand
        ),
    }));
  }

  function toggleProduct(product) {
    const id = getId(product);

    if (!id) {
      return;
    }

    setForm((prev) => {
      const exists =
        prev.applicableProductIds.includes(id);

      return {
        ...prev,
        applicableProductIds: exists
          ? prev.applicableProductIds.filter(
              (item) => item !== id
            )
          : [
              ...prev.applicableProductIds,
              id,
            ],
      };
    });
  }

  function removeProduct(id) {
    setForm((prev) => ({
      ...prev,
      applicableProductIds:
        prev.applicableProductIds.filter(
          (item) =>
            Number(item) !== Number(id)
        ),
    }));
  }

  function getCategoryName(id) {
    const category = categories.find(
      (item) =>
        getId(item) === Number(id)
    );

    return category
      ? getName(category)
      : `Category #${id}`;
  }

  function getProductName(id) {
    const product = products.find(
      (item) =>
        getId(item) === Number(id)
    );

    return product
      ? getName(product)
      : `Product #${id}`;
  }

  function getParentName(id) {
    return getCategoryName(id);
  }

  function handleSubmit() {
    const categoryIds = [
      ...new Set(
        form.applicableCategoryIds
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id > 0
          )
      ),
    ];

    const payload = {
      ...(coupon?.id
        ? {
            id: coupon.id,
          }
        : {}),

      code: String(form.code || "")
        .trim()
        .toUpperCase(),

      discountType:
        form.discountType,

      discountValue:
        form.discountValue === "" ||
        form.discountValue === null ||
        form.discountValue === undefined
          ? null
          : Number(form.discountValue),

      applicableProductIds: [
        ...new Set(
          form.applicableProductIds
            .map(Number)
            .filter(
              (id) =>
                Number.isInteger(id) &&
                id > 0
            )
        ),
      ],

      applicableCategoryIds:
        categoryIds,

      applicableBrands: [
        ...new Set(
          form.applicableBrands.map(String)
        ),
      ],

      minCartValue:
        form.minCartValue === "" ||
        form.minCartValue === null ||
        form.minCartValue === undefined
          ? null
          : Number(form.minCartValue),

      maxDiscount:
        form.maxDiscount === "" ||
        form.maxDiscount === null ||
        form.maxDiscount === undefined
          ? null
          : Number(form.maxDiscount),

      usageLimit:
        form.usageLimit === "" ||
        form.usageLimit === null ||
        form.usageLimit === undefined
          ? null
          : Number(form.usageLimit),

      expiresAt:
        form.expiresAt === ""
          ? null
          : new Date(
              `${form.expiresAt}T23:59:59.000Z`
            ).toISOString(),

      isActive: Boolean(
        form.isActive
      ),

      showOnCheckout: Boolean(
        form.showOnCheckout
      ),
    };

    onSave(payload);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {coupon
              ? "Edit Coupon"
              : "Add Coupon"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label>Code</Label>

            <Input
              value={form.code}
              onChange={(e) =>
                handleChange(
                  "code",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="MEGA_SALE"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Discount Type
              </Label>

              <Select
                value={form.discountType}
                onValueChange={(value) =>
                  handleChange(
                    "discountType",
                    value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="PERCENTAGE">
                    Percentage
                  </SelectItem>

                  <SelectItem value="FIXED">
                    Fixed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                Discount Value
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.discountValue ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    "discountValue",
                    e.target.value
                  )
                }
                placeholder={
                  form.discountType ===
                  "PERCENTAGE"
                    ? "25"
                    : "500"
                }
              />
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3">
              <Label>
                Applicable Products
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Search and select products
                this coupon applies to.
              </p>
            </div>

            <SelectorBox
              label="Products"
              placeholder="Select products"
              searchPlaceholder="Search products..."
              searchValue={productInput}
              onSearchChange={
                handleProductSearch
              }
              open={productOpen}
              onToggle={() => {
                const next = !productOpen;

                setProductOpen(next);
                setBrandOpen(false);
                setParentCategoryOpen(
                  false
                );

                if (next) {
                  setProductInput("");
                }
              }}
              loading={
                loadingProducts ||
                loadingOptions
              }
              selectedCount={
                form.applicableProductIds
                  .length
              }
              emptyText={
                productInput
                  ? "No products found."
                  : "Type to search products."
              }
            >
              {products.map((product) => {
                const id = getId(product);

                if (!id) {
                  return null;
                }

                const selected =
                  form.applicableProductIds.includes(
                    id
                  );

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      toggleProduct(product)
                    }
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left ${
                      selected
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <SelectionImage
                      item={product}
                      type="product"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {getName(
                          product,
                          `Product #${id}`
                        )}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {product?.sku && (
                          <span className="truncate">
                            SKU: {product.sku}
                          </span>
                        )}

                        {product?.category
                          ?.name && (
                          <span className="truncate">
                            •{" "}
                            {
                              product
                                .category
                                .name
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </SelectorBox>

            {form.applicableProductIds
              .length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.applicableProductIds.map(
                  (id) => (
                    <SelectedChip
                      key={id}
                      onRemove={() =>
                        removeProduct(id)
                      }
                    >
                      {getProductName(id)}
                    </SelectedChip>
                  )
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-4">
              <Label>
                Applicable Categories
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Select multiple parent
                categories. Their subcategories
                will appear below.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>
                  Parent Categories
                </Label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        !parentCategoryOpen;

                      setParentCategoryOpen(
                        next
                      );

                      setBrandOpen(false);
                      setProductOpen(false);

                      if (next) {
                        loadCategories();
                      }
                    }}
                    className="flex min-h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted/40"
                  >
                    <span
                      className={
                        selectedParentCategoryIds.length >
                        0
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {selectedParentCategoryIds.length >
                      0
                        ? `${selectedParentCategoryIds.length} parent categories selected`
                        : "Select parent categories"}
                    </span>

                    <ChevronDown
                      className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        parentCategoryOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {parentCategoryOpen && (
                    <div className="absolute left-0 right-0 top-full z-[60] mt-1 overflow-hidden rounded-md border bg-background shadow-lg">
                      <div className="border-b p-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            autoFocus
                            value={
                              parentCategoryInput
                            }
                            onChange={(e) =>
                              setParentCategoryInput(
                                e.target.value
                              )
                            }
                            placeholder="Search parent category..."
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto p-1">
                        {loadingCategories ? (
                          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading categories...
                          </div>
                        ) : filteredParentCategories.length >
                          0 ? (
                          filteredParentCategories.map(
                            (category) => {
                              const id =
                                getId(category);

                              const selected =
                                selectedParentCategoryIds.includes(
                                  id
                                );

                              const hasSubcategories =
                                categories.some(
                                  (item) =>
                                    Number(
                                      item?.parentId
                                    ) ===
                                    Number(id)
                                );

                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() =>
                                    toggleParentCategory(
                                      category
                                    )
                                  }
                                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left ${
                                    selected
                                      ? "bg-muted"
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  <SelectionImage
                                    item={
                                      category
                                    }
                                    type="category"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                      {getName(
                                        category,
                                        `Category #${id}`
                                      )}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {hasSubcategories
                                        ? "Has subcategories"
                                        : "No subcategories"}
                                    </p>
                                  </div>

                                  {selected && (
                                    <Check className="h-4 w-4 shrink-0" />
                                  )}
                                </button>
                              );
                            }
                          )
                        ) : (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            No parent categories
                            found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedParentCategories.length >
                  0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedParentCategories.map(
                      (category) => {
                        const id =
                          getId(category);

                        return (
                          <SelectedChip
                            key={id}
                            onRemove={() =>
                              removeParentCategory(
                                id
                              )
                            }
                          >
                            {getName(category)}
                          </SelectedChip>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {selectedParentCategories.length >
                0 && (
                <div className="grid gap-2">
                  <div>
                    <Label>
                      Subcategories
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Select subcategories from
                      any selected parent.
                    </p>
                  </div>

                  <div className="rounded-md border">
                    <div className="max-h-80 overflow-y-auto p-1">
                      {selectedParentCategories.map(
                        (parent) => {
                          const parentId =
                            getId(parent);

                          const children =
                            categories.filter(
                              (category) =>
                                Number(
                                  category?.parentId
                                ) ===
                                Number(parentId)
                            );

                          const parentSelectedDirectly =
                            form.applicableCategoryIds.includes(
                              parentId
                            );

                          return (
                            <div
                              key={parentId}
                              className="mb-2 last:mb-0"
                            >
                              <div className="sticky top-0 z-10 border-b bg-background px-2 py-2">
                                <div className="flex items-center gap-2">
                                  <SelectionImage
                                    item={parent}
                                    type="category"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                      {getName(
                                        parent
                                      )}
                                    </p>
                                  </div>

                                  {children.length ===
                                    0 && (
                                    <span className="text-xs text-muted-foreground">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </div>

                              {children.length >
                              0 ? (
                                children.map(
                                  (category) => {
                                    const id =
                                      getId(
                                        category
                                      );

                                    const selected =
                                      form.applicableCategoryIds.includes(
                                        id
                                      );

                                    return (
                                      <button
                                        key={id}
                                        type="button"
                                        onClick={() =>
                                          toggleCategory(
                                            category
                                          )
                                        }
                                        className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left ${
                                          selected
                                            ? "bg-muted"
                                            : "hover:bg-muted"
                                        }`}
                                      >
                                        <SelectionImage
                                          item={
                                            category
                                          }
                                          type="category"
                                        />

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium">
                                            {getName(
                                              category,
                                              `Category #${id}`
                                            )}
                                          </p>

                                          <p className="truncate text-xs text-muted-foreground">
                                            Parent:{" "}
                                            {getName(
                                              parent
                                            )}
                                          </p>
                                        </div>

                                        {selected && (
                                          <Check className="h-4 w-4 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  }
                                )
                              ) : (
                                <div className="px-3 py-3 text-xs text-muted-foreground">
                                  This parent category
                                  has no
                                  subcategories. The
                                  parent itself is
                                  selected.
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.applicableCategoryIds
                .length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Selected Categories
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {form.applicableCategoryIds.map(
                      (id) => (
                        <SelectedChip
                          key={id}
                          onRemove={() =>
                            removeCategory(id)
                          }
                        >
                          {getCategoryName(id)}
                        </SelectedChip>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3">
              <Label>
                Applicable Brands
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Search and select brands this
                coupon applies to.
              </p>
            </div>

            <SelectorBox
              label="Brands"
              placeholder="Select brands"
              searchPlaceholder="Search brands..."
              searchValue={brandInput}
              onSearchChange={setBrandInput}
              open={brandOpen}
              onToggle={() => {
                const next = !brandOpen;

                setBrandOpen(next);
                setParentCategoryOpen(
                  false
                );
                setProductOpen(false);

                if (next) {
                  loadBrands();
                }
              }}
              loading={loadingBrands}
              selectedCount={
                form.applicableBrands.length
              }
              emptyText="No brands found."
            >
              {filteredBrands.map((brand) => {
                const value =
                  getBrandValue(brand);

                if (!value) {
                  return null;
                }

                const selected =
                  form.applicableBrands.some(
                    (item) =>
                      String(item).toLowerCase() ===
                      value.toLowerCase()
                  );

                return (
                  <button
                    key={
                      brand?.id ?? value
                    }
                    type="button"
                    onClick={() =>
                      toggleBrand(brand)
                    }
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left ${
                      selected
                        ? "bg-muted"
                        : "hover:bg-muted"
                    }`}
                  >
                    <SelectionImage
                      item={brand}
                      type="brand"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {getName(
                          brand,
                          value
                        )}
                      </p>

                      {brand?.slug && (
                        <p className="truncate text-xs text-muted-foreground">
                          {brand.slug}
                        </p>
                      )}
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </SelectorBox>

            {form.applicableBrands.length >
              0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.applicableBrands.map(
                  (brand) => (
                    <SelectedChip
                      key={brand}
                      onRemove={() =>
                        removeBrand(brand)
                      }
                    >
                      {brand}
                    </SelectedChip>
                  )
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Min Cart Value
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.minCartValue ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    "minCartValue",
                    e.target.value
                  )
                }
                placeholder="500"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Max Discount
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.maxDiscount ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    "maxDiscount",
                    e.target.value
                  )
                }
                placeholder="300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>
                Usage Limit
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  form.usageLimit ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    "usageLimit",
                    e.target.value
                  )
                }
                placeholder="100"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Expires At
              </Label>

              <Input
                type="date"
                value={
                  form.expiresAt ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    "expiresAt",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="divide-y rounded-xl border">
            <div className="flex items-center justify-between p-4">
              <div>
                <Label>
                  Active
                </Label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Enable this coupon.
                </p>
              </div>

              <Switch
                checked={Boolean(
                  form.isActive
                )}
                onCheckedChange={(value) =>
                  handleChange(
                    "isActive",
                    value
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <Label>
                  Show on Checkout
                </Label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Show this coupon to
                  customers during checkout.
                </p>
              </div>

              <Switch
                checked={Boolean(
                  form.showOnCheckout
                )}
                onCheckedChange={(value) =>
                  handleChange(
                    "showOnCheckout",
                    value
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
          >
            {coupon
              ? "Update Coupon"
              : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}