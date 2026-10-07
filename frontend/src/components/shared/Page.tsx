import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Page({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-8", className)} {...props} />;
}

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </header>
  );
}

type PageSectionProps = {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export function PageSection({
  title,
  description,
  className,
  children,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
