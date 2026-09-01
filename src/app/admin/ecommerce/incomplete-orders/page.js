"use client";

import { useState, useEffect } from "react";
import OrderTable from "@/app/components/ui/OrderTable";
import OrderEditForm from "@/app/components/ui/OrderEditForm";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OrderDetailModal from "../OrderDetailModal/page";

const PAGE_SIZE = 20;

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    function Token() {
        return sessionStorage.getItem("pm_admin_token");
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);

                const baseUrl =
                    process.env.NEXT_PUBLIC_BASE_URL;

                let url;

                if (debouncedSearch) {
                    const params = new URLSearchParams({
                        q: debouncedSearch,
                        page: currentPage.toString(),
                        limit: PAGE_SIZE.toString(),
                    });

                    url = `${baseUrl}/api/orders/dashboard/search?${params.toString()}`;
                } else {
                    const params = new URLSearchParams({
                        page: currentPage.toString(),
                        limit: PAGE_SIZE.toString(),
                    });

                    url = `${baseUrl}/api/orders/dashboard/all?${params.toString()}`;
                }

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Token()}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(
                        `Failed to fetch orders: ${res.status}`
                    );
                }

                const data = await res.json();

                setOrders(data.orders || []);

                const total =
                    data.totalOrders ||
                    data.total ||
                    data.count ||
                    0;

                setTotalOrders(total);

                setTotalPages(
                    data.totalPages ||
                    Math.ceil(total / PAGE_SIZE) ||
                    1
                );
            } catch (err) {
                console.error(
                    "Failed to fetch orders:",
                    err
                );

                setOrders([]);
                setTotalPages(1);
                setTotalOrders(0);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [currentPage, debouncedSearch]);

    function handleEditClick(order) {
        setEditingOrder(order);
        setFormOpen(true);
    }

    function handleOrderClick(order) {
        setViewingOrder(order);
        setDetailOpen(true);
    }

    function handleDelete(id) {
        setOrders((prev) =>
            prev.filter((order) => order.id !== id)
        );
    }

    function handleSave(updatedOrder) {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === updatedOrder.id
                    ? updatedOrder
                    : order
            )
        );
    }

    const filteredOrders = orders.filter((order) => {
        return (
            order.status?.toLowerCase() === "pending"
        );
    });

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
    }

    function getPaginationPages() {
        const pages = [];

        for (let page = 1; page <= totalPages; page++) {
            if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
            ) {
                pages.push(page);
            }
        }

        const result = [];

        pages.forEach((page, index) => {
            if (
                index > 0 &&
                page - pages[index - 1] > 1
            ) {
                result.push(`ellipsis-${page}`);
            }

            result.push(page);
        });

        return result;
    }

    const paginationPages = getPaginationPages();

    const startItem =
        totalOrders === 0
            ? 0
            : (currentPage - 1) * PAGE_SIZE + 1;

    const endItem =
        totalOrders === 0
            ? 0
            : Math.min(
                  currentPage * PAGE_SIZE,
                  totalOrders
              );

    return (
        <div className="w-full space-y-4 sm:space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">
                        In-Complete Orders
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage orders and order status.
                    </p>
                </div>

                <div className="text-xs text-slate-400 sm:text-sm">
                    Showing {startItem}–{endItem} of{" "}
                    {totalOrders} orders
                </div>
            </div>

            <div className="relative w-full">
                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search orders..."
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-10 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setDebouncedSearch("");
                            setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                    >
                        ✕
                    </button>
                )}
            </div>

            {loading ? (
                <TableSkeleton
                    rows={8}
                    columns={7}
                />
            ) : (
                <div className="w-full overflow-hidden rounded-lg border bg-white">
                    <div className="w-full overflow-x-auto">
                        <OrderTable
                            orders={filteredOrders}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onOrderClick={handleOrderClick}
                        />
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                            No incomplete orders found.
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                            <button
                                onClick={() =>
                                    goToPage(
                                        currentPage - 1
                                    )
                                }
                                disabled={
                                    currentPage === 1 ||
                                    loading
                                }
                                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </button>

                            <div className="flex items-center gap-1">
                                {paginationPages.map(
                                    (page) =>
                                        typeof page ===
                                        "string" ? (
                                            <span
                                                key={page}
                                                className="px-2 text-sm text-slate-400"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    goToPage(
                                                        page
                                                    )
                                                }
                                                disabled={loading}
                                                className={`h-8 w-8 rounded-md text-sm ${
                                                    page ===
                                                    currentPage
                                                        ? "bg-slate-900 text-white"
                                                        : "hover:bg-slate-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    goToPage(
                                        currentPage + 1
                                    )
                                }
                                disabled={
                                    currentPage ===
                                        totalPages ||
                                    loading
                                }
                                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <OrderEditForm
                open={formOpen}
                onOpenChange={setFormOpen}
                order={editingOrder}
                onSave={handleSave}
            />

            <OrderDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                order={viewingOrder}
            />
        </div>
    );
}