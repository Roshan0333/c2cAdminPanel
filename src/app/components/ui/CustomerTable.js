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
  Eye,
  Pencil,
} from "lucide-react";

import { getAvatarColor } from "@/lib/avatarColor";

export default function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <Table className="min-w-[850px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[8%]">
            ID
          </TableHead>

          <TableHead className="w-[10%]">
            Avatar
          </TableHead>

          <TableHead className="w-[22%]">
            Name
          </TableHead>

          <TableHead className="w-[15%]">
            Phone
          </TableHead>

          <TableHead className="w-[13%]">
            Created
          </TableHead>

          <TableHead className="w-[12%]">
            Status
          </TableHead>

          <TableHead className="w-[20%] text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {customers.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="py-10 text-center text-slate-400"
            >
              No customers yet.
            </TableCell>
          </TableRow>
        )}

        {customers.map((customer) => (
          <TableRow key={customer.id}>
            {/* ID */}
            <TableCell className="text-sm font-medium">
              {customer.id}
            </TableCell>

            {/* Avatar */}
            <TableCell>
              <div
                className={`
                  flex h-8 w-8 items-center justify-center
                  rounded text-sm font-semibold text-white
                  ${getAvatarColor(customer.name)}
                `}
              >
                {customer.name
                  ?.charAt(0)
                  ?.toUpperCase() || "?"}
              </div>
            </TableCell>

            {/* Name */}
            <TableCell className="max-w-[220px] truncate text-sm text-blue-600">
              {customer.name}
            </TableCell>

            {/* Phone */}
            <TableCell className="text-sm">
              {customer.phone || "—"}
            </TableCell>

            {/* Created */}
            <TableCell className="text-sm whitespace-nowrap">
              {customer.createdAt
                ? customer.createdAt.slice(0, 10)
                : "—"}
            </TableCell>

            {/* Status */}
            <TableCell>
              <Badge
                variant="outline"
                className={
                  customer.status
                    ? "border-green-200 bg-green-100 text-green-700"
                    : "border-red-200 bg-red-100 text-red-700"
                }
              >
                {customer.status
                  ? "Activated"
                  : "Deactivated"}
              </Badge>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onView(customer)}
                  aria-label={`View ${customer.name}`}
                >
                  <Eye size={16} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(customer)}
                  aria-label={`Edit ${customer.name}`}
                >
                  <Pencil size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}