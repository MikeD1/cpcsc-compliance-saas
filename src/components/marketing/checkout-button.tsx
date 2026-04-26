import Link from "next/link";

type CheckoutButtonProps = {
  plan: string;
  children: React.ReactNode;
  className: string;
};

export function CheckoutButton({ plan, children, className }: CheckoutButtonProps) {
  return (
    <div className="grid gap-2">
      <Link href={`/signup?plan=${plan}`} className={className}>
        {children}
      </Link>
      <p className="text-xs text-slate-500">Create your account first, then continue to secure checkout.</p>
    </div>
  );
}
