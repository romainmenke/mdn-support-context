// ==UserScript==
// @name        Support context
// @version     1.0.19
// @description Add context about support on MDN documentation, using your own browserslist as a target.
// @author      Romain Menke
// @match       https://developer.mozilla.org/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==


				<label for="rm-support-context-browserslist">Browserslist:</label>
				<input style="all: revert;" type="text" id="rm-support-context-browserslist" name="rm-support-context-browserslist" value="${e}">
				<button style="all: revert;" id="rm-support-context-browserslist-submit">Save</button>
			</div>
		`);let f=`
		<details class="baseline-indicator supported support-context" style="background: hsl(${Math.round(140*s)}deg ${r}% ${m}%)">
			<summary>
				<h2>Supported in: <span class="not-bold">${o.percentageOfTarget}% of your targets ${"100.0"===o.percentageOfTarget?"\uD83C\uDF89":""}</span></h2><br>
				<div>Stable in: ${o.numberOfVendorImplementations}/3 browser engines</div>
			</summary>

			<div class="extra">${_}</div>

			${i}
		</details>`,p=document.createElement("div");return p.innerHTML=f,a&&p.querySelector("#rm-support-context-browserslist-submit")?.addEventListener("click",()=>{a(p.querySelector("#rm-support-context-browserslist")?.value)}),p}let or=!1;var om=function(o,e){if(!o)return;let a=document.getElementById("hydration");if(!a)return;let s=a.textContent.trim();if(!s)return;let r=JSON.parse(s).doc;if(!r)return;let m=r.browserCompat;if(!m||!m.length||or)return;or=!0;let _=f(o,{ignoreUnknownVersions:!0,mobileToDesktop:!0}).filter(o=>!oe.test(o)),p=new Set(_),c=f.coverage(_),t=[],g=[];for(let o=0;o<m.length;o++){let e=m[o],a=e.split("."),s=i;for(let o=0;o<a.length;o++){let e=a[o];if(!(s=s[e]))break}if(!s)continue;let r=function o(e){let a=[];if(!e.__compat)return a;let s=e.__compat;for(let o in s)if(s[o]&&!Number.isNaN(parseFloat(s[o])))try{let e=f(o+" >= "+s[o],{ignoreUnknownVersions:!0});a.push(...e)}catch(o){}for(let s in e){if("__compat"===s)continue;let r=o(e[s]);if(!1===r)continue;let m=new Set(r);a=a.filter(o=>m.has(o))}return a}(s);if(!r)continue;let _=new Set(r.filter(o=>!oe.test(o)));t=0===o?Array.from(_):g.filter(o=>_.has(o))}t=new Set(t);let n=!1,d=!1,u=!1;for(let o of t)o.startsWith("safari ")?n=!0:o.startsWith("chrome ")?d=!0:o.startsWith("firefox ")&&(u=!0);let h={percentageOfTarget:0,numberOfVendorImplementations:0};for(let o of(n&&h.numberOfVendorImplementations++,d&&h.numberOfVendorImplementations++,u&&h.numberOfVendorImplementations++,p))if(t.has(o)){g.push(o);continue}let x=f.coverage(g);h.percentageOfTarget=Math.min(100,x/c*100).toFixed(1),Number.isNaN(h.percentageOfTarget)&&(h.percentageOfTarget=0);{let a=document.querySelector(".baseline-indicator:not(.support-context)");if(a)a.replaceWith(os(h,o,e));else{let a=document.querySelector("h1");a&&a.after(os(h,o,e))}}};let o_=o=>{GM.setValue("browserslist",o)};requestAnimationFrame(()=>{GM.getValue("browserslist","defaults").then(o=>{om(o,o_),document.addEventListener("readyStateChange",()=>{om(o,o_)})})})})();