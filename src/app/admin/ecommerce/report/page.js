"use client"

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const PERIODS = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
];

const STATUS_COLORS = {
    pending: "bg-amber-400",
    placed: "bg-blue-400",
    confirmed: "bg-green-400",
    ready_to_ship: "bg-green-400",
    on_the_way: "bg-indigo-400",
    delivered: "bg-emerald-500",
    cancelled: "bg-red-400",
    refunded: "bg-slate-400",
};

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function formatDateRange(from, to) {
    if (!from || !to) return "";
    const opts = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    const f = new Date(from);
    const t = new Date(to);
    return `${f.toLocaleDateString("en-US", opts)} — ${t.toLocaleDateString("en-US", opts)}`;
}

function StatCard({ label, value, accent, link }) {
    return (
        <Link
            href={link || "#"}
            onClick={(e) => {
                if (label === "Conversion") {
                    e.preventDefault();
                }
            }}
        >
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p
                    className={`mt-1 font-mono text-2xl font-semibold ${accent ?? "text-slate-900"
                        }`}
                >
                    {value}
                </p>
            </div>
        </Link>
    );
}

export default function Report() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const [period, setPeriod] = useState("daily");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("pm_admin_token");
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `${baseUrl}/api/dashboard/reports?period=${period}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!cancelled) setData(response.data);
            } catch (err) {
                console.error("Error:", err.message);
                if (!cancelled) setError(err.message || "Failed to load report");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [period, baseUrl]);

    const report = data?.report;
    const conversionRate =
        report && report.totalOrders > 0
            ? Math.round((report.paidOrders / report.totalOrders) * 100)
            : null;
    const maxStatusCount = report?.ordersByStatus?.length
        ? Math.max(...report.ordersByStatus.map((s) => s.count ?? 0))
        : 0;

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
                    {data?.dateRange && (
                        <p className="text-sm text-slate-400">
                            {formatDateRange(data.dateRange.from, data.dateRange.to)}
                        </p>
                    )}
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${period === p.key
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    Couldn't load the report. {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : (
                report && (
                    <>
                        <div className="rounded-xl border border-slate-200 bg-blue-800 p-6">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Total revenue
                            </p>
                            <p className="mt-1 font-mono text-4xl font-semibold text-white">
                                {formatCurrency(report.totalRevenue)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <StatCard label="New users" value={report.newUsers ?? 0} link={"/admin/ecommerce/customers"} />
                            <StatCard label="Total orders" value={report.totalOrders ?? 0} link={"/admin/ecommerce/orders"} />
                            <StatCard label="Paid orders" value={report.paidOrders ?? 0} link={"/admin/ecommerce/orders"} />
                            <StatCard
                                label="Conversion"
                                value={conversionRate !== null ? `${conversionRate}%` : "—"}
                                accent="text-emerald-600"
                                link=""
                            />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <p className="mb-4 text-sm font-medium text-slate-900">Orders by status</p>
                            {report.ordersByStatus?.length ? (
                                <div className="space-y-3">
                                    {report.ordersByStatus.map((s) => (
                                        <div key={s.status} className="flex items-center gap-3">
                                            <span className="w-24 shrink-0 text-sm capitalize text-slate-600">
                                                {s.status}
                                            </span>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full ${STATUS_COLORS[s.status] ?? "bg-slate-400"
                                                        }`}
                                                    style={{
                                                        width: `${maxStatusCount
                                                            ? (s.count / maxStatusCount) * 100
                                                            : 0
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-8 shrink-0 text-right font-mono text-sm text-slate-900">
                                                {s.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    No orders placed in this period yet.
                                </p>
                            )}
                        </div>
                    </>
                )
            )}
        </div>
    );
}