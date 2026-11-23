const divs = document.getElementById("serdiv");
const divb =document.getElementById("sendiv");
const divsh =document.getElementById("serdiv");
const inputserch =document.createElement("input");
inputserch.placeholder="جستجوی  سریال - تاریخ - نام";
inputserch.id="ich";
const sebutton =document.createElement("button");
sebutton.textContent="ارسال اطلاعات";
divb.appendChild(sebutton);
divb.appendChild(inputserch);
const selects=document.createElement("select");
const selectm =document.createElement("select");
const selectd =document.createElement("select");
selectd.id="sd";
const inputs = document.createElement("input");
inputs.type="number";
inputs.placeholder="";
inputs.id="se";
const inputlabel =document.createElement("label");
inputlabel.textContent ="سریال دستگاه :  ";
const inputname =document.createElement("label");
inputname.textContent ="نام تحویل گیرنده  :  ";
const inputdate =document.createElement("label");
inputdate.textContent ="تاریخ ارسال دستگاه :  ";
const inputmodel =document.createElement("label");
inputmodel.textContent ="مدل دستگاه :  ";
const inputyear =document.createElement("label");
inputyear.textContent ="سال ساخت دستگاه :  ";
const inputf = document.createElement("input");
inputf.type="text";
inputf.id ="fin";
const inbutton =document.createElement("button");
inbutton.textContent="ثبت";
const table = document.createElement("table");
const thead =document.createElement("thead");

const tbody =document.createElement("tbody");
const tablef = document.createElement("table");
const theadf =document.createElement("thead");
const tbodyf =document.createElement("tbody");
function makeserial(){
fetch('/p1/api/jalali-dates')
.then(res=>res.json())
.then(ta=>{
    const today=ta[0].date;
console.log(today);
cu(today);
})
}
makeserial();
function cu(today){
    const nown =today.split("/");
    let newto =[];
    let y =Number(nown[0]);
        let m =Number(nown[1]);
    let d =Number(nown[2]);
   // const m2 =m.toString().padStart(2,"0");
//const d2 =d.toString().padStart(2,"0");
   // newto.push(`${y}:${m2}:${d2}`);
   const newt = today.replace(/\//g, ":");
   newto.push(newt);
    for(let x=0 ;x<7 ;x++){
        
if(d>1){d=d-1}else if(d===1){if(m<=7){d=31;m=m-1}else{d=30;m=m-1}};
let m1=m.toString().padStart(2,"0");
let d1 =d.toString().padStart(2,"0");
newto.push(`${y}:${m1}:${d1}`);
    }
    console.log(newto);
op(newto);
modelselect(y);
oc();
}
function op(newto){
    newto.forEach(n => {
      const option =document.createElement("option");
      option.textContent=n;
      option.value=n;
      selectd.appendChild(option); 
    });
    inputdate.appendChild(selectd);
    divs.appendChild(inputdate);
    const li =selectd.querySelectorAll("option")[0].value;
console.log(li)
}
function modelselect(y){
    const ym=[y-1000,(y-1000)-1]
ym.forEach(y=>{const opy =document.createElement("option");
opy.textContent=y;
selectm.appendChild(opy);
})
inputyear.appendChild(selectm);
divs.appendChild(inputyear);
}
function oc(){
    const tc=['D05','D06','D09','D11','G06','G13','G16','G18'];
    tc.forEach(t=>{
        const pc=document.createElement("option");
        pc.textContent=t;
        selects.appendChild(pc);
    })
    inputmodel.appendChild(selects);
    divs.appendChild(inputmodel);
}
function makeob(){
    const n =inputf.value.trim();
    const d = selectd.value;
    const y =selectm.value;
    const m =selects.value;
    let s =inputs.value.trim();
    const f =`${y}${m}${s}`;
    console.log(f);
    if(!n&&!s){ return alarm("لطفا تمام موارد را تکمیل کنید")}else if(n&&d&&y&&m&&s){if(nob.stat().length===0||nob.stat().every(n=>n.fin!==f)){nob.addn(n,d,y,m,s,f)};imp();
    inputs.value="";}
}
class Pro {
    constructor(){
        this.list=[];
        this.name ='';
        this.date ='';
        this.yea ='';
        this.model ='';
        this.ser ='';

    }
    addn(namec,datee,yeaa,modell,seri,f){
        this.name=namec;
         this.date =datee;
        this.yea =yeaa;
        this.model =modell;
        this.ser =seri;
        this.list.push({name:this.name,year:this.yea,model:this.model,serial:this.ser,date:this.date,fin:f});
        console.log(this.list);

    }
    del(serial){
       this.list = this.list.filter(l=>l.fin!==serial)
        console.log(this.list);
    }
    stat(){
        return this.list;
    }
   reset(){
    this.list=[];
   }
}
 const nob =new Pro();

function imp(){
 thead.innerHTML='<tr><th>نام تحویل گیرنده</th><th>تاریخ فاکتور</th><th>سریال دستگاه</th><th>عملیات</th></tr>';   
tbody.innerHTML="";
nob.stat().forEach(n=>{
    const serialno =`${n.year}${n.model}${n.serial}`;
    const row=document.createElement("tr");
    row.id="rt"
    row.innerHTML=`<td>${n.name}</td><td>${n.date}</td><td>${serialno}</td><td><button id="dbn">حذف</button></td>`;
    const dn = row.querySelector("#dbn");
    tbody.appendChild(row);
dn.onclick=()=>{nob.del(n.fin);row.remove();if(!document.querySelector("#rt")){thead.innerHTML="";}}
    
})
table.appendChild(thead);
table.appendChild(tbody);
divs.appendChild(table);

}
function sendto() {
  fetch('/p3/saveserial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nob.stat())
  })
  .then(async res => {
    let data;
    try {
      data = await res.json();  // فقط یک بار JSON بخون
    } catch (e) {
      console.warn("پاسخ JSON معتبر نبود");
      data = null;
    }

    if (!res.ok) {
      console.error("خطا از سرور:", data || res.statusText);
      alarm(`${data.error}:${data.serial}`)
      return;
    }
table.innerHTML="";
nob.reset();
console.log(nob.stat());
    console.log("موفق:", data);
    alarm("ثبت شد");
  })
  .catch(err => {
    console.error("خطای شبکه یا fetch:", err);
  });
}

