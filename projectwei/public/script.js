//,خط228
list(); 
const div=document.getElementById("div");
const divtable=document.getElementById("divt");
const ul=document.createElement("ul");
let vspan=document.createElement("span");
vspan.id="spanv";
let spanrow=document.createElement("tr");
let spantdb=document.createElement("td");
let spantd=document.createElement("td");
  let sendb=document.createElement("button");
  sendb.id="sb";
const input =document.createElement("input");
input.type="text";
input.placeholder="جستجو براساس بارکد";
div.appendChild(input);
  const title=document.createElement("span");
  title.textContent="انتخاب دسته بندی";
  title.id="span"
  div.appendChild(title);
    const selectcrop=document.createElement("select");
    selectcrop.span="انتخاب دسته بندی";
    selectcrop.id="selectc"
    const coltivator=document.createElement("option");
    coltivator.textContent="کولتیواتور";
    coltivator.value="colt";
    const generator =document.createElement("option");
    generator.textContent="موتور برق";
    generator.value="gen";
    const brushcutter=document.createElement("option");
    brushcutter.textContent="علفتراش";
    brushcutter.value="bru";
    const waterpomp=document.createElement("option");
    waterpomp.textContent="پمپ آب";
    waterpomp.value="wat";
    const sprayer=document.createElement("option");
    sprayer.textContent="سمپاش";
    sprayer.value="spa";
    const holer =document.createElement("option");
    holer.textContent="چاله کن";
    holer.value="hol";
    const saw =document.createElement("option");
    saw.textContent="اره موتوری";
    saw.value="sawe";
    const other =document.createElement("option");
    other.textContent="سایر محصولات";
    other.value="oth";
    selectcrop.value="gen";
    selectcrop.appendChild(coltivator);
    selectcrop.appendChild(generator);
    selectcrop.appendChild(brushcutter);
    selectcrop.appendChild(waterpomp);
    selectcrop.appendChild(sprayer);
    selectcrop.appendChild(holer);
    selectcrop.appendChild(saw);
    selectcrop.appendChild(other);
    div.appendChild(selectcrop);
    const noresult=document.createElement("span");
    noresult.id="noresul";
const table=document.createElement("table");
table.id="newtable";
div.appendChild(table);
    const thead=document.createElement("thead");
    thead.innerHTML='<th>نام</th><th>بارکد</th><th>کد</th><th></th><th>تعداد کالا</th><th></th><th></th>';
    table.appendChild(thead);
    const tbody=document.createElement("tbody");
    const span=document.createElement("span");
    function number(){
        let num=0;
        function inc(){
num++
        }
        function dec(){
          if(num===0){num=0}else{num--}
        }
        function stat(){
           return num
        }
        function reset(){
          num=0;
        }
        return{inc,dec,stat,reset}
    }
    function conf(te){
      const cond=document.createElement("div");
      cond.id="confird"
      const spanc=document.createElement("span");
      spanc.id="spc";
      const byes=document.createElement("button");
      const bno=document.createElement("button");
      const cusname=document.createElement("input");
      cusname.type="text";
      cusname.placeholder="نام نماینده";
      cusname.id="cus";
      const crnum=document.createElement("input");
      crnum.type="number";
      crnum.placeholder="شماره حواله انبار";
      crnum.id="cr";
      if(!document.querySelector("#spc")){
        spanc.textContent=te;
        byes.textContent="بله";
        bno.textContent="خیر";
        cond.appendChild(spanc);
        cond.appendChild(cusname);
        cond.appendChild(crnum);
        cond.appendChild(byes);
        cond.appendChild(bno);
        div.appendChild(cond);
      }else{return}
byes.addEventListener("click",()=>{
let ce=cusname.value.trim();
let ci=crnum.value.trim();
if(ce&&ci){
  sdat.backed(event,ce,ci);
  cond.remove()}else{return;}});
bno.addEventListener("click",()=>{cond.remove()});
 }
    function alarm(textalarm){
      const divalarm=document.createElement("div");
      divalarm.id="alamm";
      const alarmt=document.createElement("span");
      alarmt.id="al"
      if(!document.querySelector("#al")){
      alarmt.textContent=textalarm;
      const btnalarm=document.createElement("button");
      btnalarm.textContent="ok";
      divalarm.appendChild(alarmt);
      divalarm.appendChild(btnalarm);
      div.appendChild(divalarm);
      btnalarm.addEventListener("click",()=>{divalarm.remove()})}else{return}
    }
