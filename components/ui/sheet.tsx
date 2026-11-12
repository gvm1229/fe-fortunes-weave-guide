'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export const Sheet=Dialog.Root;
export const SheetTitle=Dialog.Title;
export function SheetContent({children,themeRoute}:{children:React.ReactNode;themeRoute:string}){return <Dialog.Portal><Dialog.Overlay className="sheet-overlay"/><Dialog.Content className="sheet" data-route={themeRoute} aria-describedby={undefined}><Dialog.Close className="button button-ghost sheet-close" aria-label="참고 문서 닫기"><X size={24}/></Dialog.Close>{children}</Dialog.Content></Dialog.Portal>;}
