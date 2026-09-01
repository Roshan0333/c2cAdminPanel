"use client";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import {
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  FileText,
  CalendarDays,
  Phone,
  Mail,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import axios from "axios";
import { useState } from "react";

const paymentColors = {
  partial_paid:"bg-green-100 border-green-200 text-black-700 p-4 text-[15px] font-bold",
  paid: "bg-green-100 border-green-200 text-black-700 p-4 text-[15px] font-bold",
  pending:
    "bg-yellow-100 border-yellow-200 text-black-700 p-4 text-[15px] font-bold",
  failed:
    "bg-red-100 border-red-200 text-black-700 p-4 text-[15px] font-bold",
};

const statusColors = {
  pending:
    "bg-yellow-100 border-yellow-200 text-black-700 p-4 text-[15px] font-bold",
  confirmed:
    "bg-green-100 border-green-200 text-black-700 p-4 text-[15px] font-bold",
  placed:
    "bg-green-100 border-green-200 text-black-700 p-4 text-[15px] font-bold",
  ready_to_ship:
    "bg-blue-100 border-blue-200 text-black-700 p-4 text-[15px] font-bold",
  on_the_way:
    "bg-purple-100 border-purple-200 text-black-700 p-4 text-[15px] font-bold",
  delivered:
    "bg-green-100 border-green-200 text-black-700 p-4 text-[15px] font-bold",
  cancelled:
    "bg-red-100 border-red-200 text-black-700 p-4 text-[15px] font-bold",
};

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return "₹0";
  }

  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function OrderTable({
  orders,
  onEdit,
  onDelete,
  onOrderClick,
}) {
  const [serviceMode, setServiceMode] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [shipmentType, setShipmentType] = useState("");

  const [deliveryPathner, setDeliveryPathner] = useState([]);
  const [deliveryStatus, setDeliveyStatus] = useState(false);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] =
    useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [shipmentDetailsOpen, setShipmentDetailsOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);

  const [from, setFrom] = useState("201309");
  const [to, setTo] = useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const resetShipmentData = () => {
    setServiceMode(false);
    setDeliveyStatus(false);

    setFrom("");
    setTo("");

    setPaymentMode("");
    setShipmentType("");

    setDeliveryPathner([]);
    setSelectedDeliveryPartner(null);

    setSelectedOrder(null);

    window.location.reload();
  };

  const openConfirmDialog = (action, order) => {
    setConfirmAction(action);
    setConfirmOrder(order);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    if (loading || partnerLoading) return;

    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setConfirmOrder(null);
  };

  const handleViewShipmentDetails = (e, order) => {
    e.stopPropagation();

    setShipmentDetails(order);
    setShipmentDetailsOpen(true);
  };

  const handleShipmentClick = (e, order) => {
    e.stopPropagation();

    if (
      order.displayStage === "pending" ||
      order.shipmentStatus === "cancelled"
    ) {
      return;
    }

    if (order.shipmentStatus === "not_shipped") {
      setSelectedOrder(order);
      setTo(order.shippingPincode || "");
      setServiceMode(true);
      return;
    }

    handleViewShipmentDetails(e, order);
  };

  const handleCreateVelocity = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const token = sessionStorage.getItem("pm_admin_token");

      const url = `${baseUrl}/api/velocity/serviceability`;

      const response = await axios.post(
        url,
        {
          from: from,
          to: to,
          payment_mode: paymentMode,
          shipment_type: shipmentType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveryPathner(response.data.couriers || []);

        setServiceMode(false);
        setDeliveyStatus(true);
      }
    } catch (err) {
      console.error(
        "Serviceability error:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!confirmOrder) return;

    try {
      setLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const token = sessionStorage.getItem("pm_admin_token");

      const url = `${baseUrl}/api/velocity/cancel/${confirmOrder.id}`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setConfirmDialogOpen(false);
        setConfirmAction(null);
        setConfirmOrder(null);

        window.location.reload();
      }
    } catch (err) {
      console.error(
        "Cancel shipment error:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseServiceDialog = (open) => {
    setServiceMode(open);

    if (!open) {
      setFrom("");
      setTo("");

      setPaymentMode("");
      setShipmentType("");

      setSelectedOrder(null);
    }
  };

  const handleClosePartnerDialog = (open) => {
    setDeliveyStatus(open);

    if (!open) {
      setDeliveryPathner([]);
      setSelectedDeliveryPartner(null);

      setFrom("");
      setTo("");

      setPaymentMode("");
      setShipmentType("");

      setSelectedOrder(null);
    }
  };

  const handleSelectDeliveryPartner = (partner) => {
    setSelectedDeliveryPartner(partner);
  };

  const handleConfirmDeliveryPartner = () => {
    if (!selectedOrder || !selectedDeliveryPartner) {
      return;
    }

    openConfirmDialog("create", selectedOrder);
  };

  const createShipment = async () => {
    if (!selectedOrder || !selectedDeliveryPartner) {
      return;
    }

    try {
      setPartnerLoading(true);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const token = sessionStorage.getItem("pm_admin_token");

      const url = `${baseUrl}/api/velocity/shipment/${selectedOrder.id}`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setConfirmDialogOpen(false);
        setConfirmAction(null);
        setConfirmOrder(null);

        resetShipmentData();
      }
    } catch (err) {
      console.error(
        "Create shipment error:",
        err.response?.data || err.message
      );
    } finally {
      setPartnerLoading(false);
    }
  };

  return (
    <>
      <Table className="min-w-[1400px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Order</TableHead>
            <TableHead className="w-[15%]">Customer</TableHead>
            <TableHead className="w-[12%]">Items</TableHead>
            <TableHead className="w-[25%]">Shipping Address</TableHead>
            <TableHead className="w-[10%]">Amount</TableHead>
            <TableHead className="w-[10%]">Payment</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[10%]">Ship Status</TableHead>
            <TableHead className="w-[10%]">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-10 text-center text-slate-400"
              >
                No orders found.
              </TableCell>
            </TableRow>
          )}

          {orders.map((o) => (
            <TableRow
              key={o.id}
              onClick={() => onOrderClick(o)}
              className="cursor-pointer transition-colors hover:bg-slate-50"
            >
              <TableCell>
                <div className="text-sm font-medium">
                  {o.orderNumber || `#${o.id}`}
                </div>

                <div className="text-xs text-slate-400">
                  ID: {o.id}
                </div>
              </TableCell>

              <TableCell>
                <div className="max-w-[200px] truncate text-sm font-medium">
                  {o.user?.name || o.shippingFullName || "-"}
                </div>

                <div className="max-w-[200px] break-all text-xs text-slate-400">
                  {o.user?.email || "-"}
                </div>

                <div className="text-xs text-slate-400">
                  {o.shippingMobile || "-"}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm font-medium">
                  {o.items?.length || 0} item
                  {(o.items?.length || 0) !== 1 ? "s" : ""}
                </div>

                {o.items?.length > 0 && (
                  <div className="max-w-[150px] truncate text-xs text-slate-400">
                    {o.items[0].productName}

                    {o.items.length > 1 &&
                      ` + ${o.items.length - 1} more`}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="max-w-[320px] text-sm">
                  <div className="font-medium text-slate-900">
                    {o.shippingFullName || "-"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {o.shippingMobile || "-"}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {o.shippingAddressLine1 || "-"}
                  </div>

                  {o.shippingAddressLine2 && (
                    <div className="text-xs text-slate-600">
                      {o.shippingAddressLine2}
                    </div>
                  )}

                  {o.shippingLandmark && (
                    <div className="text-xs text-slate-500">
                      Landmark: {o.shippingLandmark}
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    {[o.shippingCity, o.shippingState]
                      .filter(Boolean)
                      .join(", ")}
                  </div>

                  <div className="text-xs text-slate-600">
                    {[o.shippingCountry, o.shippingPincode]
                      .filter(Boolean)
                      .join(" - ")}
                  </div>

                  {o.shippingAddressType && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px]"
                    >
                      {o.shippingAddressType}
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm font-medium">
                  {formatAmount(o.totalAmount)}
                </div>

                {Number(o.discountAmount) > 0 && (
                  <div className="text-xs text-green-600">
                    -{formatAmount(o.discountAmount)}
                  </div>
                )}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    paymentColors[o.paymentStatus] ||
                    "bg-slate-100 text-slate-700"
                  }
                >
                  {(o.paymentStatus || "-").toUpperCase()}
                </Badge>

                <div className="mt-1 text-xs text-slate-400">
                  {o.paymentMethod || "-"}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    statusColors[o.displayStage] ||
                    "bg-slate-100 text-slate-700 py-5"
                  }
                >
                  {(o.displayStage || "-").toUpperCase()}
                </Badge>
              </TableCell>

              <TableCell>
                {o.displayStage === "pending" ? (
                  <Badge
                    variant="outline"
                    className="cursor-default border-slate-200 bg-slate-100 text-slate-500"
                  >
                    -
                  </Badge>
                ) : o.shipmentStatus === "not_shipped" ? (
                  <Badge
                    variant="outline"
                    onClick={(e) => {
                      handleShipmentClick(e, o);
                    }}
                    className="cursor-pointer border-green-300 bg-green-100 p-4 text-[15px] font-bold text-black-700 hover:bg-green-200"
                  >
                    Ship Now
                  </Badge>
                ) : o.shipmentStatus === "cancelled" ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      onClick={(e) =>
                        handleViewShipmentDetails(e, o)
                      }
                      className="cursor-pointer border-blue-300 bg-blue-100 p-4 text-[15px] font-bold text-black-700 hover:bg-blue-200"
                    >
                      View Details
                    </Badge>

                    <Badge
                      variant="outline"
                      className="cursor-default border-slate-300 bg-slate-100 p-4 text-[15px] font-bold text-black-700"
                    >
                      Cancelled
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      onClick={(e) =>
                        handleViewShipmentDetails(e, o)
                      }
                      className="cursor-pointer border-blue-300 bg-blue-100 p-4 text-[15px] font-bold text-black-700 hover:bg-blue-200"
                    >
                      View Details
                    </Badge>

                    <Badge
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirmDialog("cancel", o);
                      }}
                      className="cursor-pointer border-red-300 bg-red-100 p-4 text-[15px] font-bold text-black-700 hover:bg-red-200"
                    >
                      Cancel Ship
                    </Badge>
                  </div>
                )}
              </TableCell>

              <TableCell className="whitespace-nowrap text-sm">
                {formatDate(o.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={serviceMode}
        onOpenChange={handleCloseServiceDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Shipment</DialogTitle>

            <DialogDescription>
              Enter shipment details for{" "}
              <span className="font-medium text-slate-900">
                {selectedOrder?.orderNumber ||
                  `#${selectedOrder?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                From Pincode
              </label>

              <Input
                placeholder="Enter pickup pincode"
                value={from}
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                To Pincode
              </label>

              <Input
                placeholder="Enter delivery pincode"
                value={to}
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Payment Mode
              </label>

              <Select
                value={paymentMode}
                onValueChange={setPaymentMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Prepaid">
                    Prepaid
                  </SelectItem>

                  <SelectItem value="COD">
                    COD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Shipment Type
              </label>

              <Select
                value={shipmentType}
                onValueChange={setShipmentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Forward">
                    Forward
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleCloseServiceDialog(false)
                }
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  loading ||
                  !paymentMode ||
                  !shipmentType
                }
                onClick={handleCreateVelocity}
              >
                {loading
                  ? "Checking..."
                  : "Check Availability"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deliveryStatus}
        onOpenChange={handleClosePartnerDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Select Delivery Partner
            </DialogTitle>

            <DialogDescription>
              Select a delivery partner for{" "}
              <span className="font-medium text-slate-900">
                {selectedOrder?.orderNumber ||
                  `#${selectedOrder?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[450px] space-y-3 overflow-y-auto pr-1">
            {deliveryPathner.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-slate-500">
                  No delivery partners available.
                </p>
              </div>
            ) : (
              deliveryPathner.map((partner) => {
                const isSelected =
                  selectedDeliveryPartner?.carrier_id ===
                  partner.carrier_id;

                return (
                  <div
                    key={partner.carrier_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDeliveryPartner(partner);
                    }}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">
                          {partner.carrier_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Carrier ID: {partner.carrier_id}
                        </div>

                        <div className="mt-2 text-sm text-slate-600">
                          Expected Delivery:{" "}
                          <span className="font-medium">
                            {formatDate(
                              partner.expected_delivery_date
                            )}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleClosePartnerDialog(false)
              }
              disabled={partnerLoading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                !selectedDeliveryPartner ||
                partnerLoading
              }
              onClick={handleConfirmDeliveryPartner}
            >
              Create Shipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirmDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-[440px]">
          {confirmAction === "cancel" ? (
            <>
              <div className="border-b bg-red-50 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>

                  <div>
                    <DialogTitle className="text-lg font-semibold text-slate-900">
                      Cancel Shipment?
                    </DialogTitle>

                    <DialogDescription className="mt-1 text-sm text-slate-600">
                      Are you sure you want to cancel this
                      shipment?
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Order
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {confirmOrder?.orderNumber ||
                        `#${confirmOrder?.id}`}
                    </span>
                  </div>

                  {confirmOrder?.courierName && (
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Courier
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {confirmOrder.courierName}
                      </span>
                    </div>
                  )}

                  {confirmOrder?.awbCode && (
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        AWB
                      </span>

                      <span className="font-mono text-sm font-medium text-slate-900">
                        {confirmOrder.awbCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <p className="text-xs leading-5 text-red-700">
                      Once the shipment is cancelled, this
                      action cannot be undone from the admin
                      panel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeConfirmDialog}
                  disabled={loading}
                >
                  Keep Shipment
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancelShipment}
                  disabled={loading}
                >
                  {loading ? (
                    "Cancelling..."
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Shipment
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="border-b bg-green-50 px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>

                  <div>
                    <DialogTitle className="text-lg font-semibold text-slate-900">
                      Confirm Shipment
                    </DialogTitle>

                    <DialogDescription className="mt-1 text-sm text-slate-600">
                      Review the shipment details before
                      creating the shipment.
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-600" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Shipment Summary
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Order
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {selectedOrder?.orderNumber ||
                          `#${selectedOrder?.id}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Courier Partner
                      </span>

                      <span className="text-sm font-semibold text-slate-900">
                        {selectedDeliveryPartner?.carrier_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Carrier ID
                      </span>

                      <span className="font-mono text-xs text-slate-700">
                        {selectedDeliveryPartner?.carrier_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Expected Delivery
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatDate(
                          selectedDeliveryPartner?.expected_delivery_date
                        )}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Payment Mode
                      </span>

                      <Badge variant="outline">
                        {paymentMode}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Shipment Type
                      </span>

                      <Badge variant="outline">
                        {shipmentType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

                    <p className="text-xs leading-5 text-green-700">
                      Confirming will create the shipment
                      with the selected delivery partner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeConfirmDialog}
                  disabled={partnerLoading}
                >
                  Go Back
                </Button>

                <Button
                  type="button"
                  onClick={createShipment}
                  disabled={partnerLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {partnerLoading ? (
                    "Creating..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm & Create
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={shipmentDetailsOpen}
        onOpenChange={(open) => {
          setShipmentDetailsOpen(open);

          if (!open) {
            setShipmentDetails(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[750px]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5" />
                  Shipment Details
                </DialogTitle>

                <DialogDescription className="mt-1">
                  Shipment information for{" "}
                  <span className="font-medium text-slate-900">
                    {shipmentDetails?.orderNumber || "-"}
                  </span>
                </DialogDescription>
              </div>

              {shipmentDetails?.shipmentStatus && (
                <Badge
                  variant="outline"
                  className={
                    shipmentDetails.shipmentStatus === "cancelled"
                      ? "border-red-200 bg-red-100 text-red-700"
                      : "border-green-200 bg-green-100 text-green-700"
                  }
                >
                  {shipmentDetails.shipmentStatus}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {shipmentDetails && (
            <div className="space-y-6 pt-2">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Shipment Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Courier Partner
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {shipmentDetails.courierName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      AWB Number
                    </p>

                    <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                      {shipmentDetails.awbCode || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Velocity Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-900">
                      {shipmentDetails.velocityOrderId || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Velocity Shipment ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-900">
                      {shipmentDetails.velocityShipmentId || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Created
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDateTime(shipmentDetails.createdAt)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Last Updated
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDateTime(shipmentDetails.updatedAt)}
                    </p>
                  </div>
                </div>

                {shipmentDetails.labelUrl &&
                  shipmentDetails.shipmentStatus !== "cancelled" && (
                    <div className="mt-4 border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          const link =
                            document.createElement("a");

                          link.href =
                            shipmentDetails.labelUrl;

                          link.download = `shipping-label-${
                            shipmentDetails.trackingNumber ||
                            "label"
                          }.pdf`;

                          document.body.appendChild(link);

                          link.click();

                          document.body.removeChild(link);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />

                        Download Shipping Label

                        <Download className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Customer Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      Customer Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {shipmentDetails.user?.name ||
                        shipmentDetails.shippingFullName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Customer ID
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {shipmentDetails.userId || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Email
                      </p>
                    </div>

                    <p className="mt-1 break-all text-sm text-slate-900">
                      {shipmentDetails.user?.email ||
                        shipmentDetails.address?.email ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Mobile
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {shipmentDetails.shippingMobile ||
                        shipmentDetails.address?.mobile ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {shipmentDetails.shippingFullName ||
                          shipmentDetails.address?.fullName ||
                          "-"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {shipmentDetails.shippingMobile ||
                          shipmentDetails.address?.mobile ||
                          "-"}
                      </p>
                    </div>

                    {shipmentDetails.shippingAddressType && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {shipmentDetails.shippingAddressType}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    {shipmentDetails.shippingAddressLine1 && (
                      <p>
                        {shipmentDetails.shippingAddressLine1}
                      </p>
                    )}

                    {shipmentDetails.shippingAddressLine2 && (
                      <p>
                        {shipmentDetails.shippingAddressLine2}
                      </p>
                    )}

                    {shipmentDetails.shippingLandmark && (
                      <p>
                        Landmark:{" "}
                        {shipmentDetails.shippingLandmark}
                      </p>
                    )}

                    <p>
                      {[
                        shipmentDetails.shippingCity,
                        shipmentDetails.shippingState,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p>
                      {[
                        shipmentDetails.shippingCountry,
                        shipmentDetails.shippingPincode,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h3>
                </div>

                <div className="overflow-hidden rounded-xl border">
                  {shipmentDetails.items?.length > 0 ? (
                    <div className="divide-y">
                      {shipmentDetails.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 p-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {item.productName || "-"}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              {item.flavour && (
                                <span>
                                  Flavour: {item.flavour}
                                </span>
                              )}

                              {item.size && (
                                <span>
                                  Size: {item.size}
                                </span>
                              )}

                              <span>
                                Qty: {item.quantity || 0}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatAmount(item.priceAtPurchase)}
                            </p>

                            <p className="text-xs text-slate-400">
                              per item
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No items found.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Order & Payment
                  </h3>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        Order Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-900">
                        {shipmentDetails.orderNumber || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {shipmentDetails.paymentMethod || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Status
                      </p>

                      <Badge
                        variant="outline"
                        className={`mt-1 ${
                          paymentColors[
                            shipmentDetails.paymentStatus
                          ] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {shipmentDetails.paymentStatus || "-"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Order Status
                      </p>

                      <Badge
                        variant="outline"
                        className={`mt-1 ${
                          statusColors[
                            shipmentDetails.displayStage
                          ] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {shipmentDetails.displayStage || "-"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-medium">
                        {formatAmount(
                          shipmentDetails.subtotal
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Shipping
                      </span>

                      <span className="font-medium">
                        {formatAmount(
                          shipmentDetails.shippingCost
                        )}
                      </span>
                    </div>

                    {Number(
                      shipmentDetails.discountAmount
                    ) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Discount
                        </span>

                        <span className="font-medium text-green-600">
                          -
                          {formatAmount(
                            shipmentDetails.discountAmount
                          )}
                        </span>
                      </div>
                    )}

                    {shipmentDetails.couponCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Coupon
                        </span>

                        <span className="font-medium text-slate-900">
                          {shipmentDetails.couponCode}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between pt-1">
                      <span className="font-semibold text-slate-900">
                        Total Amount
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        {formatAmount(
                          shipmentDetails.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(shipmentDetails.razorpayOrderId ||
                shipmentDetails.razorpayPaymentId) && (
                <div className="rounded-xl border bg-slate-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Payment Reference
                  </h3>

                  <div className="space-y-3 text-xs">
                    {shipmentDetails.razorpayOrderId && (
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span className="text-slate-500">
                          Razorpay Order ID
                        </span>

                        <span className="break-all font-mono text-slate-700">
                          {shipmentDetails.razorpayOrderId}
                        </span>
                      </div>
                    )}

                    {shipmentDetails.razorpayPaymentId && (
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span className="text-slate-500">
                          Razorpay Payment ID
                        </span>

                        <span className="break-all font-mono text-slate-700">
                          {shipmentDetails.razorpayPaymentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShipmentDetailsOpen(false)
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}