"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import CustomerTable from "@/app/components/ui/CustomerTable";
import CustomerForm from "@/app/components/ui/CustomerForm";
import CustomerViewDialog from "@/app/components/ui/CustomerViewDialog";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

function getToken() {
  return sessionStorage.getItem("pm_admin_token");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        setError(null);

        const url = `${BASE_URL}/api/dashboard/users?page=${page}&limit=20`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!res.ok) {
          throw new Error(
            `Request failed with status ${res.status}`
          );
        }

        const data = await res.json();

        setCustomers(data.users || []);

        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [page, BASE_URL]);

  function handleEditClick(customer) {
    setSelectedCustomer(customer);
    setFormOpen(true);
  }

  function handleViewClick(customer) {
    setSelectedCustomer(customer);
    setViewOpen(true);
  }

  function handleDelete(customer) {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!customerToDelete?.id) return;

    setDeleting(true);

    try {
      // ?page=1&limit=20
      const url = `${BASE_URL}/api/dashboard/users/${customerToDelete.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);

        throw new Error(
          errData?.message ||
            `Deletion failed with status ${res.status}`
        );
      }

      setCustomers((prev) =>
        prev.filter(
          (customer) => customer.id !== customerToDelete.id
        )
      );

      toast.success("Customer deleted successfully!");

      setDeleteDialogOpen(false);
      setCustomerToDelete(null);

      if (customers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Delete customer failed:", err);

      toast.error(
        `Failed to delete customer: ${err.message}`
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(customer) {
    if (!customer?.id) return;

    const { id, status } = customer;

    const updatedStatus =
      status === "Activated" || status === true;

    try {
      const url = `${BASE_URL}/api/dashboard/users/${id}/status`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status: updatedStatus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);

        throw new Error(
          errData?.message ||
            `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();

      const updated = data.user || data;

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === updated.id ? updated : c
        )
      );

      toast.success("Customer updated successfully!");

      setFormOpen(false);
    } catch (err) {
      console.error("Update customer failed:", err);

      toast.error(
        `Failed to update customer: ${err.message}`
      );
    }
  }

  function handlePreviousPage() {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }

  function handlePageChange(pageNumber) {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== page
    ) {
      setPage(pageNumber);
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
        </div>

        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <TableSkeleton rows={6} columns={7} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load customers: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your customers and their account status.
          </p>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border bg-white">
        <div className="w-full overflow-x-auto">
          <CustomerTable
            customers={customers}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() =>
                  handlePageChange(pageNumber)
                }
                className={`min-w-9 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  page === pageNumber
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      <CustomerViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        customer={selectedCustomer}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Customer"
        description={
          customerToDelete
            ? `Are you sure you want to delete "${customerToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}