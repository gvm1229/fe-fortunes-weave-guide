'use client';
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn('ui-tabs-list inline-flex items-center gap-[4px] p-[4px] rounded-[12px] bg-[var(--secondary)]', className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn('ui-press inline-flex items-center justify-center gap-[8px] whitespace-nowrap min-h-[40px] px-[16px] rounded-[8px] text-[18px] font-semibold text-[var(--secondary-fg)] data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-fg)] focus-visible:outline-[3px] focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2', className)} {...props} />; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn('min-w-0 focus-visible:outline-[3px] focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2', className)} {...props} />; }
