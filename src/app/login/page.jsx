// app/login/page.jsx
import { Suspense } from "react";
import Login from "@/components/Login";

export default function LoginPage({ searchParams }) {
  return (
    <Login searchParams={searchParams} />
  );
}