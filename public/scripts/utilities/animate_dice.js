const FACE_ROT = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

export const ATTACKER_DICE_CONFIGS = [
  { leftPct: 12, landY: 20, spinDir: 1 },
  { leftPct: 24, landY: 25, spinDir: -1 },
  { leftPct: 36, landY: 30, spinDir: 1 },
];
export const DEFENDER_DICE_CONFIGS = [
  { leftPct: 60, landY: 25, spinDir: -1 },
  { leftPct: 72, landY: 20, spinDir: 1 },
];

const buildPips = (n) => {
  const grid = document.createElement("div");
  grid.className = `pip-grid pip-grid-${n}`;
  for (let i = 0; i < n; i++) {
    const pip = document.createElement("div");
    pip.className = "pip";
    grid.appendChild(pip);
  }
  return grid;
};

export const buildFace = (cls, value) => {
  const face = document.createElement("div");
  face.className = `dice-face ${cls}`;
  face.appendChild(buildPips(value));
  return face;
};

const createCube = () => {
  const cube = document.createElement("div");
  cube.className = "dice-3d";
  const faces = [
    ["dice-face-front", 1],
    ["dice-face-back", 6],
    ["dice-face-right", 2],
    ["dice-face-left", 5],
    ["dice-face-top", 3],
    ["dice-face-bottom", 4],
  ];
  faces.forEach(([cls, val]) => cube.appendChild(buildFace(cls, val)));

  return cube;
};

export const animateDice = (cube, targetValue, spinDir) => {
  const rot = FACE_ROT[targetValue];
  const spins = 360 * spinDir;
  const finalX = rot.x + spins;
  const finalY = rot.y + spins;

  cube.animate(
    [
      { transform: `rotateX(0deg) rotateY(0deg)`, offset: 0 },
      {
        transform: `rotateX(${spins * 0.3}deg) rotateY(${spins * 0.2}deg)`,
        offset: 0.25,
      },
      {
        transform: `rotateX(${spins * 0.7}deg) rotateY(${spins * 0.6}deg)`,
        offset: 0.60,
      },
      {
        transform: `rotateX(${spins * 0.9}deg) rotateY(${spins * 0.85}deg)`,
        offset: 0.82,
      },
      { transform: `rotateX(${finalX}deg) rotateY(${finalY}deg)`, offset: 1 },
    ],
    {
      duration: 1300,
      easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      fill: "forwards",
    },
  );
};

export const prepareOverlay = () => {
  const overlay = getOverlay();
  overlay.innerHTML = "";
  return overlay;
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

const triggerExitAnimation = (cubes, overlay) => {
  setTimeout(() => {
    cubes.forEach(({ cube }) => animateCubeExit(cube));

    setTimeout(() => {
      overlay.innerHTML = "";
    }, 2000);
  }, 2200);
};

export const animateCubeExit = (cube) => {
  const currentTransform = getComputedStyle(cube).transform;

  cube.getAnimations().forEach((anim) => anim.cancel());
  cube.style.transform = currentTransform;

  cube.animate(
    [
      { transform: currentTransform, opacity: 1 },
      {
        transform: `${currentTransform} scale(1.1) translateY(-8px)`,
        opacity: 1,
        offset: 0.4,
      },
      {
        transform: `${currentTransform} scale(0.15) translateY(60px)`,
        opacity: 0,
      },
    ],
    {
      duration: 360,
      easing: "ease-out",
      fill: "forwards",
    },
  );
};

const animateWrapperFall = (wrapper, delay, landY, direction) => {
  const startX = direction === "left" ? -40 : 80;
  const midX = direction === "left" ? -10 : 100;

  wrapper.animate(
    [
      { transform: `translate(${startX}vw, -30vh) `, opacity: 1 },
      { transform: `translate(${midX}vw, -10vh) `, opacity: 1, offset: 0.05 },
      { transform: `translate(0px, ${landY}px) scale(1)`, opacity: 1 },
    ],
    {
      duration: 800,
      delay,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
      fill: "forwards",
    },
  );
};

const createDiceCube = (overlay, config, playerType) => {
  const wrapper = document.createElement("div");

  wrapper.className = "dice-wrapper";
  wrapper.classList.add(playerType);

  wrapper.style.left = `${config.leftPct}%`;
  wrapper.style.top = "40%";

  const cube = createCube();

  wrapper.appendChild(cube);
  overlay.appendChild(wrapper);
  return { wrapper, cube };
};

export const showDiceAnimations = (
  overlay,
  diceValues,
  configs,
  playerType,
) => {
  const cubes = [];
  const direction = playerType === "attacker" ? "left" : "right";

  diceValues.forEach((value, index) => {
    const config = configs[index];
    const cubeObj = createDiceCube(overlay, config, playerType);
    cubes.push(cubeObj);

    animateWrapperFall(cubeObj.wrapper, index * 60, config.landY, direction);

    setTimeout(() => {
      animateDice(cubeObj.cube, value, config.spinDir);
    }, index * 60 + 80);
  });

  triggerExitAnimation(cubes, overlay);
};
