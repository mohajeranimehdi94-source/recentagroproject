
const btnd=document.createElement("button");
const btnclo =document.createElement("button");
btnclo.textContent="بستن";
const divb=document.getElementById("imp");
   const table = document.createElement("table");
const thead = document.createElement("thead");
thead.innerHTML='<th>نام نماینده</th><th>شماره حواله انبار</th><th></th><th></th>';
btnd.textContent="لیست حواله های ثبت شده";
divb.appendChild(btnd);
divb.appendChild(btnclo);

function listimp(){
    fetch('/p2/sendsaved')
    .then(res=>res.json())
    .then(dataim=>{divload(dataim);console.log(dataim)})
}
function divload(dataim){
    if([...dataim].length<1){return;}else{
        table.innerHTML="";
    const tbody=document.createElement("tbody");
    tbody.innerHTML="";
    const inid =document.createElement("input");
    dataim.forEach(d => {
        const row =document.createElement("tr");
        row.innerHTML=`<td>${d.cuname}</td>
        <td>${d.cpid}</td>
        <td id="ibtn"></td>
        <td id="idbtn"></td>`;
        const sbtn=document.createElement("button");
        sbtn.textContent="انتخاب";
        const dibtn=document.createElement("button");
        dibtn.textContent="حذف";
        const std = row.querySelector("#ibtn");
        const dtd= row.querySelector("#idbtn");
        std.appendChild(sbtn);
        dtd.appendChild(dibtn);
    tbody.appendChild(row);
        //divb.appendChild(ul);
        sbtn.onclick=()=>{
            const form = document.querySelector("#reservationForm");
            const ne = document.querySelector("#customerName");
            const ve =document.querySelector("#vehicleType");
            if(form.querySelector("#customerID")){const inidd=form.querySelector("#customerID");
                inidd.remove()}
            inid.type="number";
            inid.readOnly=true;
            inid.id="customerID";
            inid.label="شماره حواله انبار";
            const newop =[...ve.querySelectorAll("option")].find(n=>n.value===d.carname);
            console.log(newop);
            form.appendChild(inid);
            inid.value=d.cpid;
            ne.value=d.cuname;
            ne.readOnly=true;
            newop.selected=true;
            chech();
            table.innerHTML="";
        };
        dibtn.onclick=()=>{
del(d.id);
        }
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    divb.appendChild(table);

}};
function del(id){
    const id1=id;
    fetch(`/p2/delitem/${id1}`,{method:'DELETE'})
    .then(res=>{if(!res.ok){showError("عملیات ناموفق")}})
        .then(res=>{showError("حذف شد");
            table.innerHTML="";
            listimp();
            

        })
        }

        function chech(){
            const ves =document.querySelector("#vehicleType");
            const sop =ves.querySelectorAll("option");
            const i =document.querySelector("#customerID");
            const o =[...sop].find(o=>o.selected===true);
            console.log(o);
            ves.addEventListener("change",()=>{if(document.querySelector("#customerID")){o.selected=true;}})
        }
        function ress(){
          const iw =document.querySelector("#customerID");
          const ner = document.querySelector("#customerName");
        if(iw){iw.remove() ; ner.readOnly=false; }
        }
btnd.onclick=()=>{listimp()};
btnclo.onclick=()=>{table.innerHTML="";
    const form = document.querySelector("#reservationForm");
    form.reset();
    ress();
}
