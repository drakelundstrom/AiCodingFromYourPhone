import { useEffect, useRef, useState } from 'react'

const WORLD_WIDTH = 960
const WORLD_HEIGHT = 540
const GAME_SECONDS = 120
const GOAT_RADIUS = 26

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
type ObjectiveKind = 'eat' | 'ram' | 'bells' | 'scare' | 'combo'
type InputKey =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'sprint'
  | 'jump'
  | 'ram'
  | 'bleat'
  | 'chomp'

type InputState = Record<InputKey, boolean>

type Goat = {
  x: number
  y: number
  vx: number
  vy: number
  z: number
  vz: number
  facingX: number
  facingY: number
  stamina: number
  hunger: number
  ramCooldown: number
  ramActive: number
  bleatCooldown: number
  eatCooldown: number
}

type GrassPatch = {
  id: number
  x: number
  y: number
  r: number
  eaten: boolean
  respawnAt: number
}

type PropKind = 'crate' | 'hay' | 'barrel' | 'picnic'

type YardProp = {
  id: number
  kind: PropKind
  x: number
  y: number
  w: number
  h: number
  health: number
  maxHealth: number
  knocked: boolean
  respawnAt: number
  hitCooldown: number
  shake: number
}

type Bell = {
  id: number
  x: number
  y: number
  collected: boolean
  respawnAt: number
}

type Farmer = {
  x: number
  y: number
  speed: number
  routeIndex: number
  panic: number
  scareCooldown: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  text?: string
}

type Objective = {
  kind: ObjectiveKind
  label: string
  progress: number
  target: number
  completed: boolean
}

type GameData = {
  status: GameStatus
  score: number
  timeLeft: number
  clock: number
  chaos: number
  combo: number
  comboTime: number
  goat: Goat
  grass: GrassPatch[]
  props: YardProp[]
  bells: Bell[]
  farmer: Farmer
  objectives: Objective[]
  particles: Particle[]
  lastTime: number
  lastHudSync: number
  message: string
}

type HudState = {
  status: GameStatus
  score: number
  timeLeft: number
  stamina: number
  hunger: number
  chaos: number
  combo: number
  missionLabel: string
  missionProgress: number
  missionTarget: number
  completedMissions: number
  totalMissions: number
  message: string
}

const farmerRoute = [
  { x: 740, y: 120 },
  { x: 830, y: 250 },
  { x: 690, y: 420 },
  { x: 545, y: 275 },
]

const emptyInput = (): InputState => ({
  up: false,
  down: false,
  left: false,
  right: false,
  sprint: false,
  jump: false,
  ram: false,
  bleat: false,
  chomp: false,
})

const createGrass = (): GrassPatch[] => [
  { id: 1, x: 104, y: 120, r: 18, eaten: false, respawnAt: 0 },
  { id: 2, x: 210, y: 96, r: 20, eaten: false, respawnAt: 0 },
  { id: 3, x: 366, y: 138, r: 17, eaten: false, respawnAt: 0 },
  { id: 4, x: 164, y: 268, r: 19, eaten: false, respawnAt: 0 },
  { id: 5, x: 288, y: 348, r: 22, eaten: false, respawnAt: 0 },
  { id: 6, x: 448, y: 432, r: 19, eaten: false, respawnAt: 0 },
  { id: 7, x: 594, y: 376, r: 18, eaten: false, respawnAt: 0 },
  { id: 8, x: 790, y: 452, r: 21, eaten: false, respawnAt: 0 },
  { id: 9, x: 835, y: 178, r: 18, eaten: false, respawnAt: 0 },
  { id: 10, x: 636, y: 92, r: 20, eaten: false, respawnAt: 0 },
]

const createProps = (): YardProp[] => [
  {
    id: 1,
    kind: 'crate',
    x: 320,
    y: 236,
    w: 54,
    h: 44,
    health: 2,
    maxHealth: 2,
    knocked: false,
    respawnAt: 0,
    hitCooldown: 0,
    shake: 0,
  },
  {
    id: 2,
    kind: 'barrel',
    x: 504,
    y: 160,
    w: 46,
    h: 52,
    health: 2,
    maxHealth: 2,
    knocked: false,
    respawnAt: 0,
    hitCooldown: 0,
    shake: 0,
  },
  {
    id: 3,
    kind: 'hay',
    x: 646,
    y: 248,
    w: 68,
    h: 48,
    health: 3,
    maxHealth: 3,
    knocked: false,
    respawnAt: 0,
    hitCooldown: 0,
    shake: 0,
  },
  {
    id: 4,
    kind: 'picnic',
    x: 760,
    y: 340,
    w: 76,
    h: 44,
    health: 2,
    maxHealth: 2,
    knocked: false,
    respawnAt: 0,
    hitCooldown: 0,
    shake: 0,
  },
  {
    id: 5,
    kind: 'crate',
    x: 170,
    y: 420,
    w: 58,
    h: 46,
    health: 2,
    maxHealth: 2,
    knocked: false,
    respawnAt: 0,
    hitCooldown: 0,
    shake: 0,
  },
]

