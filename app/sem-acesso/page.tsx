
export default function SemAcessoPage() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff0f6",
      padding: "24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "24px",
        maxWidth: "440px",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#a83b79" }}>
          Tu acceso aún no está activo
        </h1>
        <p style={{ color: "#555", lineHeight: 1.7 }}>
          Tu cuenta está creada, pero todavía
          no tiene acceso autorizado a Mi 2027.
        </p>
        <p style={{ color: "#555", lineHeight: 1.7 }}>
          Si ya compraste el planner,
          contacta con nuestro equipo.
        </p>
      </div>
    </main>
  );
}
