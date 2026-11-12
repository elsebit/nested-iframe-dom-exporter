// ==UserScript==
// @name         Nested iframe DOM Exporter
// @namespace    local.finance.dom-export
// @version      0.14.0
// @description  Export the current page and readable nested iframe DOM sources into one HTML file for AI analysis. Redacts recognizable credential form fields.
// @author       elsebit
// @homepageURL  https://github.com/elsebit/nested-iframe-dom-exporter
// @supportURL   https://github.com/elsebit/nested-iframe-dom-exporter/issues
// @updateURL    https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js
// @downloadURL  https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js
// @license      All rights reserved
// @match        http://*/*
// @match        https://*/*
// @run-at       document-idle
// @noframes
// @grant        GM_registerMenuCommand
// ==/UserScript==
// Build variant: obfuscated
(function () {
  'use strict';
function o(){
const o4=["cSkAW7NdM8kkWRFdPW","WRhcUCo+EK1eW7VcHq","W7G7qWhdRx3cG2jFuqaW","u3KoWPT9W4Lzta","d8klW6FdHa","FXpdQCoIWQJcLSoIFSk3rcBcH8oU","kZ12W5P0tmoGlG","ebD4y8kuWOjuWPu","W7eOh8odtbaHsbRdH8oLWOtdQSoZDW","g8o1oIxdG8on","BmopoSoxWPrE","W4qpvW","rJhdNCkkWRy","W4vFlmoE","WP1GW43dUSovt3XIo14fdConWPNdGW","nmkrW7WlgqS","E8ozW6ddTW","W5hcV8kvW6FcGhddHSo2","ffZdLrbawwBcLgJcKSkYWOddQq","bb9FW7hdMCoJW6VdVCoHwmkHWPCT","CHzzWQJdLd/dL8oN","buuwW77dLcpdSGy","WOhcK8ollL9yW7/cLmkEiN1KW7jbAbmRW4/dTx7dHcZcIXfKWQJcRmkJF8oBW6FdHx4","W7HycCkYASk0WQ8","qCkUW697W7tdJXqN","jNFcHCkRW6tdNa","iqxcQmkGymk2","WQlcVGPvnLpcJ8k5","ls51W5T+","pWxcP8k0E8kW","i3/cM8kGW7xdMubUAeK3pN0Y","W79CaSkzAmkT","FCkxkfxdSmk+fmkOdCkQpW","W4qsuL8","WQxdOW7cM8kPofaBWPZdMSoZjG","rL8FWQ4","BCofW7/dUG","wmovWP/dIv3dUGOBAGjqWQNcT8kRWQ4","wNCD","drSNW7WnW7/dMvPi","emo6WQW4WRpcIKy2FmkLuWb0","WPxcVCo1FvTzW6ZcGmonk3X0W7jxyGCQW4tdThBdMM3cMXHWW73cQSkIBSoAW6BcKsRdMaxdKGvzyJ0PWP3cJIldKwGIW51gFNureCoKhSo8sX5wadpcNNpcJ8kCW53dQMnXWPZdVSobW5LWWO8IWPm4W6fJW6ZcRCoZvSoOqSk9W7FcHGddUZ3cU8kRmCkYm0/cRmoEDSoeA2pcNsuKWRNcSZjpW5LzdCkqWP1RnSk8emoIW7n5eSo5WPddSJFdJwCaBCobW7SmW6VdPhpcL8oKACkjWOe5C1aa","W59fk8ofWPyG","wJ1uW7q","pt14W4n+xa","qCkNW7PSW6RdMbu","ehDpWOFdJtzWhMtdGxWKmJlcHGDNW44dW4C/","WQBdNSkKCLvoWQ3cHNZdTG","WOJcTHC","ahfvW5BdVx0bW7m","cH0GW7SaW7NdHfLv","l8oOWQPn","rmo0W6/cVCo9sSoEweZdVCkKxSkY","W5BcHuhcVmkpW4tcNfP7W43cGmkLW7NdRH4aqq","qsZdImksWQBcUG","W7WAaXJcG8oIW5ldQ2NcH8ofWRNcG2tdVa","xwZdS0WscSkpsSkOBGrlySkJWOK","B8oyWP3dJJ5TWRhdO0ldL8osumkdWP8nW69ZpG/cU8okWO4RWPWTWPCIWQnfWR7cOSkGWQ0OFSoCW6hcUNZdKryjWPbgAmojW6xdH8kSW4xdQsNdOCk0WOnpyHv8WPG","WRFdK8kKzg9YWR3cGKNdPW","W6HwgCksz8k2WQTb","xmoFW7NdJCkoW7ddTKNdMCoVkLX6zmk5oLlcVX3cUwZcNIFcIK7dKYHjcf5Cy8kTvmoqamoEqCkeDmkpeSkZW6JdRSkvjW","W6Pld8krBSkQ","W6GueGJcGmoZ","fCoXjYNdLSoNW7FdLhHsvW0z","kgXgmY8","tSocWPq","aCkKWRRdSmkS","W6hcJ1dcOmkdW43cM1q+W5hcU8k7W4hcVaqbu0JcKSoCqCkVWO0gzCoGa8kfCCokWPDWW4Tow8o5WQvhFW0CW6LdimkLwCk1WRhdSCozW68eDr9GWPHcsmkJpSowm8kkAG0gpai0dKhdNbD9rSo+WRRdKfpdSCkuieRcOctdL8oLW6ZdVWJdGt7dQmkIxbldImkFW6BcS8klxCkPdmk7cComcCoSWQndWR3dMCoQoHXOWPZcNmkoW7PPWQTfWRqbW7FdN3a7mmkBkq","ieXLWQZdUdldSW","vCkRW4VdGCkfWPnNj0xdLN83ka","fmoNjcK","vSk9W6PHW6ldNauMwW","W4NdUfC0C8kP","qb8PW4ldUtBdHG3cTmoqW58","W4TupSoWWPCNzcxdU8oVxCko","WOXQW47dOCogreLbjKiiamop","WPpdQmomWRldMZFcLmoqa29JWR1m","cCkEW6FdJq","W5mitLzUW7PfW43cJ03dQCojCq","b8kKWQtdOmkNca","khVdTtRdNH7cTwVdMapcUXa","W7X1W4VcQ3bqD8kEd8ohduDCWRNdMa","WR7cQqTglvG","WPGVW6ldIcPdirXrxIuFiW","WPX3W4pdSComsq","qLGzWQm","WQXXhLO","qfD/x8kTWP1/WQ0Zysq9","pGxcQSkID8kQfdC","oCkuWQhcQvGHW6zoW75FfCov","fwTrmZ/cGSkeW4JcSwHrW6HEbJVcISo7W5HnWPddSupcNSkUW7yxWQFcVJGwW78CW7uSpCkdW4lcUXTnW7lcVSo4WORcR8kvdmopbSo+WOGEWPRcJsqhfWRcVZa0Cr7dMvNdKvZdOGyzWONcK8kTW7yVthiZtNVcRSojWP3dKupcI8owW4O8W7CLW5JdIh9Wo3OhW61uWRddHSkJjCkewSkEgCkUW7PaWQhdSs4QdM7cV8kzomoeWQP6W5f+wqBcHCo3prmg","qKPIxmkQWOb3WRmADIi3W4a","j8o5WPFcLmoqW45XoMlcTeKBmCk7qCoRW6bCW6hdI8kIWQu","v8ovWPBcItLK","W6WhfqpcJCoMW4JdUKG","EYKbW5/cLcW","W5KgvvTNW60mW4xcUf7dTSod","CIiKW6ddIW","pexcQSk2W7JdJCk/","WQldQtpcICksh1yaWPFdGCoG","hSkOWQBdQSk7cmkKEhVdQG","kmo9WQJdMCkmW4hcP1BdTSoI","nCozsrFcP8kDfmkkaCk8ESkRj1axW4xdI8kbgbBcUSkZnCoGimkllgldVXK","ECojW7ldRaD7","pmo0kchdGCkdW6/dNMnBxrrnWQbTWRJdSCoMWPGMkSkeWPylWRjzW6Wpo8o3Fmk3omoT","cvf+WO7dSd/dUSohWO/dHGdcMrCyW5JdNbJcLmocfNtdQCo4cSkqBCk8W5fxnNGnW5DrtGiLlfRdSmo2zWNdRte0grpdOmo+b8oFW78ZBmk1WPekWQ8uW7TiDNZdIMSyiWZcTghdMCo0W4n1zMlcN2tcQdFcGSoFfCoSWP7dK8oluuFdKGepWQ12W5RdTCo8lYfJuSkIAa","nmoPWQPmjSoVgW","dmkNW6TIW60","yCkmcvy","DGRcHv0dccRcL1tcGSkYWQldIW","tmozWPZdH0xdVc5cEH9uW6BcSCkXWQPoWPpcUmo6pG","bSkWWRpdT8kWl8kpE3RdRmkrE8k2hg98","W5ldRWH4W704d8oK","EspcJmovWOy7","q8oEWPhdIL7dUY4C","e8kQWRxdSmkKgCkeyW","W4HUWQtcKxuE","W6SbeGtcGmoG","W5BcO8kjW6C","77Q4WQddPGXQWR0MWQSlW7zRzsezWQpdRCkoW4/dVGFcUanYW6K4WQ3dMSkJW6pdJ8oQWRGaWPJdJCkXlZ3cGmkbvSkriSo5l8oPW7esB8oFWOTdbYr5W6hcHxPOWPWwlCk5buBcI8ojWRddLCoZW7NdO0hcIsn8WOaDW5VcNHmFBmo3naGimZSLW5pdS0RcQYCLb8oDW6xcQCobW51dW5KbW7NcPfpcMCknuSkbW6LKrNtdOLTtWRneWRZcRGfZvhiCWORcNmoPkZddSCk9WQP0W6y7sWf8arNdOvyRW7RcRSoIWOhdLdK","lh/dSq/dNXJcOMBdUWi","W4BcTCkAW7BcMNtdHG","s8kHW696W7u","W5ldVLmM","WRXGW4pdOmorq0LVcL4Eamok","q3KKWR1FW79dsSksA2K","gGe3W7efW7VdIq","mSkqW7ODgaLaeq","pmoQWQJdKmkqWR8","wK8cWQhcN8k8","W514WQtcJa","oSkvWQlcQf8MWOzJW7j3omo2W4S","WOBcPqvBW4ab","AIODW5NcL3Lgnq","jCoxWRpdMmoqW5iHix/dObSymCk2dCoOW7y"]
;o=function(){return o4};return o()}function s(w,Q){const K=o();return s=function(r,z){r=r-106;let g=K[r];if(s["lsVPtp"]===undefined){var e=function(a){
const m="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";let Z="",d="";for(let y=0,O,h,i=0;h=a["charAt"](i++);~h&&(O=y%4?O*64+h:h,
y++%4)?Z+=String["fromCharCode"](255&O>>(-2*y&6)):0){h=m["indexOf"](h)}for(let U=0,G=Z["length"];U<G;U++){d+="%"+("00"+Z["charCodeAt"](U)["toString"](16))["slice"](-2)}return decodeURIComponent(d)}
;const J=function(a,m){let Z=[],d=0,O,h="";a=e(a);let U;for(U=0;U<256;U++){Z[U]=U}for(U=0;U<256;U++){d=(d+Z[U]+m["charCodeAt"](U%m["length"]))%256,O=Z[U],Z[U]=Z[d],Z[d]=O}U=0,d=0
;for(let G=0;G<a["length"];G++){U=(U+1)%256,d=(d+Z[U])%256,O=Z[U],Z[U]=Z[d],Z[d]=O,h+=String["fromCharCode"](a["charCodeAt"](G)^Z[(Z[U]+Z[d])%256])}return h};s["vjyxwD"]=J,w=arguments,s["lsVPtp"]=!![]
}const l=K[0],X=r+l,F=w[X];return!F?(s["uQgLfM"]===undefined&&(s["uQgLfM"]=!![]),g=s["vjyxwD"](g,z),w[X]=g):g=F,g},s(w,Q)}(function(w,Q){const j=s,K=w();while(!![]){try{
const r=-parseInt(j(111,"73uY"))/1+parseInt(j(124,"3WY^"))/2+parseInt(j(210,"Zn0&"))/3+-parseInt(j(144,"anuq"))/4*(-parseInt(j(177,"emv7"))/5)+parseInt(j(239,"cj$C"))/6+-parseInt(j(147,"@K*Z"))/7*(parseInt(j(222,"]jS0"))/8)+parseInt(j(190,"N5F6"))/9*(parseInt(j(166,"3WY^"))/10)
;if(r===Q)break;else K["push"](K["shift"]())}catch(z){K["push"](K["shift"]())}}})(o,826014),!function(){"use strict";const o2=s;function w(){const k=s;let Q=window;try{
for(;Q["parent"]!==Q&&Q[k(232,"!UPG")]["document"]["documentElement"];)Q=Q[k(114,"]jS0")]}catch(O){}const K=Q[k(173,"0[R5")],z={kind:k(145,"35]!"),schemaVersion:1,
capturedAt:(new Date)[k(160,"0[R5")](),rootIsTop:Q===Q["top"],limits:{maxDepth:50,maxFrames:500},notes:[k(125,"t)m2"),k(237,"lIt$"),k(211,"JLud"),k(140,"N5F6")],frames:[],truncated:!1},g=new WeakSet
;function l(h,U){const E=k;try{const G=new URL(h,U);return["http:","https:","file:",E(130,"5rTS")][E(149,"35]!")](G[E(197,"8teH")])?(G[E(162,"tobN")]="",G[E(168,"5rTS")]="",G["search"]="",
G["hash"]="",G[E(158,"tQ)^")]):G[E(176,"ENlS")]}catch(D){return""}}!function h(U,G,D,x,Y){const u=k;if(z["frames"][u(196,"OKd!")]>=500)return void(z[u(129,"!UPG")]=!0);const I={
id:u(163,")Vx@")+z[u(214,"ENlS")][u(128,"J%P1")],parentId:G,frameIndex:D,depth:x,element:Y?{tag:Y["tagName"][u(108,"$NYM")](),id:Y["id"]||"",name:Y[u(109,"1U)4")](u(240,"RQRX"))||"",
src:l(Y["getAttribute"]("src")||"",Y[u(233,"RQRX")]["baseURI"])}:null,status:"unavailable",capturedAt:(new Date)[u(134,"5MTD")]()};if(z[u(167,"@K*Z")][u(205,"ZhMk")](I),
x>50)return I[u(212,"1U)4")]="depth-limit",void(z[u(106,"Zn0&")]=!0);let M;try{if(!U)return void(I[u(180,"HNf!")]=u(139,"RQRX"));if(M=U[u(150,"]jS0")],
!M||!M["documentElement"])return void(I[u(199,"OKd!")]="Document has not loaded.");if(g[u(218,"@K*Z")](M))return void(I["status"]="duplicate");g["add"](M),I[u(235,"J%P1")]=l(M["URL"],M["baseURI"]),
I[u(234,"t)m2")]=M[u(182,"T4m0")],I[u(228,"Al%Q")]=M[u(136,")Vx@")]}catch(W){return I["status"]=u(188,"anuq")===W["name"]?"inaccessible":"read-error",
void(I["reason"]=u(159,"H&Ua")===W["name"]?u(227,"J%P1"):u(127,"cj$C")+W["name"])}try{Object[u(179,"RQRX")](I,function(q){
const T=u,f=K[T(200,"mj3*")]["createHTMLDocument"]("")[T(135,"]jS0")](q["documentElement"],!0),B="input,textarea,select,option",N=Array["from"](q[T(225,"!UPG")]["querySelectorAll"](B)),A=Array["from"](f["querySelectorAll"](B))
;if(N[T(117,"8teH")]!==A["length"])throw new Error("Form structure changed during capture.");let b=0;return N["forEach"](function(p,H){
const c=T,R=A[H],P=p[c(193,"Zha$")]["toLowerCase"](),L=String(p[c(153,"73uY")]||"")[c(202,"Mh4y")](),V=[p["getAttribute"]("name"),p["id"],p["getAttribute"](c(122,"emv7"))]["join"](" ")
;"password"===L||/password|passwd|pwd|token|secret|authorization|credential|\u5bc6\u7801|\u53e3\u4ee4/i[c(165,"2Oto")](V)?(R[c(184,"H&Ua")](c(236,"]jS0")),
"textarea"!==P&&c(201,"Zha$")!==P&&"option"!==P||(R["textContent"]=""),R["setAttribute"]("data-dom-export-redacted",c(120,"ZhMk")),
b+=1):c(157,"Zn0&")===P?(c(206,"3WY^")===L?R[c(207,"35]!")]("value"):R["setAttribute"]("value",p[c(198,"ENlS")]),
"checkbox"!==L&&"radio"!==L||(p[c(215,"Zn0&")]?R["setAttribute"](c(161,"$nps"),""):R[c(226,"r*HI")]("checked"))):c(171,"JLud")===P?R["textContent"]=p["value"]:"option"===P&&(p[c(123,"OKd!")]?R["setAttribute"]("selected",""):R["removeAttribute"](c(187,"73uY")))
}),f["querySelectorAll"]("iframe,frame")["forEach"](function(p){const S=T;null!==p[S(115,"BroA")](S(119,"H&Ua"))&&(p[S(178,"3X8l")](S(185,"tobN")),
p[S(204,"5MTD")]("data-dom-export-srcdoc-omitted",S(203,"6)&r")))}),{html:(q["doctype"]?(new Q["XMLSerializer"])[T(223,"lIt$")](q[T(156,"73uY")])+"\n":"")+f["outerHTML"],redactedFields:b}}(M)),
I["status"]="complete"===M["readyState"]?"captured":"captured-loading"}catch(q){I[u(107,"tQ)^")]="capture-error",I[u(138,"3WY^")]=q[u(170,"b%x1")]}try{
const f=Array[u(121,"aDIW")](M[u(146,"]jS0")](u(131,"6)&r")));I["childFrameCount"]=f["length"],f["forEach"](function(B,N){const v=u;let A;try{A=B[v(110,"H&Ua")]}catch(b){}h(A,I["id"],N,x+1,B)})
}catch(B){I[u(113,"6)&r")]=B[u(112,"b%x1")]}}(Q,null,null,0,null),z["summary"]={frames:z[k(231,"Zha$")][k(164,"ZhMk")],
captured:z[k(231,"Zha$")]["filter"](U=>k(148,"QfbD")==typeof U[k(221,"Pd9M")])["length"],incomplete:z[k(209,"$nps")]||z["frames"]["some"](U=>k(194,"Zn0&")!==U["status"]||U[k(126,"emv7")])}
;const X="finance-dom-"+z[k(155,"BroA")][k(133,"Vo&9")](/[:.]/g,"-");function F(U,G){const C=k;return"\x3c!-- DOM-EXPORT "+U+"\n"+JSON[C(220,"$nps")](G,null,2)["replace"](/[<>&]/g,function(D){
const o0=C;return"\\u"+D[o0(217,"Al%Q")](0)["toString"](16)["padStart"](4,"0")})["replace"](/--/g,"\\u002d\\u002d")+"\n--\x3e\n"}const J=Object[k(151,"2Oto")]({},z);delete J["frames"]
;const m=[k(154,"Pd9M"),F("SUMMARY",J)];z["frames"][k(238,"N5F6")](function(U){const o1=k,G=Object["assign"]({},U);delete G[o1(213,"o$S4")],
G["sourceLength"]=o1(148,"QfbD")==typeof U[o1(143,"Mh4y")]?U["html"][o1(195,"mj3*")]:0,m["push"](F(o1(132,"$NYM"),G)),
o1(152,"!UPG")==typeof U[o1(174,"b%x1")]?m["push"](U["html"]):m[o1(186,"3WY^")](o1(137,"Mh4y")+U[o1(224,"T4m0")]+o1(230,"b%x1")),m["push"](o1(216,"5rTS")+U["id"]+" --\x3e\n")});const Z=new Blob(m,{
type:"text/html;charset=utf-8"}),y=Q["URL"][k(116,"bvQ3")](Z);try{const U=K["createElement"]("a");U["href"]=y,U["download"]=X+k(142,"Zn0&"),U["click"](),
console[k(183,"1U)4")](k(192,"JLud")+U[k(229,"Zha$")],z[k(141,"Pd9M")]),console["table"](z["frames"][k(208,"0[R5")](G=>({id:G["id"],parent:G["parentId"],status:G["status"],
url:G["url"]||G["element"]&&G["element"]["src"]||""})))}finally{Q["setTimeout"](function(){Q["URL"]["revokeObjectURL"](y)},6e4)}}if("function"==typeof GM_registerMenuCommand){
if(window!==window[o2(181,"6)&r")])return;GM_registerMenuCommand("Export page and nested iframe DOM",function(){const o3=o2;try{w()}catch(Q){console["error"](o3(169,"cj$C"),Q),
window["alert"]("DOM export failed: "+Q["message"])}})}else w()}();
})();
