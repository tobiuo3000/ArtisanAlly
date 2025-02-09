(()=>{"use strict";var e={398:(e,t,n)=>{n.d(t,{_:()=>s});var o=n(917);const a=document.getElementById("messageBox"),r=document.getElementById("inputMsg");function s(e,t,n){const o=document.createElement("div");o.classList.add("message"),o.classList.add("user"===t?"user-message":"ai-message"),o.id=n,o.textContent=e,a.appendChild(o),a.scrollTop=a.scrollHeight}document.getElementById("sendBtn").addEventListener("click",(async()=>{const e=r.value.trim();if(e){r.value="";try{await async function(e){try{console.log({user_message:e,room_id:o.Z});const t=await fetch("/chat/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_message:e,room_id:o.Z})});if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);console.log("Success: chat")}catch(e){throw console.error("Error:",e),e}}(e)}catch(e){console.error("Error getting AI response:",e)}}}))},91:(e,t,n)=>{n.d(t,{S0:()=>s,j$:()=>c,x_:()=>i});const o=document.getElementById("uploadScreen"),a=document.getElementById("loadingScreen"),r=document.getElementById("resultScreen");function s(){o.classList.add("hidden"),a.classList.remove("hidden"),r.classList.add("hidden")}function c(){o.classList.add("hidden"),a.classList.add("hidden"),r.classList.remove("hidden")}function i(){o.classList.remove("hidden"),a.classList.add("hidden"),r.classList.add("hidden")}i()},60:(e,t,n)=>{n.d(t,{l:()=>c});var o=n(917);const a=document.getElementById("toggle_switch1"),r=document.getElementById("toggle_switch2"),s=document.getElementById("tabbody");function c(e){document.querySelectorAll(".descriptionItem").forEach((e=>e.style.display="none")),document.getElementById(e).style.display="block";const t=document.querySelectorAll("#tabcontrol a");t.forEach((e=>e.classList.remove("active"))),t.forEach((e=>{e.firstElementChild.classList.remove("noneTransparent")}));const n=document.querySelector(`#tabcontrol a[href="#${e}"]`);n.classList.add("active"),n.firstElementChild.classList.add("noneTransparent"),s.style.backgroundColor=window.getComputedStyle(n).getPropertyValue("background-color")}document.querySelectorAll("#tabcontrol a").forEach((e=>{e.addEventListener("click",(t=>{t.preventDefault(),c(e.getAttribute("href").substring(1))}))})),a.addEventListener("change",(()=>{if(r.checked&&(r.checked=!1),a.checked){const e=document.getElementById("heatmapImage").src;document.getElementById("originalImage").src=e}else document.getElementById("originalImage").src=o.k})),r.addEventListener("change",(()=>{if(a.checked&&(a.checked=!1),r.checked){const e=document.getElementById("backgroundRemovalImage").src;document.getElementById("originalImage").src=e}else document.getElementById("originalImage").src=o.k}))},917:(e,t,n)=>{n.d(t,{Z:()=>y,k:()=>b});var o=n(91),a=n(398),r=n(60);const s=document.getElementById("uploadTile"),c=document.getElementById("loadedimage"),i=document.getElementById("rep-colors"),d=document.getElementById("histogram"),l=document.getElementById("histogram-description"),m=document.getElementById("heatmap"),g=document.getElementById("heatmap-description"),u=document.getElementById("backgroundRemoval"),h=document.getElementById("toggle_switch1"),p=document.getElementById("toggle_switch2");let y=null;firebase.apps.length||firebase.initializeApp({apiKey:"AIzaSyA-wjt8D4zYzLhj6HEeLRqjSDWmTrBku70",authDomain:"artisanallyproject.firebaseapp.com",projectId:"artisanallyproject",storageBucket:"artisanallyproject.firebasestorage.app",messagingSenderId:"471591578999",appId:"1:471591578999:web:4b37ca262aa514c91f8572"});const f=firebase.firestore(),E="rooms",_="chat_history";let I=null,v=null,b=null;async function w(e){try{const t=await f.collection(E).doc(e).get();if(!t.exists)throw new Error("Firestore document not found.");let n=t.data();const o=f.collection(E).doc(e).collection(_),a=await o.get();n[_]={};for(const e of a.docs)n[_][e.id]=e.data(),n[_][e.id].id=e.id;return n}catch(e){throw new Error(`Failed to fetch Firestore data: ${e.message}`)}}function k(e){console.log(e);const t=`https://storage.googleapis.com/${e.bucket_name}/images/`;if("original_image_name"in e){let n=null;"rep_colors"in e&&(n=function(e){i.innerHTML="";const t=function(e){const t=[];for(const n of e){const e="#"+n.r.toString(16).padStart(2,"0")+n.g.toString(16).padStart(2,"0")+n.b.toString(16).padStart(2,"0");t.push(e)}return t}(e.rep_colors);for(const e in t){const n=document.createElement("div");n.id=e,n.className="drop-tile",n.style.backgroundColor=t[e],i.appendChild(n)}return t[0]}(e));const o=e.original_image_name;b=t+o;const a=document.createElement("img");a.src=b,a.id="originalImage",a.style.maxWidth="100%",a.style.maxHeight="100%",c.style.backgroundColor=null!==n?n:"#fff",c.innerHTML="",c.appendChild(a)}if("histogram_image_name"in e&&"histogram_explanation"in e&&null!==e.histogram_image_name&&null!==e.histogram_explanation){const n=t+e.histogram_image_name,o=e.histogram_explanation;d.innerHTML=`<img src="${n}" alt="Histogram">`,l.textContent=o}if("heatmap_image_name"in e&&"heatmap_explanation"in e&&null!==e.heatmap_image_name&&null!==e.heatmap_explanation){const n=t+e.heatmap_image_name,o=e.heatmap_explanation;h.checked=!1,m.innerHTML=`<img src="${n}" alt="Heatmap" id="heatmapImage">`,g.textContent=o}if("back_removed_image_name"in e&&null!==e.back_removed_image_name){const n=t+e.back_removed_image_name;p.checked=!1,u.innerHTML=`<img src="${n}" alt="Heatmap" id="backgroundRemovalImage">`}"chat_history"in e&&null!==e.chat_history&&function(e){const t=[];for(const[n,o]of Object.entries(e.chat_history))t.push(o);t.sort(((e,t)=>new Date(e.created_at)-new Date(t.created_at)));const n=new Set,o=document.getElementsByClassName("message");for(const e of o)n.add(e.id);for(const e of t)n.has(e.id)||(0,a._)(e.text,e.sender,e.id)}(e)}function B(e){console.log("Data changed:",e)}s.addEventListener("dragover",(e=>{e.preventDefault(),s.style.backgroundColor="#e0e0e0"})),s.addEventListener("dragleave",(e=>{e.preventDefault(),s.style.backgroundColor=""})),s.addEventListener("drop",(e=>{e.preventDefault(),s.style.backgroundColor="";const t=e.dataTransfer.files[0];t&&t.type.startsWith("image/")?async function(e){(0,o.S0)();try{const t=await function(e){return new Promise(((t,n)=>{const o=new FileReader;o.readAsDataURL(e),o.onload=()=>{const n=o.result.split(","),a=n[n.length-1];t({image:a,image_type:e.type.split("/")[1]})},o.onerror=e=>n(e)}))}(e),n=await async function(e){try{const t=await fetch("/upload/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const e=await t.text();throw new Error(`HTTP error! status: ${t.status}, message: ${e}`)}const n=await t.json();if(n&&n.id)return console.log("Received ID:",n.id),n.id;throw new Error("Invalid response format: 'id' property missing.")}catch(e){throw console.error("Error sending image:",e),e}}(t);k(await w(n)),(0,o.j$)(),(0,r.l)("tabpage1"),function(e){I&&I();const t=f.collection(E).doc(e).collection(_);I=f.collection(E).doc(e).onSnapshot((e=>{if(e.exists){const n=e.data();t.get().then((e=>{n[_]={};for(const t of e.docs)n[_][t.id]=t.data()})),k(n),B(n)}else console.log("Document does not exist (anymore).")}),(e=>{console.error("Error in realtime listener:",e)})),v&&v(),v=t.onSnapshot((t=>{t.docChanges().forEach((t=>{w(e).then((e=>{k(e),B(e)})),console.log("New document added: ",t.doc.data())}))}),(e=>{console.error("Error listening for changes: ",e)}))}(n)}catch(e){console.error("Error processing image:",e),alert("Error: "+e.message),(0,o.x_)()}}(t):alert("画像ファイルをドロップしてください。")}))}},t={};function n(o){var a=t[o];if(void 0!==a)return a.exports;var r=t[o]={exports:{}};return e[o](r,r.exports,n),r.exports}n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n(917)})();