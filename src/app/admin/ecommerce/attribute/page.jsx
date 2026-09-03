"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    SlidersHorizontal,
    Save,
    Search,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
    createAttribute,
    updateAttribute,
    getAttribute,
    deleteAttribute,
} from "@/apiService/attributeApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyAttribute = {
    name: "",
    slug: "",
    unit: "",
    displayOrder: 0,
    isActive: true,
};

export default function AttributesPage() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);

    const [attributeForm, setAttributeForm] =
        useState({ ...emptyAttribute });

    const [search, setSearch] = useState("");

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        attribute: null,
    });

    const getApiErrorMessage = (error, fallback) => {
        const responseData = error?.response?.data;

        if (typeof responseData === "string") {
            return responseData;
        }

        if (Array.isArray(responseData?.errors)) {
            return responseData.errors.join(", ");
        }

        if (Array.isArray(responseData?.data?.errors)) {
            return responseData.data.errors.join(", ");
        }

        return (
            responseData?.message ||
            responseData?.error ||
            responseData?.details ||
            responseData?.data?.message ||
            responseData?.data?.error ||
            responseData?.data?.details ||
            error?.message ||
            fallback
        );
    };

    const getApiResponseMessage = (response, fallback) => {
        const data = response?.data;

        if (Array.isArray(response?.errors) && response.errors.length) {
            return response.errors.join(", ");
        }

        if (
            Array.isArray(data?.errors) &&
            data.errors.length
        ) {
            return data.errors.join(", ");
        }

        if (
            Array.isArray(data?.data?.errors) &&
            data.data.errors.length
        ) {
            return data.data.errors.join(", ");
        }

        return (
            response?.message ||
            response?.error ||
            response?.details ||
            data?.message ||
            data?.error ||
            data?.details ||
            data?.data?.message ||
            data?.data?.error ||
            fallback
        );
    };

    const isApiFailure = (response) => {
        if (response === undefined || response === null) {
            return true;
        }

        if (
            response?.status &&
            (response.status < 200 || response.status >= 300)
        ) {
            return true;
        }

        if (response?.success === false) {
            return true;
        }

        if (response?.data?.success === false) {
            return true;
        }

        if (response?.data?.data?.success === false) {
            return true;
        }

        if (
            response?.error !== undefined &&
            response?.error !== null &&
            response?.error !== ""
        ) {
            return true;
        }

        if (
            response?.data?.error !== undefined &&
            response?.data?.error !== null &&
            response?.data?.error !== ""
        ) {
            return true;
        }

        if (
            response?.data?.data?.error !== undefined &&
            response?.data?.data?.error !== null &&
            response?.data?.data?.error !== ""
        ) {
            return true;
        }

        if (
            Array.isArray(response?.errors) &&
            response.errors.length > 0
        ) {
            return true;
        }

        if (
            Array.isArray(response?.data?.errors) &&
            response.data.errors.length > 0
        ) {
            return true;
        }

        if (
            Array.isArray(response?.data?.data?.errors) &&
            response.data.data.errors.length > 0
        ) {
            return true;
        }

        return false;
    };

    const normalizeAttribute = (attribute) => ({
        id: Number(attribute?.id),
        name: attribute?.name || "",
        slug: attribute?.slug || "",
        unit: attribute?.unit || "",
        displayOrder:
            attribute?.displayOrder === null ||
                attribute?.displayOrder === undefined
                ? 0
                : Number(attribute.displayOrder),
        isActive:
            attribute?.isActive === undefined ||
                attribute?.isActive === null
                ? true
                : attribute.isActive === true ||
                attribute.isActive === 1 ||
                attribute.isActive === "true",
        createdAt: attribute?.createdAt || null,
    });

    const extractAttributes = (response) => {
        const candidates = [
            response?.attributes,
            response?.data?.attributes,
            response?.data?.data?.attributes,
            response?.data,
            response,
        ];

        for (const value of candidates) {
            if (Array.isArray(value)) {
                return value;
            }
        }

        return [];
    };

    const fetchAttributes = async () => {
        try {
            setLoading(true);

            const response = await getAttribute();

            if (isApiFailure(response)) {
                throw new Error(
                    getApiResponseMessage(
                        response,
                        "Failed to load attributes"
                    )
                );
            }

            const rawAttributes = extractAttributes(response);

            const normalized = rawAttributes
                .map(normalizeAttribute)
                .filter((attribute) =>
                    Number.isInteger(attribute.id)
                );

            setAttributes(normalized);
        } catch (error) {
            console.error(
                "Fetch attributes failed:",
                error
            );

            toast.error(
                getApiErrorMessage(
                    error,
                    "Failed to load attributes"
                )
            );

            setAttributes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const resetForm = () => {
        setAttributeForm({
            ...emptyAttribute,
        });

        setEditingAttribute(null);
    };

    const closeForm = () => {
        if (saving) return;

        setFormOpen(false);
        resetForm();
    };

    const handleNameChange = (value) => {
        setAttributeForm((previous) => ({
            ...previous,
            name: value,
            slug: editingAttribute
                ? previous.slug
                : generateSlug(value),
        }));
    };

    const handleAddAttribute = () => {
        setEditingAttribute(null);

        setAttributeForm({
            name: "",
            slug: "",
            unit: "",
            displayOrder: 0,
            isActive: true,
        });

        setFormOpen(true);
    };

    const handleEditAttribute = (attribute) => {
        setEditingAttribute(attribute);

        setAttributeForm({
            name: attribute?.name || "",
            slug: attribute?.slug || "",
            unit: attribute?.unit || "",
            displayOrder:
                attribute?.displayOrder ?? 0,
            isActive:
                attribute?.isActive ?? true,
        });

        setFormOpen(true);
    };

    const handleSave = async () => {
        if (saving) return;

        try {
            const name = String(
                attributeForm.name || ""
            ).trim();

            const slug = String(
                attributeForm.slug || ""
            ).trim();

            const unit = String(
                attributeForm.unit || ""
            ).trim();

            if (!name) {
                toast.error("Attribute name is required");
                return;
            }

            if (!slug) {
                toast.error("Slug is required");
                return;
            }

            const displayOrder = Number(
                attributeForm.displayOrder
            );

            if (
                !Number.isInteger(displayOrder) ||
                displayOrder < 0
            ) {
                toast.error(
                    "Display order must be a valid non-negative number"
                );
                return;
            }

            const isActive =
                attributeForm.isActive === true;

            const payload = {
                name,
                slug,
                unit: unit || null,
                displayOrder,
                isActive,
            };

            setSaving(true);

            let response;

            if (editingAttribute?.id) {
                response = await updateAttribute(
                    Number(editingAttribute.id),
                    payload
                );
            } else {
                response = await createAttribute(
                    payload
                );
            }

            if (isApiFailure(response)) {
                throw new Error(
                    getApiResponseMessage(
                        response,
                        editingAttribute
                            ? "Failed to update attribute"
                            : "Failed to create attribute"
                    )
                );
            }

            const responseBody =
                response?.data || response;

            if (responseBody?.success) {
                toast.success(
                    editingAttribute
                        ? "Attribute updated successfully"
                        : "Attribute created successfully"
                );

                setFormOpen(false);
                resetForm();

                await fetchAttributes();
            }

            if (
                !responseBody?.success ||
                responseBody?.error ||
                responseBody?.errors
            ) {
                throw new Error(
                    getApiResponseMessage(
                        responseBody,
                        editingAttribute
                            ? "Failed to update attribute"
                            : "Failed to create attribute"
                    )
                );
            }
        } catch (error) {
            console.error(
                "Save attribute failed:",
                error
            );

            toast.error(
                getApiErrorMessage(
                    error,
                    editingAttribute
                        ? "Failed to update attribute"
                        : "Failed to create attribute"
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (attribute) => {
        if (saving) return;

        setDeleteDialog({
            open: true,
            attribute,
        });
    };

    const closeDeleteDialog = () => {
        if (saving) return;

        setDeleteDialog({
            open: false,
            attribute: null,
        });
    };

    const handleDelete = async () => {
        if (saving) return;

        const attribute =
            deleteDialog.attribute;

        if (!attribute?.id) {
            toast.error("Invalid attribute");
            return;
        }

        try {
            setSaving(true);

            const response =
                await deleteAttribute(
                    Number(attribute.id)
                );

            if (isApiFailure(response)) {
                throw new Error(
                    getApiResponseMessage(
                        response,
                        "Failed to delete attribute"
                    )
                );
            }

            const responseBody =
                response?.data || response;

            if (
                responseBody?.success === false ||
                responseBody?.error ||
                responseBody?.errors
            ) {
                throw new Error(
                    getApiResponseMessage(
                        responseBody,
                        "Failed to delete attribute"
                    )
                );
            }

            toast.success(
                "Attribute deleted successfully"
            );

            setDeleteDialog({
                open: false,
                attribute: null,
            });

            await fetchAttributes();
        } catch (error) {
            console.error(
                "Delete attribute failed:",
                error
            );

            toast.error(
                getApiErrorMessage(
                    error,
                    "Failed to delete attribute"
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredAttributes = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return attributes;
        }

        return attributes.filter(
            (attribute) => {
                const name =
                    String(attribute?.name || "")
                        .toLowerCase();

                const slug =
                    String(attribute?.slug || "")
                        .toLowerCase();

                const unit =
                    String(attribute?.unit || "")
                        .toLowerCase();

                return (
                    name.includes(value) ||
                    slug.includes(value) ||
                    unit.includes(value)
                );
            }
        );
    }, [attributes, search]);

    const activeCount = useMemo(() => {
        return attributes.filter(
            (attribute) =>
                attribute.isActive
        ).length;
    }, [attributes]);

    const inactiveCount = useMemo(() => {
        return attributes.filter(
            (attribute) =>
                !attribute.isActive
        ).length;
    }, [attributes]);

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-[1600px] space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal
                                size={24}
                                className="text-primary"
                            />

                            <h1 className="text-2xl font-bold md:text-3xl">
                                Attributes
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage product attributes, units,
                            ordering and status.
                        </p>
                    </div>

                    <Button
                        onClick={handleAddAttribute}
                        className="w-full gap-2 sm:w-auto"
                        disabled={saving}
                    >
                        <Plus size={17} />
                        Add Attribute
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Attributes
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {attributes.length}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <SlidersHorizontal size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Active
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {activeCount}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Inactive
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {inactiveCount}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                <XCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search attributes..."
                            className="pl-9"
                        />
                    </div>

                    {search && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setSearch("")}
                        >
                            Clear Search
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                        Attribute
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                        Slug
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                        Unit
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold">
                                        Order
                                    </th>

                                    <th className="px-4 py-3 text-center text-sm font-semibold">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                        Created
                                    </th>

                                    <th className="px-4 py-3 text-right text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="h-40 text-center"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <Loader2
                                                    size={20}
                                                    className="animate-spin"
                                                />
                                                Loading attributes...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAttributes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="h-40 text-center text-muted-foreground"
                                        >
                                            {search
                                                ? "No attributes match your search."
                                                : "No attributes found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttributes.map(
                                        (attribute) => (
                                            <tr
                                                key={attribute.id}
                                                className="border-b transition hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                                            <SlidersHorizontal
                                                                size={18}
                                                                className="text-muted-foreground"
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold">
                                                                {attribute.name}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                ID: {attribute.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <code className="rounded bg-muted px-2 py-1 text-xs">
                                                        {attribute.slug}
                                                    </code>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {attribute.unit ? (
                                                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                            {attribute.unit}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No unit
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span className="font-medium">
                                                        {attribute.displayOrder}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    {attribute.isActive ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                                            <CheckCircle2 size={13} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                                            <XCircle size={13} />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {formatDate(
                                                        attribute.createdAt
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEditAttribute(
                                                                    attribute
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    attribute
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {formOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
                        <div className="flex shrink-0 items-center justify-between border-b bg-background px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <SlidersHorizontal size={18} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {editingAttribute
                                                ? "Edit Attribute"
                                                : "Add Attribute"}
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {editingAttribute
                                                ? "Update attribute information."
                                                : "Create a new product attribute."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto p-5">
                            <div className="space-y-2">
                                <Label htmlFor="attribute-name">
                                    Attribute Name
                                </Label>

                                <Input
                                    id="attribute-name"
                                    value={attributeForm.name}
                                    onChange={(event) =>
                                        handleNameChange(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Weight"
                                    disabled={saving}
                                />

                                <p className="text-xs text-muted-foreground">
                                    Enter the name used for this
                                    product attribute.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attribute-slug">
                                    Slug
                                </Label>

                                <Input
                                    id="attribute-slug"
                                    value={attributeForm.slug}
                                    onChange={(event) =>
                                        setAttributeForm(
                                            (previous) => ({
                                                ...previous,
                                                slug: generateSlug(
                                                    event.target.value
                                                ),
                                            })
                                        )
                                    }
                                    placeholder="weight"
                                    disabled={saving}
                                />

                                <p className="text-xs text-muted-foreground">
                                    Slug must be unique.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="attribute-unit">
                                        Unit
                                    </Label>

                                    <Input
                                        id="attribute-unit"
                                        value={attributeForm.unit}
                                        onChange={(event) =>
                                            setAttributeForm(
                                                (previous) => ({
                                                    ...previous,
                                                    unit: event.target.value,
                                                })
                                            )
                                        }
                                        placeholder="e.g. kg, g, ml"
                                        disabled={saving}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Optional measurement unit.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="display-order">
                                        Display Order
                                    </Label>

                                    <Input
                                        id="display-order"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            attributeForm.displayOrder
                                        }
                                        onChange={(event) => {
                                            const value =
                                                event.target.value;

                                            setAttributeForm(
                                                (previous) => ({
                                                    ...previous,
                                                    displayOrder:
                                                        value === ""
                                                            ? 0
                                                            : Number(value),
                                                })
                                            );
                                        }}
                                        disabled={saving}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Lower numbers appear first.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-muted/30 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            Active Status
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Active attributes can be used
                                            with products.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            attributeForm.isActive
                                        }
                                        onClick={() =>
                                            setAttributeForm(
                                                (previous) => ({
                                                    ...previous,
                                                    isActive:
                                                        !previous.isActive,
                                                })
                                            )
                                        }
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${attributeForm.isActive
                                            ? "bg-primary"
                                            : "bg-muted"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${attributeForm.isActive
                                                ? "translate-x-5"
                                                : "translate-x-0.5"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Preview
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background">
                                        <SlidersHorizontal
                                            size={20}
                                            className="text-muted-foreground"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                            {attributeForm.name ||
                                                "Attribute Name"}
                                        </p>

                                        <p className="truncate text-xs text-muted-foreground">
                                            /
                                            {attributeForm.slug ||
                                                "attribute-slug"}
                                        </p>

                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            {attributeForm.unit && (
                                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    {attributeForm.unit}
                                                </span>
                                            )}

                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs ${attributeForm.isActive
                                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                                    }`}
                                            >
                                                {attributeForm.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 justify-end gap-2 border-t bg-background px-5 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="gap-2"
                            >
                                {saving ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={17} />
                                )}

                                {editingAttribute
                                    ? "Update Attribute"
                                    : "Create Attribute"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteDialog.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <Trash2 size={20} />
                        </div>

                        <h2 className="text-lg font-semibold">
                            Delete Attribute?
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <strong>
                                {deleteDialog.attribute?.name}
                            </strong>
                            ?
                        </p>

                        <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                            This attribute may be associated
                            with products. Make sure it is safe to
                            delete before continuing.
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDeleteDialog}
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2
                                        size={16}
                                        className="mr-2 animate-spin"
                                    />
                                ) : (
                                    <Trash2
                                        size={16}
                                        className="mr-2"
                                    />
                                )}

                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}