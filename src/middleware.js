/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 路径配置
const pathConfig = {
  // 完全公开的路径
  public: [
    "/",
    "/public",
    "/json",
    "/home",
    "/login",
    "/register",
    "/reset-password",
    "/activation",
    "/help",
    "/about",
    "/api*",
  ],
  
  // 需要认证的路径
  // protected: [
  //   "/mutation",
  //   "/transcriptome",
  //   "/immune",
  //   "/clinical", 
  //   "/biomarkers",
  //   "/dashboard",
  //   "/profile",
  //   "/user",
  // ],
  protected: [],
};

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  // 检查路径类型
  const isPublic = pathConfig.public.some(path => 
    pathname === path || pathname.startsWith(path + "/"),
  );
  
  const isProtected = pathConfig.protected.some(path => 
    pathname === path || pathname.startsWith(path + "/"),
  );

  // 公开路径直接放行
  if (isPublic) {
    // 如果是登录页面且有 token，重定向到首页或目标页面
    if (pathname === "/login" && token) {
      const redirectUrl = searchParams.get("redirect") || "/home";
      console.log(`🔄 Already logged in, redirecting from /login to ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 需要认证的路径
  if (isProtected) {
    if (!token) {

      console.log(`❌ No token, redirecting to login from: ${pathname}`, request.cookies.getAll());
      
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    console.log(`✅ Access granted for ${pathname}`);
    return NextResponse.next();
  }

  // 默认放行其他路径
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};