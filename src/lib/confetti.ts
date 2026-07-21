'use client'

// @ts-ignore - canvas-confetti n'a pas de types officiels
import confetti from 'canvas-confetti'

export function triggerConfetti() {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 1000,
    particleCount: count,
    spread: 70,
    startVelocity: 60,
    gravity: 1.2,
    colors: ['#39FF14', '#00ff88', '#FFD700', '#FF3B3B'],
    shapes: ['circle'],
  }

  confetti({
    ...defaults,
    particleCount: Math.floor(count / 2),
    spread: 50,
    origin: { x: 0.3, y: 0.6 },
  })

  confetti({
    ...defaults,
    particleCount: Math.floor(count / 2),
    spread: 50,
    origin: { x: 0.7, y: 0.6 },
  })
}

export function triggerCelebration() {
  const duration = 3 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, zIndex: 1000, colors: ['#39FF14', '#FFD700'] }

  const random = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }

    const particleCount = 50 * (timeLeft / duration)
    confetti({
      ...defaults,
      particleCount,
      origin: { x: random(0.1, 0.9), y: random(0.3, 0.7) },
    })
  }, 250)

  triggerConfetti()
}