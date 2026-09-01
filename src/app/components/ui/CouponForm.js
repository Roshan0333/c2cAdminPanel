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

const emptyForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minCartValue: "",
  maxDiscount: "",
  usageLimit: "",
  isActive: true,
  showOnCheckout: true,
  expiresAt: "",
};

export default function CouponForm({ open, onOpenChange, coupon, onSave }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (coupon) {
      setForm({
        ...emptyForm,
        ...coupon,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [coupon, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    onSave({
      ...coupon,
      ...form,
      discountValue: form.discountValue === "" ? null : form.discountValue,
      minCartValue: form.minCartValue === "" ? null : form.minCartValue,
      maxDiscount: form.maxDiscount === "" ? null : form.maxDiscount,
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      expiresAt: form.expiresAt === "" ? null : new Date(form.expiresAt).toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Code</Label>
            <Input
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
              placeholder="WELCOME10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v) => handleChange("discountType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => handleChange("discountValue", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Min Cart Value</Label>
              <Input
                type="number"
                value={form.minCartValue??""}
                onChange={(e) => handleChange("minCartValue", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Max Discount</Label>
              <Input
                type="number"
                value={form.maxDiscount??""}
                onChange={(e) => handleChange("maxDiscount", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={form.usageLimit ??"" }
                onChange={(e) => handleChange("usageLimit", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Expires At</Label>
              <Input
                type="date"
                value={form.expiresAt ??""}
                onChange={(e) => handleChange("expiresAt", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => handleChange("isActive", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show on Checkout</Label>
            <Switch
              checked={form.showOnCheckout}
              onCheckedChange={(v) => handleChange("showOnCheckout", v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}