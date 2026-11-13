/** 2026-11-14 사용자 지시: "자세히" 접기를 없애고 글을 모두 보인다. 묶음 구조(readable-group)만 남겨 간격 규칙을 유지한다. */
export function ReadMore({children}:{children:React.ReactNode}){
  return <div className="readable-group"><div className="readable-body">{children}</div></div>;
}
