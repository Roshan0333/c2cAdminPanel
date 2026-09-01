"use client";

import { useEffect, useState } from "react";
import OrderTable from "@/app/components/ui/OrderTable";
import OrderEditForm from "@/app/components/ui/OrderEditForm";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import OrderDetailModal from "../OrderDetailModal/page";
import {
  RefreshCw,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [syncStatus, setSyncStatus] = useState(false);
  const [awbcode, setawbCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);

  function Token() {
    return sessionStorage.getItem("pm_admin_token");
  }

  function handleOrderClick(order) {
    setViewingOrder(order);
    setDetailOpen(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        let url;

        if (debouncedSearch) {
          const params = new URLSearchParams({
            q: debouncedSearch,
            page: page.toString(),
            limit: limit.toString(),
          });

          url = `${baseUrl}/api/orders/dashboard/search?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
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
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }

        const data = await res.json();

        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalOrders || 0);

        if (data.page) {
          setPage(data.page);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, limit, debouncedSearch]);

  function handleEditClick(order) {
    setEditingOrder(order);
    setFormOpen(true);
  }

  function handleDelete(id) {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }

  function handleSave(updatedOrder) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  function getPageNumbers() {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }

  function handleClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setPaymentFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  const filteredOrders = orders.filter((order) => {
    const paymentMatches =
      paymentFilter === "all" ||
      order.paymentStatus?.toLowerCase() === paymentFilter;

    const statusMatches =
      statusFilter === "all" ||
      order.displayStage?.toLowerCase() === statusFilter;

    return paymentMatches && statusMatches;
  });

  const handleSyncStatus = () => {
    setSyncStatus(true);
  };

  const closeSyncModal = () => {
    if (syncLoading) return;

    setSyncStatus(false);
    setOrderId("");
    setawbCode("");
  };

  const handleSync = async (e) => {
    e.preventDefault();

    if (!orderId.trim() || !awbcode.trim()) {
      return;
    }

    try {
      setSyncLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const response = await axios.post(
        `${baseUrl}/api/velocity/sync-awb/${orderId}`,
        {
          awbCode: awbcode,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token()}`,
          },
        }
      );

      if (response.data.success) {
        setSyncStatus(false);
        setOrderId("");
        setawbCode("");
        window.location.reload();
        return
      }

      toast.error("Failed to Sync");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSyncAll = async (e) => {
    try {
      e.preventDefault();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/api/velocity/sync-all`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token()}`
          }
        }
      )

      if (response.data.success) {
        window.location.reload();
        return
      }

      toast.error("Failed to Sync");
    }
    catch (err) {
      console.error("Error:", err.message);
    }
  }

  const handleSyncPayment = async (e) => {
    try {
      e.preventDefault();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/api/payment/sync-all-pending`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
          }
        }
      )

      if (response.data.success) {
        window.location.reload();
        return
      }

      toast.error("Failed to Sync");
    }
    catch (err) {
      console.error("Error:", err.message)
    }
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage orders, payments and order status.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSyncPayment}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <RefreshCw size={17} />
            Sync Payment
          </button>

          <button
            type="button"
            onClick={handleSyncStatus}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <RefreshCw size={17} />
            Sync AWB
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <RefreshCw size={17} />
            Sync All
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label
                htmlFor="payment-filter"
                className="shrink-0 text-sm font-medium text-slate-700"
              >
                Payment:
              </label>

              <select
                id="payment-filter"
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-[140px] sm:flex-none"
              >
                <option value="all">All</option>
                <option value="partial_paid">Partial Paid</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label
                htmlFor="status-filter"
                className="shrink-0 text-sm font-medium text-slate-700"
              >
                Status:
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-[155px] sm:flex-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready_to_ship">Ready To Ship</option>
                <option value="on_the_way">On the Way</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {(paymentFilter !== "all" ||
              statusFilter !== "all" ||
              search) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-left text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >
                  Clear filters
                </button>
              )}

            <div className="text-xs text-slate-400 sm:ml-auto sm:text-sm">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">
                {totalOrders}
              </span>{" "}
              orders
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} columns={7} />
      ) : (
        <>
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <OrderTable
                orders={filteredOrders}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onOrderClick={handleOrderClick}
              />

              {filteredOrders.length === 0 && (
                <div className="flex min-h-[180px] items-center justify-center px-4 text-sm text-slate-500">
                  No orders found.
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Page{" "}
                <span className="font-medium text-slate-700">{page}</span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {totalPages}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {getPageNumbers().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition ${page === pageNumber
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <span className="px-2 text-sm font-medium text-slate-600 sm:hidden">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
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

      {syncStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Sync AWB
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Update shipment tracking information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSyncModal}
                disabled={syncLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSync} className="p-5">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="sync-order-id"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Order ID
                  </label>

                  <input
                    id="sync-order-id"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter order ID"
                    disabled={syncLoading}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sync-awb"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    AWB Code
                  </label>

                  <input
                    id="sync-awb"
                    type="text"
                    value={awbcode}
                    onChange={(e) => setawbCode(e.target.value)}
                    placeholder="Enter AWB code"
                    disabled={syncLoading}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSyncModal}
                  disabled={syncLoading}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    syncLoading ||
                    !orderId.trim() ||
                    !awbcode.trim()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {syncLoading ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Sync AWB
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}