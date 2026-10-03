import { cn } from "@/lib/utils";

export function Page({ className, ...props }) {
  return <div className={cn("flex flex-col gap-8", className)} {...props} />;
}

export function PageHeader({ title, description }) {
  return (
    <header>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </header>
  );
}

export function PageSection({ title, description, className, children }) {
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
