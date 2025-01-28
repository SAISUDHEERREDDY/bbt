(self.webpackChunkbbt=self.webpackChunkbbt||[]).push([[372],{41798:function(e){"use strict";function n(e,t,o){this.__id__=e,o.objects[e]=this,this.__objectSignals__={},this.__propertyCache__={};var r=this;function a(e,n){var t=e[0],a=e[1];r[t]={connect:function(e){"function"==typeof e?(r.__objectSignals__[a]=r.__objectSignals__[a]||[],r.__objectSignals__[a].push(e),n||"destroyed"===t||o.exec({type:7,object:r.__id__,signal:a})):console.error("Bad callback given to connect to signal "+t)},disconnect:function(e){if("function"==typeof e){r.__objectSignals__[a]=r.__objectSignals__[a]||[];var i=r.__objectSignals__[a].indexOf(e);-1!==i?(r.__objectSignals__[a].splice(i,1),n||0!==r.__objectSignals__[a].length||o.exec({type:8,object:r.__id__,signal:a})):console.error("Cannot find connection of signal "+t+" to "+e.name)}else console.error("Bad callback given to disconnect from signal "+t)}}}function i(e,n){var t=r.__objectSignals__[e];t&&t.forEach(function(e){e.apply(e,n)})}for(var e in this.unwrapQObject=function(e){if(e instanceof Array){for(var t=new Array(e.length),a=0;a<e.length;++a)t[a]=r.unwrapQObject(e[a]);return t}if(!e||!e["__QObject*__"]||void 0===e.id)return e;var i=e.id;if(o.objects[i])return o.objects[i];if(e.data){var c=new n(i,e.data,o);return c.destroyed.connect(function(){if(o.objects[i]===c){delete o.objects[i];var e=[];for(var n in c)e.push(n);for(var t in e)delete c[e[t]]}}),c.unwrapProperties(),c}console.error("Cannot unwrap unknown QObject "+i+" without data.")},this.unwrapProperties=function(){for(var e in r.__propertyCache__)r.__propertyCache__[e]=r.unwrapQObject(r.__propertyCache__[e])},this.propertyUpdate=function(e,n){for(var t in n)r.__propertyCache__[t]=n[t];for(var o in e)i(o,e[o])},this.signalEmitted=function(e,n){i(e,this.unwrapQObject(n))},t.methods.forEach(function(e){var t=e[1];r[e[0]]=function(){for(var e,a=[],i=0;i<arguments.length;++i){var c=arguments[i];"function"==typeof c?e=c:a.push(c instanceof n&&void 0!==o.objects[c.__id__]?{id:c.__id__}:c)}o.exec({type:6,object:r.__id__,method:t,args:a},function(n){if(void 0!==n){var t=r.unwrapQObject(n);e&&e(t)}})}}),t.properties.forEach(function(e){var t=e[0],i=e[1],c=e[2];r.__propertyCache__[t]=e[3],c&&(1===c[0]&&(c[0]=i+"Changed"),a(c,!0)),Object.defineProperty(r,i,{configurable:!0,get:function(){var e=r.__propertyCache__[t];return void 0===e&&console.warn('Undefined value in property cache for property "'+i+'" in object '+r.__id__),e},set:function(e){if(void 0!==e){r.__propertyCache__[t]=e;var a=e;a instanceof n&&void 0!==o.objects[a.__id__]&&(a={id:a.__id__}),o.exec({type:9,object:r.__id__,property:t,value:a})}else console.warn("Property setter for "+i+" called with undefined value!")}})}),t.signals.forEach(function(e){a(e,!1)}),t.enums)r[e]=t.enums[e]}e.exports={QWebChannel:function(e,t){if("object"==typeof e&&"function"==typeof e.send){var o=this;this.transport=e,this.send=function(e){"string"!=typeof e&&(e=JSON.stringify(e)),o.transport.send(e)},this.transport.onmessage=function(e){var n=e.data;switch("string"==typeof n&&(n=JSON.parse(n)),n.type){case 1:o.handleSignal(n);break;case 10:o.handleResponse(n);break;case 2:o.handlePropertyUpdate(n);break;default:console.error("invalid message received:",e.data)}},this.execCallbacks={},this.execId=0,this.exec=function(e,n){n?(o.execId===Number.MAX_VALUE&&(o.execId=Number.MIN_VALUE),e.hasOwnProperty("id")?console.error("Cannot exec message with property id: "+JSON.stringify(e)):(e.id=o.execId++,o.execCallbacks[e.id]=n,o.send(e))):o.send(e)},this.objects={},this.handleSignal=function(e){var n=o.objects[e.object];n?n.signalEmitted(e.signal,e.args):console.warn("Unhandled signal: "+e.object+"::"+e.signal)},this.handleResponse=function(e){e.hasOwnProperty("id")?(o.execCallbacks[e.id](e.data),delete o.execCallbacks[e.id]):console.error("Invalid response message received: ",JSON.stringify(e))},this.handlePropertyUpdate=function(e){for(var n in e.data){var t=e.data[n],r=o.objects[t.object];r?r.propertyUpdate(t.signals,t.properties):console.warn("Unhandled property update: "+t.object+"::"+t.signal)}o.exec({type:4})},this.debug=function(e){o.send({type:5,data:e})},o.exec({type:3},function(e){for(var r in e)new n(r,e[r],o);for(var r in o.objects)o.objects[r].unwrapProperties();t&&t(o),o.exec({type:4})})}else console.error("The QWebChannel expects a transport object with a send function and onmessage callback property. Given is: transport: "+typeof e+", transport.send: "+typeof e.send)}}}}]);