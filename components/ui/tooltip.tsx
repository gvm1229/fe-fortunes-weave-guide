'use client';
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) { return <TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={sideOffset} className={cn('ui-pop z-50 rounded-[8px] bg-[var(--text)] px-[10px] py-[6px] text-[18px] text-[var(--bg)]', className)} {...props} /></TooltipPrimitive.Portal>; }
