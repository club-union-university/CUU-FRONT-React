import { GripVertical } from 'lucide-react'
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

/**
 * react-resizable-panels (v3+) shadcn 스타일 wrapper.
 * 새 API: Group/Panel/Separator + orientation prop.
 */
export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return (
    <Group
      className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

export function ResizablePanel(props: PanelProps) {
  return <Panel {...props} />
}

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: SeparatorProps & { withHandle?: boolean }) {
  return (
    <Separator
      className={cn(
        'relative flex w-px items-center justify-center bg-border',
        'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Separator>
  )
}