const createBells = (): Bell[] => [
  { id: 1, x: 84, y: 455, collected: false, respawnAt: 0 },
  { id: 2, x: 436, y: 78, collected: false, respawnAt: 0 },
  { id: 3, x: 885, y: 82, collected: false, respawnAt: 0 },
  { id: 4, x: 872, y: 430, collected: false, respawnAt: 0 },
]

const createObjectives = (): Objective[] => [
  {
    kind: 'eat',
    label: 'Pasture Feast',
    progress: 0,
    target: 6,
    completed: false,
  },
  {
    kind: 'ram',
    label: 'Barnyard Bash',
    progress: 0,
    target: 4,
    completed: false,
  },
  {
    kind: 'bells',
    label: 'Bell Roundup',
    progress: 0,
    target: 4,
    completed: false,
  },
  {
    kind: 'scare',
    label: 'Farmer Frenzy',
    progress: 0,
    target: 2,
    completed: false,
  },
  {
    kind: 'combo',
    label: 'Five-Hop Combo',
    progress: 0,
    target: 5,
    completed: false,
  },
]

const createGame = (status: GameStatus = 'ready'): GameData => ({
  status,
  score: 0,
  timeLeft: GAME_SECONDS,
  clock: 0,
  chaos: 0,
  combo: 0,
  comboTime: 0,
  goat: {
    x: 126,
    y: 340,
    vx: 0,
    vy: 0,
    z: 0,
    vz: 0,
    facingX: 1,
    facingY: 0,
    stamina: 100,
    hunger: 72,
    ramCooldown: 0,
    ramActive: 0,
    bleatCooldown: 0,
    eatCooldown: 0,
  },
  grass: createGrass(),
  props: createProps(),
  bells: createBells(),
  farmer: {
    x: 740,
    y: 120,
    speed: 58,
    routeIndex: 0,
    panic: 0,
    scareCooldown: 0,
  },
  objectives: createObjectives(),
  particles: [],
  lastTime: performance.now(),
  lastHudSync: 0,
  message: status === 'ready' ? 'Sunny Acres' : 'Run wild',
})

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const distance = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by)

const toHud = (game: GameData): HudState => {
  const activeMission =
    game.objectives.find((objective) => !objective.completed) ??
    game.objectives[game.objectives.length - 1]
  const completedMissions = game.objectives.filter(
    (objective) => objective.completed,
  ).length

  return {
    status: game.status,
    score: game.score,
    timeLeft: Math.max(0, Math.ceil(game.timeLeft)),
    stamina: Math.round(game.goat.stamina),
    hunger: Math.round(game.goat.hunger),
    chaos: Math.round(game.chaos),
    combo: game.combo,
    missionLabel:
      completedMissions === game.objectives.length
        ? 'Goat Legend'
        : activeMission.label,
    missionProgress:
      completedMissions === game.objectives.length
        ? game.objectives.length
        : activeMission.progress,
    missionTarget:
      completedMissions === game.objectives.length
        ? game.objectives.length
        : activeMission.target,
    completedMissions,
    totalMissions: game.objectives.length,
    message: game.message,
  }
}

const addParticle = (
  game: GameData,
  x: number,
  y: number,
  color: string,
  text?: string,
) => {
  game.particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 82,
    vy: -34 - Math.random() * 58,
    life: 0.9,
    maxLife: 0.9,
    color,
    size: text ? 18 : 5 + Math.random() * 6,
    text,
  })
}

const grantPoints = (
  game: GameData,
  points: number,
  x: number,
  y: number,
  label: string,
) => {
  const multiplier = 1 + Math.min(3, game.combo) * 0.15
  const earned = Math.round(points * multiplier)

  game.score += earned
  addParticle(game, x, y, '#fff6a8', `${label} +${earned}`)
}

const advanceObjective = (
  game: GameData,
  kind: ObjectiveKind,
  amount: number,
) => {
  const objective = game.objectives.find((mission) => mission.kind === kind)

  if (!objective || objective.completed) {
    return
  }

  objective.progress = clamp(objective.progress + amount, 0, objective.target)

  if (objective.progress >= objective.target) {
    objective.completed = true
    game.score += 75
    game.chaos = clamp(game.chaos + 14, 0, 100)
    game.message = `${objective.label} cleared`
    addParticle(game, WORLD_WIDTH / 2, 108, '#2c1464', 'MISSION +75')

    if (game.objectives.every((mission) => mission.completed)) {
      game.status = 'won'
      game.message = 'Goat Legend'
    }
  }
}

