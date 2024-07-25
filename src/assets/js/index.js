document.addEventListener("DOMContentLoaded", () => {
  const gemsContainer = document.querySelector(".gems-container");
  const numberOfGems = 20; // Define how many gems you want

  for (let i = 0; i < numberOfGems; i++) {
    const gem = document.createElement("img");
    gem.src = "assets/images/gem.svg"; // Path to your SVG image
    gem.classList.add("gem");
    gem.alt = "Gem Icon";
    gem.style.opacity = 0; // Start hidden
    gem.style.transform = `rotate(${Math.random() * 360}deg)`; // Apply a random rotation
    gemsContainer.appendChild(gem);
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(handleIntersect, observerOptions);
  observer.observe(document.querySelector(".emergency-pot")); // Adjust this selector as needed

  function handleIntersect(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateGems();
        observer.unobserve(entry.target); // Stop observing after animation
      }
    });
  }

  function animateGems() {
    const gems = document.querySelectorAll(".gem");
    gems.forEach((gem, index) => {
      setTimeout(() => {
        gem.style.opacity = 1;
        gem.style.transform += ` translateY(${Math.random() * 50 - 25}px)`; // Add translateY keeping the rotation
      }, 100 * index); // Stagger the animation
    });
  }
});
