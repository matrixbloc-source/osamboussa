import React from 'react';

export default function Rating({value, size=14}){
  const stars = [];
  for(let i=1;i<=5;i++){
    const filled = i<=Math.round(value);
    stars.push(<svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={filled?"#C9A84C":"none"} stroke="#C9A84C" strokeWidth="1" style={{marginRight:6}}><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.202 4.665 24 6 15.595 0 9.748l8.332-1.73z"/></svg>);
  }
  return (<div style={{display:'flex',alignItems:'center'}}>{stars}<span style={{fontSize:12,color:'#C9A84C',marginLeft:6}}>{value.toFixed(1)}</span></div>);
}
