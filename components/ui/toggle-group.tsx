'use client';
import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';
import { toggleVariants } from './toggle';
export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) { return <ToggleGroupPrimitive.Root className={cn('flex flex-wrap items-center gap-[6px]', className)} {...props} />; }
export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) { return <ToggleGroupPrimitive.Item className={cn(toggleVariants(), className)} {...props} />; }
