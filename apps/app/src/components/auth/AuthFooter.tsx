import Link from "next/link";

export function AuthFooter() {
    return (
        <footer className="bg-background text-center py-6 px-4">
            <p className="text-xs text-accent">
                By clicking "Sign In" you agree to the{" "}
                <Link
                    href="https://www.featul.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-medium"
                >
                    Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link
                    href="https://www.featul.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-medium"
                >
                    Privacy Notice
                </Link>
                .
            </p>
        </footer>
    );
}

export default AuthFooter;
