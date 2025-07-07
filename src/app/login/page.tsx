import AuthForm from "../../components/auth-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div>
      <AuthForm type="login" />
      <p className="mt-4 text-center text-sm">
        Noch keinen Account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
} 