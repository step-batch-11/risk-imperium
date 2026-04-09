const main = () => {
  const gameInfoBtn = document.querySelector("#game-info-btn");

  gameInfoBtn.addEventListener("click", () => {
    const container = document.querySelector("main");
    container.classList.toggle("show-info");

    const info = document.querySelector(".show-info");

    const infoBtn = document.querySelector("#game-info-btn");
    infoBtn.innerHTML = info ? "&times;" : "&#9432;";
  });
};

globalThis.onload = main;
