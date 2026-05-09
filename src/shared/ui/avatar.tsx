import { cn } from '@/lib/utils'

/** 결정적 hue (id/이름 → 동일 색). 50% saturation, 55% lightness로 가독성 확보. */
function deterministicHue(seed: string | number): number {
  const s = String(seed)
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h % 360
}

export interface AvatarProps {
  /** 시드. id/userId가 안정적. 미전달 시 name 사용. */
  seed?: string | number
  /** 닉네임. 첫 글자가 표시됨. */
  name?: string
  /** 사이즈 (px). 기본 32. */
  size?: number
  className?: string
}

export function Avatar({ seed, name, size = 32, className }: AvatarProps) {
  const s = seed ?? name ?? 'user'
  const h = deterministicHue(s)
  const initial = (name?.trim()[0] ?? '?').toUpperCase()
  return (
    <div
      role="img"
      aria-label={name ?? '사용자'}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${h} 50% 55%)`,
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </div>
  )
}
