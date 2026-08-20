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
  labelCls: string;
  footerTextCls: string;
  linkButtonCls: string;
  mutedTextCls: string;
  helperTextCls: string;
  dividerHrCls: string;
  dividerTextCls: string;
  secondaryActionCls: string;
  errorTextCls: string;
  socialButtonVariant: "card" | "nav";
};

export function getAuthLayoutStyles(embedded: boolean = false): AuthLayoutStyles {
  if (embedded) {
    return {
      sectionCls: "w-full",
      formCls: "w-full",
      bodyPaddingCls: "p-0",
      footerPaddingCls: "pt-3",
      headingCls: "sr-only",
      sectionSpacingCls: "space-y-3",
      socialGapCls: "gap-1.5",
      socialButtonVariant: "card",
      dividerCls: "my-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2",
      fieldSpacingCls: "space-y-1.5",
      pwdSpacingCls: "space-y-0.5",
      labelCls: "block text-sm",
      footerTextCls: "text-accent-foreground text-center text-sm font-normal",
      linkButtonCls: "px-2 text-primary",
      mutedTextCls: "text-xs text-muted-foreground",
      helperTextCls: "text-xs text-accent text-center",
      dividerHrCls: "border-dashed",
      dividerTextCls: "text-muted-foreground text-xs",
      secondaryActionCls:
        "text-sm font-medium text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer",
      errorTextCls: "text-destructive text-xs text-center",
    };
  }

  return {
    sectionCls: "flex flex-1 px-4 sm:px-6 py-8 sm:py-12 items-center justify-center",
    formCls: "m-auto h-fit w-full max-w-sm",
    bodyPaddingCls: "p-6 sm:p-8 pb-5 sm:pb-6",
    footerPaddingCls: "p-3",
    headingCls:
      "mb-2 mt-4 font-heading text-xl font-semibold text-center text-white sm:text-2xl",
    sectionSpacingCls: "mt-6 space-y-6",
    socialGapCls: "gap-3",
    dividerCls: "my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3",
    fieldSpacingCls: "space-y-2",
    pwdSpacingCls: "space-y-0.5",
    labelCls: "block text-sm text-white",
    footerTextCls: "text-center text-sm font-normal text-white/85",
    linkButtonCls: "px-2 text-white underline-offset-4 hover:text-white/90",
    mutedTextCls: "text-xs text-white/70",
    helperTextCls: "text-xs text-center text-white/80",
    dividerHrCls: "border-dashed border-white/30",
    dividerTextCls: "text-xs text-white/70",
    secondaryActionCls:
      "text-sm font-medium text-white/85 hover:text-white flex items-center gap-2 transition-colors cursor-pointer",
    errorTextCls: "text-xs text-center text-red-200",
    socialButtonVariant: "nav",
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
          {embedded ? (
            <h1 className="sr-only">{title}</h1>
          ) : (
            <div className="text-center">
              <h1 className={styles.headingCls}>{title}</h1>
            </div>
          )}

          <div className={styles.sectionSpacingCls}>{children}</div>
        </div>

        {footer ? <div className={styles.footerPaddingCls}>{footer}</div> : null}
      </form>
    </section>
  );
}