const recordCombo = (game: GameData) => {
  game.combo = clamp(game.combo + 1, 0, 12)
  game.comboTime = 3.4

  const comboObjective = game.objectives.find(
    (mission) => mission.kind === 'combo',
  )

  if (comboObjective && !comboObjective.completed) {
    comboObjective.progress = Math.max(
      comboObjective.progress,
      Math.min(game.combo, comboObjective.target),
    )

    if (comboObjective.progress >= comboObjective.target) {
      advanceObjective(game, 'combo', comboObjective.target)
    }
  }
}

const circleIntersectsRect = (
  cx: number,
  cy: number,
  radius: number,
  prop: YardProp,
) => {
  const closestX = clamp(cx, prop.x - prop.w / 2, prop.x + prop.w / 2)
  const closestY = clamp(cy, prop.y - prop.h / 2, prop.y + prop.h / 2)

  return distance(cx, cy, closestX, closestY) < radius
}

const shoveFromProp = (goat: Goat, prop: YardProp) => {
  const dx = goat.x - prop.x
  const dy = goat.y - prop.y
  const length = Math.max(1, Math.hypot(dx, dy))

  goat.x = clamp(goat.x + (dx / length) * 9, 34, WORLD_WIDTH - 34)
  goat.y = clamp(goat.y + (dy / length) * 9, 48, WORLD_HEIGHT - 40)
  goat.vx *= -0.2
  goat.vy *= -0.2
}

const damageProp = (game: GameData, prop: YardProp) => {
  if (prop.hitCooldown > 0 || prop.knocked) {
    return
  }

  prop.hitCooldown = 0.32
  prop.shake = 0.26
  prop.health -= 1
  game.chaos = clamp(game.chaos + 5, 0, 100)
  addParticle(game, prop.x, prop.y - 18, '#ff7043')

  if (prop.health <= 0) {
    prop.knocked = true
    prop.respawnAt = game.clock + 18
    recordCombo(game)
    grantPoints(game, 30, prop.x, prop.y - 28, 'BASH')
    advanceObjective(game, 'ram', 1)
  }
}

const scareFarmer = (game: GameData, power: number) => {
  const farmer = game.farmer

  if (farmer.scareCooldown > 0) {
    return
  }

  farmer.panic = Math.max(farmer.panic, 2.4 + power)
  farmer.scareCooldown = 2.1
  game.chaos = clamp(game.chaos + 8, 0, 100)
  recordCombo(game)
  grantPoints(game, 24, farmer.x, farmer.y - 34, 'BLAAT')
  advanceObjective(game, 'scare', 1)
}

const updateGoat = (game: GameData, input: InputState, dt: number) => {
  const goat = game.goat
  const moveX = Number(input.right) - Number(input.left)
  const moveY = Number(input.down) - Number(input.up)
  const moving = moveX !== 0 || moveY !== 0
  const length = moving ? Math.hypot(moveX, moveY) : 1
  const dirX = moveX / length
  const dirY = moveY / length
  const sprinting = input.sprint && goat.stamina > 5 && moving
  const speed = sprinting ? 205 : 132
  const hungerDrag = goat.hunger < 15 ? 0.72 : 1

  if (moving) {
    goat.facingX = dirX || goat.facingX
    goat.facingY = dirY
  }

  goat.vx += (dirX * speed * hungerDrag - goat.vx) * Math.min(1, dt * 10)
  goat.vy += (dirY * speed * hungerDrag - goat.vy) * Math.min(1, dt * 10)
  goat.x = clamp(goat.x + goat.vx * dt, 36, WORLD_WIDTH - 36)
  goat.y = clamp(goat.y + goat.vy * dt, 52, WORLD_HEIGHT - 36)

  if (sprinting) {
    goat.stamina = clamp(goat.stamina - 24 * dt, 0, 100)
  } else {
    goat.stamina = clamp(goat.stamina + 13 * dt, 0, 100)
  }

  goat.hunger = clamp(goat.hunger - (moving ? 1.4 : 0.45) * dt, 0, 100)
  goat.ramCooldown = Math.max(0, goat.ramCooldown - dt)
  goat.ramActive = Math.max(0, goat.ramActive - dt)
  goat.bleatCooldown = Math.max(0, goat.bleatCooldown - dt)
  goat.eatCooldown = Math.max(0, goat.eatCooldown - dt)

  if (input.jump && goat.z === 0 && goat.stamina > 8) {
    goat.vz = 360
    goat.stamina = clamp(goat.stamina - 8, 0, 100)
    addParticle(game, goat.x, goat.y + 18, '#ffffff')
  }

  if (goat.z > 0 || goat.vz > 0) {
    goat.z = Math.max(0, goat.z + goat.vz * dt)
    goat.vz -= 860 * dt

    if (goat.z === 0) {
      goat.vz = 0
      addParticle(game, goat.x, goat.y + 20, '#e6f4a2')
    }
  }

  if (input.ram && goat.ramCooldown === 0 && goat.stamina > 12) {
    goat.ramCooldown = 0.58
    goat.ramActive = 0.24
    goat.stamina = clamp(goat.stamina - 12, 0, 100)
    goat.vx += goat.facingX * 185
    goat.vy += goat.facingY * 185
    addParticle(game, goat.x + goat.facingX * 26, goat.y - 4, '#ffdf6d')
  }

  if (input.bleat && goat.bleatCooldown === 0) {
    goat.bleatCooldown = 1.5
    game.message = 'Blaat!'
    addParticle(game, goat.x, goat.y - 38, '#2c1464', 'BLAAT')

    if (distance(goat.x, goat.y, game.farmer.x, game.farmer.y) < 155) {
      scareFarmer(game, 0.6)
    }
  }

  if (input.chomp && goat.eatCooldown === 0) {
    goat.eatCooldown = 0.34
    const grass = game.grass.find(
      (patch) =>
        !patch.eaten && distance(goat.x, goat.y, patch.x, patch.y) < patch.r + 34,
    )

    if (grass) {
      grass.eaten = true
      grass.respawnAt = game.clock + 16
      goat.hunger = clamp(goat.hunger + 17, 0, 100)
      goat.stamina = clamp(goat.stamina + 9, 0, 100)
      recordCombo(game)
      grantPoints(game, 14, grass.x, grass.y - 16, 'CHOMP')
      advanceObjective(game, 'eat', 1)
      addParticle(game, grass.x, grass.y, '#5da83c')
    }
  }
}

