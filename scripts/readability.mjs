// 원본 자료는 수정하지 않고 표시용 문장·표·접기 구조만 만든다.
export const spaceAmounts = text => text
  .replace(/(\d[\d,]*G)(?=[가-힣A-Za-z+])/g, '$1 ')
  .replace(/([.!?。])(?=[가-힣])/g, '$1 ')
  .replace(/([가-힣][.!?。])(?=\d)/g, '$1 ')
  .replace(/(명성|지원)(?=\d)/g, '$1 ');

export function sentences(text) {
  return text.split(/(?<=[.!?。])\s+|(?<=[.!?。])(?=[가-힣])|(?<=[가-힣][.!?。])(?=\d)/u).filter(s => s.trim());
}
export function treeText(nodes) {
  return nodes.map(n => typeof n === 'string' ? n : n.attrs['data-editorial'] ? '' : treeText(n.children)).join('');
}
export const preservedText = nodes => treeText(nodes).replace(/\s/g, '');

function sliceTree(nodes, start, end) {
  let offset = 0;
  const total = treeText(nodes).length;
  function visit(n) {
    if (typeof n === 'string') {
      const from = offset; offset += n.length;
      return n.slice(Math.max(0, start - from), Math.max(0, Math.min(n.length, end - from)));
    }
    if(n.attrs['data-editorial'])return null;
    const from = offset, children = n.children.map(visit).filter(n => n !== null && n !== '');
    if (offset === from) return from >= start && (from < end || from === total && end === total) ? {...n, children} : null;
    return children.length ? {...n, children} : null;
  }
  return nodes.map(visit).filter(n => n !== null && n !== '');
}
const node = (tag, children, attrs = {}) => ({tag, attrs, children});
const editorial = text => node('th', [text], {'data-editorial':'true'});
const group = children => [node('section',children,{'data-readable-group':'true'})];

function splitParagraph(children) {
  const text = treeText(children), parts = sentences(text);
  if (parts.length <= 2) return null;
  let offset = 0;
  return node('ul', parts.map(part => {
    const start = text.indexOf(part, offset), end = start + part.length;
    const item = node('li', sliceTree(children, offset, end)); offset = end;
    return item;
  }), {'data-sentence-list':'true'});
}

function conditionChips(children) {
  return children.flatMap(n => {
    if (typeof n !== 'string') return [{...n, children:conditionChips(n.children)}];
    return n.split(/((?:명성|지원)\s*\d+|\d{1,2}\/\d{1,2})/g).filter(Boolean)
      .map(s => /^(?:명성|지원|\d{1,2}\/)/.test(s) ? node('span',[s],{'data-condition-chip':'true'}) : s);
  });
}

