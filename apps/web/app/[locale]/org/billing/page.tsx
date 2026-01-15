import { Check, CreditCard } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription and billing",
};

interface BillingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="mb-6 font-bold text-2xl text-gray-900">Billing</h1>

      {/* Current Plan */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Current Plan
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-2xl text-gray-900">Professional</p>
            <p className="text-gray-600">25 job postings per month</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-gray-900">€99/mo</p>
            <p className="text-gray-600">Next billing: Feb 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Usage This Month
        </h2>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Jobs Posted</span>
          <span className="font-medium text-gray-900">8 / 25</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div className="h-2 w-1/3 rounded-full bg-green-600" />
        </div>
      </div>

      {/* Plans */}
      <div className="mb-8">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Available Plans
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Starter", price: "€49", jobs: 5, current: false },
            { name: "Professional", price: "€99", jobs: 25, current: true },
            { name: "Enterprise", price: "€249", jobs: 100, current: false },
          ].map((plan) => (
            <div
              className={`rounded-lg border p-6 ${plan.current ? "border-green-600 ring-2 ring-green-600" : ""}`}
              key={plan.name}
            >
              {plan.current && (
                <span className="mb-2 inline-block rounded-full bg-green-100 px-2 py-1 font-medium text-green-800 text-xs">
                  Current Plan
                </span>
              )}
              <h3 className="font-semibold text-gray-900 text-lg">
                {plan.name}
              </h3>
              <p className="font-bold text-3xl text-gray-900">
                {plan.price}
                <span className="font-normal text-gray-600 text-sm">/mo</span>
              </p>
              <p className="text-gray-600">{plan.jobs} jobs/month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  Featured listings
                </li>
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  Analytics dashboard
                </li>
              </ul>
              {!plan.current && (
                <button
                  className="mt-4 w-full rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  type="button"
                >
                  Switch Plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Payment Method
        </h2>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-gray-100 p-3">
            <CreditCard className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
            <p className="text-gray-600 text-sm">Expires 12/26</p>
          </div>
          <button
            className="ml-auto text-green-600 hover:text-green-700"
            type="button"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