const updateWorld = (game: GameData, input: InputState, dt: number) => {
  game.clock += dt
  game.timeLeft = Math.max(0, game.timeLeft - dt)

  if (game.timeLeft === 0) {
    game.status = 'lost'
    game.message = 'Pasture Closed'
  }

  if (game.comboTime > 0) {
    game.comboTime = Math.max(0, game.comboTime - dt)

    if (game.comboTime === 0) {
      game.combo = 0
    }
  }

  updateGoat(game, input, dt)

  game.grass.forEach((grass) => {
    if (grass.eaten && game.clock >= grass.respawnAt) {
      grass.eaten = false
    }
  })

  game.bells.forEach((bell) => {
    if (bell.collected && game.clock >= bell.respawnAt) {
      bell.collected = false
    }

    if (
      !bell.collected &&
      distance(game.goat.x, game.goat.y, bell.x, bell.y) < 32
    ) {
      bell.collected = true
      bell.respawnAt = game.clock + 22
      recordCombo(game)
      grantPoints(game, 22, bell.x, bell.y - 18, 'BELL')
      advanceObjective(game, 'bells', 1)
    }
  })

  game.props.forEach((prop) => {
    prop.hitCooldown = Math.max(0, prop.hitCooldown - dt)
    prop.shake = Math.max(0, prop.shake - dt)

    if (prop.knocked && game.clock >= prop.respawnAt) {
      prop.knocked = false
      prop.health = prop.maxHealth
    }

    if (!prop.knocked && circleIntersectsRect(game.goat.x, game.goat.y, GOAT_RADIUS, prop)) {
      if (game.goat.ramActive > 0 || game.goat.z > 42) {
        damageProp(game, prop)
      } else {
        shoveFromProp(game.goat, prop)
      }
    }
  })

  if (
    game.goat.ramActive > 0 &&
    distance(game.goat.x, game.goat.y, game.farmer.x, game.farmer.y) < 55
  ) {
    scareFarmer(game, 0.9)
  }

  updateFarmer(game, dt)
  updateParticles(game, dt)
}

const updateFarmer = (game: GameData, dt: number) => {
  const farmer = game.farmer

  farmer.scareCooldown = Math.max(0, farmer.scareCooldown - dt)

  if (farmer.panic > 0) {
    farmer.panic = Math.max(0, farmer.panic - dt)
    const dx = farmer.x - game.goat.x
    const dy = farmer.y - game.goat.y
    const length = Math.max(1, Math.hypot(dx, dy))

    farmer.x = clamp(farmer.x + (dx / length) * 148 * dt, 70, WORLD_WIDTH - 70)
    farmer.y = clamp(farmer.y + (dy / length) * 148 * dt, 70, WORLD_HEIGHT - 70)
    return
  }

  const target = farmerRoute[farmer.routeIndex]
  const dx = target.x - farmer.x
  const dy = target.y - farmer.y
  const length = Math.max(1, Math.hypot(dx, dy))

  if (length < 12) {
    farmer.routeIndex = (farmer.routeIndex + 1) % farmerRoute.length
  } else {
    farmer.x += (dx / length) * farmer.speed * dt
    farmer.y += (dy / length) * farmer.speed * dt
  }
}

