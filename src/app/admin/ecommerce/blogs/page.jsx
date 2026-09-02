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
    FileText,
    ImagePlus,
    X,
} from "lucide-react";

import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import {
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
} from "@/apiService/blogApi";

const emptyBlog = {
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: [],
    status: "draft",
    metaTitle: "",
    metaDescription: "",
    readTime: "",
    publishedData: "",
    featuredImage: null,
};

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const [formOpen, setFormOpen] =
        useState(false);

    const [editingBlog, setEditingBlog] =
        useState(null);

    const [blogForm, setBlogForm] =
        useState(emptyBlog);

    const [featuredImageFile, setFeaturedImageFile] =
        useState(null);

    const [featuredImagePreview, setFeaturedImagePreview] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [blogToDelete, setBlogToDelete] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    async function fetchBlogs() {
        try {
            setLoading(true);
            setError(null);

            const res = await getBlogs();

            if (!res?.success) {
                throw new Error(
                    res?.message ||
                    "Failed to load blogs"
                );
            }

            setBlogs(
                res?.blogs ||
                res?.data ||
                []
            );
        } catch (err) {
            console.error(
                "Failed to fetch blogs:",
                err
            );

            setError(
                err?.message ||
                "Failed to load blogs"
            );
        } finally {
            setLoading(false);
        }
    }

function removeTag(index) {
    setBlogForm((prev) => ({
        ...prev,
        tags: Array.isArray(prev.tags)
            ? prev.tags.filter(
                (_, i) => i !== index
            )
            : [],
    }));
}

