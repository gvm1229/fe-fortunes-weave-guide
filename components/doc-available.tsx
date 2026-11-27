'use client';
import { createContext, useContext } from 'react';
import { guideHref, resolveDoc } from '@/lib/document-links';
/** 이 루트·부에 있는 문서 경로. 할 일·문서의 문서 단추가 없는 문서(빈 "문서 확인" 서랍)를 가리키면 글자만 남긴다(Fable 재검토 O). */
export const DocPaths = createContext<ReadonlySet<string> | null>(null);
export function useDocAvailable() {
  const paths = useContext(DocPaths);
  return (url: string) => !paths || !!guideHref(url) || paths.has(resolveDoc(url).split('#')[0]);
}