let newlist=[];
 function list(){
    fetch('/p2/api/items')
    .then(res=>res.json())
    .then(newdata=>{
  // console.log(newdata);
  if(newdata){newlist=newdata;
    filtered();
  }else{alert("داده ای برای نمایش وجود ندارد")}
});
 
}
function croplists(){
  let croplist=[];
  function statelist(newname,newqty,newcode){
    const cropobj={name:newname,qty:newqty,code:newcode};
    croplist.push(cropobj);
  }
  function changeqty(oldname,oldqty){
    const changedcrop=croplist.filter(d=>d.name===oldname);
    const newchanged={name:changedcrop[0].name,qty:oldqty,code:changedcrop[0].code};
    croplist=croplist.filter(c=>c.name!==changedcrop[0].name);
    croplist.push(newchanged);
    //console.log(changedcrop);
  }
  function delcrop(oldnamee){
    //console.log(oldnamee);
    croplist=croplist.filter(c=>c.name!==oldnamee);
  }
  function finalcrop(){
    return croplist;
  }
  function resetcrop(){
    croplist=[];
  }
return{statelist,changeqty,delcrop,finalcrop,resetcrop}
}
const crp=croplists();
//توسعه
class Vhicl{
  constructor(v){
    this.re=[];
    this.name=v.vname;
    this.yr=v.lenght;
    this.xr=v.width;
    this.zr=v.height;
    this.wr=v.weight;
    this.vrd=v.volum;
    this.vrt=v.tvolum;
    this.vd=0;
    this.vu=0;
    this.w=0;
    this.val=v.va;
   // console.log(this.val);
  }
  addc(v1,w1,n,l){
if(this.w+w1<=this.wr&&this.vd+v1<=this.vrd){
    const c1={name:n};
  this.re.push(c1);
  this.vd=this.vd+v1;
}
//console.log(this.re)
  }
  stat(){
    return {name:this.name,val:this.val};
  }

}

function vicle(){
  fetch('/p2/vehicle')
.then(res=>res.json())
.then(data=>{
  clculation(data)
});
}
function clculation(data){
    let vlist=[];
    let sumlist=[];
    let vicles=[...data].sort((a,b)=>a.weight-b.weight);
    let viclesv=[...data].sort((a,b)=>a.volum-b.volum);
    const titems=crp.finalcrop();
//let vehiclen=[{name:vic.vname,width:vic.width,lenghtt:vic.lenght,height:vic.height}];
//const vnl=vehiclen[0].lenghtt;
//const vnw=vehiclen[0].width;
//const vnh=vehiclen[0].height;
fetch('/p2/api/items')
.then(res=>res.json())
.then(data=>{if(data){vlist=data;
titems.forEach(t=>{
    const wid=vlist.find(v=>t.code===v.id).width;
    const len=vlist.find(v=>t.code===v.id).lenght;
    const hei=vlist.find(v=>t.code===v.id).height;
    const we=vlist.find(v=>t.code===v.id).weight;
    const vo=vlist.find(v=>t.code===v.id).volum;
    for(let x=1;x<=t.qty;x++){
      const newcrop={name:t.name,code:t.code,widt:wid,leng:len,heig:hei,v:vo,w:we};
sumlist.push(newcrop);
    }
   let vic=vicles.sort((a,b)=>a.weight-b.weight).find(v=>pluss.statew()<=v.weight);
    if(pluss.statev()<=(vic.volum+vic.tvolum)&&sumlist.some(s=>s.leng<=1.03)&&sumlist.filter(s=>s.leng>=1.03).map(s=>s.v).reduce((acc,curent)=>acc+curent,0)<=vic.volum){ 
      vic={...vic,volum:vic.volum+vic.tvolum};
      console.log(vic)
      vi=new Vhicl(vic);}else{
      const vicv=viclesv.find(v=>pluss.statev()<v.volum);
       vi=new Vhicl(vicv);
    }
}); 
sumlist.forEach(s=>{
  vi.addc(s.v,s.w,s.name,s.leng);
})
vehicle(vi.stat());
}
else{alarm("داده ای یافت نشد")}});
}

