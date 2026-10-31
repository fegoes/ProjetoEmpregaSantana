export function reorderById<T extends {id:string}>(items:readonly T[],source:string,target:string):T[] {
  const from=items.findIndex(i=>i.id===source),to=items.findIndex(i=>i.id===target)
  if(from<0||to<0||from===to)return [...items]
  const next=[...items];const [item]=next.splice(from,1);next.splice(to,0,item);return next
}
