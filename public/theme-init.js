(function () {
  var storageKey = "uiThemeMode";
  var storedMode = "system";
  try {
    var localMode = window.localStorage.getItem(storageKey);
    if (localMode === "dark" || localMode === "light" || localMode === "system") {
      storedMode = localMode;
    }
  } catch (error) {
    storedMode = "system";
  }

  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var useDarkTheme = storedMode === "dark" || (storedMode === "system" && prefersDark);
  var resolvedTheme = useDarkTheme ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;
})();