export function readableTree(nodes, {disclose = false} = {}) {
  function visit(n) {
    if (typeof n === 'string') return spaceAmounts(n);
    let result = {...n, attrs:{...n.attrs}, children:n.children.map(visit)};
    if(n.tag==='table'&&treeText(n.children.find(c=>typeof c!=='string'&&c.tag==='thead')?.children||[]).replace(/\s/g,'')==='용도준비액'){
      const body=n.children.find(c=>typeof c!=='string'&&c.tag==='tbody');
      const rows=(body?.children||[]).filter(c=>typeof c!=='string'&&c.tag==='tr').map(row=>{
        const cells=row.children.filter(c=>typeof c!=='string'&&c.tag==='td'),usage=cells[0]?.children||[];
        const note=usage.filter(c=>typeof c!=='string'&&c.tag==='small'),label=usage.filter(c=>typeof c==='string'||c.tag!=='small').map(visit);
        const condition=conditionChips(note.flatMap(c=>c.children).map(visit));
        return node('tr',[node('td',group(label)),node('td',(cells[1]?.children||[]).map(visit),{'data-amount':'true'}),node('td',group([splitParagraph(condition)||node('span',condition)]))]);
      });
      result=node('table',[node('thead',[node('tr',[editorial('용도'),editorial('금액'),editorial('조건')])]),node('tbody',rows)],{'data-gold-table':'true'});
    }
    if(n.tag==='ul'){
      const items=result.children.filter(c=>typeof c!=='string');
      if(items.length&&items.every(c=>c.tag==='li'&&c.children.length===1&&typeof c.children[0]!=='string'&&c.children[0].attrs['data-gold-table'])){
        const tables=items.map(c=>c.children[0]);
        result=node('table',[tables[0].children[0],node('tbody',tables.flatMap(t=>t.children.find(c=>c.tag==='tbody').children))],{'data-gold-table':'true'});
      }
    }
    if(n.tag==='dl'){
      const rows=[];let label=[];
      for(const child of result.children){
        if(typeof child!=='string'&&child.tag==='dt')label=child.children;
        else if(typeof child!=='string'&&child.tag==='dd'){rows.push(node('tr',[node('th',label,{'scope':'row'}),node('td',group(child.children))]));label=[];}
        else if(typeof child==='string'&&child.trim())label.push(child);
      }
      if(rows.length&&!label.length)result=node('table',[node('tbody',rows)],{'data-info-table':'true'});
    }
    if(n.tag==='span'&&result.children.some(c=>typeof c!=='string'&&c.tag==='img'&&/\/(portraits|gods)\//.test(c.attrs.src||'')))result.attrs['data-face-row']='true';
    if(['div','p'].includes(n.tag)&&result.children.filter(c=>typeof c!=='string'&&c.attrs['data-face-row']).length>1)result=node('ul',result.children.map(c=>typeof c!=='string'&&c.attrs['data-face-row']?node('li',[c]):c),{'data-face-list':'true'});
    const hasBlock=children=>children.some(c=>typeof c!=='string'&&(/^(p|div|section|ul|ol|li|table|tr|td|th|dl|h[1-6])$/.test(c.tag)||hasBlock(c.children)));
    const inline = result.tag===n.tag&&!hasBlock(result.children);
    if (inline && ['p','li','td','dd','div'].includes(n.tag)) {
      const text = treeText(result.children);
      const amount = text.match(/[+−-]?\s*\d[\d,]*(?:\s*[~～]\s*\d[\d,]*)?\s*G/);
      if (amount && /명성|지원|때|경우|조건|날짜|구매|영입/.test(text) && !result.children.some(c => typeof c !== 'string' && c.tag === 'table')) {
        const start = amount.index, end = start + amount[0].length;
        result = {...result, tag:n.tag === 'p' ? 'div' : n.tag, children:[node('table',[
          node('thead',[node('tr',[editorial('용도'),editorial('금액'),editorial('조건')])]),
          node('tbody',[node('tr',[
            node('td',group(sliceTree(result.children,0,start))),
            node('td',sliceTree(result.children,start,end),{'data-amount':'true'}),
            node('td',group([splitParagraph(conditionChips(sliceTree(result.children,end,text.length)))||node('span',conditionChips(sliceTree(result.children,end,text.length)))]))
          ])])
        ],{'data-gold-table':'true'})]};
      } else {
        const list = splitParagraph(result.children);
        if (list) result = n.tag === 'p' ? list : {...result, children:[list]};
      }
    }
    if(n.tag==='p'&&['p','ul'].includes(result.tag)&&!result.attrs['data-face-list']&&treeText(result.children).trim())result.attrs['data-readable-group']='prose';
    return result;
  }
  const result = nodes.map(visit);
  return disclose && treeText(result).trim() ? [node('section',result,{'data-readable-group':'true'})] : result;
}

export function readableRecord(value) {
  if (typeof value === 'string') {
    const text = spaceAmounts(value), parts = sentences(text);
    return parts.length > 1 || text.length > 100 ? {$prose:parts} : text;
  }
  if (Array.isArray(value)) {
    const result=value.map(readableRecord);
    if(value.length&&value.every(v=>v&&typeof v==='object'&&'chapter' in v&&Array.isArray(v.items))){
      const counts=new Map();for(const v of result)for(const note of v.notes||[])counts.set(JSON.stringify(note),(counts.get(JSON.stringify(note))||0)+1);
      const shared=new Map();for(const v of result)v.$notes=(v.notes||[]).filter(note=>{const key=JSON.stringify(note);if(counts.get(key)>1){shared.set(key,note);return false;}return true;});
      result[0].$sharedNotes=[...shared.values()];
    }
    return result;
  }
  if (value && typeof value === 'object') {
    const result=Object.fromEntries(Object.entries(value).map(([k,v]) => [k,readableRecord(v)]));
    if('chapter' in value&&Array.isArray(value.items)&&Array.isArray(value.extras))result.$goldRows=[...value.items.map(v=>({...v,optional:false})),...value.extras.map(v=>({...v,optional:true}))].map(row=>({...readableRecord(row),conditionTags:[...new Set((row.label+' '+(row.note||'')).match(/(?:명성|지원)\s*\d+|\d{1,2}\/\d{1,2}/g)||[])]}));
    return result;
  }
  return value;
}