//توسعه
//
function vehicle(nm){
  vspan.textContent="";
  spanrow.innerHTML="";
  const vrow=divtable.querySelector("tfoot");
  if(crp.finalcrop().length<=0){vspan.textContent="";}else{
  vspan.textContent=`وسیله نقلیه مورد نیاز :    ${nm.name}`;
  spantd.appendChild(vspan);
spanrow.appendChild(spantd);
  vrow.appendChild(spanrow);
  sdat.makeb();
}
 
}
fetch('/p2/sendsaved')
.then(res=>res.json())
.then(data=>console.log(data));
function senddata(){
   function makeb(){
    if(spanrow.innerHTML.length>0){
    sendb.textContent="ذخیره اطلاعات";
  spantdb.appendChild(sendb);
  spanrow.appendChild(spantdb);
console.log("ss")}else{return;}
sendb.onclick=()=>{
  conf("از ارسال اطلاعات مطمئن هستید؟");
  }
}
function backed(e,namec,cid){
  e.preventDefault();
    let d ;
    fetch('/p1/vehicles')
    .then(res=>res.json())
    .then(datac=>{
       const r = datac.find(d=>d.val===vi.stat().val);
        const n =(pluss.statew()/r.w);
        console.log(datac);
        if(n>=1){let du =r.duration;
            console.log(du)
             d = du;}else if(n<1){let duu =Math.round(n*r.duration);
            console.log(duu);
            d = duu ;}
    

 if(e){fetch('/p2/saved',{method:'post',headers:{'content-Type':'application/json'},body:JSON.stringify({carname:vi.stat().name,cuname:namec,cpid:cid,vo:d,we:pluss.statew(),val:vi.stat().val})})
  .then(async res=>{if(!res.ok){const ress= await res.json(); return alarm(ress.error);}})
.then(res=>{ console.log(res);alarm("با موفقیت ثبت شد")})
.catch(err=>{console.error(err);alarm("ارسال اطلاعات ناموفق")})}

  })}
 return{makeb,backed}
}
const sdat=senddata();
function plus(){
  let sumw=0
  let sumv=0
  function sumwei(weight){
    sumw=sumw+weight
  }
  function sumvol(volum){
    sumv=sumv+volum;
  }
  function delw(weight){
    sumw=sumw-weight;
  }
  function delv(volum){
   sumv= sumv-volum;
  }
  function statew(){
    return sumw;
  }
  function statev(){
    return sumv.toFixed(2);
  }
  function reset(){
sumw=0;
sumv=0;
  }
  return{sumwei,sumvol,statew,statev,delw,delv,reset}
}
const pluss=plus();

     function croptable(name,barcode,qty,volum,weight,id){
      const croptables=divtable.querySelector("table");
        const cctbody=divtable.querySelector("tbody");
          const crow=document.createElement("tr");
        crow.innerHTML=`<td id="oldname">${name}</td>
        <td>${barcode}</td>
        <td id="qtd">${qty}</td>
        <td id="cvol">${(volum*qty).toFixed(2)}</td>
        <td id="cweii">${weight*qty}</td>
        <td><button id="dbtn">حذف</button></td>
        <td><button id="vbtn">ویرایش تعداد</button></td>`;
        const srow=divtable.querySelector("#trs");
        let cellnumber3=document.createElement("td");
        cellnumber3.id="cellvolum";
      let cellnumber4=document.createElement("td");
      cellnumber4.id="cellweight";
        cctbody.appendChild(crow);
      if([divtable.querySelector("#trs").innerHTML]<=0){
        const celltitle=document.createElement("td");
        celltitle.textContent="جمع";
        const cellnumber=document.createElement("td");
        cellnumber.textContent="*****";
        const cellnumber2=document.createElement("td");
        cellnumber2.textContent="*****";
        cellnumber3.textContent=`${pluss.statev()}`;
        const cellnumber5=document.createElement("td");
        cellnumber5.textContent="*****";
        
        cellnumber4.textContent=`${pluss.statew()}`;
        const cellnumber6=document.createElement("td");
        cellnumber6.textContent="*****";
        srow.appendChild(celltitle);
        srow.appendChild(cellnumber);
        srow.appendChild(cellnumber2);
        srow.appendChild(cellnumber3);
        srow.appendChild(cellnumber4);
        srow.appendChild(cellnumber5);
        srow.appendChild(cellnumber6);
        }else{srow.innerHTML="";
          const celltitle=document.createElement("td");
        celltitle.textContent="جمع";
        const cellnumber=document.createElement("td");
        cellnumber.textContent="*****";
        const cellnumber2=document.createElement("td");
        cellnumber2.textContent="*****";
        cellnumber3.textContent=`${pluss.statev()}`;
        const cellnumber5=document.createElement("td");
        cellnumber5.textContent="*****";
        cellnumber4.textContent=`${pluss.statew()}`;
        const cellnumber6=document.createElement("td");
        cellnumber6.textContent="*****";
        srow.appendChild(celltitle);
        srow.appendChild(cellnumber);
        srow.appendChild(cellnumber2);
        srow.appendChild(cellnumber3);
        srow.appendChild(cellnumber4);
        srow.appendChild(cellnumber5);
        srow.appendChild(cellnumber6);
        }
        croptables.appendChild(cctbody);
                const dbtn=crow.querySelector("#dbtn");
        const vbtn=crow.querySelector("#vbtn");
      
dbtn.addEventListener("click",()=>{
  const resu= cctbody.querySelectorAll("tr").length
 if(resu>1){
  const oldname=crow.querySelector("#oldname").textContent;
  const olddweigh=crow.querySelector("#cweii").textContent;
  const oldvol=crow.querySelector("#cvol").textContent;
 // console.log(weight);
 crp.delcrop(oldname);
  pluss.delw(olddweigh);
  pluss.delv(oldvol);
  crow.remove();
//console.log(crp.finalcrop());
srow.innerHTML="";
          const celltitle=document.createElement("td");
        celltitle.textContent="جمع";
        const cellnumber=document.createElement("td");
        cellnumber.textContent="*****";
        const cellnumber2=document.createElement("td");
        cellnumber2.textContent="*****";

        cellnumber3.textContent=`${pluss.statev()}`;
        const cellnumber5=document.createElement("td");
        cellnumber5.textContent="*****";
        
        cellnumber4.textContent=`${pluss.statew()}`;
        const cellnumber6=document.createElement("td");
        cellnumber6.textContent="*****";
        srow.appendChild(celltitle);
        srow.appendChild(cellnumber);
        srow.appendChild(cellnumber2);
        srow.appendChild(cellnumber3);
        srow.appendChild(cellnumber4);
        srow.appendChild(cellnumber5);
        srow.appendChild(cellnumber6);
vehicle(pluss.statew(),pluss.statev());
vicle();
 }else{
crp.resetcrop();
  pluss.reset();
  vicle();
  const sumrow=croptables.querySelector("tfoot");
  const ssrow=sumrow.querySelector("#trs");
  crow.remove();
  ssrow.innerHTML="";
  vspan.remove();
  //console.log(crp.finalcrop())
}
})

vbtn.addEventListener("click",()=>{
  let oldweight=crow.querySelector("#cweii").textContent;
  let oldvol=crow.querySelector("#cvol").textContent;
  const newinput=document.createElement("input");
  newinput.type="number";
  newinput.id="inputv";
  const newbtn=document.createElement("button");
  newbtn.textContent="ثبت";
 const edittd=crow.querySelector("#qtd");
  if(document.querySelector("#inputv")){alarm("فرم در حال ویرایش است")}else{
    crow.appendChild(newinput);
  crow.appendChild(newbtn);
  newbtn.addEventListener("click",()=>{
 const ooldname=crow.querySelector("#oldname").textContent;  
let editedw=srow.querySelector("#cellweight");
let editedv=srow.querySelector("#cellvolum");

edittd.textContent=newinput.value;
let newweight=crow.querySelector("#cweii");
let newvol=crow.querySelector("#cvol");
newweight.textContent=newinput.value*weight;
newvol.textContent=(newinput.value*volum).toFixed(2);
pluss.delw(oldweight);
pluss.delv(oldvol);
pluss.sumwei(newinput.value*weight);
pluss.sumvol(newinput.value*volum);
editedw.textContent=`${pluss.statew()}`;
editedv.textContent=`${pluss.statev()}`;
vehicle(pluss.statew(),pluss.statev());
crp.changeqty(ooldname,newinput.value);
vicle();
//console.log(crp.finalcrop());
    newinput.remove();
    newbtn.remove();
  })}
  
})
        divtable.appendChild(croptables);
        vehicle(pluss.statew(),pluss.statev());
        crp.statelist(name,qty,id);
        vicle();
       // console.log(crp.finalcrop());
     }
    function load(printed){
        tbody.innerHTML="";
        
        
        if(printed.length===0){noresult.textContent="موردی یافت نشد";
          div.appendChild(noresult)
        }else{noresult.textContent="";
     // console.log(printed);    
    printed.forEach(n => {
        const row=document.createElement("tr");
        const newnumber=number();
        const btnp=document.createElement("button");
        btnp.textContent="+";
        const btnn=document.createElement("button");
        btnn.textContent="-";
        const spann=document.createElement("input");
        spann.type="number";
        spann.id="inputnumber";
        spann.value=`${newnumber.stat()}`;
        const btn=document.createElement("button");
        btn.textContent="انتخاب";
        row.innerHTML=`<td>${n.name}</td>
        <td>${n.barcode}</td>
        <td>${n.id}</td>`;
        const cellbtn=document.createElement("td");
        const cellnum=document.createElement("td");
        const cellbtnn=document.createElement("td");
        const cellbtnp=document.createElement("td");
        cellnum.appendChild(spann);
        cellbtnn.appendChild(btnn);
        cellbtnp.appendChild(btnp);
        cellbtn.appendChild(btn);
        row.appendChild(cellbtnn);
        row.appendChild(cellnum);
        row.appendChild(cellbtnp);
        row.appendChild(cellbtn);
        tbody.appendChild(row);
        btnn.addEventListener("click",()=>{newnumber.dec()
            spann.value=`${newnumber.stat()}`;
        });
        btnp.addEventListener("click",()=>{newnumber.inc()
            spann.value=`${newnumber.stat()}`;
        });
       // console.log(span.value);
       btn.addEventListener("click",()=>{
   if(spann.value>0&&![...divtable.querySelectorAll("tr")].some(l=>l.textContent.includes(n.name))){
    const fweight=n.weight*spann.value;
    const fvolum=n.volum*spann.value;
   pluss.sumwei(fweight);
   pluss.sumvol(fvolum);
  // console.log(pluss.statew());
   croptable(n.name,n.barcode,spann.value,n.volum,n.weight,n.id);
    newnumber.reset();
   spann.value=`${newnumber.stat()}`;
   
   }else if(spann.value<=0){alarm("لطفا برای دستگاه یک مقدار وارد کنید")}else{alarm("قبلا این کالا انتخاب شده است");newnumber.reset();
   spann.value=`${newnumber.stat()}`;}
}) 
        
    });
    table.appendChild(tbody);

    
   
}}
function search(){
    const newlist3=[...newlist];
   // console.log(newlist3);
let newlist2=[];
span.textContent="";
    const searched=input.value.toLowerCase().trim();
   const result= newlist3.filter(l=>l.barcode.toLowerCase().includes(searched));
   // console.log(result);
  if(!searched){
   // span.textContent="نتیجه ای برای نمایش وجود ندارد";
    //div.appendChild(span);
    filtered();
  }else{newlist2=result
    load(newlist2)}
    
    
}