function handleTagKeyDown(e) {
    const input = e.currentTarget;

    if (
        e.key === "," ||
        e.key === "Enter"
    ) {
        e.preventDefault();

        const value = input.value.trim();

        if (!value) {
            return;
        }

        const newTags = value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        setBlogForm((prev) => {
            const existingTags = Array.isArray(
                prev.tags
            )
                ? prev.tags
                : [];

            const mergedTags = [
                ...existingTags,
                ...newTags,
            ];

            const uniqueTags = [
                ...new Set(mergedTags),
            ];

            return {
                ...prev,
                tags: uniqueTags,
            };
        });

        input.value = "";
    }

    if (
        e.key === "Backspace" &&
        input.value === "" &&
        Array.isArray(blogForm.tags) &&
        blogForm.tags.length > 0
    ) {
        removeTag(
            blogForm.tags.length - 1
        );
    }
}

    function resetForm() {
        setBlogForm({
            ...emptyBlog,
            tags: [],
        });

        setFeaturedImageFile(null);
        setFeaturedImagePreview("");
    }

    function handleAddClick() {
        setEditingBlog(null);
        resetForm();
        setFormOpen(true);
    }

    function parseTags(tags) {
        if (Array.isArray(tags)) {
            return tags;
        }

        if (typeof tags === "string") {
            try {
                const parsed =
                    JSON.parse(tags);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                return tags
                    .split(",")
                    .map((tag) =>
                        tag.trim()
                    )
                    .filter(Boolean);
            }
        }

        return [];
    }

    function getImageUrl(blog) {
        return (
            blog?.featuredImageUrl ||
            blog?.featuredImage ||
            blog?.image ||
            blog?.featured_image ||
            ""
        );
    }

    function getPublishedDate(blog) {
        const value =
            blog?.publishedData ||
            blog?.publishedAt ||
            blog?.publishedDate ||
            "";

        if (!value) {
            return "";
        }

        try {
            return new Date(value)
                .toISOString()
                .slice(0, 10);
        } catch {
            return "";
        }
    }

    function handleEditClick(blog) {
        setEditingBlog(blog);

        setBlogForm({
            title: blog?.title || "",

            content:
                blog?.content || "",

            excerpt:
                blog?.excerpt || "",

            author:
                blog?.author || "",

            category:
                blog?.category || "",

            tags: parseTags(
                blog?.tags
            ),

            status:
                blog?.status || "draft",

            metaTitle:
                blog?.metaTitle || "",

            metaDescription:
                blog?.metaDescription || "",

            readTime:
                blog?.readTime !==
                    undefined &&
                    blog?.readTime !== null
                    ? String(
                        blog.readTime
                    )
                    : "",

            publishedData:
                getPublishedDate(blog),

            featuredImage: null,
        });

        setFeaturedImageFile(null);

        setFeaturedImagePreview(
            getImageUrl(blog)
        );

        setFormOpen(true);
    }

    function handleInputChange(
        field,
        value
    ) {
        setBlogForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleTagsChange(value) {
        const tags = value
            .split(",")
            .map((tag) =>
                tag.trim()
            )
            .filter(Boolean);

        setBlogForm((prev) => ({
            ...prev,
            tags,
        }));
    }

    function handleFeaturedImageChange(
        event
    ) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error(
                "Please select a valid image."
            );

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            toast.error(
                "Image must be less than 5MB."
            );

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

        setBlogForm((prev) => ({
            ...prev,
            featuredImage: file,
        }));
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

        setBlogForm((prev) => ({
            ...prev,
            featuredImage: null,
        }));
    }

    function closeForm() {
        if (saving) {
            return;
        }

        setFormOpen(false);
        setEditingBlog(null);
        resetForm();
    }

    async function handleSave() {
        if (!blogForm.title.trim()) {
            toast.error(
                "Blog title is required."
            );

            return;
        }

        if (!blogForm.content.trim()) {
            toast.error(
                "Blog content is required."
            );

            return;
        }

        setSaving(true);

        try {
            const payload = {
                title:
                    blogForm.title.trim(),

                content:
                    blogForm.content,

                excerpt:
                    blogForm.excerpt?.trim() ||
                    "",

                author:
                    blogForm.author?.trim() ||
                    "",

                category:
                    blogForm.category?.trim() ||
                    "",

                tags: Array.isArray(
                    blogForm.tags
                )
                    ? blogForm.tags
                    : [],

                status:
                    blogForm.status ||
                    "draft",

                metaTitle:
                    blogForm.metaTitle?.trim() ||
                    "",

                metaDescription:
                    blogForm.metaDescription?.trim() ||
                    "",

                readTime:
                    blogForm.readTime !== ""
                        ? Number(
                            blogForm.readTime
                        ) || 0
                        : "",

                publishedData:
                    blogForm.publishedData ||
                    "",

                featuredImage:
                    featuredImageFile ||
                    null,
            };

            if (editingBlog?.id) {
                const res =
                    await updateBlog(
                        editingBlog.id,
                        payload
                    );

                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                        "Failed to update blog"
                    );
                }

                const updated =
                    res?.blog ||
                    res?.data ||
                    {};

                setBlogs((prev) =>
                    prev.map((blog) =>
                        blog.id ===
                            editingBlog.id
                            ? {
                                ...blog,
                                ...updated,
                            }
                            : blog
                    )
                );

                toast.success(
                    "Blog updated successfully!"
                );
            } else {
                const res =
                    await createBlog(
                        payload
                    );

                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                        "Failed to create blog"
                    );
                }

                const created =
                    res?.blog ||
                    res?.data ||
                    {};

                setBlogs((prev) => [
                    created,
                    ...prev,
                ]);

                toast.success(
                    "Blog created successfully!"
                );
            }

            closeForm();
        } catch (err) {
            console.error(
                "Save blog failed:",
                err
            );

            toast.error(
                `Failed to ${editingBlog
                    ? "update"
                    : "create"
                } blog: ${err?.message ||
                "Unknown error"
                }`
            );
        } finally {
            setSaving(false);
        }
    }

    function handleDelete(blog) {
        setBlogToDelete(blog);
        setDeleteDialogOpen(true);
    }

    async function confirmDelete() {
        if (!blogToDelete?.id) {
            return;
        }

        setDeleting(true);

        try {
            const res =
                await deleteBlog(
                    blogToDelete.id
                );

            if (!res?.success) {
                throw new Error(
                    res?.message ||
                    "Deletion failed"
                );
            }

            setBlogs((prev) =>
                prev.filter(
                    (blog) =>
                        blog.id !==
                        blogToDelete.id
                )
            );

            toast.success(
                "Blog deleted successfully!"
            );

            setDeleteDialogOpen(false);
            setBlogToDelete(null);
        } catch (err) {
            console.error(
                "Delete blog failed:",
                err
            );

            toast.error(
                `Failed to delete blog: ${err?.message ||
                "Unknown error"
                }`
            );
        } finally {
            setDeleting(false);
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

                <div className="overflow-hidden rounded-lg border bg-white">
                    <div className="overflow-x-auto">
                        <TableSkeleton
                            rows={6}
                            columns={6}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                Failed to load blogs:{" "}
                {error}
            </div>
        );
    }

    return (
        <div className="w-full space-y-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">
                        Blogs
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {blogs.length} blog
                        {blogs.length === 1
                            ? ""
                            : "s"}{" "}
                        in your content library.
                    </p>
                </div>

                <Button
                    onClick={
                        handleAddClick
                    }
                    className="w-full sm:w-auto"
                >
                    <Plus
                        size={16}
                        className="mr-1"
                    />
                    Add Blog
                </Button>
            </div>

            {blogs.length === 0 ? (
                <div className="rounded-lg border bg-white p-10 text-center">

                    <FileText
                        size={40}
                        className="mx-auto mb-3 text-muted-foreground"
                    />

                    <p className="text-sm text-muted-foreground">
                        No blogs yet.
                    </p>

                    <Button
                        className="mt-4"
                        onClick={
                            handleAddClick
                        }
                    >
                        <Plus
                            size={16}
                            className="mr-1"
                        />
                        Create Your First Blog
                    </Button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-white">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead>
                                <tr className="border-b bg-muted/40">

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Title
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Author
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Category
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Read Time
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Published
                                    </th>

                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {blogs.map(
                                    (blog) => {

                                        const image =
                                            getImageUrl(
                                                blog
                                            );

                                        return (
                                            <tr
                                                key={
                                                    blog.id
                                                }
                                                className="border-b last:border-0 hover:bg-muted/20"
                                            >

                                                <td className="px-4 py-4">

                                                    <div className="flex items-center gap-3">

                                                        {image ? (
                                                            <img
                                                                src={
                                                                    image
                                                                }
                                                                alt={
                                                                    blog.title ||
                                                                    "Blog"
                                                                }
                                                                className="h-11 w-11 shrink-0 rounded-lg border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                                                <FileText
                                                                    size={
                                                                        18
                                                                    }
                                                                    className="text-muted-foreground"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">

                                                            <p className="max-w-[320px] truncate font-medium">
                                                                {blog.title ||
                                                                    "-"}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                ID:{" "}
                                                                {
                                                                    blog.id
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {blog.author ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {blog.category ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {blog.readTime
                                                        ? `${blog.readTime} min`
                                                        : "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {getPublishedDate(
                                                        blog
                                                    ) ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${blog.status ===
                                                            "published"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {blog.status ===
                                                            "published"
                                                            ? "Published"
                                                            : "Draft"}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <Button
                                                         className="cursor-pointer"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    blog
                                                                )
                                                            }
                                                        >
                                                            <Pencil
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </Button>

                                                        <Button
                                                         className="cursor-pointer"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    blog
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </Button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}

            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeForm();
                    }
                }}
            >

                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[700px]">

                    <DialogHeader>
                        <DialogTitle>
                            {editingBlog
                                ? "Update Blog"
                                : "Create Blog"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-2">

                        <div className="space-y-2">
                            <Label htmlFor="blog-title">
                                Title
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </Label>

                            <Input
                                id="blog-title"
                                value={
                                    blogForm.title
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "title",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="How Creatine Works"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blog-content">
                                Content
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </Label>

                            <Textarea
                                id="blog-content"
                                value={
                                    blogForm.content
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "content",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="<p>Full blog HTML content here...</p>"
                                rows={12}
                                className="font-mono text-sm"
                            />

                            <p className="text-xs text-muted-foreground">
                                HTML content is supported.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Featured Image
                            </Label>

                            <div className="rounded-xl border border-dashed p-4">

                                {featuredImagePreview ? (
                                    <div className="relative w-fit">

                                        <img
                                            src={
                                                featuredImagePreview
                                            }
                                            alt="Featured image"
                                            className="h-40 w-64 rounded-xl border object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                removeFeaturedImage
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
                                ) : (
                                    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-muted/30">

                                        <div className="text-center">

                                            <ImagePlus
                                                size={
                                                    32
                                                }
                                                className="mx-auto text-muted-foreground"
                                            />

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                No featured image
                                            </p>

                                        </div>

                                    </div>
                                )}

                                <div className="mt-4">

                                    <label
                                        htmlFor="featured-image-upload"
                                        className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                                    >
                                        <ImagePlus
                                            size={
                                                16
                                            }
                                        />

                                        {featuredImagePreview
                                            ? "Change Image"
                                            : "Upload Featured Image"}
                                    </label>

                                    <input
                                        id="featured-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleFeaturedImageChange
                                        }
                                        className="hidden"
                                    />

                                </div>

                                <p className="mt-2 text-xs text-muted-foreground">
                                    JPG, PNG, WEBP. Maximum 5MB.
                                </p>

                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blog-excerpt">
                                Excerpt
                            </Label>

                            <Textarea
                                id="blog-excerpt"
                                value={
                                    blogForm.excerpt
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        "excerpt",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="A quick guide to creating benefits"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div className="space-y-2">
                                <Label htmlFor="blog-author">
                                    Author
                                </Label>

                                <Input
                                    id="blog-author"
                                    value={
                                        blogForm.author
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "author",
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Dr. Sharma"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="blog-category">
                                    Category
                                </Label>

                                <Input
                                    id="blog-category"
                                    value={
                                        blogForm.category
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "category",
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Fitness"
                                />
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blog-tags">
                                Tags
                            </Label>

                            <div className="min-h-11 w-full rounded-md border border-input bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-ring">

                                <div className="flex flex-wrap items-center gap-2">

                                    {Array.isArray(blogForm.tags) &&
                                        blogForm.tags.map(
                                            (tag, index) => (
                                                <span
                                                    key={`${tag}-${index}`}
                                                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                                                >
                                                    {tag}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(index)
                                                        }
                                                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                                                        aria-label={`Remove ${tag}`}
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </span>
                                            )
                                        )}

                                    <input
                                        id="blog-tags"
                                        type="text"
                                        placeholder={
                                            blogForm.tags.length === 0
                                                ? "Type tag and press comma"
                                                : "Add another tag..."
                                        }
                                        onKeyDown={
                                            handleTagKeyDown
                                        }
                                        className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                                    />

                                </div>

                            </div>

                            <p className="text-xs text-muted-foreground">
                                Press comma or Enter after each tag.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div className="space-y-2">
                                <Label htmlFor="blog-status">
                                    Status
                                </Label>

                                <select
                                    id="blog-status"
                                    value={
                                        blogForm.status
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "status",
                                            e.target
                                                .value
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="draft">
                                        Draft
                                    </option>

                                    <option value="published">
                                        Published
                                    </option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="published-data">
                                    Published Date
                                </Label>

                                <Input
                                    id="published-data"
                                    type="date"
                                    value={
                                        blogForm.publishedData
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "publishedData",
                                            e.target
                                                .value
                                        )
                                    }
                                />
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="blog-read-time">
                                Read Time
                            </Label>

                            <div className="relative">

                                <Input
                                    id="blog-read-time"
                                    type="number"
                                    min="0"
                                    value={
                                        blogForm.readTime
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "readTime",
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="5"
                                    className="pr-20"
                                />

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    minutes
                                </span>

                            </div>
                        </div>

                        <div className="rounded-xl border p-4">

                            <div className="mb-4">
                                <h3 className="text-sm font-semibold">
                                    SEO
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    Search engine metadata.
                                </p>
                            </div>

                            <div className="space-y-4">

                                <div className="space-y-2">
                                    <Label htmlFor="meta-title">
                                        Meta Title
                                    </Label>

                                    <Input
                                        id="meta-title"
                                        value={
                                            blogForm.metaTitle
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "metaTitle",
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="How Creatine Works - Complete Guide"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta-description">
                                        Meta Description
                                    </Label>

                                    <Textarea
                                        id="meta-description"
                                        value={
                                            blogForm.metaDescription
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "metaDescription",
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Learn everything about creatine benefits"
                                        rows={4}
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                closeForm
                            }
                            disabled={saving}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={saving}
                            className="w-full sm:w-auto cursor-pointer"
                        >
                            {saving
                                ? "Saving..."
                                : editingBlog
                                    ? "Update Blog"
                                    : "Create Blog"}
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

            <DeleteConfirmDialog
                open={
                    deleteDialogOpen
                }
                onOpenChange={
                    setDeleteDialogOpen
                }
                title="Delete Blog"
                description={
                    blogToDelete
                        ? `Are you sure you want to delete "${blogToDelete.title}"? This action cannot be undone.`
                        : ""
                }
                onConfirm={
                    confirmDelete
                }
                loading={deleting}
            />

        </div>
    );
}