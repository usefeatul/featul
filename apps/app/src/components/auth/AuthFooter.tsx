import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="px-4 py-6 text-center">
      <p className="text-xs text-white/85">
        By clicking &quot;Sign In&quot; you agree to the{" "}
        <Link
          href="https://www.featul.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and acknowledge the{" "}
        <Link
          href="https://www.featul.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white underline underline-offset-4"
        >
          Privacy Notice
        </Link>
        .
      </p>
    </footer>
  );
}

export default AuthFooter;
