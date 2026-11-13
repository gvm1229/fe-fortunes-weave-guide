'use client';
import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
export const toggleVariants = cva('ui-press inline-flex items-center justify-center gap-[8px] min-h-[44px] px-[14px] rounded-[10px] text-[18px] font-semibold bg-[var(--secondary)] text-[var(--secondary-fg)] data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-fg)] disabled:opacity-55 focus-visible:outline-[3px] focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2 [&_svg]:shrink-0');
export function Toggle({ className, ...props }: React.ComponentProps<typeof TogglePrimitive.Root>) { return <TogglePrimitive.Root className={cn(toggleVariants(), className)} {...props} />; }
