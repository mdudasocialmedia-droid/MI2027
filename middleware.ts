
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // O webhook e servidor-para-servidor; a rota valida o X-HOTMART-HOTTOK antes
  // de tocar no Supabase. Todas as rotas de utilizador continuam protegidas abaixo.
  // As páginas públicas não dependem de sessão. Retorná-las antes de criar o
  // cliente evita que uma prévia local da landing page exija credenciais Supabase.
  if (path === "/api/webhooks/hotmart" || path === "/luna") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const publicRoutes = [
    "/login",
    "/registro",
    "/recuperar",
    "/redefinir",
    "/luna",
  ];

  const isPublicRoute = publicRoutes.includes(path);

  // Verifica a identidade do usuário.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Sem login: direciona para a página de login.
  if ((authError || !user) && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Permite cadastro e recuperação de senha.
  if (isPublicRoute) {
    return response;
  }

  if (!user) {
    return response;
  }

  // Consulta a autorização de acesso no Supabase.
  const { data: access, error: accessError } = await supabase
    .from("user_access")
    .select("status, access_until")
    .eq("user_id", user.id)
    .maybeSingle();

  const isActive = access?.status === "active";

  const isNotExpired =
    !access?.access_until ||
    new Date(access.access_until).getTime() > Date.now();

  const hasAccess =
    !accessError && isActive && isNotExpired;

  // Sem autorização: bloqueia o planner.
  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/sem-acesso";
    url.search = "";

    if (path === "/sem-acesso") {
      return response;
    }

    return NextResponse.redirect(url);
  }

  // Usuário autorizado não precisa voltar ao login.
  if (path === "/sem-acesso") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
