import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
export const badgeVariants = cva('ui-badge inline-flex items-center gap-[4px] min-h-[28px] px-[8px] rounded-[8px] text-[18px] font-semibold whitespace-nowrap', { variants: { variant: { default: 'bg-[var(--secondary-soft)] text-[var(--text)]', strong: 'bg-[var(--primary)] text-[var(--primary-fg)]', swap: 'bg-[var(--swap)] text-[var(--swap-fg)]' } }, defaultVariants: { variant: 'default' } });
export function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }
