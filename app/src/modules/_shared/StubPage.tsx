import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';

export function StubPage({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />
      <section className="flex min-h-[280px] flex-col items-center justify-center rounded-(--radius) border border-dashed border-(--color-border) bg-(--color-surface) p-10 text-center">
        <p className="m-0 text-sm font-medium text-(--color-text)">Module en construction</p>
        {description && (
          <p className="m-0 mt-2 max-w-md text-xs text-(--color-muted)">{description}</p>
        )}
      </section>
    </PageContainer>
  );
}
