export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            try {
              const saved = localStorage.getItem("unimart-theme");
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              const isDark = saved ? saved === "dark" : prefersDark;
              const theme = isDark ? "dark" : "light";
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