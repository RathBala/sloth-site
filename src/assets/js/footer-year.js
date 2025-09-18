const footerYearElement = document.getElementById('footer-year');

if (footerYearElement) {
  footerYearElement.textContent = new Date().getFullYear();
}
