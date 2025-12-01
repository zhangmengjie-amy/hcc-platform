// app/activation/page.jsx
import ResetPassword from "@/components/reset-password";

export default function ResetPasswordPage({ searchParams }) {
  return (
    <ResetPassword searchParams={searchParams} />
  );
}