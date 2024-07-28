document.addEventListener("DOMContentLoaded", () => {
  const gemsContainer = document.querySelector(".gems-container");
  const heroImage = document.getElementById("hero-image");
  const numberOfGems = 20;
  const imagePath = "assets/images/gem.svg";

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.7,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("Intersecting");
        gemsContainer.style.display = "block";
        generateGems();
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(heroImage);

  function generateGems() {
    for (let i = 0; i < numberOfGems; i++) {
      setTimeout(() => {
        // Use setTimeout to stagger the creation of gems
        const gem = document.createElement("img");
        gem.src = imagePath;
        gem.classList.add("gem");
        gem.alt = "Gem Icon";
        gem.style.left = `${Math.random() * 100}%`; // Randomize initial horizontal position

        gem.classList.add(
          "absolute",
          "top-0",
          "transform",
          "-translate-x-1/2",
          "opacity-0",
          "z-30",
          "animate-fall"
        );

        gemsContainer.appendChild(gem);
      }, i * 200);
    }
  }
});
