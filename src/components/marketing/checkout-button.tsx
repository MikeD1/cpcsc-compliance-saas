import Link from "next/link";

type CheckoutButtonProps = {
  plan: string;
  children: React.ReactNode;
  className: string;
  organizationId?: string | null;
  isActivationRecovery?: boolean;
};

export function CheckoutButton({ plan, children, className, organizationId, isActivationRecovery = false }: CheckoutButtonProps) {
  const href = organizationId
    ? `/api/billing/checkout-link?plan=${plan}&organizationId=${organizationId}`
    : isActivationRecovery
      ? `/api/billing/checkout-link?plan=${plan}&activation=1`
      : `/signup?plan=${plan}`;

  return (
    <div className="grid gap-2">
      <Link href={href} className={className}>
        {children}
      </Link>
      <p className="text-xs text-slate-500">
        {isActivationRecovery
          ? "Continue checkout for your existing workspace. This will not create a duplicate account."
          : "Create your account first, then continue to secure checkout."}
      </p>
    </div>
  );
}
