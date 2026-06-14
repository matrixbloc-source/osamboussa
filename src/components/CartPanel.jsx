import React from "react";
import { useNavigate } from "react-router-dom";

export default function CartPanel({cart,setCart,onClose,priceFor,IMGS,MAX_QTY}){
  const navigate = useNavigate();
  const lines=cart.map(i=>({...i,pricing:priceFor(i.cat,i.qty)}));
  const total=lines.reduce((s,i)=>s+i.pricing.total,0);
  const totalSavings=lines.reduce((s,i)=>s+i.pricing.savings,0);
  const upd=(id,qty)=>{
    if(qty<1)setCart(p=>p.filter(i=>i.id!==id));
    else setCart(p=>p.map(i=>i.id===id?{...i,qty:Math.min(MAX_QTY,qty)}:i));
  };
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,animation:"fadeIn .3s ease"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(420px,100vw)",
        background:"#111",borderLeft:"1px solid rgba(201,168,76,.2)",zIndex:1000,
        overflowY:"auto",animation:"slideLeft .3s ease"}}>
        <div style={{padding:"20px 22px",borderBottom:"1px solid rgba(201,168,76,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 className="pf" style={{fontSize:21,color:"#F5F0E8"}}>Mon Panier</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6B6B6B",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {cart.length===0?(
          <div style={{padding:56,textAlign:"center",color:"#6B6B6B"}}>
            <span style={{fontSize:46}}>🛒</span>
            <p style={{marginTop:14,fontSize:14}}>Votre panier est vide</p>
          </div>
        ):(
          <>
            <div style={{padding:"12px 16px",overflowY:"auto",maxHeight:"calc(100vh - 280px)"}}>
              {lines.map(item=>(
                <div key={item.id} style={{display:"flex",gap:12,alignItems:"center",padding:"13px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                  <img src={IMGS[item.img] || item.img || 'https://via.placeholder.com/80'} alt={item.name} style={{width:54,height:54,objectFit:"cover",borderRadius:8,border:"1px solid rgba(201,168,76,.2)"}}/>
                  <div style={{flex:1}}>
                    <p style={{color:"#F5F0E8",fontSize:13,fontWeight:500}}>{item.name}</p>
                    <p className="gold-text" style={{fontSize:13,fontWeight:700}}>{item.pricing.total.toFixed(2)} €</p>
                    <p style={{color:"#6B6B6B",fontSize:10.5,marginTop:1}}>
                      {item.pricing.unit.toFixed(2)} €/pièce
                      {item.pricing.savings>0&&<span style={{color:"#4ADE80",marginLeft:6}}>−{item.pricing.savings.toFixed(2)}€</span>}
                    </p>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button className="qbtn" onClick={()=>upd(item.id,item.qty-1)}>−</button>
                    <span style={{color:"#F5F0E8",fontSize:13,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                    <button className="qbtn" onClick={()=>upd(item.id,item.qty+1)} disabled={item.qty>=MAX_QTY} style={{opacity:item.qty>=MAX_QTY?.4:1,cursor:item.qty>=MAX_QTY?"not-allowed":"pointer"}}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"14px 20px 18px",borderTop:"1px solid rgba(201,168,76,.1)"}}>
              {totalSavings>0&&(
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12,color:"#4ADE80"}}>
                  <span>💰 Économies totales</span>
                  <span style={{fontWeight:700}}>−{totalSavings.toFixed(2)} €</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
                <span style={{color:"#6B6B6B",fontSize:14}}>Total</span>
                <span className="pf gold-text" style={{fontSize:24,fontWeight:700}}>{total.toFixed(2)} €</span>
              </div>
              <button className="btn-g" onClick={()=>{onClose();navigate('/vendeurs');}} style={{width:"100%",padding:14,borderRadius:10,fontSize:12}}>
                Voir vendeurs →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
