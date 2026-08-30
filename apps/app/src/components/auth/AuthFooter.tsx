import Link from "next/link";

export function AuthFooter() {
  return (
    <p className="text-center text-xs text-accent">
      By continuing you agree to our{" "}
      <Link
        href="https://www.featul.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4"
      >
        Terms
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
  );
}

export default AuthFooter;
