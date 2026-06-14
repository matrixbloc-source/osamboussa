import React, {useState} from 'react';

export default function UploadField({multiple=false,onChange,label}){
  const [previews,setPreviews]=useState([]);
  const handle=(e)=>{
    const files = Array.from(e.target.files||[]);
    const urls = files.map(f=>URL.createObjectURL(f));
    setPreviews(p=>multiple? [...p,...urls] : urls);
    if(onChange) onChange(files);
  };
  return (
    <div>
      {label&&<div style={{color:'#C9A84C',marginBottom:6}}>{label}</div>}
      <input type="file" accept="image/*" multiple={multiple} onChange={handle} />
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>{previews.map((u,i)=>(<img key={i} src={u} alt="preview" style={{width:84,height:84,objectFit:'cover',borderRadius:8}}/>))}</div>
    </div>
  );
}
