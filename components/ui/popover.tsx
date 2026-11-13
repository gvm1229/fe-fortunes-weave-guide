'use client';
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export function PopoverContent({ className, align = 'end', sideOffset = 8, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) { return <PopoverPrimitive.Portal><PopoverPrimitive.Content align={align} sideOffset={sideOffset} className={cn('ui-pop z-50 rounded-[16px] bg-[var(--surface)] text-[var(--text)] p-[16px] shadow-[0_8px_24px_rgb(0_0_0/.16)] outline-none', className)} {...props} /></PopoverPrimitive.Portal>; }