const updateParticles = (game: GameData, dt: number) => {
  game.particles = game.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vy: particle.vy + 44 * dt,
      life: particle.life - dt,
    }))
    .filter((particle) => particle.life > 0)
}

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fill()
}

const drawField = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#84c86a'
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  ctx.fillStyle = '#77ba60'
  for (let y = 0; y < WORLD_HEIGHT; y += 54) {
    ctx.fillRect(0, y, WORLD_WIDTH, 20)
  }

  ctx.fillStyle = '#ceb279'
  ctx.beginPath()
  ctx.moveTo(0, 312)
  ctx.bezierCurveTo(180, 270, 320, 312, 454, 278)
  ctx.bezierCurveTo(600, 240, 724, 260, 960, 218)
  ctx.lineTo(960, 286)
  ctx.bezierCurveTo(700, 330, 560, 315, 438, 350)
  ctx.bezierCurveTo(280, 394, 132, 345, 0, 388)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#8bd2f4'
  ctx.beginPath()
  ctx.ellipse(846, 278, 78, 43, -0.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(36, 109, 130, 0.35)'
  ctx.lineWidth = 5
  ctx.stroke()

  drawBarn(ctx)
  drawTrees(ctx)
  drawFence(ctx)
}

const drawBarn = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#a63f3f'
  drawRoundedRect(ctx, 42, 46, 152, 110, 7)
  ctx.fillStyle = '#68282e'
  ctx.beginPath()
  ctx.moveTo(28, 58)
  ctx.lineTo(118, 8)
  ctx.lineTo(210, 58)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f2c971'
  ctx.fillRect(92, 106, 50, 50)
  ctx.strokeStyle = '#783332'
  ctx.lineWidth = 4
  ctx.strokeRect(92, 106, 50, 50)
  ctx.beginPath()
  ctx.moveTo(94, 108)
  ctx.lineTo(140, 154)
  ctx.moveTo(140, 108)
  ctx.lineTo(94, 154)
  ctx.stroke()
}

const drawTrees = (ctx: CanvasRenderingContext2D) => {
  const trees = [
    { x: 260, y: 64, s: 1 },
    { x: 914, y: 130, s: 0.85 },
    { x: 584, y: 496, s: 0.95 },
  ]

  trees.forEach((tree) => {
    ctx.fillStyle = '#85552d'
    ctx.fillRect(tree.x - 8 * tree.s, tree.y + 16 * tree.s, 16 * tree.s, 34 * tree.s)
    ctx.fillStyle = '#357f4c'
    ctx.beginPath()
    ctx.arc(tree.x, tree.y, 30 * tree.s, 0, Math.PI * 2)
    ctx.arc(tree.x - 22 * tree.s, tree.y + 18 * tree.s, 24 * tree.s, 0, Math.PI * 2)
    ctx.arc(tree.x + 22 * tree.s, tree.y + 18 * tree.s, 24 * tree.s, 0, Math.PI * 2)
    ctx.fill()
  })
}

const drawFence = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = '#f5e8bd'
  ctx.lineWidth = 7

  for (let x = 242; x < 900; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 36)
    ctx.lineTo(x + 34, 42)
    ctx.stroke()
  }

  for (let x = 24; x < 928; x += 66) {
    ctx.beginPath()
    ctx.moveTo(x, 508)
    ctx.lineTo(x + 40, 500)
    ctx.stroke()
  }
}

