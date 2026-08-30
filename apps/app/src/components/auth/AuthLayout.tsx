import type { FormEvent, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@featul/ui/components/card";

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
    sectionCls: "w-full",
    formCls: "m-auto h-fit w-full max-w-sm",
    bodyPaddingCls: "",
    footerPaddingCls: "",
    headingCls: "font-heading text-xl",
    sectionSpacingCls: "space-y-6",
    socialGapCls: "gap-3",
    dividerCls: "my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3",
    fieldSpacingCls: "space-y-2",
    pwdSpacingCls: "space-y-0.5",
    labelCls: "block text-sm",
    footerTextCls: "text-accent text-center text-sm font-normal",
    linkButtonCls: "px-2 text-primary",
    mutedTextCls: "text-xs text-muted-foreground",
    helperTextCls: "text-xs text-accent text-center",
    dividerHrCls: "border-dashed",
    dividerTextCls: "text-muted-foreground text-xs",
    secondaryActionCls:
      "text-sm font-medium text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer",
    errorTextCls: "text-destructive text-xs text-center",
    socialButtonVariant: "nav",
  };
}

export function AuthLayout({
  embedded = false,
  title,
  description,
  onSubmit,
  children,
  footer,
}: {
  embedded?: boolean;
  title: string;
  description?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const styles = getAuthLayoutStyles(embedded);

  if (embedded) {
    return (
      <section className={styles.sectionCls}>
        <form noValidate className={styles.formCls} onSubmit={onSubmit}>
          <div className={styles.bodyPaddingCls}>
            <h1 className="sr-only">{title}</h1>
            <div className={styles.sectionSpacingCls}>{children}</div>
          </div>
          {footer ? <div className={styles.footerPaddingCls}>{footer}</div> : null}
        </form>
      </section>
    );
  }

  return (
    <section className={styles.sectionCls}>
      <form noValidate className={styles.formCls} onSubmit={onSubmit}>
        <Card variant="plain" className="w-full bg-transparent dark:bg-transparent">
          <CardHeader>
            <CardTitle className={styles.headingCls}>{title}</CardTitle>
            {description ? (
              <CardDescription className="font-light text-accent">
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>

          <CardContent className={styles.sectionSpacingCls}>{children}</CardContent>

          {footer ? (
            <CardFooter className="flex-col items-stretch">{footer}</CardFooter>
          ) : null}
        </Card>
      </form>
    </section>
  );
}
