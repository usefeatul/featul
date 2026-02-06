import type { FormEvent, ReactNode } from "react";

export type AuthLayoutStyles = {
  sectionCls: string;
  formCls: string;
  bodyPaddingCls: string;
  footerPaddingCls: string;
  headingCls: string;
  sectionSpacingCls: string;
  socialGapCls: string;
  dividerCls: string;
  fieldSpacingCls: string;
  pwdSpacingCls: string;
};

export function getAuthLayoutStyles(embedded: boolean = false): AuthLayoutStyles {
  return {
    sectionCls: embedded
      ? "flex flex-1 px-4 sm:px-5 py-3 sm:py-4 items-center justify-center"
      : "flex flex-1 bg-background px-4 sm:px-6 py-8 sm:py-12 items-center justify-center",
    formCls: embedded
      ? "m-auto h-fit w-full max-w-sm"
      : "bg-background m-auto h-fit w-full max-w-sm",
    bodyPaddingCls: embedded
      ? "p-4 sm:p-5 pb-4 sm:pb-4"
      : "p-6 sm:p-8 pb-5 sm:pb-6",
    footerPaddingCls: embedded ? "p-3 sm:p-4" : "p-3",
    headingCls: embedded
      ? "mb-2 mt-1 text-lg sm:text-xl font-semibold text-center"
      : "mb-2 mt-4 text-xl sm:text-2xl font-semibold text-center",
    sectionSpacingCls: embedded ? "mt-4 space-y-4" : "mt-6 space-y-6",
    socialGapCls: embedded ? "gap-2" : "gap-3",
    dividerCls: embedded
      ? "my-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
      : "my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3",
    fieldSpacingCls: embedded ? "space-y-1.5" : "space-y-2",
    pwdSpacingCls: embedded ? "space-y-0.5" : "space-y-0.5",
  };
}

export function AuthLayout({
  embedded = false,
  title,
  onSubmit,
  children,
  footer,
}: {
  embedded?: boolean;
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const styles = getAuthLayoutStyles(embedded);

  return (
    <section className={styles.sectionCls}>
      <form noValidate className={styles.formCls} onSubmit={onSubmit}>
        <div className={styles.bodyPaddingCls}>
          <div className="text-center">
            <h1 className={styles.headingCls}>{title}</h1>
          </div>

          <div className={styles.sectionSpacingCls}>{children}</div>
        </div>

        {footer ? <div className={styles.footerPaddingCls}>{footer}</div> : null}
      </form>
    </section>
  );
}
