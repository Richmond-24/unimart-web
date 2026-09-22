export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            try {
              const saved = localStorage.getItem("unimart-theme");
              const isValid = saved === "light" || saved === "dark";
              const theme = isValid ? saved : "light";

              document.documentElement.setAttribute("data-theme", theme);
              document.documentElement.style.colorScheme = theme;
            } catch (e) {
              document.documentElement.setAttribute("data-theme", "light");
              document.documentElement.style.colorScheme = "light";
            }
          })();
        `,
      }}
    />
  );
}