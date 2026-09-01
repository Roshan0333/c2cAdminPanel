"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import {
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers3,
  Tag,
} from "lucide-react";

function getVariantStats(product) {
  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const validVariants = variants.filter(
    (variant) =>
      variant &&
      variant.price !== null &&
      variant.price !== undefined &&
      variant.price !== ""
  );

  const prices = validVariants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  const discountedPrices = validVariants
    .map((variant) => {
      if (
        variant.discountedPrice === null ||
        variant.discountedPrice === undefined ||
        variant.discountedPrice === ""
      ) {
        return null;
      }

      const price = Number(variant.discountedPrice);

      return Number.isFinite(price) ? price : null;
    })
    .filter((price) => price !== null);

  const totalStock = variants.reduce(
    (total, variant) =>
      total + (Number(variant?.stockQuantity) || 0),
    0
  );

  return {
    minPrice:
      prices.length > 0
        ? Math.min(...prices)
        : null,

    maxPrice:
      prices.length > 0
        ? Math.max(...prices)
        : null,

    minDiscountedPrice:
      discountedPrices.length > 0
        ? Math.min(...discountedPrices)
        : null,

    maxDiscountedPrice:
      discountedPrices.length > 0
        ? Math.max(...discountedPrices)
        : null,

    totalStock,
    variantCount: variants.length,
  };
}

function formatPrice(price) {
  if (
    price === null ||
    price === undefined ||
    !Number.isFinite(Number(price))
  ) {
    return "—";
  }

  return Number(price).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getPriceDisplay(stats) {
  if (stats.variantCount === 0) {
    return {
      type: "empty",
    };
  }

  if (stats.minPrice === null) {
    return {
      type: "empty",
    };
  }

  const hasDiscount =
    stats.minDiscountedPrice !== null &&
    stats.minDiscountedPrice < stats.minPrice;

  if (stats.minPrice === stats.maxPrice) {
    if (hasDiscount) {
      const discount =
        stats.minPrice > 0
          ? Math.round(
              ((stats.minPrice -
                stats.minDiscountedPrice) /
                stats.minPrice) *
                100
            )
          : 0;

      return {
        type: "discount",
        price: stats.minDiscountedPrice,
        originalPrice: stats.minPrice,
        discount,
      };
    }

    return {
      type: "single",
      price: stats.minPrice,
    };
  }

  const minPrice = hasDiscount
    ? stats.minDiscountedPrice
    : stats.minPrice;

  const maxPrice = hasDiscount
    ? stats.maxDiscountedPrice
    : stats.maxPrice;

  const discount =
    hasDiscount && stats.minPrice > 0
      ? Math.round(
          ((stats.minPrice -
            stats.minDiscountedPrice) /
            stats.minPrice) *
            100
        )
      : null;

  return {
    type: "range",
    minPrice,
    maxPrice,
    originalMinPrice: hasDiscount
      ? stats.minPrice
      : null,
    originalMaxPrice: hasDiscount
      ? stats.maxPrice
      : null,
    discount,
  };
}

function getStockInfo(stats) {
  if (stats.variantCount === 0) {
    return {
      label: "No variants",
      icon: Package,
      color: "text-slate-500",
      bg: "bg-slate-100",
    };
  }

  if (stats.totalStock <= 0) {
    return {
      label: "Out of stock",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }

  if (stats.totalStock <= 10) {
    return {
      label: `${stats.totalStock} left`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    };
  }

  return {
    label: `${stats.totalStock} in stock`,
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  };
}

function getProductImage(product) {
  if (
    typeof product?.featuredimg === "string" &&
    product.featuredimg.trim()
  ) {
    return product.featuredimg.trim();
  }

  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];

    if (
      typeof firstImage === "string" &&
      firstImage.trim()
    ) {
      return firstImage.trim();
    }

    if (
      firstImage &&
      typeof firstImage === "object"
    ) {
      return (
        firstImage.url ||
        firstImage.src ||
        firstImage.path ||
        null
      );
    }
  }

  return null;
}

function formatCreatedDate(date) {
  if (!date) {
    return {
      date: "—",
      weekday: "",
    };
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      date: "—",
      weekday: "",
    };
  }

  return {
    date: parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),

    weekday: parsedDate.toLocaleDateString("en-IN", {
      weekday: "short",
    }),
  };
}

