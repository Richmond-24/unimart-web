export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            try {
              const saved = localStorage.getItem("unimart-theme");
              const isValid = saved === "light" || saved === "dark";
              const theme = isValid ? saved : "dark"; // default to dark brand styling for all screens

              document.documentElement.setAttribute("data-theme", theme);
              document.documentElement.style.colorScheme = theme;
            } catch (e) {
              document.documentElement.setAttribute("data-theme", "dark");
              document.documentElement.style.colorScheme = "dark";
            }
          })();
        `,
      }}
    />
  );
}