const drawGrass = (ctx: CanvasRenderingContext2D, grass: GrassPatch) => {
  if (grass.eaten) {
    ctx.fillStyle = 'rgba(82, 116, 52, 0.42)'
    ctx.beginPath()
    ctx.ellipse(grass.x, grass.y + 4, grass.r * 0.7, grass.r * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  ctx.strokeStyle = '#3f8f35'
  ctx.lineWidth = 3

  for (let blade = 0; blade < 9; blade += 1) {
    const angle = -Math.PI / 2 + (blade - 4) * 0.18
    const startX = grass.x + (blade - 4) * 3
    ctx.beginPath()
    ctx.moveTo(startX, grass.y + grass.r * 0.45)
    ctx.lineTo(
      startX + Math.cos(angle) * grass.r * 0.7,
      grass.y + Math.sin(angle) * grass.r,
    )
    ctx.stroke()
  }

  ctx.fillStyle = '#62b846'
  ctx.beginPath()
  ctx.ellipse(grass.x, grass.y + grass.r * 0.4, grass.r, grass.r * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
}

const drawProp = (ctx: CanvasRenderingContext2D, prop: YardProp) => {
  const shakeX = prop.shake > 0 ? Math.sin(prop.shake * 80) * 3 : 0

  ctx.save()
  ctx.translate(prop.x + shakeX, prop.y)

  if (prop.knocked) {
    ctx.globalAlpha = 0.42
    ctx.rotate(0.14)
  }

  if (prop.kind === 'crate') {
    ctx.fillStyle = '#b7723d'
    drawRoundedRect(ctx, -prop.w / 2, -prop.h / 2, prop.w, prop.h, 5)
    ctx.strokeStyle = '#70411f'
    ctx.lineWidth = 4
    ctx.strokeRect(-prop.w / 2 + 5, -prop.h / 2 + 5, prop.w - 10, prop.h - 10)
    ctx.beginPath()
    ctx.moveTo(-prop.w / 2 + 7, -prop.h / 2 + 7)
    ctx.lineTo(prop.w / 2 - 7, prop.h / 2 - 7)
    ctx.moveTo(prop.w / 2 - 7, -prop.h / 2 + 7)
    ctx.lineTo(-prop.w / 2 + 7, prop.h / 2 - 7)
    ctx.stroke()
  }

  if (prop.kind === 'hay') {
    ctx.fillStyle = '#e8c455'
    drawRoundedRect(ctx, -prop.w / 2, -prop.h / 2, prop.w, prop.h, 10)
    ctx.strokeStyle = '#a47f2c'
    ctx.lineWidth = 3
    for (let y = -16; y <= 16; y += 11) {
      ctx.beginPath()
      ctx.moveTo(-prop.w / 2 + 8, y)
      ctx.lineTo(prop.w / 2 - 8, y + 4)
      ctx.stroke()
    }
  }

  if (prop.kind === 'barrel') {
    ctx.fillStyle = '#7b4b35'
    ctx.beginPath()
    ctx.ellipse(0, 0, prop.w / 2, prop.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#d7c59c'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(-prop.w / 2 + 4, -12)
    ctx.lineTo(prop.w / 2 - 4, -12)
    ctx.moveTo(-prop.w / 2 + 4, 12)
    ctx.lineTo(prop.w / 2 - 4, 12)
    ctx.stroke()
  }

  if (prop.kind === 'picnic') {
    ctx.fillStyle = '#f4f0e4'
    drawRoundedRect(ctx, -prop.w / 2, -prop.h / 2, prop.w, prop.h, 6)
    ctx.fillStyle = '#d54848'
    for (let x = -prop.w / 2; x < prop.w / 2; x += 16) {
      ctx.fillRect(x, -prop.h / 2, 8, prop.h)
    }
    for (let y = -prop.h / 2; y < prop.h / 2; y += 16) {
      ctx.fillRect(-prop.w / 2, y, prop.w, 8)
    }
  }

  ctx.restore()
}

const drawBell = (ctx: CanvasRenderingContext2D, bell: Bell, clock: number) => {
  if (bell.collected) {
    return
  }

  const bob = Math.sin(clock * 4 + bell.id) * 4

  ctx.save()
  ctx.translate(bell.x, bell.y + bob)
  ctx.fillStyle = '#ffd95b'
  ctx.beginPath()
  ctx.moveTo(-13, 11)
  ctx.quadraticCurveTo(-11, -13, 0, -17)
  ctx.quadraticCurveTo(12, -13, 13, 11)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#9d7422'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = '#6e4b10'
  ctx.beginPath()
  ctx.arc(0, 14, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawFarmer = (ctx: CanvasRenderingContext2D, farmer: Farmer) => {
  const panicOffset = farmer.panic > 0 ? Math.sin(farmer.panic * 28) * 5 : 0

  ctx.save()
  ctx.translate(farmer.x + panicOffset, farmer.y)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.beginPath()
  ctx.ellipse(0, 26, 25, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2f6f97'
  drawRoundedRect(ctx, -15, -12, 30, 40, 8)
  ctx.fillStyle = '#f0bb81'
  ctx.beginPath()
  ctx.arc(0, -28, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#d3aa44'
  ctx.beginPath()
  ctx.ellipse(0, -42, 28, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(-13, -48, 26, 10)
  ctx.strokeStyle = '#143d5b'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(-8, 27)
  ctx.lineTo(-13, 48)
  ctx.moveTo(8, 27)
  ctx.lineTo(13, 48)
  ctx.stroke()

  if (farmer.panic > 0) {
    ctx.fillStyle = '#2c1464'
    ctx.font = '800 20px Space Grotesk, sans-serif'
    ctx.fillText('!', 20, -44)
  }

  ctx.restore()
}

const drawGoat = (ctx: CanvasRenderingContext2D, goat: Goat) => {
  const faceX = goat.facingX < 0 ? -1 : 1
  const jumpOffset = goat.z * 0.34

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.beginPath()
  ctx.ellipse(goat.x, goat.y + 25, 34 - jumpOffset * 0.08, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(goat.x, goat.y - jumpOffset)
  ctx.scale(faceX, 1)

  if (goat.ramActive > 0) {
    ctx.strokeStyle = '#fff3a4'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-44, -10)
    ctx.lineTo(-70, -20)
    ctx.moveTo(-42, 2)
    ctx.lineTo(-72, 6)
    ctx.stroke()
  }

  ctx.fillStyle = '#fff7df'
  ctx.beginPath()
  ctx.ellipse(0, 0, 36, 22, 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#d3c4a7'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.strokeStyle = '#5d4d3e'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(-18, 16)
  ctx.lineTo(-22, 40)
  ctx.moveTo(16, 16)
  ctx.lineTo(19, 40)
  ctx.stroke()

  ctx.fillStyle = '#fff7df'
  ctx.beginPath()
  ctx.ellipse(35, -13, 22, 17, -0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = '#5f4933'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(37, -27)
  ctx.quadraticCurveTo(42, -44, 51, -30)
  ctx.moveTo(24, -26)
  ctx.quadraticCurveTo(18, -44, 9, -29)
  ctx.stroke()

  ctx.fillStyle = '#2b2733'
  ctx.beginPath()
  ctx.arc(43, -17, 3.8, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#5d4d3e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(52, -8)
  ctx.quadraticCurveTo(61, -4, 52, 0)
  ctx.moveTo(40, 2)
  ctx.lineTo(43, 18)
  ctx.stroke()

  ctx.strokeStyle = '#fff7df'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(-34, -5)
  ctx.quadraticCurveTo(-50, -18, -58, -6)
  ctx.stroke()

  ctx.restore()
}

const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  particles.forEach((particle) => {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1)

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color

    if (particle.text) {
      ctx.font = '800 18px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 4
      ctx.strokeText(particle.text, particle.x, particle.y)
      ctx.fillText(particle.text, particle.x, particle.y)
    } else {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  })
}

const drawGame = (ctx: CanvasRenderingContext2D, game: GameData) => {
  drawField(ctx)

  game.grass.forEach((grass) => drawGrass(ctx, grass))
  game.bells.forEach((bell) => drawBell(ctx, bell, game.clock))
  game.props.forEach((prop) => drawProp(ctx, prop))
  drawFarmer(ctx, game.farmer)
  drawGoat(ctx, game.goat)
  drawParticles(ctx, game.particles)
}

export default function GoatSimulatorPage() {
  const [initialGame] = useState(createGame)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gameRef = useRef<GameData>(initialGame)
  const inputRef = useRef<InputState>(emptyInput())
  const animationRef = useRef<number | null>(null)
  const [hud, setHud] = useState(() => toHud(initialGame))

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return undefined
    }

    const setKey = (code: string, pressed: boolean) => {
      const input = inputRef.current
      const handledCodes = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'ShiftLeft',
        'ShiftRight',
        'Space',
        'KeyE',
        'KeyF',
        'KeyQ',
      ]

      if (!handledCodes.includes(code)) {
        return false
      }

      input.up = code === 'ArrowUp' || code === 'KeyW' ? pressed : input.up
      input.down =
        code === 'ArrowDown' || code === 'KeyS' ? pressed : input.down
      input.left =
        code === 'ArrowLeft' || code === 'KeyA' ? pressed : input.left
      input.right =
        code === 'ArrowRight' || code === 'KeyD' ? pressed : input.right
      input.sprint =
        code === 'ShiftLeft' || code === 'ShiftRight' ? pressed : input.sprint
      input.jump = code === 'Space' ? pressed : input.jump
      input.ram = code === 'KeyE' ? pressed : input.ram
      input.bleat = code === 'KeyF' ? pressed : input.bleat
      input.chomp = code === 'KeyQ' ? pressed : input.chomp

      return true
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (setKey(event.code, true)) {
        event.preventDefault()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (setKey(event.code, false)) {
        event.preventDefault()
      }
    }

    const tick = (time: number) => {
      const game = gameRef.current
      const dt = Math.min(0.04, (time - game.lastTime) / 1000 || 0)

      game.lastTime = time

      if (game.status === 'playing') {
        updateWorld(game, inputRef.current, dt)
      }

      drawGame(context, game)

      if (time - game.lastHudSync > 80) {
        game.lastHudSync = time
        setHud(toHud(game))
      }

      animationRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    animationRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startGame = () => {
    gameRef.current = createGame('playing')
    inputRef.current = emptyInput()
    setHud(toHud(gameRef.current))
    window.requestAnimationFrame(() => canvasRef.current?.focus())
  }

  const setControl = (key: InputKey, pressed: boolean) => {
    inputRef.current[key] = pressed
    canvasRef.current?.focus()
  }

  const releaseAction = (key: InputKey) => {
    inputRef.current[key] = false
  }

  const statusAction = hud.status === 'playing' ? null : (
    <div className="goat-overlay">
      <p>{hud.message}</p>
      <button type="button" onClick={startGame}>
        {hud.status === 'ready' ? 'Start Run' : 'Restart Run'}
      </button>
    </div>
  )

  return (
    <section className="goat-game page-enter" aria-label="Goat Simulator game">
      <div className="goat-game-header">
        <div>
          <p className="kicker">Goat Simulator</p>
          <h1>Goat Simulator</h1>
        </div>
        <button type="button" className="restart-button" onClick={startGame}>
          Reset
        </button>
      </div>

      <div className="game-hud" aria-live="polite">
        <div className="goat-stat">
          <span>Score</span>
          <strong data-testid="goat-score">{hud.score}</strong>
        </div>
        <div className="goat-stat">
          <span>Time</span>
          <strong>{hud.timeLeft}s</strong>
        </div>
        <div className="goat-stat meter-stat">
          <span>Stamina</span>
          <strong>{hud.stamina}%</strong>
          <i style={{ width: `${hud.stamina}%` }} />
        </div>
        <div className="goat-stat meter-stat">
          <span>Hunger</span>
          <strong>{hud.hunger}%</strong>
          <i style={{ width: `${hud.hunger}%` }} />
        </div>
        <div className="goat-stat">
          <span>Chaos</span>
          <strong>{hud.chaos}%</strong>
        </div>
        <div className="goat-stat">
          <span>Combo</span>
          <strong>x{hud.combo}</strong>
        </div>
      </div>

      <div className="mission-strip">
        <span>{hud.missionLabel}</span>
        <strong>
          {hud.missionProgress}/{hud.missionTarget}
        </strong>
        <small>
          {hud.completedMissions}/{hud.totalMissions}
        </small>
      </div>

      <div className="goat-stage" data-game-status={hud.status}>
        <canvas
          ref={canvasRef}
          className="goat-canvas"
          data-testid="goat-canvas"
          width={WORLD_WIDTH}
          height={WORLD_HEIGHT}
          tabIndex={0}
          aria-label="Playable goat simulator canvas"
        />
        {statusAction}
      </div>

      <div className="goat-controls" aria-label="Game controls">
        <div className="goat-pad" aria-label="Move">
          <button
            type="button"
            aria-label="Move up"
            onPointerDown={() => setControl('up', true)}
            onPointerUp={() => releaseAction('up')}
            onPointerLeave={() => releaseAction('up')}
            onPointerCancel={() => releaseAction('up')}
          >
            ^
          </button>
          <button
            type="button"
            aria-label="Move left"
            onPointerDown={() => setControl('left', true)}
            onPointerUp={() => releaseAction('left')}
            onPointerLeave={() => releaseAction('left')}
            onPointerCancel={() => releaseAction('left')}
          >
            &lt;
          </button>
          <button
            type="button"
            aria-label="Move down"
            onPointerDown={() => setControl('down', true)}
            onPointerUp={() => releaseAction('down')}
            onPointerLeave={() => releaseAction('down')}
            onPointerCancel={() => releaseAction('down')}
          >
            v
          </button>
          <button
            type="button"
            aria-label="Move right"
            onPointerDown={() => setControl('right', true)}
            onPointerUp={() => releaseAction('right')}
            onPointerLeave={() => releaseAction('right')}
            onPointerCancel={() => releaseAction('right')}
          >
            &gt;
          </button>
        </div>

        <div className="goat-actions" aria-label="Actions">
          <button
            type="button"
            aria-label="Sprint"
            onPointerDown={() => setControl('sprint', true)}
            onPointerUp={() => releaseAction('sprint')}
            onPointerLeave={() => releaseAction('sprint')}
            onPointerCancel={() => releaseAction('sprint')}
          >
            ++
          </button>
          <button
            type="button"
            aria-label="Jump"
            onPointerDown={() => setControl('jump', true)}
            onPointerUp={() => releaseAction('jump')}
            onPointerLeave={() => releaseAction('jump')}
            onPointerCancel={() => releaseAction('jump')}
          >
            /\
          </button>
          <button
            type="button"
            aria-label="Ram"
            onPointerDown={() => setControl('ram', true)}
            onPointerUp={() => releaseAction('ram')}
            onPointerLeave={() => releaseAction('ram')}
            onPointerCancel={() => releaseAction('ram')}
          >
            !!
          </button>
          <button
            type="button"
            aria-label="Bleat"
            onPointerDown={() => setControl('bleat', true)}
            onPointerUp={() => releaseAction('bleat')}
            onPointerLeave={() => releaseAction('bleat')}
            onPointerCancel={() => releaseAction('bleat')}
          >
            ~
          </button>
          <button
            type="button"
            aria-label="Chomp"
            onPointerDown={() => setControl('chomp', true)}
            onPointerUp={() => releaseAction('chomp')}
            onPointerLeave={() => releaseAction('chomp')}
            onPointerCancel={() => releaseAction('chomp')}
          >
            []
          </button>
        </div>
      </div>
    </section>
  )
}
