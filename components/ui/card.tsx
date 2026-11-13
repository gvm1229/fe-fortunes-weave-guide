import * as React from 'react';
import { cn } from '@/lib/utils';
export function Card({ className, ...props }: React.ComponentProps<'div'>) { return <div className={cn('ui-card rounded-[16px] bg-[var(--surface)] text-[var(--text)] min-w-0', className)} {...props} />; }
