'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface EnergyFlow {
  x1: number
  y1: number
  x2: number
  y2: number
  strength: number
  opacity: number
  color: string
}

export function EnergyFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const flowsRef = useRef<EnergyFlow[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Energy colors
    const colors = [
      'rgba(59, 130, 246, ', // blue
      'rgba(16, 185, 129, ', // green
      'rgba(245, 158, 11, ', // yellow
      'rgba(249, 115, 22, ', // orange
      'rgba(139, 92, 246, ', // purple
    ]

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 20))
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: Math.random() * 300 + 200,
        })
      }
      
      return particles
    }

    // Create energy flows
    const createEnergyFlows = () => {
      const flows: EnergyFlow[] = []
      const flowCount = Math.min(8, Math.floor(window.innerWidth / 200))
      
      for (let i = 0; i < flowCount; i++) {
        flows.push({
          x1: Math.random() * canvas.width,
          y1: Math.random() * canvas.height,
          x2: Math.random() * canvas.width,
          y2: Math.random() * canvas.height,
          strength: Math.random() * 0.5 + 0.3,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
      
      return flows
    }

    particlesRef.current = createParticles()
    flowsRef.current = createEnergyFlows()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw energy flows
      flowsRef.current.forEach((flow, index) => {
        // Animate flow endpoints slightly
        const time = Date.now() * 0.001
        const offset1 = Math.sin(time + index) * 30
        const offset2 = Math.cos(time + index * 0.7) * 30

        const x1 = flow.x1 + offset1
        const y1 = flow.y1 + offset1 * 0.3
        const x2 = flow.x2 + offset2
        const y2 = flow.y2 + offset2 * 0.3

        // Create gradient
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, `${flow.color}${flow.opacity})`)
        gradient.addColorStop(0.5, `${flow.color}${flow.opacity * 1.5})`)
        gradient.addColorStop(1, `${flow.color}${flow.opacity})`)

        // Draw flow line
        ctx.strokeStyle = gradient
        ctx.lineWidth = flow.strength * 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // Add glow effect
        ctx.strokeStyle = `${flow.color}${flow.opacity * 0.3})`
        ctx.lineWidth = flow.strength * 4
        ctx.stroke()
      })

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) {
          particle.vx *= -1
        }
        if (particle.y <= 0 || particle.y >= canvas.height) {
          particle.vy *= -1
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Calculate life-based opacity
        const lifeOpacity = Math.sin((particle.life / particle.maxLife) * Math.PI) * particle.opacity

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${lifeOpacity})`
        ctx.fill()

        // Add glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        )
        gradient.addColorStop(0, `${particle.color}${lifeOpacity * 0.5})`)
        gradient.addColorStop(1, `${particle.color}0)`)
        ctx.fillStyle = gradient
        ctx.fill()

        // Reset particle if life exceeded
        if (particle.life >= particle.maxLife) {
          particle.life = 0
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
        }
      })

      // Add connection lines between nearby particles
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const distance = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          )

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.2
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (!prefersReducedMotion) {
      animate()
    } else {
      // Draw static version for reduced motion
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
      for (let i = 0; i < 20; i++) {
        ctx.beginPath()
        ctx.arc(
          (i * canvas.width) / 20,
          (Math.sin(i) * canvas.height) / 4 + canvas.height / 2,
          2,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    }

    // Check if on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      // Reduce animation complexity on mobile
      particleCount = Math.min(20, particleCount)
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: `linear-gradient(135deg, 
          rgba(248, 250, 252, 0.95) 0%, 
          rgba(241, 245, 249, 0.95) 25%,
          rgba(226, 232, 240, 0.95) 50%,
          rgba(203, 213, 225, 0.95) 75%,
          rgba(148, 163, 184, 0.95) 100%
        )`,
      }}
      aria-hidden="true"
    />
  )
}

// Add dark mode styles
if (typeof document !== 'undefined') {
  const darkStyles = `
    [data-theme="dark"] canvas {
      background: linear-gradient(135deg, 
        rgba(15, 23, 42, 0.95) 0%, 
        rgba(30, 41, 59, 0.95) 25%,
        rgba(51, 65, 85, 0.95) 50%,
        rgba(71, 85, 105, 0.95) 75%,
        rgba(100, 116, 139, 0.95) 100%
      ) !important;
    }
  `
  
  const styleElement = document.createElement('style')
  styleElement.textContent = darkStyles
  document.head.appendChild(styleElement)
}