"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    Braces,
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
    seo: {
        robots: "index, follow",
        canonical: "",
        author: "",
        structuredData: {
            enabled: true,
            schemaType: "BlogPosting",
            jsonLd: "",
        },
        openGraph: {
            title: "",
            description: "",
            url: "",
            image: "",
        },
        twitter: {
            title: "",
            description: "",
            card: "summary_large_image",
            image: "",
        },
    },
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

    const [currentStep, setCurrentStep] =
        useState(1);

    const totalSteps = 7;

    const steps = [
        {
            id: 1,
            title: "Basic Info",
            description: "Blog content",
        },
        {
            id: 2,
            title: "Image",
            description: "Featured image",
        },
        {
            id: 3,
            title: "Publishing",
            description: "Status & timing",
        },
        {
            id: 4,
            title: "SEO",
            description: "Search metadata",
        },
        {
            id: 5,
            title: "Social",
            description: "Facebook & X",
        },
        {
            id: 6,
            title: "JSON-LD",
            description: "Structured data",
        },
        {
            id: 7,
            title: "Review",
            description: "Check & save",
        },
    ];

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
        setCurrentStep(1);
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

            seo: normalizeSeo(
                blog?.seo ||
                blog?.SEO ||
                {}
            ),

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

        setCurrentStep(1);
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
        setCurrentStep(1);
        resetForm();
    }


    function normalizeSeo(seo) {
        const defaults = {
            robots: "index, follow",
            canonical: "",
            author: "",
            structuredData: {
                enabled: true,
                schemaType: "BlogPosting",
                jsonLd: "",
            },
            openGraph: {
                title: "",
                description: "",
                url: "",
                image: "",
            },
            twitter: {
                title: "",
                description: "",
                card: "summary_large_image",
                image: "",
            },
        };

        let value = seo;

        if (typeof value === "string") {
            try {
                value = JSON.parse(value);
            } catch {
                value = {};
            }
        }

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            value = {};
        }

        let structuredData = value.structuredData;

        if (typeof structuredData === "string") {
            try {
                structuredData = JSON.parse(structuredData);
            } catch {
                structuredData = {};
            }
        }

        if (!structuredData || typeof structuredData !== "object" || Array.isArray(structuredData)) {
            structuredData = {};
        }

        return {
            ...defaults,
            ...value,
            structuredData: {
                ...defaults.structuredData,
                ...structuredData,
            },
            openGraph: {
                ...defaults.openGraph,
                ...(value.openGraph && typeof value.openGraph === "object"
                    ? value.openGraph
                    : {}),
            },
            twitter: {
                ...defaults.twitter,
                ...(value.twitter && typeof value.twitter === "object"
                    ? value.twitter
                    : {}),
            },
        };
    }

    function parseJsonLd(value) {
        if (!value?.trim()) {
            return null;
        }

        try {
            const parsed = JSON.parse(value);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return null;
            }

            return parsed;
        } catch {
            return null;
        }
    }

    function createBlogJsonLd() {
        const image = getImageUrl(editingBlog) || featuredImagePreview || "";
        const canonical = blogForm.seo?.canonical?.trim() || "";
        const publishedDate = blogForm.publishedData || "";

        const schema = {
            "@context": "https://schema.org",
            "@type": blogForm.seo?.structuredData?.schemaType || "BlogPosting",
            headline: blogForm.title?.trim() || "",
            description:
                blogForm.excerpt?.trim() ||
                blogForm.metaDescription?.trim() ||
                "",
            author: blogForm.author?.trim()
                ? {
                    "@type": "Person",
                    name: blogForm.author.trim(),
                }
                : undefined,
            image: image || undefined,
            datePublished: publishedDate || undefined,
            dateModified: publishedDate || undefined,
            mainEntityOfPage: canonical
                ? {
                    "@type": "WebPage",
                    "@id": canonical,
                }
                : undefined,
            articleSection: blogForm.category?.trim() || undefined,
            keywords:
                Array.isArray(blogForm.tags) && blogForm.tags.length
                    ? blogForm.tags.join(", ")
                    : undefined,
            timeRequired: blogForm.readTime
                ? `PT${Number(blogForm.readTime) || 0}M`
                : undefined,
        };

        return JSON.stringify(schema, null, 2);
    }

    function handleSeoChange(field, value) {
        setBlogForm((prev) => ({
            ...prev,
            seo: {
                ...normalizeSeo(prev.seo),
                [field]: value,
            },
        }));
    }

    function handleSeoNestedChange(section, field, value) {
        setBlogForm((prev) => {
            const seo = normalizeSeo(prev.seo);

            return {
                ...prev,
                seo: {
                    ...seo,
                    [section]: {
                        ...(seo[section] || {}),
                        [field]: value,
                    },
                },
            };
        });
    }

    function handleStructuredDataChange(field, value) {
        setBlogForm((prev) => {
            const seo = normalizeSeo(prev.seo);

            return {
                ...prev,
                seo: {
                    ...seo,
                    structuredData: {
                        ...seo.structuredData,
                        [field]: value,
                    },
                },
            };
        });
    }

    function handleGenerateBlogJsonLd() {
        const jsonLd = createBlogJsonLd();

        handleStructuredDataChange("jsonLd", jsonLd);
        toast.success("Blog JSON-LD generated.");
    }

    function handleFormatJsonLd() {
        const current = blogForm.seo?.structuredData?.jsonLd || "";
        const parsed = parseJsonLd(current);

        if (!parsed) {
            toast.error("Enter valid JSON-LD before formatting.");
            return;
        }

        handleStructuredDataChange(
            "jsonLd",
            JSON.stringify(parsed, null, 2)
        );

        toast.success("JSON-LD formatted.");
    }

    function validateSeo(seo) {
        const value = normalizeSeo(seo);
        const errors = {};

        if (value.canonical?.trim()) {
            try {
                const url = new URL(value.canonical.trim());

                if (!["http:", "https:"].includes(url.protocol)) {
                    errors.canonical = "Canonical URL must use HTTP or HTTPS.";
                }
            } catch {
                errors.canonical = "Enter a valid canonical URL.";
            }
        }

        if (value.openGraph?.url?.trim()) {
            try {
                new URL(value.openGraph.url.trim());
            } catch {
                errors.openGraphUrl = "Enter a valid Open Graph URL.";
            }
        }

        if (value.openGraph?.image?.trim()) {
            try {
                new URL(value.openGraph.image.trim());
            } catch {
                errors.openGraphImage = "Enter a valid Open Graph image URL.";
            }
        }

        if (value.twitter?.image?.trim()) {
            try {
                new URL(value.twitter.image.trim());
            } catch {
                errors.twitterImage = "Enter a valid Twitter/X image URL.";
            }
        }

        if (value.structuredData?.enabled && value.structuredData?.jsonLd?.trim()) {
            const parsed = parseJsonLd(value.structuredData.jsonLd);

            if (!parsed) {
                errors.jsonLd = "JSON-LD must be valid JSON.";
            } else {
                if (!parsed["@context"]) {
                    errors.jsonLd = 'JSON-LD must include "@context".';
                } else if (!parsed["@type"]) {
                    errors.jsonLd = 'JSON-LD must include "@type".';
                }
            }
        }

        return errors;
    }

    function renderSeo() {
        const seo = normalizeSeo(blogForm.seo);

        return (
            <div className="space-y-5">
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-4 py-4 sm:px-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold sm:text-base">
                                    Search Engine Metadata
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Configure the title, description, canonical URL and crawler instructions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="meta-title">Meta Title</Label>
                                <span className="text-[11px] tabular-nums text-muted-foreground">
                                    {blogForm.metaTitle?.length || 0}/60
                                </span>
                            </div>
                            <Input
                                id="meta-title"
                                value={blogForm.metaTitle}
                                onChange={(e) =>
                                    handleInputChange("metaTitle", e.target.value)
                                }
                                maxLength={60}
                                placeholder="How Creatine Works - Complete Guide"
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="meta-description">Meta Description</Label>
                                <span className="text-[11px] tabular-nums text-muted-foreground">
                                    {blogForm.metaDescription?.length || 0}/160
                                </span>
                            </div>
                            <Textarea
                                id="meta-description"
                                value={blogForm.metaDescription}
                                onChange={(e) =>
                                    handleInputChange("metaDescription", e.target.value)
                                }
                                maxLength={160}
                                rows={4}
                                placeholder="Learn everything about creatine benefits..."
                                className="resize-y"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="seo-canonical">Canonical URL</Label>
                                <Input
                                    id="seo-canonical"
                                    value={seo.canonical}
                                    onChange={(e) =>
                                        handleSeoChange("canonical", e.target.value)
                                    }
                                    placeholder="https://example.com/blog/how-creatine-works"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seo-author">SEO Author</Label>
                                <Input
                                    id="seo-author"
                                    value={seo.author}
                                    onChange={(e) =>
                                        handleSeoChange("author", e.target.value)
                                    }
                                    placeholder="Author name"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-robots">Robots</Label>
                            <select
                                id="seo-robots"
                                value={seo.robots}
                                onChange={(e) =>
                                    handleSeoChange("robots", e.target.value)
                                }
                                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                            >
                                <option value="index, follow">index, follow</option>
                                <option value="noindex, nofollow">noindex, nofollow</option>
                                <option value="noindex, follow">noindex, follow</option>
                                <option value="index, nofollow">index, nofollow</option>
                            </select>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    function validateCurrentStep() {
        if (currentStep === 1) {
            if (!blogForm.title.trim()) {
                toast.error("Blog title is required.");
                return false;
            }

            if (!blogForm.content.trim()) {
                toast.error("Blog content is required.");
                return false;
            }
        }

        if (currentStep === 4) {
            const seoErrors = validateSeo(blogForm.seo);

            if (Object.keys(seoErrors).length > 0) {
                toast.error(
                    Object.values(seoErrors)[0] ||
                    "Please fix the SEO fields."
                );
                return false;
            }
        }

        if (currentStep === 6) {
            const seo = normalizeSeo(blogForm.seo);

            if (seo.structuredData.enabled) {
                if (!seo.structuredData.jsonLd?.trim()) {
                    toast.error("JSON-LD is required when structured data is enabled.");
                    return false;
                }

                const errors = validateSeo(seo);

                if (errors.jsonLd) {
                    toast.error(errors.jsonLd);
                    return false;
                }
            }
        }

        return true;
    }

    function goNext() {
        if (!validateCurrentStep()) {
            return;
        }

        setCurrentStep((prev) =>
            Math.min(prev + 1, totalSteps)
        );
    }

    function goBack() {
        setCurrentStep((prev) =>
            Math.max(prev - 1, 1)
        );
    }

    function goToStep(step) {
        if (step <= currentStep) {
            setCurrentStep(step);
            return;
        }

        if (!validateCurrentStep()) {
            return;
        }

        setCurrentStep(step);
    }

    function renderStepIndicator() {
        const progress = Math.round((currentStep / totalSteps) * 100);

        return (
            <div className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-sm mx-1 mt-1">
                <div className="hidden border-b px-4 py-3 lg:block">
                    <div className="overflow-x-auto pb-1">
                        <div className="flex min-w-[920px] items-center">
                            {steps.map((step, index) => {
                                const active = currentStep === step.id;
                                const completed = currentStep > step.id;

                                return (
                                    <div
                                        key={step.id}
                                        className="flex min-w-0 flex-1 items-center"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => goToStep(step.id)}
                                            className="group flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-muted/60"
                                        >
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${active
                                                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                        : completed
                                                            ? "border-primary/30 bg-primary/10 text-primary"
                                                            : "border-muted-foreground/20 bg-background text-muted-foreground"
                                                    }`}
                                            >
                                                {completed ? "✓" : step.id}
                                            </span>

                                            <span className="min-w-0">
                                                <span
                                                    className={`block truncate text-xs font-semibold ${active
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                        }`}
                                                >
                                                    {step.title}
                                                </span>
                                                <span className="block truncate text-[10px] text-muted-foreground">
                                                    {step.description}
                                                </span>
                                            </span>
                                        </button>

                                        {index < steps.length - 1 && (
                                            <div
                                                className={`mx-2 h-px min-w-5 flex-1 ${currentStep > step.id
                                                        ? "bg-primary"
                                                        : "bg-border"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 sm:px-5 lg:hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Step {currentStep} of {totalSteps}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold">
                                {steps[currentStep - 1]?.title}
                            </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            {progress}%
                        </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => goToStep(step.id)}
                                aria-label={`Go to ${step.title}`}
                                className={`h-1.5 min-w-7 rounded-full transition-all ${currentStep >= step.id
                                        ? "bg-primary"
                                        : "bg-muted-foreground/20"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    function renderBasicStep() {
        return (
            <div className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold">
                        Basic Information
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Add the main content and classification for your blog.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blog-title">
                        Title
                        <span className="ml-1 text-red-500">*</span>
                    </Label>

                    <Input
                        id="blog-title"
                        value={blogForm.title}
                        onChange={(e) =>
                            handleInputChange("title", e.target.value)
                        }
                        placeholder="How Creatine Works"
                        className="h-11 text-sm sm:text-base"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blog-content">
                        Content
                        <span className="ml-1 text-red-500">*</span>
                    </Label>

                    <Textarea
                        id="blog-content"
                        value={blogForm.content}
                        onChange={(e) =>
                            handleInputChange("content", e.target.value)
                        }
                        placeholder="<p>Full blog HTML content here...</p>"
                        rows={14}
                        className="min-h-[280px] resize-y font-mono text-xs leading-6 sm:min-h-[360px] sm:text-sm"
                    />

                    <p className="text-xs text-muted-foreground">
                        HTML content is supported.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blog-excerpt">Excerpt</Label>

                    <Textarea
                        id="blog-excerpt"
                        value={blogForm.excerpt}
                        onChange={(e) =>
                            handleInputChange("excerpt", e.target.value)
                        }
                        placeholder="A quick guide to creating benefits"
                        rows={4}
                        className="resize-y"
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="blog-author">Author</Label>

                        <Input
                            id="blog-author"
                            value={blogForm.author}
                            onChange={(e) =>
                                handleInputChange("author", e.target.value)
                            }
                            placeholder="Dr. Sharma"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="blog-category">Category</Label>

                        <Input
                            id="blog-category"
                            value={blogForm.category}
                            onChange={(e) =>
                                handleInputChange("category", e.target.value)
                            }
                            placeholder="Fitness"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blog-tags">Tags</Label>

                    <div className="min-h-11 w-full rounded-md border border-input bg-background px-2 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {Array.isArray(blogForm.tags) &&
                                blogForm.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                                    >
                                        {tag}

                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                                            aria-label={`Remove ${tag}`}
                                        >
                                            <X size={13} />
                                        </button>
                                    </span>
                                ))}

                            <input
                                id="blog-tags"
                                type="text"
                                placeholder={
                                    blogForm.tags.length === 0
                                        ? "Type tag and press comma"
                                        : "Add another tag..."
                                }
                                onKeyDown={handleTagKeyDown}
                                className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Press comma or Enter after each tag.
                    </p>
                </div>
            </div>
        );
    }

    function renderImageStep() {
        return (
            <div className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold">
                        Featured Image
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Upload the main image used for the blog.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed p-5">
                    {featuredImagePreview ? (
                        <div className="relative mx-auto w-fit">
                            <img
                                src={featuredImagePreview}
                                alt="Featured image"
                                className="aspect-video max-h-[360px] w-full max-w-[680px] rounded-xl border object-cover"
                            />

                            <button
                                type="button"
                                onClick={removeFeaturedImage}
                                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex min-h-52 items-center justify-center rounded-xl bg-muted/30 sm:h-64">
                            <div className="text-center">
                                <ImagePlus
                                    size={40}
                                    className="mx-auto text-muted-foreground"
                                />
                                <p className="mt-3 text-sm font-medium">
                                    No featured image
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Upload a JPG, PNG, or WEBP image.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-5 flex justify-center">
                        <label
                            htmlFor="featured-image-upload-step"
                            className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                            <ImagePlus size={16} />
                            {featuredImagePreview
                                ? "Change Image"
                                : "Upload Featured Image"}
                        </label>

                        <input
                            id="featured-image-upload-step"
                            type="file"
                            accept="image/*"
                            onChange={handleFeaturedImageChange}
                            className="hidden"
                        />
                    </div>

                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Maximum file size: 5MB.
                    </p>
                </div>
            </div>
        );
    }

    function renderPublishingStep() {
        return (
            <div className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold">
                        Publishing
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Control publication status, date, and reading time.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="blog-status">Status</Label>

                        <select
                            id="blog-status"
                            value={blogForm.status}
                            onChange={(e) =>
                                handleInputChange("status", e.target.value)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="published-data">
                            Published Date
                        </Label>

                        <Input
                            id="published-data"
                            type="date"
                            value={blogForm.publishedData}
                            onChange={(e) =>
                                handleInputChange(
                                    "publishedData",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <div className="max-w-md space-y-2">
                    <Label htmlFor="blog-read-time">Read Time</Label>

                    <div className="relative">
                        <Input
                            id="blog-read-time"
                            type="number"
                            min="0"
                            value={blogForm.readTime}
                            onChange={(e) =>
                                handleInputChange(
                                    "readTime",
                                    e.target.value
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
            </div>
        );
    }

    function renderReviewStep() {
        const seo = normalizeSeo(blogForm.seo);
        const image = featuredImagePreview || getImageUrl(editingBlog);

        return (
            <div className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold">
                        Review Blog
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Review your blog information before saving.
                    </p>
                </div>

                {image && (
                    <img
                        src={image}
                        alt={blogForm.title || "Blog"}
                        className="h-44 w-full rounded-xl border object-cover"
                    />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="mt-1 font-medium">
                            {blogForm.title || "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">Author</p>
                        <p className="mt-1 font-medium">
                            {blogForm.author || "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="mt-1 font-medium">
                            {blogForm.category || "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="mt-1 font-medium capitalize">
                            {blogForm.status || "draft"}
                        </p>
                    </div>

                    <div className="rounded-xl border p-4 sm:col-span-2">
                        <p className="text-xs text-muted-foreground">Tags</p>
                        <p className="mt-1 font-medium">
                            {blogForm.tags?.length
                                ? blogForm.tags.join(", ")
                                : "-"}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground">SEO</p>
                    <div className="mt-2 space-y-1 text-sm">
                        <p>
                            <span className="font-medium">Meta title:</span>{" "}
                            {blogForm.metaTitle || "-"}
                        </p>
                        <p>
                            <span className="font-medium">Robots:</span>{" "}
                            {seo.robots}
                        </p>
                        <p>
                            <span className="font-medium">Canonical:</span>{" "}
                            {seo.canonical || "-"}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground">
                        Structured Data
                    </p>
                    <div className="mt-2 text-sm">
                        <p>
                            <span className="font-medium">Enabled:</span>{" "}
                            {seo.structuredData.enabled ? "Yes" : "No"}
                        </p>
                        <p>
                            <span className="font-medium">Schema:</span>{" "}
                            {seo.structuredData.schemaType}
                        </p>
                        <p>
                            <span className="font-medium">JSON-LD:</span>{" "}
                            {seo.structuredData.jsonLd?.trim()
                                ? "Configured"
                                : "Not configured"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    async function handleSave() {
        if (!validateCurrentStep()) {
            return;
        }

        if (!blogForm.title.trim()) {
            toast.error("Blog title is required.");
            setCurrentStep(1);
            return;
        }

        if (!blogForm.content.trim()) {
            toast.error("Blog content is required.");
            setCurrentStep(1);
            return;
        }

        const seoErrors = validateSeo(blogForm.seo);

        if (Object.keys(seoErrors).length > 0) {
            toast.error(
                Object.values(seoErrors)[0] ||
                "Please fix the SEO fields."
            );

            if (
                seoErrors.canonical ||
                seoErrors.openGraphUrl ||
                seoErrors.openGraphImage ||
                seoErrors.twitterImage
            ) {
                setCurrentStep(4);
            } else if (seoErrors.jsonLd) {
                setCurrentStep(6);
            }

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

                seo: normalizeSeo(blogForm.seo),

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

                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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
            <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                Failed to load blogs:{" "}
                {error}
            </div>
        );
    }

    return (
        <div className="w-full space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText size={18} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                            Blogs
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {blogs.length} blog{blogs.length === 1 ? "" : "s"} in your content library.
                    </p>
                </div>

                <Button onClick={handleAddClick} className="w-full sm:w-auto">
                    <Plus size={16} className="mr-1" />
                    Add Blog
                </Button>
            </div>

            {blogs.length === 0 ? (
                <div className="rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">

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
                <>
                    {/* Desktop / tablet table */}
                    <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
                        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
                            <div>
                                <h2 className="text-sm font-semibold">All Blogs</h2>
                                <p className="text-xs text-muted-foreground">
                                    Manage your published and draft content.
                                </p>
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                {blogs.length} total
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px]">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Author
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Read Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Published
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {blogs.map((blog) => {
                                        const image = getImageUrl(blog);
                                        const published = getPublishedDate(blog);

                                        return (
                                            <tr
                                                key={blog.id}
                                                className="group transition-colors hover:bg-muted/20"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={blog.title || "Blog"}
                                                                className="h-12 w-16 shrink-0 rounded-lg border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                                                <FileText
                                                                    size={18}
                                                                    className="text-muted-foreground"
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="max-w-[320px] truncate text-sm font-semibold">
                                                                {blog.title || "-"}
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                                ID: {blog.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {blog.author || "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm">
                                                    {blog.category || "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {blog.readTime ? `${blog.readTime} min` : "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {published || "-"}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${blog.status === "published"
                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${blog.status === "published"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-amber-500"
                                                                }`}
                                                        />
                                                        {blog.status === "published" ? "Published" : "Draft"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            className="cursor-pointer"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleEditClick(blog)}
                                                            aria-label={`Edit ${blog.title || "blog"}`}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>

                                                        <Button
                                                            className="cursor-pointer text-destructive hover:text-destructive"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDelete(blog)}
                                                            aria-label={`Delete ${blog.title || "blog"}`}
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

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">All Blogs</h2>
                                <p className="text-xs text-muted-foreground">
                                    Manage your content.
                                </p>
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                {blogs.length}
                            </span>
                        </div>

                        {blogs.map((blog) => {
                            const image = getImageUrl(blog);
                            const published = getPublishedDate(blog);

                            return (
                                <article
                                    key={blog.id}
                                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                                >
                                    <div className="flex gap-3 p-3">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={blog.title || "Blog"}
                                                className="h-20 w-24 shrink-0 rounded-xl border object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border bg-muted">
                                                <FileText
                                                    size={20}
                                                    className="text-muted-foreground"
                                                />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="line-clamp-2 text-sm font-semibold leading-5">
                                                    {blog.title || "-"}
                                                </h3>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${blog.status === "published"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                                        }`}
                                                >
                                                    {blog.status === "published" ? "Published" : "Draft"}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                ID: {blog.id}
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                                <span>{blog.author || "No author"}</span>
                                                <span>{blog.category || "No category"}</span>
                                                <span>{blog.readTime ? `${blog.readTime} min` : "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-2.5">
                                        <span className="text-[11px] text-muted-foreground">
                                            Published: {published || "Not published"}
                                        </span>

                                        <div className="flex gap-2">
                                            <Button
                                                className="h-8 w-8 cursor-pointer"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEditClick(blog)}
                                                aria-label={`Edit ${blog.title || "blog"}`}
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            <Button
                                                className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(blog)}
                                                aria-label={`Delete ${blog.title || "blog"}`}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}

            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeForm();
                    }
                }}>

                <DialogContent className="flex max-h-[94dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)] sm:max-w-[900px]">

                    <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
                        <DialogTitle className="text-base sm:text-lg">
                            {editingBlog ? "Update Blog" : "Create Blog"}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                            {editingBlog
                                ? "Update your blog content, SEO and publishing settings."
                                : "Create a blog with content, SEO and social metadata."}
                        </p>
                    </DialogHeader>

                    {renderStepIndicator()}

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                        {currentStep === 1 && renderBasicStep()}

                        {currentStep === 2 && renderImageStep()}

                        {currentStep === 3 && renderPublishingStep()}

                        {currentStep === 4 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-base font-semibold">
                                        SEO
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Optimize this blog for search engines.
                                    </p>
                                </div>

                                {renderSeo()}
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Social Media
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Configure Facebook/Open Graph and Twitter/X sharing data.
                                    </p>
                                </div>

                                <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
                                    <div className="mb-5">
                                        <h4 className="text-sm font-semibold">
                                            Facebook / Open Graph
                                        </h4>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>OG Title</Label>
                                            <Input
                                                value={normalizeSeo(blogForm.seo).openGraph.title}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "openGraph",
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>OG URL</Label>
                                            <Input
                                                value={normalizeSeo(blogForm.seo).openGraph.url}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "openGraph",
                                                        "url",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/blog/..."
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>OG Description</Label>
                                            <Textarea
                                                value={normalizeSeo(blogForm.seo).openGraph.description}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "openGraph",
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>OG Image URL</Label>
                                            <Input
                                                value={normalizeSeo(blogForm.seo).openGraph.image}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "openGraph",
                                                        "image",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/images/blog.jpg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
                                    <div className="mb-5">
                                        <h4 className="text-sm font-semibold">
                                            Twitter / X
                                        </h4>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Twitter/X Title</Label>
                                            <Input
                                                value={normalizeSeo(blogForm.seo).twitter.title}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "twitter",
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Card Type</Label>
                                            <select
                                                value={normalizeSeo(blogForm.seo).twitter.card}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "twitter",
                                                        "card",
                                                        e.target.value
                                                    )
                                                }
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="summary">
                                                    summary
                                                </option>
                                                <option value="summary_large_image">
                                                    summary_large_image
                                                </option>
                                                <option value="player">
                                                    player
                                                </option>
                                                <option value="app">
                                                    app
                                                </option>
                                            </select>
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Twitter/X Description</Label>
                                            <Textarea
                                                value={normalizeSeo(blogForm.seo).twitter.description}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "twitter",
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Twitter/X Image URL</Label>
                                            <Input
                                                value={normalizeSeo(blogForm.seo).twitter.image}
                                                onChange={(e) =>
                                                    handleSeoNestedChange(
                                                        "twitter",
                                                        "image",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/images/blog.jpg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-base font-semibold">
                                        JSON-LD Structured Data
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Add structured data to help search engines understand your blog.
                                    </p>
                                </div>

                                {(() => {
                                    const seo = normalizeSeo(blogForm.seo);
                                    const jsonLdError = validateSeo(seo).jsonLd;

                                    return (
                                        <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Braces size={18} />
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold">
                                                            Structured Data
                                                        </h4>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Use BlogPosting or another supported schema.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Label
                                                        htmlFor="structured-data-enabled-step"
                                                        className="text-sm"
                                                    >
                                                        Enabled
                                                    </Label>

                                                    <Switch
                                                        id="structured-data-enabled-step"
                                                        checked={!!seo.structuredData.enabled}
                                                        onCheckedChange={(checked) =>
                                                            handleStructuredDataChange(
                                                                "enabled",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-4">
                                                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                                    <div className="space-y-2">
                                                        <Label>Schema Type</Label>

                                                        <select
                                                            value={seo.structuredData.schemaType}
                                                            onChange={(e) =>
                                                                handleStructuredDataChange(
                                                                    "schemaType",
                                                                    e.target.value
                                                                )
                                                            }
                                                            disabled={!seo.structuredData.enabled}
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="BlogPosting">
                                                                BlogPosting
                                                            </option>
                                                            <option value="Article">
                                                                Article
                                                            </option>
                                                            <option value="NewsArticle">
                                                                NewsArticle
                                                            </option>
                                                            <option value="WebPage">
                                                                WebPage
                                                            </option>
                                                            <option value="FAQPage">
                                                                FAQPage
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleGenerateBlogJsonLd}
                                                            disabled={!seo.structuredData.enabled}
                                                        >
                                                            Generate JSON-LD
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleFormatJsonLd}
                                                            disabled={!seo.structuredData.enabled}
                                                        >
                                                            Format JSON
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <Label>JSON-LD Schema</Label>
                                                        <span className="text-xs text-muted-foreground">
                                                            {seo.structuredData.jsonLd?.length || 0} characters
                                                        </span>
                                                    </div>

                                                    <Textarea
                                                        value={seo.structuredData.jsonLd}
                                                        onChange={(e) =>
                                                            handleStructuredDataChange(
                                                                "jsonLd",
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={!seo.structuredData.enabled}
                                                        rows={17}
                                                        spellCheck={false}
                                                        className={`font-mono text-xs ${jsonLdError
                                                                ? "border-red-400 focus-visible:ring-red-400"
                                                                : ""
                                                            }`}
                                                        placeholder={`{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your blog title"
}`}
                                                    />

                                                    {jsonLdError ? (
                                                        <p className="text-xs text-red-500">
                                                            {jsonLdError}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">
                                                            JSON-LD must contain @context and @type.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {currentStep === 7 && renderReviewStep()}
                    </div>

                    <DialogFooter className="shrink-0 flex-col gap-2 border-t bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 mb-1">
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                                disabled={saving}
                                className="w-full sm:w-[140px]"
                            >
                                Cancel
                            </Button>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={goBack}
                                        disabled={saving}
                                        className="w-full sm:w-[140px]"
                                    >
                                        Back
                                    </Button>
                                )}

                                {currentStep < totalSteps ? (
                                    <Button
                                        type="button"
                                        onClick={goNext}
                                        disabled={saving}
                                        className="w-full sm:w-[140px]"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full sm:w-[140px]"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingBlog
                                                ? "Update Blog"
                                                : "Create Blog"}
                                    </Button>
                                )}
                            </div>
                        </div>
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