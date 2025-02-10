(()=>{"use strict";var e={91:(e,t,o)=>{o.d(t,{S0:()=>s,j$:()=>c,x_:()=>i});const n=document.getElementById("uploadScreen"),a=document.getElementById("loadingScreen"),r=document.getElementById("resultScreen");function s(){n.classList.add("hidden"),a.classList.remove("hidden"),r.classList.add("hidden")}function c(){n.classList.add("hidden"),a.classList.add("hidden"),r.classList.remove("hidden")}function i(){n.classList.remove("hidden"),a.classList.add("hidden"),r.classList.add("hidden")}i()},60:(e,t,o)=>{o.d(t,{l:()=>c});var n=o(917);const a=document.getElementById("toggle_switch1"),r=document.getElementById("toggle_switch2"),s=document.getElementById("tabbody");function c(e){document.querySelectorAll(".descriptionItem").forEach((e=>e.style.display="none")),document.getElementById(e).style.display="block";const t=document.querySelectorAll("#tabcontrol a");t.forEach((e=>e.classList.remove("active"))),t.forEach((e=>{e.firstElementChild.classList.remove("noneTransparent")}));const o=document.querySelector(`#tabcontrol a[href="#${e}"]`);o.classList.add("active"),o.firstElementChild.classList.add("noneTransparent"),s.style.backgroundColor=window.getComputedStyle(o).getPropertyValue("background-color")}document.querySelectorAll("#tabcontrol a").forEach((e=>{e.addEventListener("click",(t=>{t.preventDefault(),c(e.getAttribute("href").substring(1))}))})),a.addEventListener("change",(()=>{if(r.checked&&(r.checked=!1),a.checked){const e=document.getElementById("heatmapImage").src;document.getElementById("originalImage").src=e}else document.getElementById("originalImage").src=n.k})),r.addEventListener("change",(()=>{if(a.checked&&(a.checked=!1),r.checked){const e=document.getElementById("backgroundRemovalImage").src;document.getElementById("originalImage").src=e}else document.getElementById("originalImage").src=n.k}))},917:(e,t,o)=>{o.d(t,{k:()=>I});var n=o(91),a=o(60);const r=document.getElementById("uploadTile"),s=document.getElementById("loadedimage"),c=document.getElementById("rep-colors"),i=document.getElementById("histogram"),d=document.getElementById("histogram-description"),l=document.getElementById("heatmap"),m=document.getElementById("heatmap-description"),g=document.getElementById("backgroundRemoval"),u=document.getElementById("toggle_switch1"),h=document.getElementById("toggle_switch2");let p=null;firebase.apps.length||firebase.initializeApp({apiKey:"AIzaSyA-wjt8D4zYzLhj6HEeLRqjSDWmTrBku70",authDomain:"artisanallyproject.firebaseapp.com",projectId:"artisanallyproject",storageBucket:"artisanallyproject.firebasestorage.app",messagingSenderId:"471591578999",appId:"1:471591578999:web:4b37ca262aa514c91f8572"});const y=firebase.firestore(),f="rooms",E="chat_history";let _=null,w=null,I=null;async function v(e){try{const t=await y.collection(f).doc(e).get();if(!t.exists)throw new Error("Firestore document not found.");let o=t.data();const n=y.collection(f).doc(e).collection(E),a=await n.get();o[E]={};for(const e of a.docs)o[E][e.id]=e.data(),o[E][e.id].id=e.id;return o}catch(e){throw new Error(`Failed to fetch Firestore data: ${e.message}`)}}function b(e){console.log(e);const t=`https://storage.googleapis.com/${e.bucket_name}/images/`;if("original_image_name"in e){let o=null;"rep_colors"in e&&(o=function(e){c.innerHTML="";const t=function(e){const t=[];for(const o of e){const e="#"+o.r.toString(16).padStart(2,"0")+o.g.toString(16).padStart(2,"0")+o.b.toString(16).padStart(2,"0");t.push(e)}return t}(e.rep_colors);for(const e in t){const o=document.createElement("div");o.id=e,o.className="drop-tile",o.style.backgroundColor=t[e],c.appendChild(o)}return t[0]}(e));const n=e.original_image_name;I=t+n;const a=document.createElement("img");a.src=I,a.id="originalImage",a.style.maxWidth="100%",a.style.maxHeight="100%",s.style.backgroundColor=null!==o?o:"#fff",s.innerHTML="",s.appendChild(a)}if("histogram_image_name"in e&&null!==e.histogram_image_name){const o=t+e.histogram_image_name;i.innerHTML=`<img src="${o}" alt="Histogram">`}if("histogram_commentary"in e&&null!==e.histogram_commentary&&(d.textContent=e.histogram_commentary),"heatmap_image_name"in e&&null!==e.heatmap_image_name){const o=t+e.heatmap_image_name;u.checked=!1,l.innerHTML=`<img src="${o}" alt="Heatmap" id="heatmapImage">`}if("heatmap_commentary"in e&&null!==e.heatmap_commentary&&(m.textContent=e.heatmap_commentary),"back_removed_image_name"in e&&null!==e.back_removed_image_name){const o=t+e.back_removed_image_name;h.checked=!1,g.innerHTML=`<img src="${o}" alt="Heatmap" id="backgroundRemovalImage">`}"chat_history"in e&&null!==e.chat_history&&function(e){const t=[];for(const[o,n]of Object.entries(e.chat_history))t.push(n);t.sort(((e,t)=>new Date(e.created_at)-new Date(t.created_at)));const o=new Set,n=document.getElementsByClassName("message");for(const e of n)o.add(e.id);for(const e of t)o.has(e.id)||S(e.text,e.sender,e.id)}(e)}function k(e){console.log("Data changed:",e)}r.addEventListener("dragover",(e=>{e.preventDefault(),r.style.backgroundColor="#e0e0e0"})),r.addEventListener("dragleave",(e=>{e.preventDefault(),r.style.backgroundColor=""})),r.addEventListener("drop",(e=>{e.preventDefault(),r.style.backgroundColor="";const t=e.dataTransfer.files[0];t&&t.type.startsWith("image/")?async function(e){(0,n.S0)();try{const t=await function(e){return new Promise(((t,o)=>{const n=new FileReader;n.readAsDataURL(e),n.onload=()=>{const o=n.result.split(","),a=o[o.length-1];t({image:a,image_type:e.type.split("/")[1]})},n.onerror=e=>o(e)}))}(e),o=await async function(e){try{const t=await fetch("/upload/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const e=await t.text();throw new Error(`HTTP error! status: ${t.status}, message: ${e}`)}const o=await t.json();if(o&&o.room_id)return console.log("Received ID:",o.room_id),o.room_id;throw new Error("Invalid response format: 'id' property missing.")}catch(e){throw console.error("Error sending image:",e),e}}(t);p=o,b(await v(o)),(0,n.j$)(),(0,a.l)("tabpage1"),function(e){_&&_();const t=y.collection(f).doc(e).collection(E);_=y.collection(f).doc(e).onSnapshot((e=>{if(e.exists){const o=e.data();t.get().then((e=>{o[E]={};for(const t of e.docs)o[E][t.id]=t.data()})),b(o),k(o)}else console.log("Document does not exist (anymore).")}),(e=>{console.error("Error in realtime listener:",e)})),w&&w(),w=t.onSnapshot((t=>{t.docChanges().forEach((t=>{v(e).then((e=>{b(e),k(e)})),console.log("New document added: ",t.doc.data())}))}),(e=>{console.error("Error listening for changes: ",e)}))}(o),await async function(e){const t=["/main_commentary/","/histogram_commentary/","/background_removal/","/heatmap/"];for(const o of t)try{const t=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({room_id:e})});if(!t.ok){const e=await t.text();throw new Error(`HTTP error! status: ${t.status}, message: ${e}`)}}catch(e){throw console.error("Error sending image:",e),e}}(o)}catch(e){console.error("Error processing image:",e),(0,n.x_)()}}(t):alert("画像ファイルをドロップしてください。")}));const B=document.getElementById("messageBox"),L=document.getElementById("inputMsg");function S(e,t,o){const n=document.createElement("div");n.classList.add("message"),n.classList.add("user"===t?"user-message":"ai-message"),n.id=o,n.textContent=e,B.appendChild(n),B.scrollTop=B.scrollHeight}document.getElementById("sendBtn").addEventListener("click",(async()=>{const e=L.value.trim();if(e){L.value="";try{await async function(e){try{console.log({user_message:e,room_id:p});const t=await fetch("/chat/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_message:e,room_id:p})});if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);console.log("Success: chat")}catch(e){throw console.error("Error:",e),e}}(e)}catch(e){console.error("Error getting AI response:",e)}}}))}},t={};function o(n){var a=t[n];if(void 0!==a)return a.exports;var r=t[n]={exports:{}};return e[n](r,r.exports,o),r.exports}o.d=(e,t)=>{for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),o(917)})();