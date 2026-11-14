'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export const Sheet=Dialog.Root;
export const SheetTitle=Dialog.Title;
export function SheetContent({children,themeRoute,onCloseAutoFocus}:{children:React.ReactNode;themeRoute:string;onCloseAutoFocus?:(e:Event)=>void}){return <Dialog.Portal><Dialog.Overlay className="sheet-overlay"/><Dialog.Content className="sheet" data-route={themeRoute} aria-describedby={undefined} onCloseAutoFocus={onCloseAutoFocus}><Dialog.Close className="button button-ghost sheet-close" aria-label="닫기"><X size={24}/></Dialog.Close>{children}</Dialog.Content></Dialog.Portal>;}
