import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import {sentences,spaceAmounts} from './readability.mjs';
const processor=unified().use(remarkParse).use(remarkGfm).use(remarkStringify,{bullet:'-',listItemIndent:'one'});
export const markdownTree=body=>processor.parse(body);
export const markdownText=n=>n.value??(n.children||[]).map(markdownText).join('');
function sliceInline(nodes,start,end){
  let offset=0;
  const total=nodes.map(markdownText).join('').length;
  function visit(n){
    if('value' in n){const from=offset;offset+=n.value.length;const value=n.value.slice(Math.max(0,start-from),Math.max(0,Math.min(n.value.length,end-from)));return value?{...n,value}:null;}
    const from=offset,children=(n.children||[]).map(visit).filter(Boolean);
    if(from===offset)return from>=start&&(from<end||from===total&&end===total)?n:null;
    return children.length?{...n,children}:null;
  }
  return nodes.map(visit).filter(Boolean);
}
export function deriveMarkdown(body){
  const tree=markdownTree(body);
  function visit(n){
    if(n.type==='text')return {...n,value:spaceAmounts(n.value)};
    const result=n.children?{...n,children:n.children.map(visit)}:n;
    if(n.type==='paragraph'){
      const text=markdownText(result),parts=sentences(text);
      if(parts.length>2){let offset=0;return {type:'list',ordered:false,spread:false,children:parts.map(part=>{
        const end=text.indexOf(part,offset)+part.length,children=sliceInline(result.children,offset,end);offset=end;
        return {type:'listItem',spread:false,children:[{type:'paragraph',children}]};
      })};}
    }
    return result;
  }
  return processor.stringify(visit(tree));
}
