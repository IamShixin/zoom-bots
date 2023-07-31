import { Metadata } from 'next';
import { clsx } from 'clsx';
import { PlanName } from 'tier';

import { getPlan } from '@/config/subscriptionPlans';
import { getCurrentUser } from '@/lib/session';
import { getPricingPageData } from '@/lib/subscription';
import { tier } from '@/lib/tier';
import { Button } from '@/components/ui/button';
import { CheckBoxIcon } from '@/components/ui/icons/CheckBoxIcon';
import { CreditCardIcon } from '@/components/ui/icons/CreditCardIcon';
import { CheckoutButton } from '@/app/(1_Main)/_components/CheckoutButton';

// import { checkout } from "./action";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your subscription and know about your usage',
};

const pricing = await getPricingPageData();
type planType = {
  planId: PlanName;
  currency: string;
  interval: string;
  name: string;
  base: number;
  extraUsageRate: number | undefined | null;
};
export default async function BillingPage() {
  const user = await getCurrentUser();
  // console.log(user);

  const freeUsageLimit = user?.limit.limit as number;
  const used = user?.limit?.used as number;

  const phase = await tier.lookupPhase(`org:${user?.id}`);
  // console.log(phase);

  let currentPlan: planType = {
    planId: 'plan:sample@1',
    currency: 'eur',
    interval: 'yearly',
    name: 'Sample',
    base: 20000,
  };
  if (phase.plans !== undefined) {
    const currentPlan1 = await getPlan(phase.plans[0] as PlanName);
    if (currentPlan1) {
      currentPlan = currentPlan1;
    }
  }

  const org = await tier.lookupOrg(`org:${user?.id}`);
  const paymentMethodResponse = await tier.lookupPaymentMethods(
    `org:${user?.id}`,
  );
  const paymentMethod = paymentMethodResponse.methods[0];
  // console.log(paymentMethod.card);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Greetings */}
      <div className="mt-16 flex items-center justify-between">
        <h1 className="h4">
          Hello <span className="text-crimson-9">{user?.name}</span>
        </h1>
      </div>
      {/* Usage Display */}
      <div className="border-slate-6 mt-16 flex flex-col items-center border-b pb-16">
        <div className="flex items-start gap-12">
          {/* Your subscription */}
          <div className="border-slate-6 flex flex-col gap-4 border-r pr-12">
            <p className="body text-slate-11">Your subscription</p>
            <div className="flex flex-col gap-2">
              <p className="body-xl">{currentPlan.name}</p>
              <div className="flex items-center gap-3">
                <h5 className="text-[32px] font-bold leading-9">
                  {`$${currentPlan.base / 100}`}
                </h5>
                <div className="flex flex-col items-start">
                  <span className="caption">
                    {currentPlan.currency.toUpperCase()}
                  </span>
                  <span className="caption-s text-slate-11">
                    {`Billed ${currentPlan.interval}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Usage details */}
          <div
            className={clsx(
              'flex flex-col gap-9 ',
              currentPlan.extraUsageRate !== null
                ? 'border-slate-6 border-r pr-12'
                : '',
            )}
          >
            <p className="text-slate-11">Copies generated</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row-reverse items-end justify-between">
                <p className="caption-s text-slate-11">
                  Free copies allowed : {freeUsageLimit}
                </p>
              </div>
              {/* Progress */}
              <div className="bg-slate-4 relative h-2 w-[442px]">
                <div
                  className="absolute h-2 bg-red-600"
                  style={{
                    width: `${
                      freeUsageLimit - used > 0
                        ? (used / freeUsageLimit) * 100
                        : (freeUsageLimit / freeUsageLimit) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                {freeUsageLimit - used > 0 ? (
                  <p className="caption-s text-slate-11">
                    {freeUsageLimit - used} remaining in free quota
                  </p>
                ) : (
                  <p className="caption-s text-slate-11">
                    0 remaining in free quota
                  </p>
                )}
                <p className="caption-s text-slate-11">
                  {freeUsageLimit - used > 0
                    ? `${used} / ${freeUsageLimit}`
                    : `${freeUsageLimit} / ${freeUsageLimit}`}
                </p>
              </div>
            </div>
          </div>
          {/* Overages */}
          {currentPlan.extraUsageRate !== null ? (
            <div className="flex flex-col gap-5">
              <p className="text-slate-11">Overages</p>
              <div className="flex items-center gap-3">
                <p className="text-[32px] font-bold leading-9">
                  $
                  {freeUsageLimit - used > 0
                    ? 0
                    : (used - freeUsageLimit) *
                      (currentPlan.extraUsageRate / 100)}
                </p>
                <p className="caption text-slate-11">
                  @ ${currentPlan.extraUsageRate / 100}/copy
                </p>
              </div>
              <p className="caption text-slate-11">
                Additional copies generated:{' '}
                {freeUsageLimit - used > 0 ? 0 : used - freeUsageLimit}
              </p>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      {/* Manage subscription */}
      {/* Pricing */}
      <div className="border-slate-6 mt-16 flex flex-col gap-12 border-b pb-24 ">
        <p className="text-slate-11">Manage subscription</p>
        <div className="mx-auto flex flex-col items-start gap-6 md:flex-row">
          {pricing.map((plan, planIndex) => (
            <div
              key={planIndex}
              className={clsx(
                'bg-slate-2 flex h-[353px] flex-col gap-8 rounded-lg px-6 py-12',
                plan.planId === currentPlan.planId
                  ? 'border-crimson-6 border-[3px]'
                  : '',
              )}
            >
              <div className="flex flex-col gap-2">
                <h6 className="body-semibold text-slate-12">{plan.name}</h6>
                <div className="flex items-center gap-3">
                  <h5 className="text-[32px] font-bold leading-9">
                    ${plan.base / 100}
                  </h5>
                  <div className="flex flex-col items-start">
                    <span className="caption">
                      {plan.currency.toUpperCase()}
                    </span>
                    <span className="caption-s text-slate-11">
                      Billed {plan.interval}
                    </span>
                  </div>
                </div>
              </div>
              {plan.planId === currentPlan.planId ? (
                <Button
                  variant="secondary"
                  disabled={true}
                  className="hover:bg-crimson-3 w-[256px]"
                >
                  Current plan
                </Button>
              ) : (
                <CheckoutButton plan={plan} currentPlan={currentPlan} />
              )}

              <div className="flex flex-col gap-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <CheckBoxIcon
                      className={clsx(
                        'h-6 w-6 ',
                        plan.planId === currentPlan.planId
                          ? 'stroke-crimson-9'
                          : 'stroke-slate-11',
                      )}
                    />
                    <p className="body text-slate-11">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Billing details */}
      <div className="mb-40 mt-16">
        <div className="flex items-start gap-16">
          {/* Billing information */}
          {org.email && (
            <div
              className={clsx(
                'flex items-start gap-16 ',
                paymentMethod ? 'border-slate-6 border-r pr-16' : '',
              )}
            >
              <p className="text-slate-11">Billing information</p>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  {org.name ? <p className="body-semibold">{org.name}</p> : ''}
                  <p className="text-slate-11">{org.email}</p>
                </div>
              </div>
            </div>
          )}
          {/* Payment method */}
          {paymentMethod && (
            <div className="flex items-start gap-16">
              <p className="text-slate-11">Payment method</p>
              <div className="flex gap-4">
                <CreditCardIcon />
                <div className="flex flex-col gap-2">
                  <p className="body-semibold">
                    Card ending in {paymentMethod.card.last4}
                  </p>
                  <p className="text-slate-11">
                    Expires {paymentMethod.card.exp_month}/
                    {paymentMethod.card.exp_year}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
