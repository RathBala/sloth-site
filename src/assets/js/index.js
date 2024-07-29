document.addEventListener("DOMContentLoaded", () => {
  const gemsContainer = document.querySelector(".gems-container");
  const heroImage = document.getElementById("hero-image");

  function logMetrics() {
    const bottomBoundary = heroImage.getBoundingClientRect().bottom;
    console.log("Hero Bottom Boundary:", bottomBoundary);
    console.log("Window Inner Height:", window.innerHeight);
  }

  function generateGems() {
    const numberOfGems = 20;
    const imagePath = "assets/images/gem.svg";
    const bottomBoundary = heroImage.getBoundingClientRect().bottom;

    for (let i = 0; i < numberOfGems; i++) {
      setTimeout(() => {
        const gem = document.createElement("img");
        gem.src = imagePath;
        gem.classList.add("gem");
        gem.alt = "Gem Icon";
        gem.style.left = `${Math.random() * 100}%`;

        const keyframes = [
          { transform: `translateY(-100px)`, opacity: 1 }, // Starts above the viewport
          { transform: `translateY(${bottomBoundary - 10}px)`, opacity: 1 }, // Moves to just above the bottom of the heroImage
          { transform: `translateY(${bottomBoundary}px)`, opacity: 0 }, // Ends at the bottom of the heroImage
        ];

        gem.animate(keyframes, {
          duration: 5000,
          iterations: Infinity,
          easing: "linear",
        });

        gemsContainer.appendChild(gem);
      }, i * 200);
    }
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.7,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gemsContainer.style.display = "block";
        generateGems();
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(heroImage);
  window.addEventListener("resize", () => {
    logMetrics(); // Log metrics separately when window resizes
    generateGems(); // Regenerate gems with the new boundary
  });

  // Optional: Log metrics on initial load or specific user actions
  logMetrics(); // Call this to log on page load
});
