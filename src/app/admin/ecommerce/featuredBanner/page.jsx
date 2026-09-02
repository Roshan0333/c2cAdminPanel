"use client";

import FeaturedBannerModal from "@/components/dashboard/FeaturedBannerModel";
import { useEffect, useState } from "react";
import {
  getFeaturedBanner,
  deleteFeaturedBanner,
} from "@/apiService/featuredBanerApi";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeImage, setActiveImage] = useState({});

  const fetchBanners = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getFeaturedBanner();

      const data =
        response?.data?.banners ||
        response?.data?.data ||
        response?.data ||
        response?.banners ||
        response ||
        [];

      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't load banners."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaved = async () => {
    setIsModalOpen(false);
    await fetchBanners();
  };

  const handleDelete = async (banner) => {
    if (
      !window.confirm(
        `Delete "${banner.title}"? This can't be undone.`
      )
    ) {
      return;
    }

    setDeletingId(banner.id);

    try {
      await deleteFeaturedBanner(banner.id);

      setBanners((prev) =>
        prev.filter((item) => item.id !== banner.id)
      );
    } catch (err) {
      console.error("Failed to delete banner:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't delete the banner. Try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const setImageType = (bannerId, type) => {
    setActiveImage((prev) => ({
      ...prev,
      [bannerId]: type,
    }));
  };

  const getBannerImage = (banner, type) => {
    if (type === "mobile" && banner.mobileImage) {
      return banner.mobileImage;
    }

    return banner.image;
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Featured Banners
          </h1>

          <p className="text-sm text-gray-500">
            Manage your storefront banners and promotional content.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

          Add Banner
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

            <p className="mt-3 text-sm text-gray-500">
              Loading banners...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBanners}
              className="mt-3 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6 text-gray-400"
              >
                <rect
                  width="18"
                  height="14"
                  x="3"
                  y="5"
                  rx="2"
                />

                <path d="m3 16 5-5 4 4 3-3 6 6" />

                <circle
                  cx="8.5"
                  cy="9.5"
                  r="1.5"
                />
              </svg>
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              No banners yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add a banner to get started.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {banners
              .slice()
              .sort(
                (a, b) =>
                  (a.displayOrder ?? 0) -
                  (b.displayOrder ?? 0)
              )
              .map((banner) => {
                const imageType =
                  activeImage[banner.id] || "desktop";

                const bannerImage = getBannerImage(
                  banner,
                  imageType
                );

                return (
                  <div
                    key={banner.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative bg-gray-100">
                      {bannerImage ? (
                        <img
                          src={bannerImage}
                          alt={banner.title || "Banner"}
                          className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-60"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-gray-100 sm:h-60">
                          <span className="text-sm text-gray-400">
                            No Image
                          </span>
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                          banner.isActive
                            ? "bg-green-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {banner.isActive
                          ? "● Active"
                          : "Inactive"}
                      </span>

                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                        #{banner.displayOrder ?? 0}
                      </span>

                      {banner.mobileImage && (
                        <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-full bg-white/90 text-xs font-medium shadow-sm">
                          <button
                            type="button"
                            onClick={() =>
                              setImageType(
                                banner.id,
                                "desktop"
                              )
                            }
                            className={`cursor-pointer px-3 py-1.5 transition ${
                              imageType === "desktop"
                                ? "bg-indigo-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            Desktop
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setImageType(
                                banner.id,
                                "mobile"
                              )
                            }
                            className={`cursor-pointer px-3 py-1.5 transition ${
                              imageType === "mobile"
                                ? "bg-indigo-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            Mobile
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 px-4 py-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
                            {banner.title}
                          </p>

                          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                            {banner.position || "home"}
                          </span>
                        </div>

                        {banner.subtitle && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-gray-50 p-2.5">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Link Type
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium capitalize text-gray-700">
                            {banner.linkType || "product"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-2.5">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Position
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium capitalize text-gray-700">
                            {banner.position || "home"}
                          </p>
                        </div>
                      </div>

                      {banner.link && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Link
                          </p>

                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            {banner.link}
                          </p>
                        </div>
                      )}

                      {banner.buttonText && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Button Text
                          </p>

                          <p className="mt-0.5 text-sm font-medium text-gray-700">
                            {banner.buttonText}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Last Updated
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatDate(banner.updatedAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(banner)
                            }
                            className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(banner)
                            }
                            disabled={
                              deletingId === banner.id
                            }
                            className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === banner.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <FeaturedBannerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        banner={editingBanner}
      />
    </div>
  );
}