function rec(){
  fetch('/p3/sedata')
  .then(res=>res.json())
  .then(data=>{if(data.length>0){tabe(data)}}
)}


function tabe(data){
  nob.reset();
  table.innerHTML="";
  let num=1;
  const searched =inputserch.value.trim();
  const newdata=data.filter(d=>d.crname.includes(searched)||d.sdate.includes(searched)||d.serial.toLowerCase().includes(searched));
  theadf.innerHTML='<tr><th>ردیف</th><th>نام تحویل گیرنده</th><th>تاریخ فاکتور</th><th>سریال دستگاه</th></tr>';
  tbodyf.innerHTML="";
  newdata.forEach(n=>{
    
    const rowf=document.createElement("tr");
    rowf.innerHTML=`<td>${num}</td><td>${n.crname}</td><td>${n.sdate}</td><td>${n.serial}</td>`;
    tbodyf.appendChild(rowf);
   num=num+1;
 }) 
   tablef.appendChild(theadf);
    tablef.appendChild(tbodyf);
divb.appendChild(tablef);

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
      divs.appendChild(divalarm);
      btnalarm.addEventListener("click",()=>{divalarm.remove()})}else{return}
    }

inputserch.addEventListener("input",()=>{if(!inputserch.value.trim()){tablef.remove()}else{rec()}})
inputname.appendChild(inputf);
divs.appendChild(inputname);
inputlabel.appendChild(inputs);
divs.appendChild(inputlabel);
divs.appendChild(inbutton);
inbutton.addEventListener("click",()=>{
    makeob();
});
sebutton.addEventListener("click",()=>{if(nob.stat().length>0){sendto();}else{alarm("داده ای برای ارسال وجود ندارد")}

})