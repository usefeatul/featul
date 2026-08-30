import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="shrink-0 px-2 pb-1 text-center">
      <p className="text-xs text-accent">
        By continuing you agree to the{" "}
        <Link
          href="https://www.featul.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="https://www.featul.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Privacy Notice
        </Link>
        .
      </p>
    </footer>
  );
}

export default AuthFooter;
