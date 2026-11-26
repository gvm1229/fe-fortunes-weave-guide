'use client';
import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glueDots } from '../game-text';
export const Accordion = AccordionPrimitive.Root;
export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) { return <AccordionPrimitive.Item className={cn('ui-accordion-item border-b border-[var(--line)]', className)} {...props} />; }
/** 제목 글은 glueDots로 "·"가 줄 머리에 오지 않게 묶는다(.dot-run 하나로 감싸 flex 단추 안에서도 쪼개지지 않음, 2026-11-26 검토 N3). */
export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) { return <AccordionPrimitive.Header className="flex m-0"><AccordionPrimitive.Trigger className={cn('ui-accordion-trigger flex flex-1 items-center justify-between gap-[12px] min-h-[56px] py-[8px] bg-transparent border-0 text-left text-[20px] font-semibold text-[var(--text)] focus-visible:outline-[3px] focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2', className)} {...props}>{typeof children==='string'?glueDots(children):children}<ChevronDown aria-hidden size={22} className="ui-accordion-chevron shrink-0 text-[var(--muted)]" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>; }
export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) { return <AccordionPrimitive.Content className="ui-accordion-content overflow-hidden" {...props}><div className={cn('pb-[16px]', className)}>{children}</div></AccordionPrimitive.Content>; }