function filtered(){
    const newlist4=[...newlist];
   // console.log(newlist4);
    const cul=newlist4.filter(n=>n.name.includes("واتور")||n.name.includes("ترا"));
    const gene=newlist4.filter(n=>n.name.includes("موتور برق")||n.name.includes("موتوربرق"));
    const brush=newlist4.filter(n=>n.name.includes("تراش"));
    const pomp=newlist4.filter(n=>n.name.includes("پمپ آب")||n.name.includes("پمپ اب"));
    const sparey=newlist4.filter(n=>n.name.includes("سمپاش"));
    const hole=newlist4.filter(n=>n.name.includes("چاله"));
    const saww=newlist4.filter(n=>n.name.includes("اره"));
   // console.log(saww);
        const culcode =cul.map(c=>c.id);
        const genecode =gene.map(g=>g.id);
        const brushcode =brush.map(b=>b.id);
        const pompcode =pomp.map(p=>p.id);
        const spareycode = sparey.map(s=>s.id);
        const holecode=hole.map(h=>h.id);
        const sawwcode=saww.map(s=>s.id);

    const othe=newlist4.filter(n=>!culcode.includes(n.id)).filter(n=>!genecode.includes(n.id)).filter(n=>!brushcode.includes(n.id)).filter(n=>!pompcode.includes(n.id)).filter(n=>!spareycode.includes(n.id))
   .filter(n=>!holecode.includes(n.id)).filter(n=>!sawwcode.includes(n.id));
    // console.log(othe);
   if(selectcrop.value==="colt"){load(cul)}else if(selectcrop.value==="gen"){load(gene)}else if(selectcrop.value==="bru"){load(brush)}else if(selectcrop.value==="wat"){load(pomp)}else if(selectcrop.value==="spa"){load(sparey)}else if(selectcrop.value==="hol"){load(hole)}else if(selectcrop.value==="sawe"){load(saww)}else{load(othe)}

}
selectcrop.addEventListener("change",()=>{filtered()
})
 input.addEventListener("input",()=>{
    search()
});


