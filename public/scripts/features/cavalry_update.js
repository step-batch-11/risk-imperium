export const updateCavalry = (positions) => {
  const cavalryPositions = document.querySelectorAll(".position");
  cavalryPositions.forEach((position, i) =>
    position.textContent = positions[i]
  );
};