export default function ProductTable({
  products = [],
  onEdit,
  onDelete,
}) {
  const safeProducts = Array.isArray(products)
    ? products
    : [];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1050px]">
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
              <TableHead className="h-14 px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Product
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pricing
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Inventory
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                SKU
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Created
              </TableHead>

              <TableHead className="h-14 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </TableHead>

              <TableHead className="h-14 pr-5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safeProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-64">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Package
                        size={25}
                        strokeWidth={1.7}
                        className="text-slate-400"
                      />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Add your first product to start
                      building your catalog.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {safeProducts.map((product) => {
              const stats = getVariantStats(product);
              const stock = getStockInfo(stats);
              const StockIcon = stock.icon;

              const price = getPriceDisplay(stats);

              const image = getProductImage(product);

              const created = formatCreatedDate(
                product.createdAt
              );

              const productStatus = String(
                product.status ?? ""
              ).toLowerCase();

              return (
                <TableRow
                  key={product.id}
                  className="
                    group
                    border-b border-slate-100
                    bg-white
                    transition-all
                    duration-200
                    hover:bg-slate-50/70
                  "
                >
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="
                          relative
                          flex h-12 w-12 shrink-0
                          items-center justify-center
                          overflow-hidden
                          rounded-xl
                          border border-slate-200
                          bg-gradient-to-br
                          from-slate-50
                          to-slate-100
                        "
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={
                              product.name ||
                              "Product"
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-300
                              group-hover:scale-105
                            "
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";

                              const fallback =
                                e.currentTarget
                                  .nextElementSibling;

                              if (fallback) {
                                fallback.classList.remove(
                                  "hidden"
                                );

                                fallback.classList.add(
                                  "flex"
                                );
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={
                            image
                              ? "hidden h-full w-full items-center justify-center"
                              : "flex h-full w-full items-center justify-center"
                          }
                        >
                          <Package
                            size={20}
                            strokeWidth={1.7}
                            className="text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p
                          title={
                            product.name || ""
                          }
                          className="
                            max-w-[360px]
                            truncate
                            text-[13px]
                            font-semibold
                            leading-5
                            text-slate-800
                            transition-colors
                            group-hover:text-slate-950
                          "
                        >
                          {product.name ||
                            "Unnamed Product"}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            ID #{product.id ?? "—"}
                          </span>

                          {product.brand?.name && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />

                              <span
                                title={
                                  product.brand.name
                                }
                                className="
                                  max-w-[120px]
                                  truncate
                                  text-[10px]
                                  font-medium
                                  capitalize
                                  text-slate-400
                                "
                              >
                                {product.brand.name}
                              </span>
                            </>
                          )}
                        </div>

                        {product.category?.name && (
                          <div className="mt-1">
                            <span className="text-[10px] text-slate-400">
                              {product.category.name}
                            </span>
                          </div>
                        )}

                        {stats.variantCount > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <Layers3 size={11} />

                            <span>
                              {stats.variantCount}{" "}
                              {stats.variantCount === 1
                                ? "variant"
                                : "variants"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {price.type === "empty" && (
                      <span className="text-sm text-slate-300">
                        —
                      </span>
                    )}

                    {price.type === "single" && (
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-900">
                          ₹{formatPrice(price.price)}
                        </span>
                      </div>
                    )}

                    {price.type === "discount" && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-slate-900">
                            ₹{formatPrice(price.price)}
                          </span>

                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                            -{price.discount}%
                          </span>
                        </div>

                        <span className="mt-0.5 text-[10px] text-slate-400 line-through">
                          ₹
                          {formatPrice(
                            price.originalPrice
                          )}
                        </span>
                      </div>
                    )}

                    {price.type === "range" && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-slate-900">
                            ₹
                            {formatPrice(
                              price.minPrice
                            )}
                            {" – ₹"}
                            {formatPrice(
                              price.maxPrice
                            )}
                          </span>

                          {price.discount !== null && (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                              -{price.discount}%
                            </span>
                          )}
                        </div>

                        {price.originalMinPrice !== null && (
                          <span className="mt-0.5 text-[10px] text-slate-400 line-through">
                            ₹
                            {formatPrice(
                              price.originalMinPrice
                            )}
                            {" – ₹"}
                            {formatPrice(
                              price.originalMaxPrice
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`
                          flex h-8 w-8
                          shrink-0
                          items-center justify-center
                          rounded-lg
                          ${stock.bg}
                        `}
                      >
                        <StockIcon
                          size={15}
                          strokeWidth={2}
                          className={stock.color}
                        />
                      </span>

                      <div className="flex min-w-0 flex-col">
                        <span
                          className={`text-xs font-semibold ${stock.color}`}
                        >
                          {stock.label}
                        </span>

                        {stats.variantCount > 0 && (
                          <span className="mt-0.5 text-[10px] text-slate-400">
                            {stats.variantCount}{" "}
                            {stats.variantCount === 1
                              ? "variant"
                              : "variants"}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {product.sku ? (
                      <div className="flex items-center gap-1.5">
                        <Tag
                          size={12}
                          className="shrink-0 text-slate-400"
                        />

                        <span
                          title={product.sku}
                          className="
                            max-w-[150px]
                            truncate
                            font-mono
                            text-[11px]
                            font-medium
                            text-slate-600
                          "
                        >
                          {product.sku}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-300">
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap text-xs font-medium text-slate-600">
                        {created.date}
                      </span>

                      {created.weekday && (
                        <span className="mt-0.5 text-[10px] text-slate-400">
                          {created.weekday}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {productStatus === "active" ? (
                      <Badge
                        variant="outline"
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border-emerald-200
                          bg-emerald-50
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          text-emerald-600
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border-slate-200
                          bg-slate-50
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          capitalize
                          text-slate-500
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {product.status || "Unknown"}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="pr-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onEdit?.(product)
                        }
                        aria-label={`Edit ${
                          product.name || "product"
                        }`}
                        className="
                          h-9 w-9
                          rounded-lg
                          border
                          border-transparent
                          text-slate-400
                          transition-all
                          hover:border-blue-100
                          hover:bg-blue-50
                          hover:text-blue-600
                        "
                      >
                        <Pencil
                          size={15}
                          strokeWidth={2}
                        />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onDelete?.(product)
                        }
                        aria-label={`Delete ${
                          product.name || "product"
                        }`}
                        className="
                          h-9 w-9
                          rounded-lg
                          border
                          border-transparent
                          text-slate-400
                          transition-all
                          hover:border-red-100
                          hover:bg-red-50
                          hover:text-red-600
                        "
                      >
                        <Trash2
                          size={15}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}