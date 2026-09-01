"use client";

import { useState, useEffect } from "react";
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
import { X, Plus } from "lucide-react";

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

export default function CouponForm({
  open,
  onOpenChange,
  coupon,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);

  const [productInput, setProductInput] =
    useState("");

  const [categoryInput, setCategoryInput] =
    useState("");

  const [brandInput, setBrandInput] =
    useState("");

  useEffect(() => {
    if (coupon) {
      setForm({
        ...emptyForm,
        ...coupon,
        applicableProductIds: Array.isArray(
          coupon.applicableProductIds
        )
          ? coupon.applicableProductIds
          : [],
        applicableCategoryIds: Array.isArray(
          coupon.applicableCategoryIds
        )
          ? coupon.applicableCategoryIds
          : [],
        applicableBrands: Array.isArray(
          coupon.applicableBrands
        )
          ? coupon.applicableBrands
          : [],
        expiresAt: coupon.expiresAt
          ? coupon.expiresAt.slice(0, 10)
          : "",
      });
    } else {
      setForm({
        ...emptyForm,
        applicableProductIds: [],
        applicableCategoryIds: [],
        applicableBrands: [],
      });
    }

    setProductInput("");
    setCategoryInput("");
    setBrandInput("");
  }, [coupon, open]);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function addProduct() {
    const value = productInput.trim();

    if (!value) return;

    const productId = Number(value);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return;
    }

    if (
      form.applicableProductIds.includes(
        productId
      )
    ) {
      setProductInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      applicableProductIds: [
        ...prev.applicableProductIds,
        productId,
      ],
    }));

    setProductInput("");
  }

  function removeProduct(id) {
    setForm((prev) => ({
      ...prev,
      applicableProductIds:
        prev.applicableProductIds.filter(
          (item) => item !== id
        ),
    }));
  }

  function addCategory() {
    const value = categoryInput.trim();

    if (!value) return;

    const categoryId = Number(value);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return;
    }

    if (
      form.applicableCategoryIds.includes(
        categoryId
      )
    ) {
      setCategoryInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      applicableCategoryIds: [
        ...prev.applicableCategoryIds,
        categoryId,
      ],
    }));

    setCategoryInput("");
  }

  function removeCategory(id) {
    setForm((prev) => ({
      ...prev,
      applicableCategoryIds:
        prev.applicableCategoryIds.filter(
          (item) => item !== id
        ),
    }));
  }

  function addBrand() {
    const value = brandInput.trim();

    if (!value) return;

    const exists =
      form.applicableBrands.some(
        (brand) =>
          brand.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setBrandInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      applicableBrands: [
        ...prev.applicableBrands,
        value,
      ],
    }));

    setBrandInput("");
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

  function handleSubmit() {
    const payload = {
      ...(coupon?.id
        ? { id: coupon.id }
        : {}),

      code: form.code.trim(),

      discountType:
        form.discountType,

      discountValue:
        form.discountValue === ""
          ? null
          : Number(form.discountValue),

      applicableProductIds:
        form.applicableProductIds.map(
          Number
        ),

      applicableCategoryIds:
        form.applicableCategoryIds.map(
          Number
        ),

      applicableBrands:
        form.applicableBrands,

      minCartValue:
        form.minCartValue === ""
          ? null
          : Number(form.minCartValue),

      maxDiscount:
        form.maxDiscount === ""
          ? null
          : Number(form.maxDiscount),

      usageLimit:
        form.usageLimit === ""
          ? null
          : Number(form.usageLimit),

      expiresAt:
        form.expiresAt === ""
          ? null
          : new Date(
              `${form.expiresAt}T23:59:59.000Z`
            ).toISOString(),

      isActive: form.isActive,

      showOnCheckout:
        form.showOnCheckout,
    };

    onSave(payload);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
                Add product IDs that this coupon
                applies to.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={productInput}
                onChange={(e) =>
                  setProductInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addProduct();
                  }
                }}
                placeholder="Product ID"
              />

              <Button
                type="button"
                variant="outline"
                onClick={addProduct}
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {form.applicableProductIds
              .length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.applicableProductIds.map(
                  (id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm"
                    >
                      <span>
                        Product #{id}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeProduct(id)
                        }
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3">
              <Label>
                Applicable Categories
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Add category IDs that this coupon
                applies to.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={categoryInput}
                onChange={(e) =>
                  setCategoryInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
                placeholder="Category ID"
              />

              <Button
                type="button"
                variant="outline"
                onClick={addCategory}
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {form.applicableCategoryIds
              .length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.applicableCategoryIds.map(
                  (id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm"
                    >
                      <span>
                        Category #{id}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeCategory(id)
                        }
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3">
              <Label>
                Applicable Brands
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Add brand names that this coupon
                applies to.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={brandInput}
                onChange={(e) =>
                  setBrandInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBrand();
                  }
                }}
                placeholder="Promolecules"
              />

              <Button
                type="button"
                variant="outline"
                onClick={addBrand}
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {form.applicableBrands
              .length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.applicableBrands.map(
                  (brand) => (
                    <div
                      key={brand}
                      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm"
                    >
                      <span>
                        {brand}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeBrand(brand)
                        }
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
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

          <div className="rounded-xl border divide-y">
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
                  Show this coupon to customers
                  during checkout.
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