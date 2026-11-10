(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const W=Object.create(null);W.open="0";W.close="1";W.ping="2";W.pong="3";W.message="4";W.upgrade="5";W.noop="6";const ce=Object.create(null);Object.keys(W).forEach(r=>{ce[W[r]]=r});const xe={type:"error",data:"parser error"},Ge=typeof Blob=="function"||typeof Blob<"u"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",Ye=typeof ArrayBuffer=="function",Je=r=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(r):r&&r.buffer instanceof ArrayBuffer,_e=({type:r,data:e},t,n)=>Ge&&e instanceof Blob?t?n(e):ze(e,n):Ye&&(e instanceof ArrayBuffer||Je(e))?t?n(e):ze(new Blob([e]),n):n(W[r]+(e||"")),ze=(r,e)=>{const t=new FileReader;return t.onload=function(){const n=t.result.split(",")[1];e("b"+(n||""))},t.readAsDataURL(r)};function $e(r){return r instanceof Uint8Array?r:r instanceof ArrayBuffer?new Uint8Array(r):new Uint8Array(r.buffer,r.byteOffset,r.byteLength)}let ge;function Lt(r,e){if(Ge&&r.data instanceof Blob)return r.data.arrayBuffer().then($e).then(e);if(Ye&&(r.data instanceof ArrayBuffer||Je(r.data)))return e($e(r.data));_e(r,!1,t=>{ge||(ge=new TextEncoder),e(ge.encode(t))})}const qe="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",re=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(let r=0;r<qe.length;r++)re[qe.charCodeAt(r)]=r;const Rt=r=>{let e=r.length*.75,t=r.length,n,s=0,i,c,l,d;r[r.length-1]==="="&&(e--,r[r.length-2]==="="&&e--);const f=new ArrayBuffer(e),b=new Uint8Array(f);for(n=0;n<t;n+=4)i=re[r.charCodeAt(n)],c=re[r.charCodeAt(n+1)],l=re[r.charCodeAt(n+2)],d=re[r.charCodeAt(n+3)],b[s++]=i<<2|c>>4,b[s++]=(c&15)<<4|l>>2,b[s++]=(l&3)<<6|d&63;return f},Ot=typeof ArrayBuffer=="function",Se=(r,e)=>{if(typeof r!="string")return{type:"message",data:Xe(r,e)};const t=r.charAt(0);return t==="b"?{type:"message",data:Bt(r.substring(1),e)}:ce[t]?r.length>1?{type:ce[t],data:r.substring(1)}:{type:ce[t]}:xe},Bt=(r,e)=>{if(Ot){const t=Rt(r);return Xe(t,e)}else return{base64:!0,data:r}},Xe=(r,e)=>{switch(e){case"blob":return r instanceof Blob?r:new Blob([r]);case"arraybuffer":default:return r instanceof ArrayBuffer?r:r.buffer}},Ze="",Mt=(r,e)=>{const t=r.length,n=new Array(t);let s=0;r.forEach((i,c)=>{_e(i,!1,l=>{n[c]=l,++s===t&&e(n.join(Ze))})})},Pt=(r,e)=>{const t=r.split(Ze),n=[];for(let s=0;s<t.length;s++){const i=Se(t[s],e);if(n.push(i),i.type==="error")break}return n};function It(){return new TransformStream({transform(r,e){Lt(r,t=>{const n=t.length;let s;if(n<126)s=new Uint8Array(1),new DataView(s.buffer).setUint8(0,n);else if(n<65536){s=new Uint8Array(3);const i=new DataView(s.buffer);i.setUint8(0,126),i.setUint16(1,n)}else{s=new Uint8Array(9);const i=new DataView(s.buffer);i.setUint8(0,127),i.setBigUint64(1,BigInt(n))}r.data&&typeof r.data!="string"&&(s[0]|=128),e.enqueue(s),e.enqueue(t)})}})}let be;function oe(r){return r.reduce((e,t)=>e+t.length,0)}function ae(r,e){if(r[0].length===e)return r.shift();const t=new Uint8Array(e);let n=0;for(let s=0;s<e;s++)t[s]=r[0][n++],n===r[0].length&&(r.shift(),n=0);return r.length&&n<r[0].length&&(r[0]=r[0].slice(n)),t}function Nt(r,e){be||(be=new TextDecoder);const t=[];let n=0,s=-1,i=!1;return new TransformStream({transform(c,l){for(t.push(c);;){if(n===0){if(oe(t)<1)break;const d=ae(t,1);i=(d[0]&128)===128,s=d[0]&127,s<126?n=3:s===126?n=1:n=2}else if(n===1){if(oe(t)<2)break;const d=ae(t,2);s=new DataView(d.buffer,d.byteOffset,d.length).getUint16(0),n=3}else if(n===2){if(oe(t)<8)break;const d=ae(t,8),f=new DataView(d.buffer,d.byteOffset,d.length),b=f.getUint32(0);if(b>Math.pow(2,21)-1){l.enqueue(xe);break}s=b*Math.pow(2,32)+f.getUint32(4),n=3}else{if(oe(t)<s)break;const d=ae(t,s);l.enqueue(Se(i?d:be.decode(d),e)),n=0}if(s===0||s>r){l.enqueue(xe);break}}}})}const Qe=4;function I(r){if(r)return Dt(r)}function Dt(r){for(var e in I.prototype)r[e]=I.prototype[e];return r}I.prototype.on=I.prototype.addEventListener=function(r,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+r]=this._callbacks["$"+r]||[]).push(e),this};I.prototype.once=function(r,e){function t(){this.off(r,t),e.apply(this,arguments)}return t.fn=e,this.on(r,t),this};I.prototype.off=I.prototype.removeListener=I.prototype.removeAllListeners=I.prototype.removeEventListener=function(r,e){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var t=this._callbacks["$"+r];if(!t)return this;if(arguments.length==1)return delete this._callbacks["$"+r],this;for(var n,s=0;s<t.length;s++)if(n=t[s],n===e||n.fn===e){t.splice(s,1);break}return t.length===0&&delete this._callbacks["$"+r],this};I.prototype.emit=function(r){this._callbacks=this._callbacks||{};for(var e=new Array(arguments.length-1),t=this._callbacks["$"+r],n=1;n<arguments.length;n++)e[n-1]=arguments[n];if(t){t=t.slice(0);for(var n=0,s=t.length;n<s;++n)t[n].apply(this,e)}return this};I.prototype.emitReserved=I.prototype.emit;I.prototype.listeners=function(r){return this._callbacks=this._callbacks||{},this._callbacks["$"+r]||[]};I.prototype.hasListeners=function(r){return!!this.listeners(r).length};const pe=typeof Promise=="function"&&typeof Promise.resolve=="function"?e=>Promise.resolve().then(e):(e,t)=>t(e,0),F=typeof self<"u"?self:typeof window<"u"?window:Function("return this")(),zt="arraybuffer";function et(r,...e){return e.reduce((t,n)=>(r.hasOwnProperty(n)&&(t[n]=r[n]),t),{})}const $t=F.setTimeout,qt=F.clearTimeout;function fe(r,e){e.useNativeTimers?(r.setTimeoutFn=$t.bind(F),r.clearTimeoutFn=qt.bind(F)):(r.setTimeoutFn=F.setTimeout.bind(F),r.clearTimeoutFn=F.clearTimeout.bind(F))}const Ft=1.33;function Vt(r){return typeof r=="string"?jt(r):Math.ceil((r.byteLength||r.size)*Ft)}function jt(r){let e=0,t=0;for(let n=0,s=r.length;n<s;n++)e=r.charCodeAt(n),e<128?t+=1:e<2048?t+=2:e<55296||e>=57344?t+=3:(n++,t+=4);return t}function tt(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function Ut(r){let e="";for(let t in r)r.hasOwnProperty(t)&&(e.length&&(e+="&"),e+=encodeURIComponent(t)+"="+encodeURIComponent(r[t]));return e}function Ht(r){let e={},t=r.split("&");for(let n=0,s=t.length;n<s;n++){let i=t[n].split("=");e[decodeURIComponent(i[0])]=decodeURIComponent(i.slice(1).join("="))}return e}class Kt extends Error{constructor(e,t,n){super(e),this.description=t,this.context=n,this.type="TransportError"}}class Ce extends I{constructor(e){super(),this.writable=!1,fe(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,t,n){return super.emitReserved("error",new Kt(e,t,n)),this}open(){return this.readyState="opening",this.doOpen(),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(e){this.readyState==="open"&&this.write(e)}onOpen(){this.readyState="open",this.writable=!0,super.emitReserved("open")}onData(e){const t=Se(e,this.socket.binaryType);this.onPacket(t)}onPacket(e){super.emitReserved("packet",e)}onClose(e){this.readyState="closed",super.emitReserved("close",e)}pause(e){}createUri(e,t={}){return e+"://"+this._hostname()+this._port()+this.opts.path+this._query(t)}_hostname(){const e=this.opts.hostname;return e.indexOf(":")===-1?e:"["+e+"]"}_port(){return this.opts.port&&(this.opts.secure&&Number(this.opts.port)!==443||!this.opts.secure&&Number(this.opts.port)!==80)?":"+this.opts.port:""}_query(e){const t=Ut(e);return t.length?"?"+t:""}}class Wt extends Ce{constructor(){super(...arguments),this._polling=!1}get name(){return"polling"}doOpen(){this._poll()}pause(e){this.readyState="pausing";const t=()=>{this.readyState="paused",e()};if(this._polling||!this.writable){let n=0;this._polling&&(n++,this.once("pollComplete",function(){--n||t()})),this.writable||(n++,this.once("drain",function(){--n||t()}))}else t()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved("poll")}onData(e){const t=n=>{if(this.readyState==="opening"&&n.type==="open"&&this.onOpen(),n.type==="close")return this.onClose({description:"transport closed by the server"}),!1;this.onPacket(n)};Pt(e,this.socket.binaryType).forEach(t),this.readyState!=="closed"&&(this._polling=!1,this.emitReserved("pollComplete"),this.readyState==="open"&&this._poll())}doClose(){const e=()=>{this.write([{type:"close"}])};this.readyState==="open"?e():this.once("open",e)}write(e){this.writable=!1,Mt(e,t=>{this.doWrite(t,()=>{this.writable=!0,this.emitReserved("drain")})})}uri(){const e=this.opts.secure?"https":"http",t=this.query||{};return this.opts.timestampRequests!==!1&&(t[this.opts.timestampParam]=tt()),!this.supportsBinary&&!t.sid&&(t.b64=1),this.createUri(e,t)}}let nt=!1;try{nt=typeof XMLHttpRequest<"u"&&"withCredentials"in new XMLHttpRequest}catch{}const Gt=nt;function Yt(){}class Jt extends Wt{constructor(e){if(super(e),typeof location<"u"){const t=location.protocol==="https:";let n=location.port;n||(n=t?"443":"80"),this.xd=typeof location<"u"&&e.hostname!==location.hostname||n!==e.port}}doWrite(e,t){const n=this.request({method:"POST",data:e});n.on("success",t),n.on("error",(s,i)=>{this.onError("xhr post error",s,i)})}doPoll(){const e=this.request();e.on("data",this.onData.bind(this)),e.on("error",(t,n)=>{this.onError("xhr poll error",t,n)}),this.pollXhr=e}}class K extends I{constructor(e,t,n){super(),this.createRequest=e,fe(this,n),this._opts=n,this._method=n.method||"GET",this._uri=t,this._data=n.data!==void 0?n.data:null,this._create()}_create(){var e;const t=et(this._opts,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");t.xdomain=!!this._opts.xd;const n=this._xhr=this.createRequest(t);try{n.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){n.setDisableHeaderCheck&&n.setDisableHeaderCheck(!0);for(let s in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(s)&&n.setRequestHeader(s,this._opts.extraHeaders[s])}}catch{}if(this._method==="POST")try{n.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{n.setRequestHeader("Accept","*/*")}catch{}(e=this._opts.cookieJar)===null||e===void 0||e.addCookies(n),"withCredentials"in n&&(n.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(n.timeout=this._opts.requestTimeout),n.onreadystatechange=()=>{var s;n.readyState===3&&((s=this._opts.cookieJar)===null||s===void 0||s.parseCookies(n.getResponseHeader("set-cookie"))),n.readyState===4&&(n.status===200||n.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof n.status=="number"?n.status:0)},0))},n.send(this._data)}catch(s){this.setTimeoutFn(()=>{this._onError(s)},0);return}typeof document<"u"&&(this._index=K.requestsCount++,K.requests[this._index]=this)}_onError(e){this.emitReserved("error",e,this._xhr),this._cleanup(!0)}_cleanup(e){if(!(typeof this._xhr>"u"||this._xhr===null)){if(this._xhr.onreadystatechange=Yt,e)try{this._xhr.abort()}catch{}typeof document<"u"&&delete K.requests[this._index],this._xhr=null}}_onLoad(){const e=this._xhr.responseText;e!==null&&(this.emitReserved("data",e),this.emitReserved("success"),this._cleanup())}abort(){this._cleanup()}}K.requestsCount=0;K.requests={};if(typeof document<"u"){if(typeof attachEvent=="function")attachEvent("onunload",Fe);else if(typeof addEventListener=="function"){const r="onpagehide"in F?"pagehide":"unload";addEventListener(r,Fe,!1)}}function Fe(){for(let r in K.requests)K.requests.hasOwnProperty(r)&&K.requests[r].abort()}const Xt=(function(){const r=rt({xdomain:!1});return r&&r.responseType!==null})();class Zt extends Jt{constructor(e){super(e);const t=e&&e.forceBase64;this.supportsBinary=Xt&&!t}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new K(rt,this.uri(),e)}}function rt(r){const e=r.xdomain;try{if(typeof XMLHttpRequest<"u"&&(!e||Gt))return new XMLHttpRequest}catch{}if(!e)try{return new F[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}const st=typeof navigator<"u"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class Qt extends Ce{get name(){return"websocket"}doOpen(){const e=this.uri(),t=this.opts.protocols,n=st?{}:et(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(n.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,t,n)}catch(s){return this.emitReserved("error",s)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:"websocket connection closed",context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError("websocket error",e)}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const n=e[t],s=t===e.length-1;_e(n,this.supportsBinary,i=>{try{this.doWrite(n,i)}catch{}s&&pe(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){typeof this.ws<"u"&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){const e=this.opts.secure?"wss":"ws",t=this.query||{};return this.opts.timestampRequests&&(t[this.opts.timestampParam]=tt()),this.supportsBinary||(t.b64=1),this.createUri(e,t)}}const ve=F.WebSocket||F.MozWebSocket;class en extends Qt{createSocket(e,t,n){return st?new ve(e,t,n):t?new ve(e,t):new ve(e)}doWrite(e,t){this.ws.send(t)}}class tn extends Ce{get name(){return"webtransport"}doOpen(){try{this._transport=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved("error",e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError("webtransport error",e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{const t=Nt(Number.MAX_SAFE_INTEGER,this.socket.binaryType),n=e.readable.pipeThrough(t).getReader(),s=It();s.readable.pipeTo(e.writable),this._writer=s.writable.getWriter();const i=()=>{n.read().then(({done:l,value:d})=>{l||(this.onPacket(d),i())}).catch(l=>{})};i();const c={type:"open"};this.query.sid&&(c.data=`{"sid":"${this.query.sid}"}`),this._writer.write(c).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const n=e[t],s=t===e.length-1;this._writer.write(n).then(()=>{s&&pe(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)===null||e===void 0||e.close()}}const nn={websocket:en,webtransport:tn,polling:Zt},rn=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,sn=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function we(r){if(r.length>8e3)throw"URI too long";const e=r,t=r.indexOf("["),n=r.indexOf("]");t!=-1&&n!=-1&&(r=r.substring(0,t)+r.substring(t,n).replace(/:/g,";")+r.substring(n,r.length));let s=rn.exec(r||""),i={},c=14;for(;c--;)i[sn[c]]=s[c]||"";return t!=-1&&n!=-1&&(i.source=e,i.host=i.host.substring(1,i.host.length-1).replace(/;/g,":"),i.authority=i.authority.replace("[","").replace("]","").replace(/;/g,":"),i.ipv6uri=!0),i.pathNames=on(i,i.path),i.queryKey=an(i,i.query),i}function on(r,e){const t=/\/{2,9}/g,n=e.replace(t,"/").split("/");return(e.slice(0,1)=="/"||e.length===0)&&n.splice(0,1),e.slice(-1)=="/"&&n.splice(n.length-1,1),n}function an(r,e){const t={};return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(n,s,i){s&&(t[s]=i)}),t}const ke=typeof addEventListener=="function"&&typeof removeEventListener=="function",le=[];ke&&addEventListener("offline",()=>{le.forEach(r=>r())},!1);let it=class Z extends I{constructor(e,t={}){var n,s;if(super(),this.binaryType=zt,this.writeBuffer=[],this._prevBufferLen=0,this._upgrades=[],this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e=="object"&&(t=e,e=null),e){const i=we(e);t.hostname=i.host,t.secure=i.protocol==="https"||i.protocol==="wss",t.port=i.port,i.query&&(t.query=i.query)}else t.host&&(t.hostname=we(t.host).host);if(fe(this,t),this.secure=t.secure!=null?t.secure:typeof location<"u"&&location.protocol==="https:",t.hostname&&!t.port&&(t.port=this.secure?"443":"80"),this.hostname=t.hostname||(typeof location<"u"?location.hostname:"localhost"),this.port=t.port||(typeof location<"u"&&location.port?location.port:this.secure?"443":"80"),t.transportImplementations&&t.transports)throw new Error("specifying both 'transportImplementations' and 'transports' options is not supported");t.transportImplementations||!((n=t.transports)===null||n===void 0)&&n.length&&typeof t.transports[0]=="function"?(this.transports=[],this._transportsByName=Object.create(null),((s=t.transportImplementations)!==null&&s!==void 0?s:t.transports).forEach(i=>{const c=i.prototype.name;this.transports.push(c),this._transportsByName[c]=i})):(this.transports=t.transports?[...t.transports]:["polling","websocket","webtransport"],this._transportsByName=nn),this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},t),this.opts.path=this.opts.path.replace(/\/$/,"")+(this.opts.addTrailingSlash?"/":""),typeof this.opts.query=="string"&&(this.opts.query=Ht(this.opts.query)),ke&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener("beforeunload",this._beforeunloadEventListener,!1)),this.hostname!=="localhost"&&(this._offlineEventListener=()=>{this._onClose("transport close",{description:"network connection lost"})},le.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){const t=Object.assign({},this.opts.query);t.EIO=Qe,t.transport=e,this.id&&(t.sid=this.id);const n=Object.assign({},this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](n)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved("error","No transports available")},0);return}const e=this.opts.rememberUpgrade&&Z.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1?"websocket":this.transports[0];this.readyState="opening";const t=this.createTransport(e);t.open(),this.setTransport(t)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on("drain",this._onDrain.bind(this)).on("packet",this._onPacket.bind(this)).on("error",this._onError.bind(this)).on("close",t=>this._onClose("transport close",t))}_probe(e){let t=this.createTransport(e),n=!1;Z.priorWebsocketSuccess=!1;const s=()=>{n||(t.send([{type:"ping",data:"probe"}]),t.once("packet",S=>{if(!n)if(S.type==="pong"&&S.data==="probe"){if(this.upgrading=!0,this.emitReserved("upgrading",t),!t)return;Z.priorWebsocketSuccess=t.name==="websocket",this.transport.pause(()=>{n||this.readyState!=="closed"&&(b(),this.setTransport(t),t.send([{type:"upgrade"}]),this.emitReserved("upgrade",t),t=null,this.upgrading=!1,this.flush())})}else{const O=new Error("probe error");O.transport=t.name,this.emitReserved("upgradeError",O)}}))};function i(){n||(n=!0,b(),t.close(),t=null)}const c=S=>{const O=new Error("probe error: "+S);O.transport=t.name,i(),this.emitReserved("upgradeError",O)};function l(){c("transport closed")}function d(){c("socket closed")}function f(S){t&&S.name!==t.name&&i()}const b=()=>{t.removeListener("open",s),t.removeListener("error",c),t.removeListener("close",l),this.off("close",d),this.off("upgrading",f)};t.once("open",s),t.once("error",c),t.once("close",l),this.once("close",d),this.once("upgrading",f),this._upgrades.indexOf("webtransport")!==-1&&e!=="webtransport"?this.setTimeoutFn(()=>{n||t.open()},200):t.open()}onOpen(){if(this.readyState="open",Z.priorWebsocketSuccess=this.transport.name==="websocket",this.emitReserved("open"),this.flush(),this.readyState==="open"&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_onPacket(e){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(this.emitReserved("packet",e),this.emitReserved("heartbeat"),e.type){case"open":this.onHandshake(JSON.parse(e.data));break;case"ping":this._sendPacket("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this._resetPingTimeout();break;case"error":const t=new Error("server error");t.code=e.data,this._onError(t);break;case"message":this.emitReserved("data",e.data),this.emitReserved("message",e.data);break}}onHandshake(e){this.emitReserved("handshake",e),this.id=e.sid,this.transport.query.sid=e.sid,this._upgrades=this._filterUpgrades(e.upgrades),this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!=="closed"&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);const e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose("ping timeout")},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved("drain"):this.flush()}flush(){if(this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){const e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved("flush")}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name==="polling"&&this.writeBuffer.length>1))return this.writeBuffer;let t=1;for(let n=0;n<this.writeBuffer.length;n++){const s=this.writeBuffer[n].data;if(s&&(t+=Vt(s)),n>0&&t>this._maxPayload)return this.writeBuffer.slice(0,n);t+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;const e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,pe(()=>{this._onClose("ping timeout")},this.setTimeoutFn)),e}write(e,t,n){return this._sendPacket("message",e,t,n),this}send(e,t,n){return this._sendPacket("message",e,t,n),this}_sendPacket(e,t,n,s){if(typeof t=="function"&&(s=t,t=void 0),typeof n=="function"&&(s=n,n=null),this.readyState==="closing"||this.readyState==="closed")return;n=n||{},n.compress=n.compress!==!1;const i={type:e,data:t,options:n};this.emitReserved("packetCreate",i),this.writeBuffer.push(i),s&&this.once("flush",s),this.flush()}close(){const e=()=>{this._onClose("forced close"),this.transport.close()},t=()=>{this.off("upgrade",t),this.off("upgradeError",t),e()},n=()=>{this.once("upgrade",t),this.once("upgradeError",t)};return(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",()=>{this.upgrading?n():e()}):this.upgrading?n():e()),this}_onError(e){if(Z.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState==="opening")return this.transports.shift(),this._open();this.emitReserved("error",e),this._onClose("transport error",e)}_onClose(e,t){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),ke&&(this._beforeunloadEventListener&&removeEventListener("beforeunload",this._beforeunloadEventListener,!1),this._offlineEventListener)){const n=le.indexOf(this._offlineEventListener);n!==-1&&le.splice(n,1)}this.readyState="closed",this.id=null,this.emitReserved("close",e,t),this.writeBuffer=[],this._prevBufferLen=0}}_filterUpgrades(e){const t=[];for(let n=0;n<e.length;n++)~this.transports.indexOf(e[n])&&t.push(e[n]);return t}};it.protocol=Qe;function cn(r,e="",t){let n=r;t=t||typeof location<"u"&&location,r==null&&(r=t.protocol+"//"+t.host),typeof r=="string"&&(r.charAt(0)==="/"&&(r.charAt(1)==="/"?r=t.protocol+r:r=t.host+r),/^(https?|wss?):\/\//.test(r)||(typeof t<"u"?r=t.protocol+"//"+r:r="https://"+r),n=we(r)),n.port||(/^(http|ws)$/.test(n.protocol)?n.port="80":/^(http|ws)s$/.test(n.protocol)&&(n.port="443")),n.path=n.path||"/";const i=n.host.indexOf(":")!==-1?"["+n.host+"]":n.host;return n.id=n.protocol+"://"+i+":"+n.port+e,n.href=n.protocol+"://"+i+(t&&t.port===n.port?"":":"+n.port),n}const ln=typeof ArrayBuffer=="function",dn=r=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(r):r.buffer instanceof ArrayBuffer,ot=Object.prototype.toString,un=typeof Blob=="function"||typeof Blob<"u"&&ot.call(Blob)==="[object BlobConstructor]",hn=typeof File=="function"||typeof File<"u"&&ot.call(File)==="[object FileConstructor]";function Ae(r){return ln&&(r instanceof ArrayBuffer||dn(r))||un&&r instanceof Blob||hn&&r instanceof File}function de(r,e){if(!r||typeof r!="object")return!1;if(Array.isArray(r)){for(let t=0,n=r.length;t<n;t++)if(de(r[t]))return!0;return!1}if(Ae(r))return!0;if(r.toJSON&&typeof r.toJSON=="function"&&arguments.length===1)return de(r.toJSON(),!0);for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t)&&de(r[t]))return!0;return!1}function pn(r){const e=[],t=r.data,n=r;return n.data=ue(t,e),n.attachments=e.length,{packet:n,buffers:e}}function ue(r,e,t){if(!r)return r;if(Ae(r)){const n={_placeholder:!0,num:e.length};return e.push(r),n}else if(Array.isArray(r)){const n=new Array(r.length);for(let s=0;s<r.length;s++)n[s]=ue(r[s],e);return n}else if(typeof r=="object"&&!(r instanceof Date)){if(r.toJSON&&typeof r.toJSON=="function"&&!t)return ue(r.toJSON(),e,!0);const n={};for(const s in r)Object.prototype.hasOwnProperty.call(r,s)&&(n[s]=ue(r[s],e));return n}return r}function fn(r,e){return r.data=Ee(r.data,e),delete r.attachments,r}function Ee(r,e){if(!r)return r;if(r&&r._placeholder===!0){if(typeof r.num=="number"&&r.num>=0&&r.num<e.length)return e[r.num];throw new Error("illegal attachments")}else if(Array.isArray(r))for(let t=0;t<r.length;t++)r[t]=Ee(r[t],e);else if(typeof r=="object")for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&(r[t]=Ee(r[t],e));return r}const mn=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"];var E;(function(r){r[r.CONNECT=0]="CONNECT",r[r.DISCONNECT=1]="DISCONNECT",r[r.EVENT=2]="EVENT",r[r.ACK=3]="ACK",r[r.CONNECT_ERROR=4]="CONNECT_ERROR",r[r.BINARY_EVENT=5]="BINARY_EVENT",r[r.BINARY_ACK=6]="BINARY_ACK"})(E||(E={}));class yn{constructor(e){this.replacer=e}encode(e){return(e.type===E.EVENT||e.type===E.ACK)&&de(e)?this.encodeAsBinary({type:e.type===E.EVENT?E.BINARY_EVENT:E.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let t=""+e.type;return(e.type===E.BINARY_EVENT||e.type===E.BINARY_ACK)&&(t+=e.attachments+"-"),e.nsp&&e.nsp!=="/"&&(t+=e.nsp+","),e.id!=null&&(t+=e.id),e.data!=null&&(t+=JSON.stringify(e.data,this.replacer)),t}encodeAsBinary(e){const t=pn(e),n=this.encodeAsString(t.packet),s=t.buffers;return s.unshift(n),s}}class Le extends I{constructor(e){super(),this.opts=Object.assign({reviver:void 0,maxAttachments:10},typeof e=="function"?{reviver:e}:e)}add(e){let t;if(typeof e=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");t=this.decodeString(e);const n=t.type===E.BINARY_EVENT;n||t.type===E.BINARY_ACK?(t.type=n?E.EVENT:E.ACK,this.reconstructor=new gn(t)):super.emitReserved("decoded",t)}else if(Ae(e)||e.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(e),t&&(this.reconstructor=null,super.emitReserved("decoded",t));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+e)}decodeString(e){let t=0;const n={type:Number(e.charAt(0))};if(E[n.type]===void 0)throw new Error("unknown packet type "+n.type);if(n.type===E.BINARY_EVENT||n.type===E.BINARY_ACK){const i=t+1;for(;e.charAt(++t)!=="-"&&t!=e.length;);const c=e.substring(i,t);if(c!=Number(c)||e.charAt(t)!=="-")throw new Error("Illegal attachments");const l=Number(c);if(!bn(l)||l<1)throw new Error("Illegal attachments");if(l>this.opts.maxAttachments)throw new Error("too many attachments");n.attachments=l}if(e.charAt(t+1)==="/"){const i=t+1;for(;++t&&!(e.charAt(t)===","||t===e.length););n.nsp=e.substring(i,t)}else n.nsp="/";const s=e.charAt(t+1);if(s!==""&&Number(s)==s){const i=t+1;for(;++t;){const c=e.charAt(t);if(c==null||Number(c)!=c){--t;break}if(t===e.length)break}n.id=Number(e.substring(i,t+1))}if(e.charAt(++t)){const i=this.tryParse(e.substr(t));if(Le.isPayloadValid(n.type,i))n.data=i;else throw new Error("invalid payload")}return n}tryParse(e){try{return JSON.parse(e,this.opts.reviver)}catch{return!1}}static isPayloadValid(e,t){switch(e){case E.CONNECT:return Ve(t);case E.DISCONNECT:return t===void 0;case E.CONNECT_ERROR:return typeof t=="string"||Ve(t);case E.EVENT:case E.BINARY_EVENT:return Array.isArray(t)&&(typeof t[0]=="number"||typeof t[0]=="string"&&mn.indexOf(t[0])===-1);case E.ACK:case E.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class gn{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){const t=fn(this.reconPack,this.buffers);return this.finishedReconstruction(),t}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}const bn=Number.isInteger||function(r){return typeof r=="number"&&isFinite(r)&&Math.floor(r)===r};function Ve(r){return Object.prototype.toString.call(r)==="[object Object]"}const vn=Object.freeze(Object.defineProperty({__proto__:null,Decoder:Le,Encoder:yn,get PacketType(){return E}},Symbol.toStringTag,{value:"Module"}));function U(r,e,t){return r.on(e,t),function(){r.off(e,t)}}const xn=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class at extends I{constructor(e,t,n){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=t,n&&n.auth&&(this.auth=n.auth),this._opts=Object.assign({},n),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const e=this.io;this.subs=[U(e,"open",this.onopen.bind(this)),U(e,"packet",this.onpacket.bind(this)),U(e,"error",this.onerror.bind(this)),U(e,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift("message"),this.emit.apply(this,e),this}emit(e,...t){var n,s,i;if(xn.hasOwnProperty(e))throw new Error('"'+e.toString()+'" is a reserved event name');if(t.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(t),this;const c={type:E.EVENT,data:t};if(c.options={},c.options.compress=this.flags.compress!==!1,typeof t[t.length-1]=="function"){const b=this.ids++,S=t.pop();this._registerAckCallback(b,S),c.id=b}const l=(s=(n=this.io.engine)===null||n===void 0?void 0:n.transport)===null||s===void 0?void 0:s.writable,d=this.connected&&!(!((i=this.io.engine)===null||i===void 0)&&i._hasPingExpired());return this.flags.volatile&&!l||(d?(this.notifyOutgoingListeners(c),this.packet(c)):this.sendBuffer.push(c)),this.flags={},this}_registerAckCallback(e,t){var n;const s=(n=this.flags.timeout)!==null&&n!==void 0?n:this._opts.ackTimeout;if(s===void 0){this.acks[e]=t;return}const i=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let l=0;l<this.sendBuffer.length;l++)this.sendBuffer[l].id===e&&this.sendBuffer.splice(l,1);t.call(this,new Error("operation has timed out"))},s),c=(...l)=>{this.io.clearTimeoutFn(i),t.apply(this,l)};c.withError=!0,this.acks[e]=c}emitWithAck(e,...t){return new Promise((n,s)=>{const i=(c,l)=>c?s(c):n(l);i.withError=!0,t.push(i),this.emit(e,...t)})}_addToQueue(e){let t;typeof e[e.length-1]=="function"&&(t=e.pop());const n={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((s,...i)=>(this._queue[0],s!==null?n.tryCount>this._opts.retries&&(this._queue.shift(),t&&t(s)):(this._queue.shift(),t&&t(null,...i)),n.pending=!1,this._drainQueue())),this._queue.push(n),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;const t=this._queue[0];t.pending&&!e||(t.pending=!0,t.tryCount++,this.flags=t.flags,this.emit.apply(this,t.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth=="function"?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:E.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved("connect_error",e)}onclose(e,t){this.connected=!1,delete this.id,this.emitReserved("disconnect",e,t),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(n=>String(n.id)===e)){const n=this.acks[e];delete this.acks[e],n.withError&&n.call(this,new Error("socket has been disconnected"))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case E.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case E.EVENT:case E.BINARY_EVENT:this.onevent(e);break;case E.ACK:case E.BINARY_ACK:this.onack(e);break;case E.DISCONNECT:this.ondisconnect();break;case E.CONNECT_ERROR:this.destroy();const n=new Error(e.data.message);n.data=e.data.data,this.emitReserved("connect_error",n);break}}onevent(e){const t=e.data||[];e.id!=null&&t.push(this.ack(e.id)),this.connected?this.emitEvent(t):this.receiveBuffer.push(Object.freeze(t))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){const t=this._anyListeners.slice();for(const n of t)n.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]=="string"&&(this._lastOffset=e[e.length-1])}ack(e){const t=this;let n=!1;return function(...s){n||(n=!0,t.packet({type:E.ACK,id:e,data:s}))}}onack(e){const t=this.acks[e.id];typeof t=="function"&&(delete this.acks[e.id],t.withError&&e.data.unshift(null),t.apply(this,e.data))}onconnect(e,t){this.id=e,this.recovered=t&&this._pid===t,this._pid=t,this.connected=!0,this.emitBuffered(),this._drainQueue(!0),this.emitReserved("connect")}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(e=>e()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:E.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){const t=this._anyListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){const t=this._anyOutgoingListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const t=this._anyOutgoingListeners.slice();for(const n of t)n.apply(this,e.data)}}}function ee(r){r=r||{},this.ms=r.min||100,this.max=r.max||1e4,this.factor=r.factor||2,this.jitter=r.jitter>0&&r.jitter<=1?r.jitter:0,this.attempts=0}ee.prototype.duration=function(){var r=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random(),t=Math.floor(e*this.jitter*r);r=(Math.floor(e*10)&1)==0?r-t:r+t}return Math.min(r,this.max)|0};ee.prototype.reset=function(){this.attempts=0};ee.prototype.setMin=function(r){this.ms=r};ee.prototype.setMax=function(r){this.max=r};ee.prototype.setJitter=function(r){this.jitter=r};class Te extends I{constructor(e,t){var n;super(),this.nsps={},this.subs=[],e&&typeof e=="object"&&(t=e,e=void 0),t=t||{},t.path=t.path||"/socket.io",this.opts=t,fe(this,t),this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor((n=t.randomizationFactor)!==null&&n!==void 0?n:.5),this.backoff=new ee({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState="closed",this.uri=e;const s=t.parser||vn;this.encoder=new s.Encoder,this.decoder=new s.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var t;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(t=this.backoff)===null||t===void 0||t.setMin(e),this)}randomizationFactor(e){var t;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(t=this.backoff)===null||t===void 0||t.setJitter(e),this)}reconnectionDelayMax(e){var t;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(t=this.backoff)===null||t===void 0||t.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf("open"))return this;this.engine=new it(this.uri,this.opts);const t=this.engine,n=this;this._readyState="opening",this.skipReconnect=!1;const s=U(t,"open",function(){n.onopen(),e&&e()}),i=l=>{this.cleanup(),this._readyState="closed",this.emitReserved("error",l),e?e(l):this.maybeReconnectOnOpen()},c=U(t,"error",i);if(this._timeout!==!1){const l=this._timeout,d=this.setTimeoutFn(()=>{s(),i(new Error("timeout")),t.close()},l);this.opts.autoUnref&&d.unref(),this.subs.push(()=>{this.clearTimeoutFn(d)})}return this.subs.push(s),this.subs.push(c),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState="open",this.emitReserved("open");const e=this.engine;this.subs.push(U(e,"ping",this.onping.bind(this)),U(e,"data",this.ondata.bind(this)),U(e,"error",this.onerror.bind(this)),U(e,"close",this.onclose.bind(this)),U(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(e){try{this.decoder.add(e)}catch(t){this.onclose("parse error",t)}}ondecoded(e){pe(()=>{this.emitReserved("packet",e)},this.setTimeoutFn)}onerror(e){this.emitReserved("error",e)}socket(e,t){let n=this.nsps[e];return n?this._autoConnect&&!n.active&&n.connect():(n=new at(this,e,t),this.nsps[e]=n),n}_destroy(e){const t=Object.keys(this.nsps);for(const n of t)if(this.nsps[n].active)return;this._close()}_packet(e){const t=this.encoder.encode(e);for(let n=0;n<t.length;n++)this.engine.write(t[n],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose("forced close")}disconnect(){return this._close()}onclose(e,t){var n;this.cleanup(),(n=this.engine)===null||n===void 0||n.close(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",e,t),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const t=this.backoff.duration();this._reconnecting=!0;const n=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved("reconnect_attempt",e.backoff.attempts),!e.skipReconnect&&e.open(s=>{s?(e._reconnecting=!1,e.reconnect(),this.emitReserved("reconnect_error",s)):e.onreconnect()}))},t);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}}onreconnect(){const e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",e)}}const te={};function he(r,e){typeof r=="object"&&(e=r,r=void 0),e=e||{};const t=cn(r,e.path||"/socket.io"),n=t.source,s=t.id,i=t.path,c=te[s]&&i in te[s].nsps,l=e.forceNew||e["force new connection"]||e.multiplex===!1||c;let d;return l?d=new Te(n,e):(te[s]||(te[s]=new Te(n,e)),d=te[s]),t.query&&!e.query&&(e.query=t.queryKey),d.socket(t.path,e)}Object.assign(he,{Manager:Te,Socket:at,io:he,connect:he});const se={MIN_PLAYERS:2,MAX_PLAYERS:12,SPEED_MODES:{rahat:{label:"Rahat",description:"Yeni başlayanlar için geniş süre",minFuse:14e3,maxFuse:22e3,difficulty:"easy"},normal:{label:"Normal",description:"Dengeli ve tempolu",minFuse:9e3,maxFuse:16e3,difficulty:"medium"},cilgin:{label:"Çılgın",description:"Yüksek adrenalin, kısa fitil!",minFuse:6e3,maxFuse:11e3,difficulty:"hard"}},BONUS_LETTERS:["Z","P","V","J","G","F","H"]},L={JOIN_ROOM:"join_room",CREATE_ROOM:"create_room",START_GAME:"start_game",SUBMIT_WORD:"submit_word",TYPING_UPDATE:"typing_update",UPDATE_SETTINGS:"update_settings",KICK_PLAYER:"kick_player",PLAY_AGAIN:"play_again",SEND_EMOJI:"send_emoji",LEAVE_ROOM:"leave_room",ROOM_STATE:"room_state",PLAYER_JOINED:"player_joined",PLAYER_LEFT:"player_left",PLAYER_DISCONNECTED:"player_disconnected",PLAYER_RECONNECTED:"player_reconnected",PLAYER_KICKED:"player_kicked",HOST_CHANGED:"host_changed",SETTINGS_UPDATED:"settings_updated",COUNTDOWN_START:"countdown_start",COUNTDOWN_TICK:"countdown_tick",GAME_STARTED:"game_started",TURN_STARTED:"turn_started",WORD_ACCEPTED:"word_accepted",WORD_REJECTED:"word_rejected",BOMB_EXPLODED:"bomb_exploded",PLAYER_ELIMINATED:"player_eliminated",GAME_OVER:"game_over",EMOJI_RECEIVED:"emoji_received",REMOTE_TYPING:"remote_typing",ERROR_MESSAGE:"error_message"},ne=[{id:"bomb",emoji:"💣",label:"Bomba",color:"#FF3B30"},{id:"fire",emoji:"🔥",label:"Alev",color:"#FF9500"},{id:"skull",emoji:"💀",label:"Kafatası",color:"#AF52DE"},{id:"alien",emoji:"👾",label:"Uzaylı",color:"#5856D6"},{id:"cool",emoji:"😎",label:"Havalı",color:"#34C759"},{id:"cat",emoji:"😼",label:"Kedi",color:"#FF2D55"},{id:"tiger",emoji:"🐯",label:"Kaplan",color:"#FF9F0A"},{id:"ghost",emoji:"👻",label:"Hayalet",color:"#64D2FF"},{id:"lightning",emoji:"⚡",label:"Şimşek",color:"#FFD60A"},{id:"rocket",emoji:"🚀",label:"Roket",color:"#007AFF"},{id:"ninja",emoji:"🥷",label:"Ninja",color:"#8E8E93"},{id:"crown",emoji:"👑",label:"Kral",color:"#FFD700"}],ct=["🔥","😂","💣","😱","👏","❤️","💀","🎉"];class wn{constructor(){this.socket=null,this.sessionToken=this.getOrCreateSessionToken(),this.currentRoomCode=null,this.eventListeners=new Map}getOrCreateSessionToken(){let e=localStorage.getItem("kb_session_token");return e||(e="kb_"+Math.random().toString(36).substring(2,12)+Date.now().toString(36),localStorage.setItem("kb_session_token",e)),e}connect(){this.socket&&this.socket.connected||(this.socket=he({transports:["websocket","polling"],reconnection:!0,reconnectionAttempts:10,reconnectionDelay:1e3}),this.socket.on("connect",()=>{console.log("[Socket] Connected to server! ID:",this.socket.id),this.emitInternal("connection_change",{connected:!0})}),this.socket.on("disconnect",e=>{console.warn("[Socket] Disconnected:",e),this.emitInternal("connection_change",{connected:!1,reason:e})}),Object.values(L).forEach(e=>{this.socket.on(e,t=>{this.emitInternal(e,t)})}))}on(e,t){return this.eventListeners.has(e)||this.eventListeners.set(e,new Set),this.eventListeners.get(e).add(t),()=>this.off(e,t)}off(e,t){this.eventListeners.has(e)&&this.eventListeners.get(e).delete(t)}emitInternal(e,t){const n=this.eventListeners.get(e);n&&n.forEach(s=>{try{s(t)}catch(i){console.error(`Error in event handler for ${e}:`,i)}})}createRoom(e){return new Promise(t=>{this.connect(),this.socket.emit(L.CREATE_ROOM,{sessionToken:this.sessionToken,...e},n=>{n!=null&&n.success&&(this.currentRoomCode=n.roomCode),t(n)})})}joinRoom(e,t){return new Promise(n=>{this.connect(),this.socket.emit(L.JOIN_ROOM,{roomCode:e,sessionToken:this.sessionToken,...t},s=>{s!=null&&s.success&&(this.currentRoomCode=s.roomCode),n(s)})})}startGame(){return new Promise(e=>{this.socket.emit(L.START_GAME,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken},e)})}submitWord(e){return new Promise(t=>{this.socket.emit(L.SUBMIT_WORD,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken,word:e},t)})}sendTyping(e){this.socket&&this.socket.emit(L.TYPING_UPDATE,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken,text:e})}updateSettings(e){return new Promise(t=>{this.socket.emit(L.UPDATE_SETTINGS,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken,settings:e},t)})}kickPlayer(e){return new Promise(t=>{this.socket.emit(L.KICK_PLAYER,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken,targetSessionToken:e},t)})}playAgain(){return new Promise(e=>{this.socket.emit(L.PLAY_AGAIN,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken},e)})}sendEmoji(e){this.socket&&this.socket.emit(L.SEND_EMOJI,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken,emoji:e})}leaveRoom(){this.socket&&this.currentRoomCode&&(this.socket.emit(L.LEAVE_ROOM,{roomCode:this.currentRoomCode,sessionToken:this.sessionToken}),this.currentRoomCode=null)}}const C=new wn;class kn{constructor(){this.ctx=null,this.isMuted=localStorage.getItem("kelime_bombasi_muted")==="true",this.initialized=!1}init(){if(!(this.initialized&&this.ctx))try{const e=window.AudioContext||window.webkitAudioContext;e&&(this.ctx=new e,this.initialized=!0)}catch{console.warn("Web Audio API not supported on this browser")}}ensureContext(){this.init(),this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}toggleMute(){return this.isMuted=!this.isMuted,localStorage.setItem("kelime_bombasi_muted",this.isMuted.toString()),this.isMuted}playTick(e=0){if(this.isMuted||(this.ensureContext(),!this.ctx))return;const t=this.ctx.currentTime,n=this.ctx.createOscillator(),s=this.ctx.createGain(),i=600+e*600;n.type="sine",n.frequency.setValueAtTime(i,t),n.frequency.exponentialRampToValueAtTime(i*.5,t+.04),s.gain.setValueAtTime(.35,t),s.gain.exponentialRampToValueAtTime(.001,t+.04),n.connect(s),s.connect(this.ctx.destination),n.start(t),n.stop(t+.04)}playExplosion(){if(this.isMuted||(this.ensureContext(),!this.ctx))return;const e=this.ctx.currentTime,t=this.ctx.createOscillator(),n=this.ctx.createGain();t.type="triangle",t.frequency.setValueAtTime(140,e),t.frequency.exponentialRampToValueAtTime(30,e+.7),n.gain.setValueAtTime(.9,e),n.gain.exponentialRampToValueAtTime(.001,e+.7),t.connect(n),n.connect(this.ctx.destination),t.start(e),t.stop(e+.7);const s=this.ctx.sampleRate*.8,i=this.ctx.createBuffer(1,s,this.ctx.sampleRate),c=i.getChannelData(0);for(let b=0;b<s;b++)c[b]=Math.random()*2-1;const l=this.ctx.createBufferSource();l.buffer=i;const d=this.ctx.createBiquadFilter();d.type="lowpass",d.frequency.setValueAtTime(800,e),d.frequency.linearRampToValueAtTime(60,e+.8);const f=this.ctx.createGain();f.gain.setValueAtTime(.8,e),f.gain.exponentialRampToValueAtTime(.001,e+.8),l.connect(d),d.connect(f),f.connect(this.ctx.destination),l.start(e),l.stop(e+.8)}playCorrect(){if(this.isMuted||(this.ensureContext(),!this.ctx))return;[523.25,659.25,783.99].forEach((t,n)=>{const s=this.ctx.currentTime+n*.06,i=this.ctx.createOscillator(),c=this.ctx.createGain();i.type="sine",i.frequency.setValueAtTime(t,s),c.gain.setValueAtTime(.3,s),c.gain.exponentialRampToValueAtTime(.001,s+.25),i.connect(c),c.connect(this.ctx.destination),i.start(s),i.stop(s+.25)})}playWrong(){if(this.isMuted||(this.ensureContext(),!this.ctx))return;const e=this.ctx.currentTime;[130,138].forEach(t=>{const n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="sawtooth",n.frequency.setValueAtTime(t,e),s.gain.setValueAtTime(.2,e),s.gain.exponentialRampToValueAtTime(.001,e+.22),n.connect(s),s.connect(this.ctx.destination),n.start(e),n.stop(e+.22)})}playCountdownBeep(e=!1){if(this.isMuted||(this.ensureContext(),!this.ctx))return;const t=this.ctx.currentTime,n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="sine";const i=e?880:587.33;n.frequency.setValueAtTime(i,t),s.gain.setValueAtTime(.4,t),s.gain.exponentialRampToValueAtTime(.001,t+(e?.35:.15)),n.connect(s),s.connect(this.ctx.destination),n.start(t),n.stop(t+(e?.35:.15))}playBonus(){if(this.isMuted||(this.ensureContext(),!this.ctx))return;[440,554.37,659.25,880,1108.73].forEach((t,n)=>{const s=this.ctx.currentTime+n*.05,i=this.ctx.createOscillator(),c=this.ctx.createGain();i.type="triangle",i.frequency.setValueAtTime(t,s),c.gain.setValueAtTime(.35,s),c.gain.exponentialRampToValueAtTime(.001,s+.3),i.connect(c),c.connect(this.ctx.destination),i.start(s),i.stop(s+.3)})}playVictory(){if(this.isMuted||(this.ensureContext(),!this.ctx))return;[{f:523.25,d:.12,pause:0},{f:659.25,d:.12,pause:.14},{f:783.99,d:.14,pause:.28},{f:1046.5,d:.45,pause:.45}].forEach(({f:t,d:n,pause:s})=>{const i=this.ctx.currentTime+s,c=this.ctx.createOscillator(),l=this.ctx.createGain();c.type="triangle",c.frequency.setValueAtTime(t,i),l.gain.setValueAtTime(.4,i),l.gain.exponentialRampToValueAtTime(.001,i+n),c.connect(l),l.connect(this.ctx.destination),c.start(i),c.stop(i+n)})}}const _=new kn;function En(){if(!window.visualViewport)return;function r(){const e=window.visualViewport,t=window.innerHeight,n=Math.max(0,t-e.height);if(document.documentElement.style.setProperty("--keyboard-offset",`${n}px`),n>0){const s=document.activeElement;s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA")&&setTimeout(()=>{s.scrollIntoView({behavior:"smooth",block:"center"})},100)}}window.visualViewport.addEventListener("resize",r),window.visualViewport.addEventListener("scroll",r),window.addEventListener("resize",r),r()}function Re(r,e=null){const t=document.getElementById("emoji-layer");if(!t)return;const n=document.createElement("div");n.className="floating-emoji",n.textContent=r;const s=e!==null?Math.min(85,Math.max(15,e+(Math.random()*14-7))):Math.floor(Math.random()*70)+15;n.style.left=`${s}%`,n.style.bottom="80px",t.appendChild(n),setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},2900)}function lt(){var t,n;const r=document.getElementById("modal-container");if(!r)return;r.innerHTML=`
    <div class="modal-content">
      <button class="modal-close-btn" id="btn-close-rules" aria-label="Kapat">&times;</button>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 2.5rem;">💣</span>
        <h2 style="font-size: 1.5rem; margin-top: 6px;">Nasıl Oynanır?</h2>
      </div>

      <div class="rules-steps" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 22px;">
        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--primary-orange); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">1</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Sırası gelen oyuncuya <strong>rastgele bir hece</strong> verilir (ör: <em>"KAR"</em>, <em>"TAN"</em>).
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-yellow); color: #000; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">2</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Bu heceyi <strong>İÇEREN</strong> geçerli bir Türkçe kelime yaz (ör: <em>karpuz</em>, <em>makarna</em>).
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-pink); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">3</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Doğru kelimeyle bomba sonrakine geçer. <strong>Fitil bitmeden</strong> yazamazsan bomba elinde patlar ve can kaybedersin!
          </p>
        </div>

        <div class="rule-step" style="display: flex; gap: 12px; align-items: flex-start;">
          <div class="step-num" style="background: var(--accent-green); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">4</div>
          <p style="font-size: 0.95rem; line-height: 1.4; color: var(--text-main);">
            Bir oyunda kelimeler <strong>ikinci kez kullanılamaz</strong>. Son hayatta kalan şampiyon olur! 👑
          </p>
        </div>
      </div>

      <button id="btn-rules-got-it" class="btn btn-primary btn-block">
        Anladım, Hazırım! 🔥
      </button>
    </div>
  `,r.classList.remove("hidden");const e=()=>{r.classList.add("hidden"),r.innerHTML=""};(t=document.getElementById("btn-close-rules"))==null||t.addEventListener("click",e),(n=document.getElementById("btn-rules-got-it"))==null||n.addEventListener("click",e)}function dt(r,e={}){var G;const{onJoined:t,inviteCode:n,initialError:s}=e;let i=localStorage.getItem("kb_nickname")||"",c=localStorage.getItem("kb_avatar")||"bomb",l=ne.find(y=>y.id===c)||ne[0];const d=(n||"").trim().toUpperCase();r.innerHTML=`
    <div class="login-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 20px; justify-content: space-between;">
      <!-- Hero Header -->
      <div class="login-hero" style="text-align: center; margin-top: 10px;">
        <div class="hero-bomb-icon" style="font-size: 3.5rem; margin-bottom: 8px; filter: drop-shadow(0 0 16px var(--primary-orange-glow)); animation: floatUp 3s infinite alternate ease-in-out;">
          💣
        </div>
        <h1 style="font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; color: var(--text-main);">
          Kelime <span style="color: var(--primary-orange);">Bombası</span>
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">
          Bomba elinde kalmasın, kelimeni bul ve devret! 🔥
        </p>
      </div>

      <!-- Main Input Card -->
      <div class="login-card" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); margin: 15px 0;">
        ${d?`
          <div class="invite-banner" style="background: rgba(0, 240, 255, 0.12); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 10px 14px; text-align: center; margin-bottom: 16px;">
            <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 700;">
              🎉 <strong>${d}</strong> nolu odaya davetlisin!
            </span>
          </div>
        `:""}

        <!-- Nickname Input -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="input-nickname">Oyuncu Adın</label>
          <div style="position: relative;">
            <input
              type="text"
              id="input-nickname"
              class="input-field"
              placeholder="Adını yaz (ör: Can, Zeynep)"
              maxlength="14"
              value="${i}"
              autocomplete="nickname"
              autofocus
            />
          </div>
        </div>

        <!-- Avatar Chooser -->
        <div class="form-group" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="form-label">Avatarın</label>
            <span id="selected-avatar-label" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
              ${l.label}
            </span>
          </div>
          <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 6px;">
            ${ne.map(y=>`
              <button
                type="button"
                class="avatar-option-btn ${y.id===l.id?"active-avatar":""}"
                data-id="${y.id}"
                style="min-height: 44px; background: ${y.id===l.id?"var(--primary-orange)":"var(--bg-surface)"}; border: 1.5px solid ${y.id===l.id?"#fff":"var(--border-subtle)"}; border-radius: var(--radius-md); font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
              >
                ${y.emoji}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Error display area -->
        <div id="login-error-msg" class="login-error-box" style="display: ${s?"block":"none"}; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); color: #fca5a5; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; font-weight: 600; text-align: center; margin-bottom: 16px;">
          ${s||""}
        </div>

        <!-- Action Buttons -->
        ${d?`
          <!-- If invited via link, primary action is to Join immediately -->
          <button id="btn-join-invite" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 10px;">
            🚀 Odaya Katıl
          </button>
          <button id="btn-create-instead" class="btn btn-secondary btn-block">
            Veya Yeni Oda Kur ➕
          </button>
        `:`
          <!-- Normal Entry: Create or Join -->
          <button id="btn-create-room" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 14px;">
            👑 Oda Kur ve Başla
          </button>

          <div style="display: flex; align-items: center; gap: 12px; margin: 12px 0;">
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-dim);">VEYA</span>
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          </div>

          <div style="display: flex; gap: 8px;">
            <input
              type="text"
              id="input-room-code"
              class="input-field"
              placeholder="Oda Kodu (ör: ABCD)"
              maxlength="4"
              style="text-transform: uppercase; font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; letter-spacing: 2px; text-align: center; flex: 1;"
            />
            <button id="btn-join-room" class="btn btn-secondary" style="min-width: 90px;">
              Katıl 🚀
            </button>
          </div>
        `}
      </div>

      <!-- Footer / How to play -->
      <div class="login-footer" style="text-align: center; margin-bottom: 10px;">
        <button id="btn-open-rules" class="btn btn-secondary btn-sm" style="background: transparent; border: none; color: var(--accent-yellow); font-size: 0.9rem;">
          ❓ Nasıl Oynanır?
        </button>
      </div>
    </div>
  `;const f=r.querySelectorAll(".avatar-option-btn"),b=r.querySelector("#selected-avatar-label");f.forEach(y=>{y.addEventListener("click",()=>{_.ensureContext();const x=y.dataset.id;l=ne.find(D=>D.id===x)||ne[0],localStorage.setItem("kb_avatar",x),f.forEach(D=>{D.style.background="var(--bg-surface)",D.style.borderColor="var(--border-subtle)"}),y.style.background="var(--primary-orange)",y.style.borderColor="#fff",b&&(b.textContent=l.label)})});const S=()=>{const y=r.querySelector("#input-nickname"),x=((y==null?void 0:y.value)||"").trim();return x&&localStorage.setItem("kb_nickname",x),x},O=y=>{const x=r.querySelector("#login-error-msg");x&&(x.textContent=y,x.style.display="block")},N=r.querySelector("#btn-create-room");N&&N.addEventListener("click",async()=>{_.ensureContext();const y=S();if(!y){O("Lütfen bir oyuncu adı giriniz.");return}N.disabled=!0,N.textContent="Oda Kuruluyor...";const x=await C.createRoom({name:y,avatar:l.emoji,color:l.color});x!=null&&x.success?t(x.roomState,x.player):(O((x==null?void 0:x.error)||"Oda kurulamadı."),N.disabled=!1,N.textContent="👑 Oda Kur ve Başla")});const $=r.querySelector("#btn-join-room"),B=r.querySelector("#input-room-code");$&&B&&($.addEventListener("click",async()=>{_.ensureContext();const y=S(),x=(B.value||"").trim().toUpperCase();if(!y){O("Lütfen bir oyuncu adı giriniz.");return}if(!x||x.length!==4){O("Lütfen 4 harfli geçerli bir oda kodu giriniz.");return}$.disabled=!0,$.textContent="...";const D=await C.joinRoom(x,{name:y,avatar:l.emoji,color:l.color});D!=null&&D.success?t(D.roomState,D.player):(O((D==null?void 0:D.error)||"Odaya katılamadı."),$.disabled=!1,$.textContent="Katıl 🚀")}),B.addEventListener("keyup",y=>{y.key==="Enter"&&$.click()}));const u=r.querySelector("#btn-join-invite");u&&u.addEventListener("click",async()=>{_.ensureContext();const y=S();if(!y){O("Lütfen bir oyuncu adı giriniz.");return}u.disabled=!0,u.textContent="Katılınıyor...";const x=await C.joinRoom(d,{name:y,avatar:l.emoji,color:l.color});x!=null&&x.success?t(x.roomState,x.player):(O((x==null?void 0:x.error)||"Odaya katılamadı."),u.disabled=!1,u.textContent="🚀 Odaya Katıl")});const J=r.querySelector("#btn-create-instead");J&&J.addEventListener("click",()=>{dt(r,{onJoined:t,inviteCode:null})}),(G=r.querySelector("#btn-open-rules"))==null||G.addEventListener("click",()=>{_.ensureContext(),lt()})}function Tn(r,e=()=>{}){var c,l;const t=document.getElementById("modal-container");if(!t)return;let n={...r};t.innerHTML=`
    <div class="modal-content">
      <button class="modal-close-btn" id="btn-close-settings" aria-label="Kapat">&times;</button>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 2rem;">⚙️</span>
        <h2 style="font-size: 1.4rem; margin-top: 4px;">Oda Ayarları</h2>
      </div>

      <!-- Lives Selector -->
      <div class="form-group" style="margin-bottom: 18px;">
        <label class="form-label">Başlangıç Canı: <span id="lives-val" style="color: var(--accent-pink); font-size: 1.1rem; font-weight: 800;">${n.lives} ❤️</span></label>
        <div style="display: flex; gap: 8px;">
          ${[1,2,3,4,5].map(d=>`
            <button type="button" class="btn btn-secondary setting-live-btn ${n.lives===d?"active-setting":""}" data-val="${d}" style="flex: 1; min-height: 44px; padding: 0;">
              ${d}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Speed / Difficulty Selector -->
      <div class="form-group" style="margin-bottom: 18px;">
        <label class="form-label">Hız Seviyesi</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${Object.entries(se.SPEED_MODES).map(([d,f])=>`
            <label class="speed-option-card ${n.speed===d?"active-speed":""}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1.5px solid ${n.speed===d?"var(--primary-orange)":"var(--border-subtle)"}; border-radius: var(--radius-md); cursor: pointer;">
              <div>
                <strong style="display: block; font-size: 0.95rem; color: var(--text-main);">${f.label}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${f.description}</span>
              </div>
              <input type="radio" name="speed_mode" value="${d}" ${n.speed===d?"checked":""} style="accent-color: var(--primary-orange); width: 18px; height: 18px;" />
            </label>
          `).join("")}
        </div>
      </div>

      <!-- Bonus Lives Toggle -->
      <div class="form-group" style="margin-bottom: 22px;">
        <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); cursor: pointer;">
          <div>
            <strong style="display: block; font-size: 0.95rem; color: var(--text-main);">Bonus Canlar ⭐</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Özel harfleri toplayan oyuncuya +1 can</span>
          </div>
          <input type="checkbox" id="bonus-lives-toggle" ${n.bonusLives?"checked":""} style="accent-color: var(--accent-green); width: 20px; height: 20px;" />
        </label>
      </div>

      <button id="btn-save-settings" class="btn btn-primary btn-block">
        Ayarları Kaydet ✨
      </button>
    </div>
  `,t.classList.remove("hidden"),t.querySelectorAll(".setting-live-btn").forEach(d=>{d.addEventListener("click",()=>{n.lives=parseInt(d.dataset.val,10),t.querySelectorAll(".setting-live-btn").forEach(b=>b.classList.remove("active-setting")),d.classList.add("active-setting");const f=document.getElementById("lives-val");f&&(f.textContent=`${n.lives} ❤️`)})}),t.querySelectorAll('input[name="speed_mode"]').forEach(d=>{d.addEventListener("change",f=>{n.speed=f.target.value,t.querySelectorAll(".speed-option-card").forEach(b=>{b.style.borderColor="var(--border-subtle)"}),d.closest(".speed-option-card").style.borderColor="var(--primary-orange)"})});const s=document.getElementById("bonus-lives-toggle");s&&s.addEventListener("change",d=>{n.bonusLives=d.target.checked});const i=()=>{t.classList.add("hidden"),t.innerHTML=""};(c=document.getElementById("btn-close-settings"))==null||c.addEventListener("click",i),(l=document.getElementById("btn-save-settings"))==null||l.addEventListener("click",async()=>{const d=await C.updateSettings(n);d!=null&&d.success&&(e(n),i())})}function je(r,e={}){var O,N,$,B;const{roomState:t,currentPlayer:n,onLeave:s}=e,i=n.isHost,c=t.players.filter(u=>u.connected),l=c.length>=se.MIN_PLAYERS,d=`${window.location.origin}/?oda=${t.code}`;r.innerHTML=`
    <div class="lobby-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 16px; justify-content: space-between;">
      
      <!-- Top Room Code Card -->
      <div class="room-code-card" style="background: var(--bg-surface-elevated); border: 1.5px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">
          Oda Kodu
        </span>
        <div class="room-code-display" style="font-family: var(--font-heading); font-size: 2.8rem; font-weight: 800; color: var(--accent-yellow); letter-spacing: 4px; margin: 4px 0 10px 0; text-shadow: 0 0 20px rgba(255, 183, 3, 0.4);">
          ${t.code}
        </div>

        <div style="display: flex; gap: 8px; justify-content: center;">
          <button id="btn-copy-code" class="btn btn-secondary btn-sm" style="flex: 1;">
            📋 Kodu Kopyala
          </button>
          <button id="btn-share-link" class="btn btn-secondary btn-sm" style="flex: 1;">
            🔗 Paylaş
          </button>
        </div>
      </div>

      <!-- Settings Overview Bar -->
      <div class="settings-summary-bar" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 8px 14px; margin: 10px 0;">
        <div class="settings-badges" style="display: flex; gap: 8px; font-size: 0.82rem; font-weight: 600;">
          <span style="background: rgba(255, 42, 109, 0.15); color: var(--accent-pink); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${t.settings.lives} ❤️
          </span>
          <span style="background: rgba(255, 183, 3, 0.15); color: var(--accent-yellow); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${((O=se.SPEED_MODES[t.settings.speed])==null?void 0:O.label)||"Normal"} ⚡
          </span>
          <span style="background: rgba(16, 185, 129, 0.15); color: var(--accent-green); padding: 3px 8px; border-radius: var(--radius-sm);">
            ${t.settings.bonusLives?"Bonus Açık ⭐":"Bonus Kapalı"}
          </span>
        </div>

        ${i?`
          <button id="btn-open-settings" class="btn btn-secondary btn-sm" style="min-height: 32px; padding: 0 10px; font-size: 0.82rem;">
            ⚙️ Ayarlar
          </button>
        `:""}
      </div>

      <!-- Player List Area -->
      <div class="lobby-players-wrapper" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px;">
          <span style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-main);">
            Oyuncular
          </span>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); background: rgba(0, 240, 255, 0.1); padding: 2px 10px; border-radius: var(--radius-full);">
            ${c.length} / ${se.MAX_PLAYERS}
          </span>
        </div>

        <!-- Scrollable Player List -->
        <div id="lobby-player-list" class="players-scroll-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
          ${c.map(u=>`
            <div class="player-lobby-row" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 14px; animation: modalPop 0.25s ease-out;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="player-avatar-badge" style="width: 42px; height: 42px; background: ${u.color||"#333"}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.2);">
                  ${u.avatar||"💣"}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 700; font-size: 0.98rem; color: var(--text-main);">
                      ${u.name}
                    </span>
                    ${u.sessionToken===n.sessionToken?`
                      <span style="font-size: 0.72rem; background: rgba(255,255,255,0.12); color: var(--text-muted); padding: 1px 6px; border-radius: 4px;">(Sen)</span>
                    `:""}
                    ${u.isHost?`
                      <span title="Oda Yöneticisi" style="font-size: 1rem; filter: drop-shadow(0 0 6px gold);">👑</span>
                    `:""}
                  </div>
                  <span style="font-size: 0.78rem; color: var(--accent-green); font-weight: 600;">Hazır</span>
                </div>
              </div>

              <!-- Host kick action -->
              ${i&&u.sessionToken!==n.sessionToken?`
                <button class="icon-btn btn-kick-player" data-token="${u.sessionToken}" data-name="${u.name}" title="Odadan At" style="width: 34px; height: 34px; font-size: 0.85rem; color: var(--accent-red); border-color: rgba(239, 68, 68, 0.3);">
                  🚫
                </button>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Emoji Floating Reaction Bar -->
      <div class="lobby-reactions-bar" style="display: flex; justify-content: space-around; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 6px 10px; margin-bottom: 14px;">
        ${ct.map(u=>`
          <button type="button" class="btn-send-reaction" data-emoji="${u}" style="background: transparent; border: none; font-size: 1.45rem; cursor: pointer; transition: transform 0.15s; outline: none; padding: 2px 4px;">
            ${u}
          </button>
        `).join("")}
      </div>

      <!-- Bottom Host / Player Action -->
      <div class="lobby-bottom-actions">
        ${i?`
          <button id="btn-start-game" class="btn btn-primary btn-block btn-lg" ${l?"":"disabled"}>
            ${l?"🔥 Oyunu Başlat":"En az 2 oyuncu gerekli"}
          </button>
        `:`
          <div class="waiting-host-card" style="background: var(--bg-surface); border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 14px; text-align: center;">
            <div style="font-size: 1.2rem; margin-bottom: 4px; animation: floatUp 2s infinite alternate ease-in-out;">⏳</div>
            <strong style="font-size: 0.95rem; color: var(--text-main); display: block;">Yönetici oyunu başlatmayı bekliyor...</strong>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Yönetici butona bastığında oyun 3-2-1 ile başlar.</span>
          </div>
        `}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <button id="btn-leave-room" class="btn btn-secondary btn-sm" style="color: var(--accent-red); background: transparent; border: none;">
            🚪 Odadan Ayrıl
          </button>
          <button id="btn-lobby-rules" class="btn btn-secondary btn-sm" style="color: var(--accent-yellow); background: transparent; border: none;">
            ❓ Kurallar
          </button>
        </div>
      </div>
    </div>
  `;const f=r.querySelector("#btn-copy-code");f&&f.addEventListener("click",async()=>{_.ensureContext();try{await navigator.clipboard.writeText(t.code),f.textContent="✅ Kopyalandı!",setTimeout(()=>{f.textContent="📋 Kodu Kopyala"},1800)}catch{f.textContent=t.code}});const b=r.querySelector("#btn-share-link");b&&b.addEventListener("click",async()=>{if(_.ensureContext(),navigator.share)try{await navigator.share({title:"Kelime Bombası - Odaya Katıl!",text:`Kelime Bombası'nda odaya davetlisin! Kod: ${t.code}`,url:d})}catch{}else await navigator.clipboard.writeText(d),b.textContent="✅ Link Kopyalandı!",setTimeout(()=>{b.textContent="🔗 Paylaş"},1800)}),(N=r.querySelector("#btn-open-settings"))==null||N.addEventListener("click",()=>{_.ensureContext(),Tn(t.settings,u=>{t.settings=u})});const S=r.querySelector("#btn-start-game");S&&i&&S.addEventListener("click",async()=>{_.ensureContext(),S.disabled=!0,S.textContent="Başlatılıyor...";const u=await C.startGame();u!=null&&u.success||(alert((u==null?void 0:u.error)||"Oyun başlatılamadı."),S.disabled=!1,S.textContent="🔥 Oyunu Başlat")}),r.querySelectorAll(".btn-kick-player").forEach(u=>{u.addEventListener("click",()=>{var D,ie;_.ensureContext();const J=u.dataset.token,G=u.dataset.name,y=document.getElementById("modal-container");if(!y)return;y.innerHTML=`
        <div class="modal-content" style="text-align: center;">
          <span style="font-size: 2.2rem;">⚠️</span>
          <h3 style="margin: 8px 0;">Oyuncuyu At?</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
            <strong>${G}</strong> adlı oyuncuyu odadan atmak istediğinize emin misiniz? Bu odaya tekrar giremeyecek.
          </p>
          <div style="display: flex; gap: 10px;">
            <button id="btn-cancel-kick" class="btn btn-secondary" style="flex: 1;">Vazgeç</button>
            <button id="btn-confirm-kick" class="btn btn-danger" style="flex: 1;">Odadan At 🚫</button>
          </div>
        </div>
      `,y.classList.remove("hidden");const x=()=>{y.classList.add("hidden"),y.innerHTML=""};(D=document.getElementById("btn-cancel-kick"))==null||D.addEventListener("click",x),(ie=document.getElementById("btn-confirm-kick"))==null||ie.addEventListener("click",async()=>{x(),await C.kickPlayer(J)})})}),r.querySelectorAll(".btn-send-reaction").forEach(u=>{u.addEventListener("click",J=>{_.ensureContext(),u.style.transform="scale(1.4)",setTimeout(()=>{u.style.transform="scale(1)"},150);const G=u.dataset.emoji;C.sendEmoji(G),Re(G)})}),($=r.querySelector("#btn-lobby-rules"))==null||$.addEventListener("click",()=>{_.ensureContext(),lt()}),(B=r.querySelector("#btn-leave-room"))==null||B.addEventListener("click",()=>{_.ensureContext(),C.leaveRoom(),s&&s()})}const Q={success(){"vibrate"in navigator&&navigator.vibrate(45)},error(){"vibrate"in navigator&&navigator.vibrate([40,50,40])},explosion(){"vibrate"in navigator&&navigator.vibrate([100,40,250])},yourTurn(){"vibrate"in navigator&&navigator.vibrate([60,60,60])}};function Ue(r,e=3){r.innerHTML=`
    <div class="countdown-screen-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; padding: 20px;">
      <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-yellow); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
        Oyun Başlıyor!
      </div>

      <div id="countdown-number" style="font-family: var(--font-heading); font-size: 7.5rem; font-weight: 800; color: var(--primary-orange); text-shadow: 0 0 35px var(--primary-orange-glow); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); line-height: 1;">
        ${e}
      </div>

      <p style="color: var(--text-muted); font-size: 1rem; margin-top: 24px;">
        İlk hece hazırlanıyor... Nefesini tut! 💣
      </p>
    </div>
  `,_.playCountdownBeep(e===1),Q.yourTurn()}function _n(r){const e=document.getElementById("countdown-number");e&&(e.textContent=r>0?r:"BAŞLA! 🔥",e.style.animation="none",e.offsetWidth,e.style.animation="modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",_.playCountdownBeep(r<=1),Q.yourTurn())}class Sn{constructor(e){this.container=e,this.element=null,this.fusePath=null,this.sparkEl=null,this.syllableEl=null,this.fuseLength=0,this.animationFrame=null,this.turnStartTime=0,this.fuseDuration=0,this.lastTickTime=0}render(e="..."){this.container.innerHTML=`
      <div class="bomb-wrapper" id="bomb-wrapper">
        <svg class="bomb-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Bomb Body Gradient -->
            <radialGradient id="bombSurfaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#4a3b68" />
              <stop offset="45%" stop-color="#231b3e" />
              <stop offset="100%" stop-color="#0f0c1d" />
            </radialGradient>

            <!-- Hot Ember Glow on Critical -->
            <radialGradient id="bombCriticalGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#ff7b00" />
              <stop offset="35%" stop-color="#d90429" />
              <stop offset="85%" stop-color="#4d0519" />
              <stop offset="100%" stop-color="#1a040b" />
            </radialGradient>

            <!-- Spark Gradient -->
            <radialGradient id="sparkFlame" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="30%" stop-color="#ffeb3b" />
              <stop offset="70%" stop-color="#ff3d00" />
              <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <filter id="bombGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Shadow underneath -->
          <ellipse cx="160" cy="290" rx="90" ry="18" fill="rgba(0,0,0,0.5)" filter="url(#bombGlow)" />

          <!-- Fuse Path (Starts from spark down into the bomb neck) -->
          <path id="svg-fuse-path"
            d="M 235 65 C 220 35, 175 40, 180 85 C 185 110, 170 120, 160 125"
            fill="none"
            stroke="#a3927d"
            stroke-width="7"
            stroke-linecap="round"
            stroke-dasharray="200"
            stroke-dashoffset="0"
          />

          <!-- Bomb Neck / Collar -->
          <rect x="145" y="118" width="30" height="20" rx="4" fill="#3b2d54" stroke="#5a4580" stroke-width="2" />

          <!-- Main Bomb Body Circle -->
          <circle id="svg-bomb-sphere" cx="160" cy="210" r="82" fill="url(#bombSurfaceGrad)" stroke="#ff4500" stroke-width="3" />

          <!-- Specular Highlight for 3D depth -->
          <ellipse cx="132" cy="178" rx="28" ry="16" transform="rotate(-30 132 178)" fill="rgba(255,255,255,0.18)" />

          <!-- Burning Spark & Particle Group -->
          <g id="svg-spark-group" class="spark-animated">
            <circle id="svg-spark-glow" cx="235" cy="65" r="22" fill="url(#sparkFlame)" filter="url(#bombGlow)" />
            <polygon points="235,42 240,58 256,58 243,68 248,84 235,74 222,84 227,68 214,58 230,58" fill="#fffb00" />
          </g>
        </svg>

        <!-- Dynamic Glowing Syllable Tag -->
        <div class="syllable-display-box" id="syllable-box">
          <span class="syllable-label">İÇEREN KELİME YAZ</span>
          <span class="syllable-text" id="syllable-text">${e}</span>
        </div>
      </div>
    `,this.element=this.container.querySelector("#bomb-wrapper"),this.fusePath=this.container.querySelector("#svg-fuse-path"),this.sparkEl=this.container.querySelector("#svg-spark-group"),this.syllableEl=this.container.querySelector("#syllable-text"),this.sphereEl=this.container.querySelector("#svg-bomb-sphere"),this.fusePath&&(this.fuseLength=this.fusePath.getTotalLength(),this.fusePath.style.strokeDasharray=`${this.fuseLength}`,this.fusePath.style.strokeDashoffset="0")}setSyllable(e){this.syllableEl&&(this.syllableEl.textContent=e,this.syllableEl.classList.remove("syllable-bounce"),this.syllableEl.offsetWidth,this.syllableEl.classList.add("syllable-bounce"))}startFuse(e,t){this.turnStartTime=e,this.fuseDuration=t,this.lastTickTime=Date.now(),this.animationFrame&&cancelAnimationFrame(this.animationFrame);const n=()=>{const s=Date.now(),i=s-this.turnStartTime,c=Math.min(1,Math.max(0,i/this.fuseDuration)),l=Math.max(0,this.fuseDuration-i);this.updateFuse(c,l);const d=Math.max(200,1e3*(1-c*.7));s-this.lastTickTime>=d&&(_.playTick(c),this.lastTickTime=s),c<1&&(this.animationFrame=requestAnimationFrame(n))};this.animationFrame=requestAnimationFrame(n)}updateFuse(e,t){var i,c,l,d;if(!this.fusePath||!this.sparkEl)return;const n=this.fuseLength*e;this.fusePath.style.strokeDashoffset=`${n}`;try{const f=this.fusePath.getPointAtLength(n);this.sparkEl.setAttribute("transform",`translate(${f.x-235}, ${f.y-65})`)}catch{}t<4e3?((i=this.element)==null||i.classList.remove("bomb-pulse-normal"),(c=this.element)==null||c.classList.add("bomb-pulse-critical"),this.sphereEl&&(this.sphereEl.setAttribute("fill","url(#bombCriticalGrad)"),this.sphereEl.setAttribute("stroke","#ff0033"))):((l=this.element)==null||l.classList.remove("bomb-pulse-critical"),(d=this.element)==null||d.classList.add("bomb-pulse-normal"),this.sphereEl&&(this.sphereEl.setAttribute("fill","url(#bombSurfaceGrad)"),this.sphereEl.setAttribute("stroke","#ff4500")))}stop(){this.animationFrame&&(cancelAnimationFrame(this.animationFrame),this.animationFrame=null)}triggerExplosionAnimation(){this.stop();const e=document.getElementById("app");e&&(e.classList.remove("shake-screen","flash-screen"),e.offsetWidth,e.classList.add("shake-screen","flash-screen"),setTimeout(()=>{e.classList.remove("shake-screen","flash-screen")},700))}}class He{constructor(e,t={}){this.container=e,this.roomState=t.roomState,this.currentPlayer=t.currentPlayer,this.bombView=null,this.activePlayerId=null,this.activePlayerToken=null,this.typingDebounce=null,this.remoteTypingText=""}render(){var s,i;const e=!this.currentPlayer.isAlive||this.currentPlayer.isSpectator,t=((s=this.roomState.activePlayer)==null?void 0:s.sessionToken)===this.currentPlayer.sessionToken;this.container.innerHTML=`
      <div class="game-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 10px 14px; justify-content: space-between; position: relative;">
        
        <!-- Top Players Row -->
        <div class="game-players-header" id="game-players-header" style="display: flex; gap: 8px; overflow-x: auto; padding: 6px 2px 10px 2px; -webkit-overflow-scrolling: touch; scrollbar-width: none;">
          ${this.renderPlayersList()}
        </div>

        <!-- Bonus Letters Tracker (if enabled) -->
        ${this.roomState.settings.bonusLives?`
          <div class="bonus-letters-bar" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(20, 16, 41, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 4px 12px; margin: 0 auto; max-width: 320px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-yellow); margin-right: 2px;">BONUS:</span>
            ${se.BONUS_LETTERS.map(c=>{const d=(this.currentPlayer.bonusLetters||[]).includes(c);return`
                <span class="bonus-letter-chip ${d?"collected":""}" style="width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800; border-radius: 4px; background: ${d?"var(--accent-yellow)":"rgba(255,255,255,0.08)"}; color: ${d?"#000":"var(--text-dim)"}; transition: all 0.2s;">
                  ${c}
                </span>
              `}).join("")}
          </div>
        `:""}

        <!-- Center Bomb & Syllable Area -->
        <div class="game-center-stage" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; position: relative;">
          <div id="bomb-mount-point" style="width: 100%; max-width: 280px; display: flex; justify-content: center;"></div>
        </div>

        <!-- Live Typing Mirror Bar -->
        <div id="live-typing-mirror" class="live-typing-bar" style="text-align: center; min-height: 28px; margin-bottom: 6px;">
          <span id="typing-text-display" style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--accent-yellow); letter-spacing: 2px; text-transform: uppercase;">
            ${this.remoteTypingText}
          </span>
        </div>

        <!-- Recent Words Stream (horizontal pill list) -->
        <div class="recent-words-stream" id="recent-words-stream" style="display: flex; gap: 6px; justify-content: center; overflow-x: hidden; min-height: 26px; margin-bottom: 10px;">
          ${(this.roomState.recentWords||[]).slice(0,3).map(c=>`
            <span style="background: rgba(255,255,255,0.07); color: var(--text-muted); font-size: 0.76rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.05); text-transform: uppercase;">
              ${c}
            </span>
          `).join("")}
        </div>

        <!-- Bottom Word Input Area (Adjusted for Virtual Keyboard) -->
        <div class="game-input-container" style="padding-bottom: var(--keyboard-offset); transition: padding-bottom 0.15s ease-out;">
          <div id="turn-action-box">
            ${this.renderInputBox(t,e)}
          </div>

          <!-- Bottom Reaction Bar -->
          <div class="game-reactions-tray" style="display: flex; justify-content: space-around; background: rgba(20, 16, 41, 0.95); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 5px 8px; margin-top: 10px;">
            ${ct.map(c=>`
              <button type="button" class="btn-game-reaction" data-emoji="${c}" style="background: transparent; border: none; font-size: 1.35rem; cursor: pointer; outline: none; padding: 2px;">
                ${c}
              </button>
            `).join("")}
          </div>
        </div>

      </div>
    `;const n=this.container.querySelector("#bomb-mount-point");n&&(this.bombView=new Sn(n),this.bombView.render(this.roomState.currentSyllable||"...")),this.bindEvents(),this.roomState.turnStartTime&&this.roomState.fuseDurationMs&&((i=this.bombView)==null||i.startFuse(this.roomState.turnStartTime,this.roomState.fuseDurationMs))}renderPlayersList(){var t;const e=(t=this.roomState.activePlayer)==null?void 0:t.sessionToken;return this.roomState.players.map(n=>{const s=n.sessionToken===e,i=!n.isAlive||n.lives<=0;let c="";for(let l=0;l<this.roomState.settings.lives;l++)l<n.lives?c+='<span style="color: var(--accent-pink); font-size: 0.72rem;">❤️</span>':c+='<span style="color: #4a4563; font-size: 0.72rem; opacity: 0.4;">🖤</span>';return`
        <div class="game-player-chip ${s?"turn-active-glow":""} ${i?"player-eliminated":""}" style="display: flex; flex-direction: column; align-items: center; min-width: 68px; padding: 6px 4px; background: ${s?"var(--bg-surface-elevated)":"var(--bg-surface)"}; border: 1.5px solid ${s?"var(--primary-orange)":"var(--border-subtle)"}; border-radius: var(--radius-md); opacity: ${i?.35:1}; filter: ${i?"grayscale(0.9)":"none"}; transition: all 0.25s;">
          <div style="position: relative;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${n.color||"#333"}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              ${i?"💀":n.avatar}
            </div>
            ${n.isHost?'<span style="position: absolute; top: -6px; right: -6px; font-size: 0.85rem;">👑</span>':""}
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); margin-top: 4px; max-width: 62px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${n.name}
          </span>
          <div style="display: flex; gap: 1px; margin-top: 2px;">
            ${c}
          </div>
        </div>
      `}).join("")}renderInputBox(e,t){var n;return t?`
        <div class="spectator-card" style="background: rgba(26, 21, 53, 0.9); border: 1.5px dashed var(--accent-cyan); border-radius: var(--radius-md); padding: 14px; text-align: center;">
          <span style="font-size: 1.3rem;">👀</span>
          <strong style="display: block; font-size: 0.95rem; color: var(--accent-cyan); margin-top: 2px;">İzleyici Modundasın</strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Sıradaki oyunda dahil olacaksın. Canlı izleyebilir ve emoji atabilirsin!</span>
        </div>
      `:e?`
        <form id="word-form" style="display: flex; gap: 8px; width: 100%;">
          <input
            type="text"
            id="word-input"
            class="input-field"
            placeholder="${this.roomState.currentSyllable} içeren kelime yaz..."
            maxlength="25"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; border-color: var(--primary-orange); box-shadow: 0 0 0 2px var(--primary-orange-glow); flex: 1;"
            autofocus
          />
          <button type="submit" id="btn-submit-word" class="btn btn-primary" style="min-width: 90px; font-size: 1rem;">
            GÖNDER 🔥
          </button>
        </form>
      `:`
        <div class="waiting-turn-bar" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; text-align: center;">
          <span style="font-size: 0.92rem; color: var(--text-muted);">
            Sıra <strong style="color: var(--primary-orange); font-size: 1rem;">${((n=this.roomState.activePlayer)==null?void 0:n.name)||"Rakip"}</strong> oyuncusunda...
          </span>
        </div>
      `}bindEvents(){const e=this.container.querySelector("#word-form"),t=this.container.querySelector("#word-input");e&&t&&(setTimeout(()=>t.focus(),50),e.addEventListener("submit",async n=>{n.preventDefault(),_.ensureContext();const s=(t.value||"").trim();if(!s)return;const i=await C.submitWord(s);i!=null&&i.success&&(t.value="",C.sendTyping(""))}),t.addEventListener("input",n=>{const s=n.target.value.toUpperCase(),i=this.container.querySelector("#typing-text-display");i&&(i.textContent=s),clearTimeout(this.typingDebounce),this.typingDebounce=setTimeout(()=>{C.sendTyping(s)},80)})),this.container.querySelectorAll(".btn-game-reaction").forEach(n=>{n.addEventListener("click",()=>{_.ensureContext();const s=n.dataset.emoji;C.sendEmoji(s),Re(s)})})}onTurnStarted(e){var S,O;const{activePlayer:t,syllable:n,fuseDurationMs:s,turnStartTime:i}=e;this.activePlayerId=t.id,this.activePlayerToken=t.sessionToken,this.roomState.activePlayer=t,this.roomState.currentSyllable=n,this.roomState.fuseDurationMs=s,this.roomState.turnStartTime=i,this.remoteTypingText="";const c=this.container.querySelector("#game-players-header");c&&(c.innerHTML=this.renderPlayersList()),(S=this.bombView)==null||S.setSyllable(n),(O=this.bombView)==null||O.startFuse(i,s);const l=!this.currentPlayer.isAlive||this.currentPlayer.isSpectator,d=this.activePlayerToken===this.currentPlayer.sessionToken,f=this.container.querySelector("#turn-action-box");f&&(f.innerHTML=this.renderInputBox(d,l),this.bindEvents());const b=this.container.querySelector("#typing-text-display");if(b&&(b.textContent=""),d){Q.yourTurn(),_.playCountdownBeep(!0);const N=this.container.querySelector("#word-input");N&&(N.focus(),N.placeholder=`"${n}" içeren kelime yaz!`)}}onRemoteTyping(e){this.remoteTypingText=e;const t=this.container.querySelector("#typing-text-display");t&&(t.textContent=e)}onWordAccepted(e){_.playCorrect(),Q.success(),this.showToast(`✅ "${e.word}" kabul edildi! (${e.timeSeconds}s)`,"success");const t=this.container.querySelector("#recent-words-stream");if(t){const n=document.createElement("span");n.style.cssText="background: rgba(16, 185, 129, 0.2); color: var(--accent-green); font-size: 0.76rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--accent-green); text-transform: uppercase; animation: modalPop 0.2s ease-out;",n.textContent=e.word,t.insertBefore(n,t.firstChild),t.children.length>3&&t.removeChild(t.lastChild)}e.bonusAwarded&&(_.playBonus(),this.showToast("⭐ Tebrikler! Özel harfleri tamamlayarak +1 Can kazandın!","info"))}onWordRejected(e){_.playWrong(),Q.error(),this.showToast(`❌ ${e.error}`,"error");const t=this.container.querySelector("#word-input");t&&(t.classList.remove("shake-screen"),t.offsetWidth,t.classList.add("shake-screen"),setTimeout(()=>t.classList.remove("shake-screen"),600))}onBombExploded(e){var s;_.playExplosion(),Q.explosion(),(s=this.bombView)==null||s.triggerExplosionAnimation();const t=e.player.name,n=e.player.id===this.currentPlayer.id;e.player.isEliminated?this.showToast(`💥 BOMBA PATLADI! ${t} elendi!`,"error"):this.showToast(`💥 BOMBA PATLADI! ${t} 1 can kaybetti!`,"error"),n&&e.player.isEliminated&&(this.currentPlayer.isAlive=!1,this.currentPlayer.isSpectator=!0)}showToast(e,t="info"){const n=document.getElementById("toast-banner");n&&(n.textContent=e,n.className=`toast-banner ${t}`,n.classList.remove("hidden"),clearTimeout(this.toastTimer),this.toastTimer=setTimeout(()=>{n.classList.add("hidden")},2500))}cleanup(){var e;(e=this.bombView)==null||e.stop()}}var Oe={};(function r(e,t,n,s){var i=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.OffscreenCanvasRenderingContext2D&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL),c=typeof Path2D=="function"&&typeof DOMMatrix=="function",l=(function(){if(!e.OffscreenCanvas)return!1;try{var a=new OffscreenCanvas(1,1),o=a.getContext("2d");o.fillRect(0,0,1,1);var h=a.transferToImageBitmap();o.createPattern(h,"no-repeat")}catch{return!1}return!0})();function d(){}function f(a){var o=t.exports.Promise,h=o!==void 0?o:e.Promise;return typeof h=="function"?new h(a):(a(d,d),null)}var b=(function(a,o){return{transform:function(h){if(a)return h;if(o.has(h))return o.get(h);var m=new OffscreenCanvas(h.width,h.height),g=m.getContext("2d");return g.drawImage(h,0,0),o.set(h,m),m},clear:function(){o.clear()}}})(l,new Map),S=(function(){var a=Math.floor(16.666666666666668),o,h,m={},g=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(o=function(v){var w=Math.random();return m[w]=requestAnimationFrame(function p(k){g===k||g+a-1<k?(g=k,delete m[w],v()):m[w]=requestAnimationFrame(p)}),w},h=function(v){m[v]&&cancelAnimationFrame(m[v])}):(o=function(v){return setTimeout(v,a)},h=function(v){return clearTimeout(v)}),{frame:o,cancel:h}})(),O=(function(){var a,o,h={};function m(g){function v(w,p){g.postMessage({options:w||{},callback:p})}g.init=function(p){var k=p.transferControlToOffscreen();g.postMessage({canvas:k},[k])},g.fire=function(p,k,A){if(o)return v(p,null),o;var M=Math.random().toString(36).slice(2);return o=f(function(R){function P(z){z.data.callback===M&&(delete h[M],g.removeEventListener("message",P),o=null,b.clear(),A(),R())}g.addEventListener("message",P),v(p,M),h[M]=P.bind(null,{data:{callback:M}})}),o},g.reset=function(){g.postMessage({reset:!0});for(var p in h)h[p](),delete h[p]}}return function(){if(a)return a;if(!n&&i){var g=["var CONFETTI, SIZE = {}, module = {};","("+r.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{a=new Worker(URL.createObjectURL(new Blob([g])))}catch(v){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",v),null}m(a)}return a}})(),N={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function $(a,o){return o?o(a):a}function B(a){return a!=null}function u(a,o,h){return $(a&&B(a[o])?a[o]:N[o],h)}function J(a){return a<0?0:Math.floor(a)}function G(a,o){return Math.floor(Math.random()*(o-a))+a}function y(a){return parseInt(a,16)}function x(a){return a.map(D)}function D(a){var o=String(a).replace(/[^0-9a-f]/gi,"");return o.length<6&&(o=o[0]+o[0]+o[1]+o[1]+o[2]+o[2]),{r:y(o.substring(0,2)),g:y(o.substring(2,4)),b:y(o.substring(4,6))}}function ie(a){var o=u(a,"origin",Object);return o.x=u(o,"x",Number),o.y=u(o,"y",Number),o}function ut(a){a.width=document.documentElement.clientWidth,a.height=document.documentElement.clientHeight}function ht(a){var o=a.getBoundingClientRect();a.width=o.width,a.height=o.height}function pt(a){var o=document.createElement("canvas");return o.style.position="fixed",o.style.top="0px",o.style.left="0px",o.style.pointerEvents="none",o.style.zIndex=a,o}function ft(a,o,h,m,g,v,w,p,k){a.save(),a.translate(o,h),a.rotate(v),a.scale(m,g),a.arc(0,0,1,w,p,k),a.restore()}function mt(a){var o=a.angle*(Math.PI/180),h=a.spread*(Math.PI/180);return{x:a.x,y:a.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:a.startVelocity*.5+Math.random()*a.startVelocity,angle2D:-o+(.5*h-Math.random()*h),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:a.color,shape:a.shape,tick:0,totalTicks:a.ticks,decay:a.decay,drift:a.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:a.gravity*3,ovalScalar:.6,scalar:a.scalar,flat:a.flat}}function yt(a,o){o.x+=Math.cos(o.angle2D)*o.velocity+o.drift,o.y+=Math.sin(o.angle2D)*o.velocity+o.gravity,o.velocity*=o.decay,o.flat?(o.wobble=0,o.wobbleX=o.x+10*o.scalar,o.wobbleY=o.y+10*o.scalar,o.tiltSin=0,o.tiltCos=0,o.random=1):(o.wobble+=o.wobbleSpeed,o.wobbleX=o.x+10*o.scalar*Math.cos(o.wobble),o.wobbleY=o.y+10*o.scalar*Math.sin(o.wobble),o.tiltAngle+=.1,o.tiltSin=Math.sin(o.tiltAngle),o.tiltCos=Math.cos(o.tiltAngle),o.random=Math.random()+2);var h=o.tick++/o.totalTicks,m=o.x+o.random*o.tiltCos,g=o.y+o.random*o.tiltSin,v=o.wobbleX+o.random*o.tiltCos,w=o.wobbleY+o.random*o.tiltSin;if(a.fillStyle="rgba("+o.color.r+", "+o.color.g+", "+o.color.b+", "+(1-h)+")",a.beginPath(),c&&o.shape.type==="path"&&typeof o.shape.path=="string"&&Array.isArray(o.shape.matrix))a.fill(bt(o.shape.path,o.shape.matrix,o.x,o.y,Math.abs(v-m)*.1,Math.abs(w-g)*.1,Math.PI/10*o.wobble));else if(o.shape.type==="bitmap"){var p=Math.PI/10*o.wobble,k=Math.abs(v-m)*.1,A=Math.abs(w-g)*.1,M=o.shape.bitmap.width*o.scalar,R=o.shape.bitmap.height*o.scalar,P=new DOMMatrix([Math.cos(p)*k,Math.sin(p)*k,-Math.sin(p)*A,Math.cos(p)*A,o.x,o.y]);P.multiplySelf(new DOMMatrix(o.shape.matrix));var z=a.createPattern(b.transform(o.shape.bitmap),"no-repeat");z.setTransform(P),a.globalAlpha=1-h,a.fillStyle=z,a.fillRect(o.x-M/2,o.y-R/2,M,R),a.globalAlpha=1}else if(o.shape==="circle")a.ellipse?a.ellipse(o.x,o.y,Math.abs(v-m)*o.ovalScalar,Math.abs(w-g)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI):ft(a,o.x,o.y,Math.abs(v-m)*o.ovalScalar,Math.abs(w-g)*o.ovalScalar,Math.PI/10*o.wobble,0,2*Math.PI);else if(o.shape==="star")for(var T=Math.PI/2*3,q=4*o.scalar,V=8*o.scalar,j=o.x,Y=o.y,X=5,H=Math.PI/X;X--;)j=o.x+Math.cos(T)*V,Y=o.y+Math.sin(T)*V,a.lineTo(j,Y),T+=H,j=o.x+Math.cos(T)*q,Y=o.y+Math.sin(T)*q,a.lineTo(j,Y),T+=H;else a.moveTo(Math.floor(o.x),Math.floor(o.y)),a.lineTo(Math.floor(o.wobbleX),Math.floor(g)),a.lineTo(Math.floor(v),Math.floor(w)),a.lineTo(Math.floor(m),Math.floor(o.wobbleY));return a.closePath(),a.fill(),o.tick<o.totalTicks}function gt(a,o,h,m,g){var v=o.slice(),w=a.getContext("2d"),p,k,A=f(function(M){function R(){p=k=null,w.clearRect(0,0,m.width,m.height),b.clear(),g(),M()}function P(){n&&!(m.width===s.width&&m.height===s.height)&&(m.width=a.width=s.width,m.height=a.height=s.height),!m.width&&!m.height&&(h(a),m.width=a.width,m.height=a.height),w.clearRect(0,0,m.width,m.height),v=v.filter(function(z){return yt(w,z)}),v.length?p=S.frame(P):R()}p=S.frame(P),k=R});return{addFettis:function(M){return v=v.concat(M),A},canvas:a,promise:A,reset:function(){p&&S.cancel(p),k&&k()}}}function Be(a,o){var h=!a,m=!!u(o||{},"resize"),g=!1,v=u(o,"disableForReducedMotion",Boolean),w=i&&!!u(o||{},"useWorker"),p=w?O():null,k=h?ut:ht,A=a&&p?!!a.__confetti_initialized:!1,M=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,R;function P(T,q,V){for(var j=u(T,"particleCount",J),Y=u(T,"angle",Number),X=u(T,"spread",Number),H=u(T,"startVelocity",Number),wt=u(T,"decay",Number),kt=u(T,"gravity",Number),Et=u(T,"drift",Number),Pe=u(T,"colors",x),Tt=u(T,"ticks",Number),Ie=u(T,"shapes"),_t=u(T,"scalar"),St=!!u(T,"flat"),Ne=ie(T),De=j,ye=[],Ct=a.width*Ne.x,At=a.height*Ne.y;De--;)ye.push(mt({x:Ct,y:At,angle:Y,spread:X,startVelocity:H,color:Pe[De%Pe.length],shape:Ie[G(0,Ie.length)],ticks:Tt,decay:wt,gravity:kt,drift:Et,scalar:_t,flat:St}));return R?R.addFettis(ye):(R=gt(a,ye,k,q,V),R.promise)}function z(T){var q=v||u(T,"disableForReducedMotion",Boolean),V=u(T,"zIndex",Number);if(q&&M)return f(function(H){H()});h&&R?a=R.canvas:h&&!a&&(a=pt(V),document.body.appendChild(a)),m&&!A&&k(a);var j={width:a.width,height:a.height};p&&!A&&p.init(a),A=!0,p&&(a.__confetti_initialized=!0);function Y(){if(p){var H={getBoundingClientRect:function(){if(!h)return a.getBoundingClientRect()}};k(H),p.postMessage({resize:{width:H.width,height:H.height}});return}j.width=j.height=null}function X(){R=null,m&&(g=!1,e.removeEventListener("resize",Y)),h&&a&&(document.body.contains(a)&&document.body.removeChild(a),a=null,A=!1)}return m&&!g&&(g=!0,e.addEventListener("resize",Y,!1)),p?p.fire(T,j,X):P(T,j,X)}return z.reset=function(){p&&p.reset(),R&&R.reset()},z}var me;function Me(){return me||(me=Be(null,{useWorker:!0,resize:!0})),me}function bt(a,o,h,m,g,v,w){var p=new Path2D(a),k=new Path2D;k.addPath(p,new DOMMatrix(o));var A=new Path2D;return A.addPath(k,new DOMMatrix([Math.cos(w)*g,Math.sin(w)*g,-Math.sin(w)*v,Math.cos(w)*v,h,m])),A}function vt(a){if(!c)throw new Error("path confetti are not supported in this browser");var o,h;typeof a=="string"?o=a:(o=a.path,h=a.matrix);var m=new Path2D(o),g=document.createElement("canvas"),v=g.getContext("2d");if(!h){for(var w=1e3,p=w,k=w,A=0,M=0,R,P,z=0;z<w;z+=2)for(var T=0;T<w;T+=2)v.isPointInPath(m,z,T,"nonzero")&&(p=Math.min(p,z),k=Math.min(k,T),A=Math.max(A,z),M=Math.max(M,T));R=A-p,P=M-k;var q=10,V=Math.min(q/R,q/P);h=[V,0,0,V,-Math.round(R/2+p)*V,-Math.round(P/2+k)*V]}return{type:"path",path:o,matrix:h}}function xt(a){var o,h=1,m="#000000",g='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof a=="string"?o=a:(o=a.text,h="scalar"in a?a.scalar:h,g="fontFamily"in a?a.fontFamily:g,m="color"in a?a.color:m);var v=10*h,w=""+v+"px "+g,p=new OffscreenCanvas(v,v),k=p.getContext("2d");k.font=w;var A=k.measureText(o),M=Math.ceil(A.actualBoundingBoxRight+A.actualBoundingBoxLeft),R=Math.ceil(A.actualBoundingBoxAscent+A.actualBoundingBoxDescent),P=2,z=A.actualBoundingBoxLeft+P,T=A.actualBoundingBoxAscent+P;M+=P+P,R+=P+P,p=new OffscreenCanvas(M,R),k=p.getContext("2d"),k.font=w,k.fillStyle=m,k.fillText(o,z,T);var q=1/h;return{type:"bitmap",bitmap:p.transferToImageBitmap(),matrix:[q,0,0,q,-M*q/2,-R*q/2]}}t.exports=function(){return Me().apply(this,arguments)},t.exports.reset=function(){Me().reset()},t.exports.create=Be,t.exports.shapeFromPath=vt,t.exports.shapeFromText=xt})((function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}})(),Oe,!1);const Ke=Oe.exports;Oe.exports.create;function Cn(){const e=Date.now()+3500,t={startVelocity:30,spread:360,ticks:60,zIndex:120};function n(i,c){return Math.random()*(c-i)+i}const s=setInterval(()=>{const i=e-Date.now();if(i<=0)return clearInterval(s);const c=50*(i/3500);Ke({...t,particleCount:c,origin:{x:n(.1,.3),y:Math.random()-.2},colors:["#ff4500","#ffb703","#00f0ff","#ff2a6d","#10b981"]}),Ke({...t,particleCount:c,origin:{x:n(.7,.9),y:Math.random()-.2},colors:["#ff4500","#ffb703","#00f0ff","#ff2a6d","#10b981"]})},250)}function We(r,e={}){var f,b,S,O,N,$;const{resultsData:t,currentPlayer:n,onLeave:s}=e,{winner:i,rankings:c=[],stats:l={}}=t,d=n.isHost;r.innerHTML=`
    <div class="results-screen-view" style="display: flex; flex-direction: column; flex: 1; padding: 16px; justify-content: space-between; overflow-y: auto;">
      
      <!-- Winner Celebration Podium -->
      <div class="winner-podium-card" style="text-align: center; margin: 10px 0 16px 0; background: var(--bg-surface-elevated); border: 2px solid var(--accent-yellow); border-radius: var(--radius-lg); padding: 20px; box-shadow: 0 10px 30px rgba(255, 183, 3, 0.25); animation: modalPop 0.4s ease-out;">
        <span style="font-size: 2.2rem; display: block; filter: drop-shadow(0 0 10px gold); margin-bottom: 4px;">👑</span>
        <div class="winner-avatar" style="width: 76px; height: 76px; border-radius: 50%; background: ${(i==null?void 0:i.color)||"#FF3B30"}; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; margin: 0 auto 10px auto; border: 3px solid #fff; box-shadow: 0 0 25px rgba(255, 183, 3, 0.6);">
          ${(i==null?void 0:i.avatar)||"🎉"}
        </div>
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-yellow); text-transform: uppercase; letter-spacing: 2px;">
          ŞAMPİYON
        </span>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-top: 2px;">
          ${i?i.name:"Berabere!"}
        </h2>
      </div>

      <!-- Match Highlight Stats -->
      <div class="match-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">TOPLAM KELİME</span>
          <strong style="font-size: 1.25rem; color: var(--accent-cyan);">${l.totalWords||0}</strong>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">EN UZUN</span>
          <strong style="font-size: 0.95rem; color: var(--accent-green); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${((f=l.longestWord)==null?void 0:f.word)||"-"}
          </strong>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${((b=l.longestWord)==null?void 0:b.player)||""}</span>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 8px; text-align: center;">
          <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; display: block;">EN HIZLI</span>
          <strong style="font-size: 1rem; color: var(--primary-orange); display: block;">
            ${(S=l.fastestAnswer)!=null&&S.timeSeconds&&l.fastestAnswer.timeSeconds<900?`${l.fastestAnswer.timeSeconds}s`:"-"}
          </strong>
          <span style="font-size: 0.7rem; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">
            ${((O=l.fastestAnswer)==null?void 0:O.player)||""}
          </span>
        </div>
      </div>

      <!-- Rankings Table -->
      <div class="leaderboard-section" style="flex: 1; margin-bottom: 16px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block;">
          Sıralama
        </span>
        <div class="rankings-list" style="display: flex; flex-direction: column; gap: 6px;">
          ${c.map(B=>`
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); border: 1px solid ${B.isWinner?"var(--accent-yellow)":"var(--border-subtle)"}; border-radius: var(--radius-md); padding: 8px 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; width: 22px; color: ${B.rank===1?"gold":B.rank===2?"#c0c0c0":B.rank===3?"#cd7f32":"var(--text-dim)"};">
                  #${B.rank}
                </span>
                <span style="font-size: 1.25rem;">${B.avatar}</span>
                <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                  ${B.name}
                  ${B.id===n.id?'<span style="font-size: 0.72rem; color: var(--text-muted);">(Sen)</span>':""}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-pink);">
                  ${B.lives>0?`${B.lives} ❤️`:"💀"}
                </span>
                <strong style="font-family: var(--font-heading); font-size: 1rem; color: var(--text-main);">
                  ${B.score} P
                </strong>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Actions -->
      <div class="results-actions" style="margin-top: 8px;">
        ${d?`
          <button id="btn-play-again" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 10px;">
            🔄 Tekrar Oyna
          </button>
        `:`
          <div style="text-align: center; font-size: 0.9rem; color: var(--text-muted); background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); margin-bottom: 10px; border: 1px dashed var(--border-subtle);">
            ⏳ Yöneticinin yeni oyunu başlatması bekleniyor...
          </div>
        `}

        <button id="btn-leave-results" class="btn btn-secondary btn-block">
          🚪 Lobiden Ayrıl
        </button>
      </div>

    </div>
  `,Cn(),_.playVictory(),(N=r.querySelector("#btn-play-again"))==null||N.addEventListener("click",async()=>{_.ensureContext();const B=r.querySelector("#btn-play-again");B&&(B.disabled=!0,B.textContent="Başlatılıyor..."),await C.playAgain()}),($=r.querySelector("#btn-leave-results"))==null||$.addEventListener("click",()=>{_.ensureContext(),C.leaveRoom(),s&&s()})}class An{constructor(){this.screenContainer=document.getElementById("screen-container"),this.currentScreen="login",this.roomState=null,this.currentPlayer=null,this.gameScreenInstance=null,this.init()}init(){En(),this.initSoundToggle();const e=()=>{_.ensureContext(),window.removeEventListener("click",e),window.removeEventListener("touchstart",e)};window.addEventListener("click",e),window.addEventListener("touchstart",e);let n=new URLSearchParams(window.location.search).get("oda")||window.location.hash.replace("#","");n&&(n=n.trim().toUpperCase()),this.initDesktopCompanion(),this.bindSocketListeners(),this.showLogin(n)}initSoundToggle(){const e=document.getElementById("btn-sound-toggle"),t=document.getElementById("sound-icon");!e||!t||(t.textContent=_.isMuted?"🔇":"🔊",e.addEventListener("click",n=>{n.stopPropagation();const s=_.toggleMute();t.textContent=s?"🔇":"🔊",s||_.playCorrect()}))}initDesktopCompanion(){const e=document.getElementById("btn-desktop-copy-link");e&&e.addEventListener("click",async()=>{const n=window.location.href;try{await navigator.clipboard.writeText(n),e.textContent="✅ Link Kopyalandı!",setTimeout(()=>{e.textContent="🔗 Oyun Linkini Kopyala"},2e3)}catch{}});const t=document.getElementById("desktop-qr");t&&(t.innerHTML=`
        <div style="width: 140px; height: 140px; background: #fff; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          <span style="font-size: 3.5rem;">💣</span>
          <span style="font-family: var(--font-heading); font-size: 0.72rem; font-weight: 800; color: #000; text-transform: uppercase;">KELİME BOMBASI</span>
        </div>
      `)}showLogin(e=null,t=null){var n;this.currentScreen="login",(n=this.gameScreenInstance)==null||n.cleanup(),this.gameScreenInstance=null,dt(this.screenContainer,{inviteCode:e,initialError:t,onJoined:(s,i)=>{this.roomState=s,this.currentPlayer=i,this.routeState(s)}})}routeState(e){var t,n;if(this.roomState=e,this.currentPlayer){const s=e.players.find(i=>i.sessionToken===this.currentPlayer.sessionToken);s&&(this.currentPlayer=s)}e.state==="lobby"?this.currentScreen!=="lobby"?(this.currentScreen="lobby",(t=this.gameScreenInstance)==null||t.cleanup(),this.gameScreenInstance=null,je(this.screenContainer,{roomState:this.roomState,currentPlayer:this.currentPlayer,onLeave:()=>this.showLogin()})):je(this.screenContainer,{roomState:this.roomState,currentPlayer:this.currentPlayer,onLeave:()=>this.showLogin()}):e.state==="countdown"?(this.currentScreen="countdown",Ue(this.screenContainer,3)):e.state==="in_game"?this.currentScreen!=="in_game"&&(this.currentScreen="in_game",this.gameScreenInstance=new He(this.screenContainer,{roomState:this.roomState,currentPlayer:this.currentPlayer}),this.gameScreenInstance.render()):e.state==="results"&&(this.currentScreen="results",(n=this.gameScreenInstance)==null||n.cleanup(),this.gameScreenInstance=null,We(this.screenContainer,{resultsData:{winner:e.players.find(s=>s.isAlive)||null,rankings:e.players.map((s,i)=>({rank:i+1,id:s.id,name:s.name,avatar:s.avatar,color:s.color,lives:s.lives,score:s.score,isWinner:s.isAlive})),stats:e.stats},currentPlayer:this.currentPlayer,onLeave:()=>this.showLogin()}))}bindSocketListeners(){C.on(L.ROOM_STATE,e=>{this.routeState(e)}),C.on(L.PLAYER_JOINED,e=>{this.currentScreen==="lobby"&&this.showToast(`👋 ${e.player.name} odaya katıldı!`,"info")}),C.on(L.PLAYER_LEFT,e=>{this.showToast(`🚪 ${e.name} odadan ayrıldı.`,"info")}),C.on(L.HOST_CHANGED,e=>{this.showToast(`👑 ${e.newHost.name} artık yeni oda yöneticisi!`,"info")}),C.on(L.PLAYER_KICKED,e=>{alert(e.reason||"Yönetici tarafından odadan çıkarıldınız."),this.showLogin(null,e.reason)}),C.on(L.COUNTDOWN_START,e=>{this.currentScreen="countdown",Ue(this.screenContainer,e.count)}),C.on(L.COUNTDOWN_TICK,e=>{_n(e.count)}),C.on(L.GAME_STARTED,()=>{this.currentScreen="in_game",this.gameScreenInstance||(this.gameScreenInstance=new He(this.screenContainer,{roomState:this.roomState,currentPlayer:this.currentPlayer}),this.gameScreenInstance.render())}),C.on(L.TURN_STARTED,e=>{var t;this.currentScreen==="in_game"&&((t=this.gameScreenInstance)==null||t.onTurnStarted(e))}),C.on(L.WORD_ACCEPTED,e=>{var t;this.currentScreen==="in_game"&&((t=this.gameScreenInstance)==null||t.onWordAccepted(e))}),C.on(L.WORD_REJECTED,e=>{var t;this.currentScreen==="in_game"&&((t=this.gameScreenInstance)==null||t.onWordRejected(e))}),C.on(L.BOMB_EXPLODED,e=>{var t;this.currentScreen==="in_game"&&((t=this.gameScreenInstance)==null||t.onBombExploded(e))}),C.on(L.GAME_OVER,e=>{var t;this.currentScreen="results",(t=this.gameScreenInstance)==null||t.cleanup(),this.gameScreenInstance=null,We(this.screenContainer,{resultsData:e,currentPlayer:this.currentPlayer,onLeave:()=>this.showLogin()})}),C.on(L.REMOTE_TYPING,e=>{var t,n;this.currentScreen==="in_game"&&e.playerId!==((t=this.currentPlayer)==null?void 0:t.id)&&((n=this.gameScreenInstance)==null||n.onRemoteTyping(e.text))}),C.on(L.EMOJI_RECEIVED,e=>{Re(e.emoji)})}showToast(e,t="info"){const n=document.getElementById("toast-banner");n&&(n.textContent=e,n.className=`toast-banner ${t}`,n.classList.remove("hidden"),clearTimeout(this.toastTimer),this.toastTimer=setTimeout(()=>{n.classList.add("hidden")},2800))}}window.addEventListener("DOMContentLoaded",()=>{new An});
