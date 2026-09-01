"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  status: true,
  isVendor: "No",
};

export default function CustomerForm({
  open,
  onOpenChange,
  customer,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        status: customer.status,
        isVendor: customer.isVendor || "No",
      });
    } else {
      setForm(emptyForm);
    }
  }, [customer, open]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      ...customer,
      ...form,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {customer
              ? "Edit Customer"
              : "Add Customer"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name
            </Label>

            <Input
              disabled
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              disabled
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone
            </Label>

            <Input
              disabled
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">
                Status
              </Label>

              <select
                id="status"
                name="status"
                value={
                  form.status
                    ? "Activated"
                    : "Deactivated"
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status:
                      e.target.value ===
                      "Activated",
                  }))
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="Activated">
                  Activated
                </option>

                <option value="Deactivated">
                  Deactivated
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isVendor">
                Is Vendor?
              </Label>

              <select
                id="isVendor"
                name="isVendor"
                value={form.isVendor}
                onChange={handleChange}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="No">
                  No
                </option>

                <option value="Yes">
                  Yes
                </option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
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
              {customer
                ? "Save Changes"
                : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}