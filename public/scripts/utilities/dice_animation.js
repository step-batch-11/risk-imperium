const FACE_ROTATIONS = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

const ANIMATIONS = {
  diceSpin: { duration: 1300, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
  wrapperFall: { duration: 800, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
  cubeExit: { duration: 360, easing: "ease-in" },
};

const DICE_SIDE_CONFIGS = {
  attacker: { color: "#f8f0dc", border: "#b89040", spinDir: 1 },
  defender: { color: "#e0f0ff", border: "#4090b8", spinDir: -1 },
};

const buildPips = (n) => {
  const grid = document.createElement("div");
  grid.className = `pip-grid pip-grid-${n}`;
  Array.from({ length: n }).forEach(() => {
    const pip = document.createElement("div");
    pip.className = "pip";
    grid.appendChild(pip);
  });
  return grid;
};

const buildFace = (cls, value) => {
  const face = document.createElement("div");
  face.className = `dice-face ${cls}`;
  face.appendChild(buildPips(value));
  return face;
};

const createCube = () => {
  const cube = document.createElement("div");
  cube.className = "dice-3d";
  const faces = [
    ["front", 1],
    ["back", 6],
    ["right", 2],
    ["left", 5],
    ["top", 3],
    ["bottom", 4],
  ];
  faces.forEach(([cls, val]) =>
    cube.appendChild(buildFace(`dice-face-${cls}`, val))
  );
  return cube;
};

const animate = (el, keyframes, options) =>
  el.animate(keyframes, { fill: "forwards", ...options });

const animateDice = (cube, value, spinDir = 1) => {
  const rot = FACE_ROTATIONS[value];
  const spins = 360 * spinDir;
  animate(
    cube,
    [
      { transform: "rotateX(0deg) rotateY(0deg)", offset: 0 },
      {
        transform: `rotateX(${spins * 0.3}deg) rotateY(${spins * 0.2}deg)`,
        offset: 0.25,
      },
      {
        transform: `rotateX(${spins * 0.7}deg) rotateY(${spins * 0.6}deg)`,
        offset: 0.6,
      },
      {
        transform: `rotateX(${spins * 0.9}deg) rotateY(${spins * 0.85}deg)`,
        offset: 0.82,
      },
      {
        transform: `rotateX(${rot.x + spins}deg) rotateY(${rot.y + spins}deg)`,
        offset: 1,
      },
    ],
    ANIMATIONS.diceSpin,
  );
};

const animateWrapperFall = (wrapper, delay, landY) => {
  animate(
    wrapper,
    [
      { transform: "translateY(-30vh)", opacity: 0 },
      { transform: "translateY(-30vh)", opacity: 0, offset: 0.05 },
      { transform: `translateY(${landY}px)`, opacity: 1 },
    ],
    { ...ANIMATIONS.wrapperFall, delay },
  );
};

const animateCubeExit = (cube) => {
  const current = getComputedStyle(cube).transform;
  cube.getAnimations().forEach((a) => a.cancel());
  cube.style.transform = current;

  animate(
    cube,
    [
      { transform: current, opacity: 1 },
      {
        transform: `${current} scale(1.1) translateY(-8px)`,
        opacity: 1,
        offset: 0.4,
      },
      { transform: `${current} scale(0.15) translateY(60px)`, opacity: 0 },
    ],
    ANIMATIONS.cubeExit,
  );
};

const getOverlay = () => {
  let el = document.getElementById("dice-overlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "dice-overlay";
    document.body.appendChild(el);
  }
  return el;
};

const getDiceColor = (side, index) => {
  const base = DICE_SIDE_CONFIGS[side];

  const attackerShades = ["#f8f0dc", "#f1d999", "#eac266"];
  const defenderShades = ["#e0f0ff", "#a8d4ff", "#6fb8ff"];

  if (side === "attacker") {
    return {
      bg: attackerShades[index % attackerShades.length],
      border: base.border,
    };
  }

  if (side === "defender") {
    return {
      bg: defenderShades[index % defenderShades.length],
      border: base.border,
    };
  }

  return { bg: base.color, border: base.border };
};

const createDiceWrapper = (side, index, totalDice) => {
  const config = DICE_SIDE_CONFIGS[side];
  const wrapper = document.createElement("div");
  wrapper.className = `dice-wrapper dice-${side}`;

  const spacing = 100;
  const startX = side === "attacker"
    ? 30 + index * ((spacing / globalThis.innerWidth) * 100)
    : 68 - (totalDice - index) * ((spacing / globalThis.innerWidth) * 100);
  wrapper.style.left = `${startX}%`;
  wrapper.style.top = "40%";

  const cube = createCube();
  const { bg, border } = getDiceColor(side, index);

  cube.querySelectorAll(".dice-face").forEach((face) => {
    face.style.background = bg;
    face.style.borderColor = border;
  });

  wrapper.appendChild(cube);
  return { wrapper, cube, spinDir: config.spinDir, landY: 20 };
};

export const showDiceAnimation = ([attackerDice, defenderDice]) => {
  const overlay = getOverlay();
  overlay.innerHTML = "";

  const cubes = [];

  attackerDice.forEach((value, i) => {
    const { wrapper, cube, spinDir, landY } = createDiceWrapper(
      "attacker",
      i,
      attackerDice.length,
    );
    overlay.appendChild(wrapper);
    animateWrapperFall(wrapper, i * 60, landY);
    setTimeout(() => animateDice(cube, value, spinDir), i * 60 + 80);
    cubes.push({ cube });
  });

  defenderDice.forEach((value, i) => {
    const { wrapper, cube, spinDir, landY } = createDiceWrapper(
      "defender",
      i,
      defenderDice.length,
    );
    overlay.appendChild(wrapper);
    animateWrapperFall(wrapper, i * 60, landY);
    setTimeout(() => animateDice(cube, value, spinDir), i * 60 + 80);
    cubes.push({ cube });
  });

  setTimeout(() => {
    cubes.forEach(({ cube }) => animateCubeExit(cube));
    setTimeout(() => (overlay.innerHTML = ""), 2000);
  }, 2000);
};
