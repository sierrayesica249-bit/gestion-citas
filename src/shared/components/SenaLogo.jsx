export default function SenaLogo({ size = 36, className = "" }) {
  return (
    <img
      src="/SENA.jpg"
      alt="Logo SENA"
      className={className}
      style={{ width: size, height: size, objectFit: "contain", maxWidth: "100%" }}
    />
  );
}
