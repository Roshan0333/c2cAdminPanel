"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  Target,
  ImagePlus,
  X,
  GripVertical,
} from "lucide-react";

import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/apiService/goalApi";

const emptyGoal = {
  name: "",
  slug: "",
  image: null,
  description: "",
  displayOrder: "0",
  isActive: true,
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({ ...emptyGoal });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      setError(null);

      const res = await getGoals();

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load goals");
      }

      setGoals(res?.goals || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError(err?.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function resetForm() {
    setGoalForm({
      ...emptyGoal,
      isActive: true,
    });

    setImageFile(null);
    setImagePreview("");
  }

  function handleAddClick() {
    setEditingGoal(null);
    resetForm();
    setFormOpen(true);
  }

  function handleInputChange(field, value) {
    setGoalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleNameChange(value) {
    setGoalForm((prev) => ({
      ...prev,
      name: value,
      slug: editingGoal ? prev.slug : slugify(value),
    }));
  }

  function getImageUrl(goal) {
    return goal?.imageUrl || goal?.image || "";
  }

  function handleEditClick(goal) {
    setEditingGoal(goal);

    setGoalForm({
      name: goal?.name || "",
      slug: goal?.slug || "",
      image: null,
      description: goal?.description || "",
      displayOrder:
        goal?.displayOrder !== undefined &&
        goal?.displayOrder !== null
          ? String(goal.displayOrder)
          : "0",
      isActive: goal?.isActive !== false,
    });

    setImageFile(null);
    setImagePreview(getImageUrl(goal));
    setFormOpen(true);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);

    setGoalForm((prev) => ({
      ...prev,
      image: file,
    }));
  }

  function removeImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");

    setGoalForm((prev) => ({
      ...prev,
      image: null,
    }));
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingGoal(null);
    resetForm();
  }

  async function handleSave() {
    if (!goalForm.name.trim()) {
      toast.error("Goal name is required.");
      return;
    }

    if (!goalForm.slug.trim()) {
      toast.error("Goal slug is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: goalForm.name.trim(),
        slug: goalForm.slug.trim().toLowerCase(),
        description: goalForm.description?.trim() || "",
        displayOrder: Number(goalForm.displayOrder) || 0,
        isActive: goalForm.isActive === true,
        image: imageFile || null,
      };

      let res;

      if (editingGoal?.id) {
        res = await updateGoal(editingGoal.id, payload);

        if (!res?.success) {
          throw new Error(
            res?.message || "Failed to update goal"
          );
        }

        const updated = res?.goal || res?.data || {};

        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === editingGoal.id
              ? { ...goal, ...updated }
              : goal
          )
        );

        toast.success("Goal updated successfully!");
      } else {
        res = await createGoal(payload);

        if (!res?.success) {
          throw new Error(
            res?.message || "Failed to create goal"
          );
        }

        const created = res?.goal || res?.data || {};

        setGoals((prev) => [created, ...prev]);

        toast.success("Goal created successfully!");
      }

      closeForm();
    } catch (err) {
      console.error("Save goal failed:", err);

      toast.error(
        `Failed to ${
          editingGoal ? "update" : "create"
        } goal: ${err?.message || "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(goal) {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!goalToDelete?.id) return;

    setDeleting(true);

    try {
      const res = await deleteGoal(goalToDelete.id);

      if (!res?.success) {
        throw new Error(
          res?.message || "Deletion failed"
        );
      }

      setGoals((prev) =>
        prev.filter(
          (goal) => goal.id !== goalToDelete.id
        )
      );

      toast.success("Goal deleted successfully!");

      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    } catch (err) {
      console.error("Delete goal failed:", err);

      toast.error(
        `Failed to delete goal: ${
          err?.message || "Unknown error"
        }`
      );
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>

          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <TableSkeleton rows={6} columns={7} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load goals: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Target size={20} className="text-primary" />
            </div>

            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">
                Goals
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your product goals.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleAddClick}
          className="w-full cursor-pointer sm:w-auto"
        >
          <Plus size={16} className="mr-1" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">
            Total Goals
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {goals.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">
            Active Goals
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {
              goals.filter(
                (goal) => goal.isActive !== false
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">
            Inactive Goals
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {
              goals.filter(
                (goal) => goal.isActive === false
              ).length
            }
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Target
              size={28}
              className="text-primary"
            />
          </div>

          <h3 className="mt-4 font-semibold">
            No goals yet
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create your first goal to get started.
          </p>

          <Button
            className="mt-5 cursor-pointer"
            onClick={handleAddClick}
          >
            <Plus size={16} className="mr-1" />
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="w-12 px-4 py-3 text-center text-sm font-medium">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Goal
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Display Order
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Created
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {goals.map((goal, index) => {
                  const image = getImageUrl(goal);

                  return (
                    <tr
                      key={goal.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <img
                              src={image}
                              alt={goal.name || "Goal"}
                              className="h-12 w-12 shrink-0 rounded-xl border object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted">
                              <Target
                                size={20}
                                className="text-muted-foreground"
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[280px] truncate font-medium">
                              {goal.name || "-"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              ID: {goal.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <code className="rounded-md bg-muted px-2 py-1 text-xs">
                          {goal.slug || "-"}
                        </code>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm">
                          <GripVertical
                            size={14}
                            className="text-muted-foreground"
                          />

                          {goal.displayOrder ?? 0}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            goal.isActive !== false
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {goal.isActive !== false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(goal.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() =>
                              handleEditClick(goal)
                            }
                          >
                            <Pencil size={16} />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() =>
                              handleDelete(goal)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Update Goal" : "Create Goal"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="goal-name">
                Goal Name
                <span className="ml-1 text-red-500">*</span>
              </Label>

              <Input
                id="goal-name"
                value={goalForm.name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                placeholder="Weight Loss"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-slug">
                Slug
                <span className="ml-1 text-red-500">*</span>
              </Label>

              <Input
                id="goal-slug"
                value={goalForm.slug}
                onChange={(e) =>
                  handleInputChange(
                    "slug",
                    slugify(e.target.value)
                  )
                }
                placeholder="weight-loss"
              />

              <p className="text-xs text-muted-foreground">
                URL-friendly unique identifier.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Goal Image</Label>

              <div className="rounded-xl border border-dashed p-4">
                {imagePreview ? (
                  <div className="relative w-fit">
                    <img
                      src={imagePreview}
                      alt="Goal preview"
                      className="h-40 w-40 rounded-xl border object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-xl bg-muted/30">
                    <div className="text-center">
                      <ImagePlus
                        size={32}
                        className="mx-auto text-muted-foreground"
                      />

                      <p className="mt-2 text-sm text-muted-foreground">
                        No goal image
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label
                    htmlFor="goal-image-upload"
                    className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                  >
                    <ImagePlus size={16} />

                    {imagePreview
                      ? "Change Image"
                      : "Upload Image"}
                  </label>

                  <input
                    id="goal-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or WEBP. Maximum 5MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description">
                Description
              </Label>

              <Textarea
                id="goal-description"
                value={goalForm.description}
                onChange={(e) =>
                  handleInputChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe what this goal is used for..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal-order">
                  Display Order
                </Label>

                <Input
                  id="goal-order"
                  type="number"
                  min="0"
                  value={goalForm.displayOrder}
                  onChange={(e) =>
                    handleInputChange(
                      "displayOrder",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />

                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>

                <button
                  type="button"
                  onClick={() =>
                    handleInputChange(
                      "isActive",
                      !goalForm.isActive
                    )
                  }
                  className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm transition ${
                    goalForm.isActive
                      ? "border-green-200 bg-green-50"
                      : "border-input bg-background"
                  }`}
                >
                  <span
                    className={
                      goalForm.isActive
                        ? "font-medium text-green-700"
                        : "text-muted-foreground"
                    }
                  >
                    {goalForm.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <span
                    className={`relative h-5 w-9 rounded-full transition ${
                      goalForm.isActive
                        ? "bg-green-500"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                        goalForm.isActive
                          ? "left-4"
                          : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={saving}
              className="w-full cursor-pointer sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full cursor-pointer sm:w-auto"
            >
              {saving
                ? "Saving..."
                : editingGoal
                  ? "Update Goal"
                  : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Goal"
        description={
          goalToDelete
            ? `Are you sure you want to delete "${goalToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}