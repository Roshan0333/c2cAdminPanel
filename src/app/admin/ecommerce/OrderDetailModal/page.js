"use client";

import {
    X,
    Package,
    User,
    MapPin,
    CreditCard,
    ShoppingBag,
    Ticket
} from "lucide-react";

export default function OrderDetailModal({
    open,
    onOpenChange,
    order,
}) {
    if (!open || !order) return null;


    const items =
        order.items ||
        order.products ||
        order.orderItems ||
        [];

    const subtotal =
        order.subtotal ??
        items.reduce((total, item) => {
            const price = Number(
                item.price ??
                item.product?.price ??
                0
            );

            const quantity =
                Number(item.quantity) || 1;

            return total + price * quantity;
        }, 0);

    const shipping = Number(
        order.shipping ??
        order.shippingFee ??
        0
    );

    const advanceAmount = Number(
        order.advanceAmount ??
        order.advanceAmount ??
        0
    );

    const discount = Number(
        order.discount ??
        order.discountAmount ??
        0
    );

    const shippingChange = Number(
        order.shippingCost ?? 0
    )

    const total =
        order.totalAmount ??
        order.total ??
        order.grandTotal ??
        subtotal + shipping - discount;

    const remainingTotal = subtotal-discount-advanceAmount+shippingChange

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >


                <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-5 py-4">

                    <div>
                        <h2 className="text-lg font-semibold">
                            Order Details
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Order #
                            {order.orderNumber ||
                                order.orderId ||
                                order.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            onOpenChange(false)
                        }
                        className="rounded-md p-2 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6 p-5">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Package className="h-4 w-4" />

                                Order ID
                            </div>

                            <p className="mt-2 break-all font-medium">
                                {order.orderNumber ||
                                    order.orderId ||
                                    order.id ||
                                    "N/A"}
                            </p>

                            {order.id && (
                                <p className="mt-1 break-all text-xs text-slate-400">
                                    ID: {order.id}
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="text-sm text-slate-500">
                                Status
                            </div>

                            <span className="mt-2 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium capitalize text-yellow-700">
                                {order.status ||
                                    "Pending"}
                            </span>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <CreditCard className="h-4 w-4" />

                                Payment
                            </div>

                            <p className="mt-2 font-medium capitalize">
                                {order.paymentMethod ||
                                    order.payment?.method ||
                                    "N/A"}
                            </p>

                            {order.paymentStatus && (
                                <p className="mt-1 text-xs capitalize text-slate-400">
                                    Status:{" "}
                                    {order.paymentStatus}
                                </p>
                            )}
                        </div>

                        {order.couponCode && <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Ticket className="h-4 w-4" />

                                Coupon Code
                            </div>

                            <p className="mt-2 font-medium capitalize">
                                {order.couponCode}
                            </p>

                        </div>}
                    </div>


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                        <div className="rounded-lg border p-5">

                            <div className="mb-4 flex items-center gap-2">
                                <User className="h-5 w-5" />

                                <h3 className="font-semibold">
                                    Customer Details
                                </h3>
                            </div>

                            <div className="space-y-3 text-sm">

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Name
                                    </p>

                                    <p className="font-medium">
                                        {order.user?.name ||
                                            order.customer?.name ||
                                            order.shippingFullName ||
                                            order.name ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Email
                                    </p>

                                    <p className="break-all">
                                        {order.user?.email ||
                                            order.customer?.email ||
                                            order.email ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Phone
                                    </p>

                                    <p>
                                        {order.shippingMobile ||
                                            order.customer?.phone ||
                                            order.user?.phone ||
                                            order.phone ||
                                            "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-lg border p-5">

                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />

                                <h3 className="font-semibold">
                                    Shipping Address
                                </h3>
                            </div>

                            <div className="space-y-1 text-sm leading-6 text-slate-600">

                                <p className="font-medium text-slate-900">
                                    {order.shippingFullName ||
                                        "N/A"}
                                </p>

                                <p>
                                    {order.shippingMobile ||
                                        "N/A"}
                                </p>

                                <p className="mt-2">
                                    {order.shippingAddressLine1 ||
                                        "N/A"}
                                </p>

                                {order.shippingAddressLine2 && (
                                    <p>
                                        {
                                            order.shippingAddressLine2
                                        }
                                    </p>
                                )}

                                {order.shippingLandmark && (
                                    <p className="text-slate-500">
                                        Landmark:{" "}
                                        {
                                            order.shippingLandmark
                                        }
                                    </p>
                                )}
                                <p>
                                    {[
                                        order.shippingCity,
                                        order.shippingState,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") ||
                                        "N/A"}
                                </p>

                                <p>
                                    {[
                                        order.shippingCountry,
                                        order.shippingPincode,
                                    ]
                                        .filter(Boolean)
                                        .join(" - ") ||
                                        "N/A"}
                                </p>

                                {order.shippingAddressType && (
                                    <span className="mt-2 inline-block rounded-full border px-2 py-1 text-xs capitalize">
                                        {
                                            order.shippingAddressType
                                        }
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>

                        <div className="mb-4 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />

                            <h3 className="font-semibold">
                                Products
                            </h3>
                        </div>

                        <div className="overflow-hidden rounded-lg border">

                            <div className="divide-y">

                                {items.length > 0 ? (
                                    items.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const product =
                                                item.product ||
                                                item;

                                            const quantity =
                                                Number(
                                                    item.quantity
                                                ) || 1;

                                            const price =
                                                Number(
                                                    item.price ??
                                                    product.price ??
                                                    0
                                                );

                                            const productImage =
                                                product.image ||
                                                product.images?.[0] ||
                                                item.image ||
                                                item.productImage;

                                            const productName =
                                                item.productName ||
                                                product.name ||
                                                product.title ||
                                                "Product";

                                            const category =
                                                product.category;

                                            return (
                                                <div
                                                    key={
                                                        item._id ||
                                                        item.id ||
                                                        index
                                                    }
                                                    className="flex gap-4 p-4"
                                                >

                                                   
                                                    {/* <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-slate-50">

                                                        {productImage ? (
                                                            <img
                                                                src={
                                                                    productImage
                                                                }
                                                                alt={
                                                                    productName
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                                No Image
                                                            </div>
                                                        )}

                                                    </div> */}

                                                
                                                    <div className="min-w-0 flex-1">

                                                        <h4 className="font-medium">
                                                            {
                                                                productName
                                                            }
                                                        </h4>

                                                      
                                                        {category && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Category:{" "}
                                                                {typeof category ===
                                                                    "object"
                                                                    ? category.name
                                                                    : category}
                                                            </p>
                                                        )}

                                    
                                                        {item.size && (
                                                            <p className="text-xs text-slate-500">
                                                                Size:{" "}
                                                                {
                                                                    item.size
                                                                }
                                                            </p>
                                                        )}

                                                        {item.flavour && (
                                                            <p className="text-xs text-slate-500">
                                                                Flavour:{" "}
                                                                {
                                                                    item.flavour
                                                                }
                                                            </p>
                                                        )}

                                                        {item.sku && (
                                                            <p className="text-xs text-slate-500">
                                                                SKU:{" "}
                                                                {
                                                                    item.sku
                                                                }
                                                            </p>
                                                        )}

                                                        
                                                        <div className="mt-2 flex flex-wrap gap-4 text-sm">

                                                            {/* <span>
                                                                Price: ₹
                                                                {price.toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </span> */}

                                                            <span>
                                                                Quantity:{" "}
                                                                {
                                                                    quantity
                                                                }
                                                            </span>

                                                        </div>
                                                    </div>
                                                    
                                                    {/* <div className="text-right">

                                                        <p className="font-semibold">
                                                            ₹
                                                            {(
                                                                price *
                                                                quantity
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Item Total
                                                        </p>
                                                    </div> */}

                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <div className="p-6 text-center text-sm text-slate-500">
                                        No products found.
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>


                    <div className="w-full flex lg:flex-row flex-col justify-between gap-2">
                        {(order.paymentStatus === "partial_paid") && <div className="flex-1 max-w-sm rounded-lg border p-5">

                            <h3 className="mb-4 font-semibold">
                                Partial Order Summary
                            </h3>

                            <div className="space-y-3 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹
                                        {Number(
                                            subtotal
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Advance Amount
                                    </span>

                                    <span>
                                        ₹
                                        {advanceAmount.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Delivery Charge
                                    </span>

                                    <span className="text-green-600">
                                         ₹
                                        {shippingChange.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Discount
                                    </span>

                                    <span className="text-green-600">
                                        - ₹
                                        {discount.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>

                                <div className="border-t pt-3">

                                    <div className="flex justify-between text-base font-semibold">

                                        <span>
                                            Remaining
                                        </span>

                                        <span>
                                            ₹
                                            {Number(
                                                remainingTotal
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </span>

                                    </div>

                                </div>
                            </div>
                        </div>}

                        <div className="flex-1 max-w-sm rounded-lg border p-5">

                            <h3 className="mb-4 font-semibold">
                                Order Summary
                            </h3>

                            <div className="space-y-3 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹
                                        {Number(
                                            subtotal
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Delivery Charge
                                    </span>

                                    <span>
                                        ₹
                                        {shippingChange.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-500">
                                        Discount
                                    </span>

                                    <span className="text-green-600">
                                        - ₹
                                        {discount.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </span>
                                </div>

                                <div className="border-t pt-3">

                                    <div className="flex justify-between text-base font-semibold">

                                        <span>
                                            Total
                                        </span>

                                        <span>
                                            ₹
                                            {Number(
                                                total
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </span>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>


                    {order.createdAt && (
                        <div className="text-right text-xs text-slate-400">
                            Ordered on{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}