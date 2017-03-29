// ==UserScript==
// @name         Keyprism3 WebBrain
// @namespace    http://mrobbinsassoc.com/
// @version      0.3.1
// @description  Allows interaction of TheBrain and Visual Paradigm
// @author       Mark Robbins
// @match        https://webbrain.com/brainpage/brain/09335629-E824-3836-6E1A-8A30325D2C09
// @grant        none
// @copyright    2017, Mark Robbins
// @homepageURL  http://mrobbinsassoc.com/projects/keyprism3/vp/publish/
// @supportURL   mailto:mark.robbins@mrobbinsassoc.com
// @updateURL https://openuserjs.org/meta/MarkRobbins/Keyprism3_WebBrain.meta.js
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      http://mrobbinsassoc.com/projects/keyprism3/vp/scripts/tinycolor.js
// ==/UserScript==
// ==OpenUserJS==
// @author MarkRobbins
// ==/OpenUserJS==

/* globals performance chrome */
/* global performance chrome */
(function() {
  function waitJq(){
    if (!window.jQuery) {
      console.log('waiting for jQuery in WebBrain');
      setTimeout(waitJq,1000);
      return;
    }
    (function() {
      console.log('RUN in WebBrain');
      //console.log('got Jq');
      //'use strict';
      const $ = jQuery;
      window.__={
        _name:'__'
        ,set:{     //configContainer
          _name:'set'
          ,bugInits:true
          ,onHashChange:{
            _name:'onHashChange'
            ,timeout:2000
            }
          } //-set
        ,data:{    //dataContainer
          _name:'data'
          ,showkeys:true
          ,paneSizes:{
            }
          ,windowData:{ //data.
            me: {}
            }
          ,linkages:{   //data.
            }
          ,timers:{     //data.
            } //-timers
          } //-data
        ,style:{   //initFnList
          _name:'style'
          ,_writeStyle:function(){ //style.
            let s = '';
            const NL = "\n";
            const parts = __.ui.parts;
            for (const i in parts) {
              //console.log(i);
              if (!parts.hasOwnProperty(i)) {
                continue;
              }
              const o = parts[i];
              if (typeof o!=='object') {
                continue;
              }
              if (o.css) {
                if (o.nameIt) {
                  const oo = o.q.q;
                  oo.attr('id',i);
                  s+='#'+i+'{'+NL;
                  s+=''+o.css+NL;
                  s+=''+'}'+NL;
                }else{
                  s+=''+o.q+'{'+NL;
                  s+=''+o.css+NL;
                  s+=''+'}'+NL;
                }
              }
            }
            //console.log(s);
            __.utils.updateNamedStyle(s,'dark');
            } //-writeStyle
          ,_init_:function(){      //style.
            this._writeStyle();
            } //-_init_
          ,_init:function(){       //style.
            this._init_();
            } //-_init
          } //-style
        ,types:{   //objectContainer
          _name:'types'
          ,typePubSub:{ //types.
            _name:'typePubSub'
            ,init_pubsub:function(bug,pfx){
              // xmp bc this.__topicName({});
              pfx=pfx===undefined?'':pfx;
              if (bug){console.log('init_pubsub');}
              //noinspection JSUnresolvedVariable
              if (this._pubs!==undefined) {
                if(bug){console.log('init_pubsub,have pubs');}
                //noinspection JSUnresolvedVariable
                for (const i in this._pubs) {
                  const f = new Function('o', 'o=o===undefined?{}:o;o.when=new Date();radio("' + i + '").broadcast(o,this);');
                  if(bug){console.log('init_pubsub, assigning function '+pfx+i,f);}
                  this[pfx+i]=f;
                }
              }
              //noinspection JSUnresolvedVariable
              const subs=this._subs;
              if (subs!==undefined) {
                if(bug){console.log('init_pubsub,have subs');}
                for (const i in subs) {
                  if (!subs.hasOwnProperty(i)) {
                    continue;
                  }
                  if(bug){console.log('init_pubsub, subscribing to msg:'+i+' with ',subs[i]);}
                  //noinspection JSUnresolvedVariable
                  radio(i).subscribe([subs[i],this]);
                }
              }
            }
            ,seed:function(that){
              that.init_pubsub=this.init_pubsub;
              that._isPubSub=true;
              } //-seed
            }//-typePubSub
          ,typeCog:{    //types.
            create:function(){
              const that=this;
              function init(){
                //noinspection JSUnresolvedVariable
                that._ctor=that.subject.ctor;
                //noinspection JSUnresolvedVariable
                delete that.subject.ctor;
                //noinspection JSUnresolvedVariable
                const st=that.subject.__static;
                if (typeof st==='object') {
                  for (const i in st) {
                    if (!st.hasOwnProperty(i)) {
                      continue;
                    }
                    that._ctor[i]=st[i];
                    delete st[i];
                  }
                }
                //noinspection JSPotentiallyInvalidUsageOfThis
                this._ctor.prototype=this.subject;
                //noinspection JSPotentiallyInvalidUsageOfThis
                this._ctor.prototype.constructor=this._ctor;
              }
              if (this._ctor===undefined) {
                init();
              }
              // http://stackoverflow.com/a/1608546/842626
              function construct(constructor, args) {
                  function F() {
                    //noinspection JSUnresolvedFunction
                    return constructor.apply(this, args);
                  }
                  F.prototype = constructor.prototype;
                  return new F();
              }
              const fn=this._ctor;
              //noinspection UnnecessaryLocalVariableJS
              const rv=construct(fn,arguments);
              return rv;
              } //-create
            ,seed:function(that){
              that.create=this.create;
              } //-seed
            } //-typeCog
          } //-types
        ,libs:{    //initializableObjectContainer
          _name:'libs'
          ,StackTraceParser:{ //libs.
            _name:'StackTraceParser'
            ,UNKNOWN_FUNCTION : '<'+'unknown>' //libs.StackTraceParser
            ,parse: function(stackString) { //libs.StackTraceParser
              /**
               * This parses the different stack traces and puts them into one format
               * This borrows heavily from TraceKit (https://github.com/occ/TraceKit)
               */
              const chrome = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object])?\S+(?: \[as \S+])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                  gecko = /^(?:\s*(\S*)(?:\((.*?)\))?@)?((?:file|http|https).*?):(\d+)(?::(\d+))?\s*$/i,
                  node  = /^\s*at (?:((?:\[object object])?\S+(?: \[as \S+])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                  lines = stackString.split('\n'),
                  stack = [];
               let parts,
                  element;
              for (let i = 0, j = lines.length; i < j; ++i) {
                if ((parts = gecko.exec(lines[i]))) {
                  element = {
                    'file': parts[3],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                    };
                } else if ((parts = chrome.exec(lines[i]))) {
                  element = {
                    'file': parts[2],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                    };
                } else if ((parts = node.exec(lines[i]))) {
                  element = {
                    'file': parts[2],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                    };
                } else {
                  continue;
                }
                stack.push(element);
              }
              return stack;
              } //-parse

            } //-StackTraceParser
          ,Radio:{            //libs.
            _name:'Radio'
            ,_init_:function(){ //libs.Radio
              if (this._initialized) {return;}
              this._initialized=true;
              (function(){ // radio
                "use strict";
                //console.log('radio');
                  window.radio=radio;
                  /**
                   * Main Wrapper for radio.$ and create a function radio to accept the channelName
                   * @param {String} channelName topic of event
                   */
                  function radio(channelName) {
                    if (arguments.length) {
                      radio.$.channel(channelName);
                      return radio.$;
                    }else{
                      return radio.$;
                    }
                    //arguments.length ? radio.$.channel(channelName) : radio.$.reset();
                  }
                radio.$ = {
                  version: '0.2',
                  channelName: "",
                  channels: [],
                    /**
                     * Reset global state, by removing all channels
                     * @example
                     *    radio()
                     */
                    reset: function() {
                      radio.$.channelName = "";
                      radio.$.channels = [];
                      },//-reset
                    /**
                     * Broadcast (publish)
                     * Iterate through all listeners (callbacks) in current channel and pass arguments to subscribers
                     * @param arguments data to be sent to listeners
                     * @example
                     *    //basic usage
                     *    radio('channel1').broadcast('my message');
                     *    //send an unlimited number of parameters
                     *    radio('channel2').broadcast(param1, param2, param3 ... );
                     */
                    broadcast: function() {
                      const c = this.channels[this.channelName],
                        l = c.length;
                      let subscriber, callback, context;
                      //iterate through current channel and run each subscriber
                      for (let i = 0; i < l; i++) {
                        subscriber = c[i];
                        //if subscriber was an array, set the callback and context.
                        if ((typeof(subscriber) === 'object') && (subscriber.length)) {
                          callback = subscriber[0];
                          //if user set the context, set it to the context otherwise, it is a globally scoped function
                          context = subscriber[1] || global;
                        }
                        //noinspection JSUnresolvedFunction
                        callback.apply(context, arguments);
                      }
                      return this;
                      },//-broadcast
                    /**
                     * Create the channel if it doesn't exist and set the current channel/event name
                     * @param {String} name the name of the channel
                     * @example
                     *    radio('channel1');
                     */
                    channel: function(name) {
                      const c = this.channels;
                      //create a new channel if it doesn't exists
                      if (!c[name]) c[name] = [];
                      this.channelName = name;
                      return this;
                      },//-channel
                    channelKeys:function (){
                      //console.log('channelKeys');//+m.c.r
                      return Object.keys(this.channels);
                    },//-channelKeys
                    /**
                     * Add Subscriber to channel
                     * Take the arguments and add it to the this.channels array.
                     * @param {Function|Array} arguments list of callbacks or arrays[callback, context] separated by commas
                     * @example
                     *      //basic usage
                     *      var callback = function() {};
                     *      radio('channel1').subscribe(callback);
                     *
                     *      //subscribe an endless amount of callbacks
                     *      radio('channel1').subscribe(callback, callback2, callback3 ...);
                     *
                     *      //adding callbacks with context
                     *      radio('channel1').subscribe([callback, context],[callback1, context], callback3);
                     *
                     *      //subscribe by chaining
                     *      radio('channel1').subscribe(callback).radio('channel2').subscribe(callback).subscribe(callback2);
                     */
                    subscribe: function() {
                      const a = arguments,
                        c = this.channels[this.channelName],
                        l = a.length;
                      //run through each arguments and subscribe it to the channel
                      for (let i = 0; i < l; i++) {
                        const ai = a[i];
                        //if the user sent just a function, wrap the function in an array [function]
                        const p = (typeof(ai) === "function") ? [ai] : ai;
                        if ((typeof(p) === 'object') && (p.length)) c.push(p);
                      }
                      return this;
                      },//-subscribe
                    /**
                     * Remove subscriber from channel
                     * Take arguments with functions and unsubscribe it if there is a match against existing subscribers.
                     * @param {Function} arguments callbacks separated by commas
                     * @example
                     *      //basic usage
                     *      radio('channel1').unsubscribe(callback);
                     *      //you can unsubscribe as many callbacks as you want
                     *      radio('channel1').unsubscribe(callback, callback2, callback3 ...);
                     *       //removing callbacks with context is the same
                     *      radio('channel1').subscribe([callback, context]).unsubscribe(callback);
                     */
                    unsubscribe: function() {
                      const a = arguments,
                        c = this.channels[this.channelName],
                        l = a.length;
                      //loop through each argument
                      for (let i = 0; i < l; i++) {
                        //need to reset vars that change as the channel array items are removed
                        let offset = 0;
                        const cl = c.length;
                        //loop through the channel
                        for (let j = 0; j < cl; j++) {
                          const jo = j - offset;
                          //if there is a match with the argument and the channel function, unsubscribe it from the channel array
                          if (c[jo][0] === a[i]) {
                            //unsubscribe matched item from the channel array
                            c.splice(jo, 1);
                            offset++;
                          }
                        }
                      }
                      return this;
                      }//-unsubscribe
                  };//-radio.%
                return radio;
                }());
              } //-_init_
            ,_init:function(){  //libs.Radio
              this._init_();
              } //-_init
            } //-Radio
          ,FontAwesome:{      //libs.
            _name:'FontAwesome'
            ,_init_:function(){ //libs.FontAwesome
              if (this._initialized) {return;}
              this._initialized=true;
              __.utils.addScript('https://use.fontawesome.com/09bc4b9f8f.js','fontawesome');
              } //-_init_
            ,_init:function(){ //libs.FontAwesome
              this._init_();
              } //-_init
            } //-FontAwesome
          ,_init_:function(){ //libs.
            __.utils.__initializer.bind(this)();
            } //-_init_
          ,_init:function(){  //libs.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            this._init_();
            } //-_init
          } //-libs
        ,utils:{   //functionContainer
          _name:'utils'
          ,itemXyWh:function(q){                            //utils.
            if (q.x!==undefined
              &&q.y!==undefined
              &&q.w!==undefined
              &&q.h!==undefined) {
              return q;
            }
            //noinspection JSValidateTypes
            const st = $(window).scrollTop();
            //noinspection JSValidateTypes
            const sl = $(window).scrollLeft();
            let w1=q.width();
            let h1=q.height();
            let x1,y1;
            if (q[0]===window) {
              x1=0;y1=0;
            }else{
              const b = q[0].getBoundingClientRect();
              x1=b.left;
              y1=b.top;
              w1=b.width;
              h1=b.height;
              if (0) {
                const offset1 = q.offset();
                if (offset1!==undefined) {
                  x1=offset1.left-sl;
                  y1=offset1.top-st;
                }else{
                  //hack!
                  x1=sl;y1=st;
                }
              }
            }
            return {x:x1,y:y1,w:w1,h:h1};
            } //-itemXyWh
          ,cas:function (e){                                //utils.
            let s = '';
            if (e.ctrlKey) {s += 'c';}
            if (e.altKey) {s += 'a';}
            if (e.shiftKey) {s += 's';}
            return s;
            } //-cas
          ,caso:function (e){                               //utils.
            let s = '';
            const o = {
              _: false
              , c: false
              , a: false
              , s: false
              , ca: false
              , cs: false
              , as: false
              , cas: false
            };
            if (e.ctrlKey) {s += 'c';}
            if (e.altKey) {s += 'a';}
            if (e.shiftKey) {s += 's';}
            if (s==='') {
              o._=true;
              return o;
            }
            if (s==='c') {
              o.c=true;
              return o;
            }
            if (s==='a') {
              o.a=true;
              return o;
            }
            if (s==='s') {
              o.s=true;
              return o;
            }
            if (s==='ca') {
              o.ca=true;
              return o;
            }
            if (s==='cs') {
              o.cs=true;
              return o;
            }
            if (s==='as') {
              o.as=true;
              return o;
            }
            if (s==='cas') {
              o.cas=true;
              return o;
            }
            } //-cas
          ,cancel:function(e){                              //utils.
            //console.log('keyProcessed');
            e.cancelBubble = true; // IE4+
            try {
              e.keyCode = 0;
            } catch (e) {

            } // IE5
            if (window.event) {e.returnValue = false; } // IE6
            if (e.preventDefault) {e.preventDefault(); } // moz/opera/konqueror
            if (e.stopPropagation) {e.stopPropagation(); } // all
            return false;
            } //-cancel
          ,delay:function(ms){                              //utils.
            ms += new Date().getTime();
            console.log('delaying '+ms);
            while (new Date() < ms){}
            console.log('delay released');
            } //-delay
          ,inheritFrom:function(obj,tgt) {                  //utils.
            //console.log('inheritFrom..........'+arguments.callee.caller.name);
            const a=[];
            for (const i in obj) {
              if (obj.hasOwnProperty(i)) {
                tgt[i]=obj[i];
                a[a.length]=i;
              }else{
                console.log('not inheriting "'+i+'" in '+obj.name);
              }
            }
            //console.log('inheritedFrom '+obj.name,a);
            } //-inheritedFrom
          ,perf:function(n){                                //utils.
            __.data.perfs=__.data.perfs===undefined?{}:__.data.perfs;
            if (__.data.perfs[n]===undefined) {
              //noinspection JSUnresolvedVariable
              __.data.perfs[n]=performance.now();
            }else{
              //noinspection JSUnresolvedVariable
              console.log('perf:'+n+' took '+(performance.now()-__.data.perfs[n])+' ms');
              delete __.data.perfs[n];
            }
            } //-perf
          ,eachNode:function(object,fn,wantTypes,re,_bag){  //utils.
            /*
             * Iterate object passing its members to fn, filtered by wantTypes and regular expression.
             *
             * Parameters:
             *   object: subject object
             *   fn:     callback - optional
             *     |
             *     signature: name,item,type,object,parent,depth,path,indexes
             *              |
             *              name:      the name of the member
             *              item:      the member
             *              type:      typeof member
             *              object:    in which member resides
             *              parent:    the parent of object
             *              depth:     zero based recursion depth
             *              path:      dot path of current object relative to passed object
             *              indexes:   object of indexes
             *                     |
                                   itemIndex:    position item was found in containing object
                                   itemDidIndex: index count of items done for containing object
                                   didIndex:     global index count of items done for passed object
                                   index:        global index count of items for passed object
             *   wantTypes: array of Javascript types, defaults to ['object'] - optional
             *   re:        regular expression to filter member names
             *   _bag:      internal, do not supply, but this it will be returned
             *
             * Returns:
             *   _bag: bag containing collections
             *       |
             *
             *
             *
             *
             */
            let itemIndex= -1, itemDidIndex=-1, name, item, rv,indexes, dupe, retItem;
            if (_bag===undefined){
              const bag = {
                index: -1
                , didIndex: -1
                , _parents: []
                , _paths: []
                , did: []
                , returns: { items: [], dupes: [] }
              };
              Object.defineProperty(bag,'depth',{
                get:function(){
                  return this._parents.length;
                }
                ,set:function(){}
                ,enumerable:true,configurable: false
              });
              Object.defineProperty(bag,'parent',{
                get:function(){
                  return this._parents.length>0?this._parents[this._parents.length-1]:undefined;
                }
                ,set:function(v){this._parents.push(v);}
                ,enumerable:true,configurable: false
                });
              Object.defineProperty(bag,'parents',{
                get:function(){
                  const a=[];
                  for(let x=0;x<this._parents.length;x++){
                    a.push(this._parents[x]);
                  }
                  return a;
                }
                ,set:function(){}
                ,enumerable: true,configurable: false
              });
              Object.defineProperty(bag,'path',{
                get:function(){
                  let p=this._paths.join('.');
                  p=p===''?p:p+'.';
                  return p+''+this._name;
                  }
                ,set:function(){}
                ,enumerable: true,configurable: false
              });
              bag.push=function(){
                this._parents.push(this._object);
                this._paths.push(this._name);
                return __.utils.eachNode(this._item,fn,wantTypes,re,this);
              };
              bag.pop=function(rv){
                this._item=this._parents.pop();
                this._paths.pop();
                this._name=this._paths.length>0?this._paths[this._paths.length-1]:'';
                if (rv===null){this._breaking=true;}
                if (this.depth===0) {
                  return this;
                }
                return rv;
              };
              bag.path=function(){
                let s='';
                for (let x=0;x<this._parents.length;x++){
                  s+='.'+this._parents[x]._name;
                }
                return s;
              };
              _bag=bag;
            } // if no bag
            //noinspection JSUnusedLocalSymbols
            fn=fn!==undefined?fn:function(name,item,type,object,parent,depth,path,indexes){return true;};
            wantTypes=wantTypes?wantTypes:['object'];
            _bag._object=object;
            for(name in object){
              if(!object.hasOwnProperty(name)){continue;}
              item=object[name];
              _bag._name=name;
              _bag._item=item;
              itemIndex++;
              _bag.index++;
              const type = typeof item;
              if (['function','object'].indexOf(type)!==-1&&item!==null){
                if (_bag.did.indexOf(item)!==-1){
                  indexes={
                    itemIndex:itemIndex
                    ,itemDidIndex:itemDidIndex
                    ,didIndex:_bag.didIndex
                    ,index:_bag.index
                    };
                  dupe={
                    item:item
                    ,name:name
                    ,object:object
                    ,type:type
                    ,parent:_bag.parent
                    ,depth:_bag.depth
                    ,path:_bag.path
                    ,indexes:indexes
                    };
                  _bag.returns.dupes.push(dupe);
                  continue;
                }else{
                  _bag.did.push(item);
                }
              }
              if(wantTypes.indexOf(type)!==-1){
                const doit = re === undefined ? true : re.test(name);
                if (doit){
                  itemDidIndex++;
                  _bag.didIndex++;
                  // undefined: no push, true: push, false: no push, -1: no push, 'done':abort level, 'finish': abort all
                  indexes={
                    itemIndex:itemIndex
                    ,itemDidIndex:itemDidIndex
                    ,didIndex:_bag.didIndex
                    ,index:_bag.index
                    };
                  rv=fn(name,item,type,object,_bag.parent,_bag.depth,_bag.path,indexes);
                  //noinspection ConstantIfStatementJS
                  if (false){
                  }else if (rv==='done'){
                    break;
                  }else if (rv==='finish'){
                    return _bag.pop(null);
                  }else if (rv){ // '==' is OK here
                    indexes={
                      itemIndex:itemIndex
                      ,itemDidIndex:itemDidIndex
                      ,didIndex:_bag.didIndex
                      ,index:_bag.index
                      };
                    retItem={
                      name:name
                      ,item:item
                      ,object:object
                      ,type:type
                      ,parent:_bag.parent
                      ,depth:_bag.depth
                      ,path:_bag.path
                      ,indexes:indexes
                      };
                    _bag.returns.items.push(retItem);
                  }else if (!rv||rv===-1||rv===undefined){
                    // nada
                  }
                }
              } // not want type
              if (type==='object'&&item!==null){
                rv=_bag.push();
                if(rv===null){
                  return _bag.pop(rv);
                }
              }
              if (_bag._breaking){
                break;
              }
            }
            return _bag.pop();
            } //-eachNode
          ,blackHtml:function(){                            //utils.
            const color = document.documentElement.style.backgroundColor;
            document.documentElement.style.backgroundColor = "black";
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (false && mutation.target.nodeName === "BODY") {
                  observer.disconnect();
                  document.documentElement.style.backgroundColor = color || "";
                }
              });
            });
            //noinspection JSCheckFunctionSignatures
            observer.observe(document, { childList: true, subtree: true });
            } //-blackHtml
          ,addStylesheet:function(url,id){                  //utils.
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            //noinspection JSUnresolvedFunction, JSUnresolvedVariable,ES6ModulesDependencies
            style.href = chrome&&chrome.extension?chrome.extension.getURL(url):url;
            if (id) {
              style.id=id;
            }
            (document.head||document.documentElement).appendChild(style);
            } //-addStylesheet
          ,addScript:function(url,id){                      //utils.
            const el = document.createElement('script');
            el.type = 'text/javascript';
            //noinspection JSUnresolvedFunction, JSUnresolvedVariable,ES6ModulesDependencies
            el.src=chrome&&chrome.extension?chrome.extension.getURL(url):url;
            if (id) {
              el.id=id;
            }
            (document.head||document.documentElement).appendChild(el);
            } //-addScript
          ,deleteNamedStyle:function(name_) {               //utils.
            __.data.namedStyles=__.data.namedStyles?__.data.namedStyles:[];
            const i = __.data.namedStyles.indexOf(name_);
            if (i!==-1) {
              __.data.namedStyles=__.data.namedStyles.splice(i,1);
              const qo=$('#'+name_);
              if (qo.length===1) {
                qo.remove();
              }else{
                if (qo.length>1) {
                  console.error('multiple element matches for named style:'+name_);
                  qo.remove();
                }else{
                  console.error('zero element matches for named style:'+name_);
                }
              }
            }else{
              console.warn('named style not found:'+name_);
            }
            } //-deleteNamedStyle
          ,updateNamedStyle:function(style_str_,name_,fn) { //utils.
            if (name_===undefined) {
              name_='defaultStyle';
            }
            __.data.namedStyles=__.data.namedStyles?__.data.namedStyles:[];
            if (__.data.namedStyles.indexOf(name_)===-1) {
              __.data.namedStyles.push(name_);
            }
            const st=document.getElementById(name_);
            if (st!==null) {
              //st=st[0];
              st.innerHTML=style_str_;
            }else{
              const head = document.getElementsByTagName("HEAD")[0];
              const ele = head.appendChild(window.document.createElement( 'style' ));
              const q=$(ele);
              q.attr('id',name_);
              q.attr('type','text/css');
              if (fn!==undefined) {
                q.on('load',fn);
              }
              ele.innerHTML = style_str_;
            }
            } //-updateNamedStyle
          ,addScripting:function(s,id){                     //utils.
            const script = document.createElement("script");
            // Add script content
            script.innerHTML = s;
            if (id!==undefined) {
              script.id=id;
            }
            // Append
            document.head.appendChild(script);
            } //-addScripting
          ,addScriptingFn:function(fn){                     //utils.
            let s='';
            s+='('+fn+')();';
            this.addScripting(s);
            } //-addScriptingFn
          ,qOf:function(q){                                 //utils.
            //noinspection ConstantIfStatementJS
            if (false) {
            }else if (typeof q==='function') {return q();
            }else if (q instanceof jQuery) {return q;
            }else if (typeof q==='string') {return q.q;
            }else if (typeof q==='object') {
              return q;
            }
            } //-q
          ,isInDocument:function(el) {                      //utils.
            const html = document.body.parentNode;
            while (el) {
              if (el === html) {
                return true;
              }
              el = el.parentNode;
            }
            return false;
            } //-isInDocument
          ,body_msg:function(s){                            //utils.
            $('body').attr('data-msg',s);
            } //
          ,timeDifference:function(earlierDate,laterDate){  //utils.
            let tot = laterDate.getTime() - earlierDate.getTime();
            const o = {};
            o.days = Math.floor(tot/1000/60/60/24);
            tot -= o.days*1000*60*60*24;
            o.hours = Math.floor(tot/1000/60/60);
            tot -= o.hours*1000*60*60;
            o.minutes = Math.floor(tot/1000/60);
            tot -= o.minutes*1000*60;
            o.seconds = Math.floor(tot/1000);
            return o;
            }
          ,findDirection:function(me,all,dir,xtol,ytol){    //utils.
            xtol=xtol===undefined?5:xtol;
            ytol=ytol===undefined?5:ytol;
            me=typeof me==='string'?me.q:me;
            all=typeof all==='string'?all.q:all;
            const res=[];
            all.each(function(){
              const vv=$(this);
              res.push({r:this.getBoundingClientRect(),q:vv});
            });
            function center(r){
              const x=r.left+r.width/2;
              const y=r.top+r.height/2;
              return {x:x,y:y};
            }
            function dist(r1,r2){
              const cp1=center(r1);
              const cp2=center(r2);
              const xx=Math.abs(cp1.x-cp2.x);
              const yy=Math.abs(cp1.y-cp2.y);
              //noinspection UnnecessaryLocalVariableJS
              const rv=Math.sqrt(xx*xx+yy*yy);
              return rv;
            }
            function xyc(r1,r2){
              const cp1=center(r1);
              const cp2=center(r2);
              const rv={};
              rv.x=cp2.x-cp1.x;
              rv.y=cp2.y-cp1.y;
              return rv;
            }
            const r=me.get(0).getBoundingClientRect();
            //var cp=center(r);
            // dist xc yc
            res.forEach(function(v){
              v.dist=dist(r,v.r);
              v.xyc=xyc(r,v.r);
            });
            let cur = null;
            function putcur(v,max){
              if (cur===null) {
                cur=v;
                return;
              }
              max=max===undefined?false:max;
              if (!max) {
                if (v.dist<cur.dist) {cur=v;}
              }else{
                if (v.dist>cur.dist) {cur=v;}
              }
            }
            res.forEach(function(v){
              if (v.q.get(0)===me.get(0)) {
                return;
              }
              //noinspection ConstantIfStatementJS
              if (false) {
              }else if (dir==='left') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x>=0) {return;}
                putcur(v);
              }else if (dir==='right') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x<=0) {return;}
                putcur(v);
              }else if (dir==='up') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y>=0) {return;}
                putcur(v);
              }else if (dir==='down') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y<=0) {return;}
                putcur(v);
              }else if (dir==='home') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x>=0) {return;}
                putcur(v,true);
              }else if (dir==='end') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x<=0) {return;}
                putcur(v,true);
              }else if (dir==='pgup') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y>=0) {return;}
                putcur(v,true);
              }else if (dir==='pgdn') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y<=0) {return;}
                putcur(v,true);
              }
            });
            if (cur===null) {
              return me;
            }
            return cur.q;
            }
          ,parseQueryString:function(queryString) {         //utils.
            const query = {};
            const a = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
            for (let i = 0; i < a.length; i++) {
              const b = a[i].split('=');
              query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
            }
            return query;
            }
          ,defunction:function(val){                        //utils.
            if ('function'===typeof val) {
              return val();
            }
            return val;
            } //-defunction
          ,messageTop:function(msg){                        //utils.
            //noinspection JSUnresolvedFunction
            window.top.postMessage(msg,'*');
            } //-messageTop
          ,__initializer:function(){                        //utils.
            // usage: __.utils.__initializer.bind(this)(); at _init_ top
            // call this.??_init functions
            // call this.<object>_init functions
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
            for (const i in this) {
              if (!this.hasOwnProperty(i)) {
                continue;
              }
              //noinspection ConstantIfStatementJS
              if (false) {
              }else if (typeof this[i]==='function') {
                if (/^.+_init$/.test(i)) {
                  this[i]();
                }
              }else if (typeof this[i]==='object') {
                if (typeof this[i]._init==='function') {
                  this[i]._init();
                }
              }
            }
            } //-__initializer
          ,linkItemHtml:function(data){                     //utils. //image title url
            let s='';
            s+='<div class="GGD0W3FBJ4" style="cursor: pointer;">';
            s+='  <div class="GGD0W3FBG4">';
            s+='    <img class="gwt-Image" style="width:32px;height:32px;"';
            s+=' src="';
            if (data.image) {
              s+=data.image;
            }else{
              const _='%2F';
              s+='https://webbrain.com/icon?path='+_+'vol'+_+'webbrain'+_+'server'+_+'res'+_+'iconImages'+_+'mimetypes'+_+'text-x-generic-template.png&maxWidth=32&maxHeight=32&match=true';
            }
            s+='"';
            s+='>';
            s+='  </div>';
            s+='  <div style="float: left; margin-top: 2px;">';
            s+='    <div class="GGD0W3FBI4">';
            if (data.title) {
              s+=data.title;
            }
            s+='    </div>';
            s+='    <div class="GGD0W3FBH4">';
            if (data.url) {
              s+=data.url;
            }
            s+='    </div>';
            s+='  </div>';
            s+='  <div style="clear: both;">';
            s+='  </div>';
            s+='</div>';
            return s;
            } //-linkItemHtml
          } //-utils
        ,state:{   //initializableObjectsAndFunctionContainer
          _name:'state'
          ,isViewLoading:function(){       //state.
            return $(__.ui.parts.bottomEdit.q).length===0;
            } //-isViewLoading
          ,isViewLoaded:function(){        //state.
            return !this.isViewLoading();
            } //-isViewLoading
          ,isTop:function(){               //state.
            //return false;
            return window===top;
            } //-isTop
          ,midBarTop:function(){           //state.
            const me=__.ui.parts.midBar.q.q;
            if (!me.length) {
              return;
            }
            const r=me.get(0).getBoundingClientRect();
            return r.top<30;
            } //-midBarTop
          ,midBarBottom:function(){        //state.
            const me=__.ui.parts.midBar.q.q;
            if (!me.length) {
              return;
            }
            const wh=window.innerHeight;
            const r=me.get(0).getBoundingClientRect();
            return wh-r.bottom<30;
            } //-midBarBottom
          ,paneTop:function(){             //state.
            if (window.innerHeight<30) {
              return true;
            }
            } //-paneTop
          ,paneBottom:function(){          //state.
            //noinspection JSUnresolvedVariable
            const cp=__.data.paneSizes._content_pane;
            if (!cp) {
              return;
            }
            const th=cp.innerHeight+window.innerHeight;
            return th - window.innerHeight < 30;
            } //-paneBottom
          ,_init_:function(){              //state.
            __.utils.__initializer.bind(this)();
            // nada
            } //-_init_
          ,_init:function(){               //state.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            this._init_();
            } //-_init
          } //-state
        ,actions:{ //functionContainer
          _name:'actions'
          ,midBarUp:function(){            //actions.
            __.ui.parts.midBarUp.q.q.click();
            } //-midBarUp
          ,midBarDown:function(){          //actions.
            __.ui.parts.midBarDown.q.q.click();
            } //-midBarDown
          ,rightFrameUp:function(){        //actions.
            const msg={
              from:window.name
              ,action:'rightFrameUp'
            };
            //noinspection JSUnresolvedFunction
            window.top.postMessage(msg,'*');
            } //-rightFrameUp
          ,rightFrameDown:function(){      //actions.
             const msg={
              from:window.name
              ,action:'rightFrameDown'
            };
            //noinspection JSUnresolvedFunction
            window.top.postMessage(msg,'*');
            } //-rightFrameUp
          ,reportWindowData:function(){    //actions.
            __.data.windowData.me.innerWidth=window.innerWidth;
            __.data.windowData.me.innerHeight=window.innerHeight;
            __.data.windowData.me.locationHref=''+window.location.href;
            const msg={
              from:window.name
              ,locationHref:''+location.href
              ,action:'reportWindowData'
              ,windowData:{
                locationHref:''+location.href
                ,innerWidth:window.innerWidth
                ,innerHeight:window.innerHeight
              }
            };
            top.postMessage(msg,'*');
            } //-reportWindowData
          } //-actions
        ,hooks:{   //initializableObjectsContainer
          _name:'hooks'
          ,mouseHooks:{                    //hooks.
            _name:'mouseHooks'
            ,_init_:function(){
              //body.on mousemove
              $(document).mousemove(function(evt){
                __.data.mmx=evt.pageX;
                __.data.mmy=evt.pageY;
                //__.events.doc.mousemove(evt);
                //console.info('evt.pageX:',evt.pageX,'evt.pageY',evt.pageY);
              });
              } //-_init_
            ,_init:function(){
              this._init_();
              }
            } //-mouseHooks
          ,hashChangeHooks:{               //hooks.
            _name:'hashChangeHooks'
            ,_init_:function(){ //hooks.hashChangeHooks
              __.data.oldHash=window.location.hash;
              $(window).bind('hashchange',function(){
                __.events.win.hashChange();
                __.data.oldHash=window.location.hash;
              });
              } //-_init_
            ,_init:function(){ //hooks.hashChangeHooks
              this._init_();
              } //-_init
            } //-hashChangeHooks
          ,messageHooks:{                  //hooks.
            _name:'messageHooks'
            ,_init_:function(){ //hooks.messageHooks
              //console.log('INIT',this._name);
              window.addEventListener("message", function(e){
                __.events.win.message(e);
              }, false);
              __.utils.messageTop({from:window.name,action:'listening'});
              } //-_init_
            ,_init:function(){ //hooks.messageHooks
              this._init_();
              } //-_init
            } //-messageHooks
          ,kbdHooks:{                      //hooks.
            _name:'kbdHooks'
            ,_init_:function(){ //hooks.kbdHooks
              $(document).on("keyup",function(e){return __.events.doc.keyup(e);});
              $(document).on("keydown",function(e){return __.events.doc.keydown(e);});
              $(document).on("keypress",function(e){return __.events.doc.keypress(e);});
              }
            ,_init:function(){ //hooks.kbdHooks
              this._init_();
              } //-_init
            } //-kbdHooks
          ,domHooks:{                      //hooks.
            _name:'domHooks'
            ,_init_:function(){ //hooks.domHooks
              $(document).bind('DOMNodeInserted', function(event) {
                __.events.dom.node_inserted(event);
              });
              $(document).bind('DOMNodeRemoved', function(event) {
                __.events.dom.node_removed(event);
              });
              } //-_init_
            ,_init:function(){ //hooks.domHooks
              this._init_();
              } //_init
            } //-domHooks
          ,winHooks:{                      //hooks.
            _name:'winHooks'
            ,_init_:function(){ //hooks.winHooks
              //noinspection JSUnresolvedFunction
              $(window).smartresize(__.events.win.resize);
              } //-_init_
            ,_init:function(){ //hooks.winHooks
              this._init_();
              } //-_init
            } //-winHooks
          ,timeHooks:{                     //hooks.
            _name:'time'
            ,_init_:function(){ //hooks.timeHooks
              if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
              } //-_init_
            ,_init:function(){ //hooks.timeHooks
              if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
              } //-_init
            }
          ,_init_:function(){              //hooks.
            __.utils.__initializer.bind(this)();
            } //-_init_
          ,_init:function(){               //hooks.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            this._init_();
            } //-init
          } //-hooks
        ,ui:{      //initializableObjectsAndFunctionContainer
          _name:'ui'
          ,parts:{                         //processableObjectsContainer
            _name:'parts'
            ,topBarTable:{                 //ui.parts
              _name:'topBarTable'
              ,q:'#topBar'
              }
            ,topBarTableCenterLink:{       //ui.parts
              _name:'topBarTableCenterLink'
              ,q:'.topBarTableCenterLink'
              ,css:'margin-right:6px;'
              }
            ,plexContainer:{               //ui.parts
              _name:'plexContainer'
              ,q:'#contentContainer>div:eq(0)'
              ,on:{
                dblclick:function(evt){
                  this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
                  if (__.state.midBarTop()) {
                    __.actions.midBarDown();
                  }else if (__.state.midBarBottom()) {
                    __.actions.midBarUp();
                  }else{
                    __.actions.midBarDown();
                    __.actions.midBarDown();
                  }
                  }
                }
              }
            ,bottomEdit:{                  //ui.parts
              _name:'bottomEdit'
              ,q:'#contentContainer>div:eq(2)' //'.GGD0W3 F B O S'
              ,css:'background-color:black;color:#555;'
              ,nameIt:true
              } //-bottomEdit
            ,bottomEditTitle:{             //ui.parts
              _name:'bottomEditTitle'
              ,q:'.GGD0W3FBKT'
              ,css:'margin-left:10px;'
              } //-bottomEditTitle
            ,bottomEditHeader:{            //ui.parts
              _name:'bottomEditHeader'
              ,q:'#bottomEditHeader'
              ,css:'display: inline-block;background-color: black;width: calc(100% - 12px);margin-top: -6px;position: fixed;margin-left: -4px;'
              } //-bottomEditHeader
            ,bottomHtml:{                  //ui.parts
              _name:'bottomHtml'
              ,q:'.gwt-HTML'
              ,css:'margin-top:73px;'
              ,on:{
                dblclick:function(evt){
                  const cas=__.utils.cas(evt);
                  console.log('dblclick:cas',cas);
                  if (cas==='') {
                    if (__.state.midBarTop()) {
                      __.actions.midBarDown();
                    }else if (__.state.midBarBottom()) {
                      __.actions.midBarUp();
                    }else{
                      __.actions.midBarUp();
                      __.actions.midBarUp();
                    }
                  }else if (cas==='c') {
                    console.log('__.state.paneTop()',__.state.paneTop());
                    console.log('__.state.paneBottom()',__.state.paneBottom());
                    if (__.state.paneTop()) {
                      __.actions.rightFrameDown();
                    }else if (__.state.paneBottom()) {
                      __.actions.rightFrameUp();
                    }else{
                      __.actions.rightFrameDown();
                    }

                  }
                  } //-dblclick
                } //-on
              } //-bottomHtml
            ,greyBar:{                     //ui.parts
              _name:'greyBar'
              ,q:'.greyBar'
              ,css:'filter:invert(1) hue-rotate(180deg);'
              } //-greyBar
            ,midBar:{                      //ui.parts
              _name:'midBar'
              ,q:'.GGD0W3FBAJ'
              ,css:'filter:invert(1);'
              } //-midBar
            ,midBarDown:{                  //ui.parts
              _name:'midBarDown'
              ,q:'.GGD0W3FBAJ>img:eq(0)'
              } //-midBarDown
            ,midBarUp:{                    //ui.parts
              _name:'midBarUp'
              ,q:'.GGD0W3FBAJ>img:eq(1)'
              } //-midBarDown
            ,searchBoxInput:{              //ui.parts
              _name:'searchBoxInput'
              ,q:'.searchBoxInput'
              ,css:'background-color:black;color:#888;border:1px solid #222;'
              } //-searcher
            ,stationaryClickMenu:{         //ui.parts
              _name:'stationaryClickMenu'
              ,q:'ul.stationaryClickMenu'
              ,css:'background-color:black;color:#888;border:1px solid #0a0a0a;'
              } //-stationaryClickMenu
            ,stationaryClickMenuLi:{       //ui.parts
              _name:'stationaryClickMenuLi'
              ,q:'ul.stationaryClickMenu li'
              ,css:'color:#888;border: 1px solid #0f0f0f;'
              } //-stationaryClickMenu
            ,clickMenu:{                   //ui.parts
              _name:'clickMenu'
              ,q:'ul.clickMenu'
              ,css:'background-color:black;color:#888;border:1px solid #0a0a0a;'
              } //-clickMenu
            ,clickMenuLi:{                 //ui.parts
              _name:'clickMenuLi'
              ,q:'ul.clickMenu li'
              ,css:'color:#888;border:1px solid #0a0a0a;'
              } //-stationaryClickMenu
            ,linkItemsContainer:{          //ui.parts
              _name:'linkItemsContainer'
              ,q:'.GGD0W3FBKS'
              ,css:'margin-left:10px;'
              } //-linkItems
            ,linkItem:{                    //ui.parts
              //<div class="GGD0W3FBKS" aria-hidden="false"> linkItemsContainer
              //  <div class="GGD0W3FBJ4" style="cursor: default;">
              //    <div class="GGD0W3FBG4">
              //      <img class="gwt-Image" src="">
              //    </div>
              //    <div style="float: left; margin-top: 2px;">
              //      <div class="GGD0W3FBI4"> linkItemTitle
              //        .assets`keyprism3`_;C.$explhere
              //      </div>
              //      <div class="GGD0W3FBH4" style="text-decoration: line-through;"> linkItemUrl
              //        C:\_\keyprism3\.assets\.assets`keyprism3`_;C.$explhere
              //      </div>
              //    </div>
              //    <div style="clear: both;">
              //    </div>
              //  </div>
              //</div>
              _name:'linkItem'
              ,q:'.GGD0W3FBJ4'
              } //-linkItem
            ,explhere:{                    //ui.parts
              _name:'explhere'
              ,q:' [title$="$explhere"]'
              }
            ,linkItemUrl:{                 //ui.parts
              _name:'linkItemUrl'
              ,q:'.GGD0W3FBH4'
              } //-linkItemUrl
            ,linkItemTitle:{               //ui.parts
              _name:'linkItemTitle'
              ,q:'.GGD0W3FBI4'
              } //-linkItemTitle
            ,linkItemImage:{               //ui.parts
              _name:'linkItemImage'
              ,q:'.GGD0W3FBG4>img'
              } //-linkItemTitle
            ,popupIcon:{                   //ui.parts
              _name:'popupIcon'
              ,q:'.gwt-PopupPanel>.popupContent>.gwt-Image'
              } //-popupIcon
            } //-parts
          ,alter:{                         //controller
            _name:'alter'
            ,_items:{                      //processableObjectsContainer
              _name:'_items'
              ,topBarTableCenter:{ //ui.alter._items
                _name:'topBarTableCenter'
                ,_clearItems:function(){//__.ui.alter._items.clearItems()
                  const tgt=('#'+this._name).q;
                  tgt.find('.'+this._name+'Link').remove();
                  } //-clearItems
                ,onHashChange:function(){
                  this._clearItems();
                  } //-onHashChange
                ,addLink:function(data){
                  //console.log('addLink:data',data);
                  //msg, text, image
                  //OR url, text, image
                  const tgt=('#'+this._name).q;
                  let s='';
                  s+='<span';
                  s+=' class="'+this._name+'Link"';
                  if (data.msg) {
                    s+=' style="cursor:crosshair"'
                  }else{
                    s+=' style="cursor:pointer"'
                  }
                  s+='>';
                  if (data.image) {
                    s+='<img';
                    s+=' src="'+data.image;
                    s+='"';
                    s+=' style="width:16px;height:16px"';
                    s+='>';
                  }
                  if (data.text) {
                    s+='<span>';
                    s+=data.text;
                    s+='</span>';
                  }
                  s+='</span>';
                  tgt.append(s);
                  const me=tgt.find('.'+this._name+'Link').last();
                  if (data.title) {
                    me.attr('title',data.title);
                  }
                  if (data.msg) {
                    me.on('click',function(){
                      //noinspection JSUnresolvedFunction
                      window.top.postMessage(data.msg,'*');
                    });
                  }else{
                    me.on('click',function(){
                      //noinspection JSUnresolvedVariable
                      window.open(data.url,data.windowName||'_blank');
                    });
                  }
                  } //-addLink
                ,onLoad:function(){
                  const table=__.ui.parts.topBarTable.q.q;
                  //const td1=table.find('td:eq(0)');
                  const td2=table.find('td:eq(1)');
                  const td3=table.find('td:eq(2)');
                  td2.after('<td id="topBarTableCenter" class="centerpart greyBar"></td>');
                  td2.css('width','33%');
                  td3.css('width','');
                  const tdc='#topBarTableCenter'.q;
                  tdc.css('width','100%');
                  } //-onLoad
                ,_init_:function(){
                  'onLoad'._sub([this.onLoad,this]);
                  'onHashChange'._sub([this.onHashChange,this]);
                  } //-_init_
                ,_init:function(){
                  this._init_();
                  } //-_init
                } //-topBarTableCenter
              ,bottomEditHeader:{ //ui.alter._items
                _name:'bottomEditHeader'
                ,_colorize:function(){
                  const tgt=('#'+this._name).q;
                  __.ui._iniData();
                  const ColorHex='ColorHex'._of(__.data.iniData);
                  if (ColorHex) {
                    const bottomEditTitle=__.ui.parts.bottomEditTitle.q.q;// Thought title
                    bottomEditTitle.css('color',ColorHex);
                    tgt.css('background','linear-gradient(to right, #000000,'+ColorHex+')');
                  }
                  } //-_colorize
                ,_doitDelay:function(){
                  const that=this;
                  setTimeout(function(){
                    that._doit();
                  },1500);
                  } //-onLoad
                ,onHashChange:function(){
                  this._doitDelay();
                  } //-onHashChange
                ,onLoad:function(){
                  this._doitDelay();
                  } //-onLoad
                ,_doit:function(){
                  if (('#'+this._name).q.length) {
                    console.log("EXISTS");
                    this._colorize();
                    return;
                  }
                  //const bottomEdit=__.ui.parts.bottomEdit.q.q;// parent
                  const bottomEditTitle=__.ui.parts.bottomEditTitle.q.q;// Thought title
                  const linkItemsContainer=__.ui.parts.linkItemsContainer.q.q;
                  let items=$([]);
                  items=items.add(bottomEditTitle);
                  let current=bottomEditTitle;
                  while (current.next().get(0)!==linkItemsContainer.get(0)) {
                    current=current.next();
                    items=items.add(current);
                  }
                  items=items.add(linkItemsContainer);
                  console.log('items',items);
                  const s='<div id="'+this._name+'"></div>';
                  bottomEditTitle.before(s);
                  const tgt=('#'+this._name).q;
                  tgt.append(items.detach());
                  this._colorize();
                  }
                ,_init_:function(){
                  'onLoad'._sub([this.onLoad,this]);
                  'onHashChange'._sub([this.onHashChange,this]);
                  } //-_init_
                ,_init:function(){
                  this._init_();
                  } //-_init
                } //-bottomEditHeader
              } //-_items
            ,_init_:function(){            //ui.alter.
              __.utils.__initializer.bind(this._items)();
              // if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
              // for (var n in this._items) {
              //   if (!this._items.hasOwnProperty(n)) {continue;}
              //   var o=this._items[n];
              //   console.log('typeof o:'+(typeof o),o);
              //   if (o instanceof Object) {
              //     console.log('alter:'+o._name);
              //     o._init();
              //   }
              // }
              } //-_init_
            ,_init:function(){             //ui.alter.
              if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
              this._init_();
              } //-_init
            } //-alter
          ,docLinkages:{                   //controller
            _name:'docLinkages'
            ,linkages:{                    //ui.docLinkages.
              } //-linkages
            ,extractors:{                  //ui.docLinkages.
              urlEquals:function(url){     //ui.docLinkages.extractors
                return url.split('=')[1];
                } //-urlEquals
              } //-extractors
            ,popupIcon:{                   //ui.docLinkages.
              _name:'popupIcon'
              ,onClick:function(evt){      //ui.docLinkages.popupIcon
                console.log(this._name+' onClick',evt);
                //console.log(__.data.linkages.vpPackageDiagram);
                __.ui.docLinkages._linkageDataCall('vpPackageDiagram');
                } //-onClick
              ,_init_:function(){          //ui.docLinkages.popupIcon
                const that=this;
                $(document).on('click','.thought.active',function(evt){
                  that.onClick(evt);
                });
                } //-_init_
              ,_init:function(){           //ui.docLinkages.popupIcon
                this._init_();
                } //-_init
              } //-popupIcon
            ,_registerLinkage:function(linkage){            //ui.docLinkages.
              this.linkages[linkage._name]=linkage;
              } //-_registerLinkage
            ,_linkages_init:function(){                     //ui.docLinkages.
              this && this["UNUSED FUNCTION\n"] && this["UNUSED FUNCTION\n"](this._linkages_init); // !unuf - lint hack for webstorm
              this._registerLinkage({
                _name:'vpPackageDiagram'
                ,topBar:{
                  title:'Package Diagram'
                  ,target:'_content_pane'
                  ,image:'http://mrobbinsassoc.com/images/icons/md/visualparadigm-16.png'
                }
                ,linkItem:{
                  title:'Package Diagram'
                  ,url:''
                  ,image:'http://mrobbinsassoc.com/images/icons/icons-ext/_vpp-48.png'
                  ,zap:true
                  ,target:'_content_pane'
                  ,find:{
                    title:/\$explhere$/
                  }
                }
                ,docLink:{
                  find:{
                    href:['/vp/publish/index.html?url=','Package']
                    }
                  ,extractor:function(url){
                    let u=__.ui.docLinkages.extractors.urlEquals(url);
                    const vp_url='vp_url'._of(__.data.iniData);  //keyprism3.vpp://shape/1234567890123456/1234567890123456
                    const u0=u;
                    //if (window.top.location.href.substr(0,5)==='file:') {
                    if (true) {
                      //const local=window.top.location.href.replace('index.html','');
                      const serv='http://mrobbinsassoc.com/projects/keyprism3/vp/publish/content/';
                      u=u.replace(serv,'');
                    }
                    console.log('uu',u);
                    if (!vp_url) {
                      return u;
                    }
                    const a=vp_url.split('/');
                    //var dia=a[3];
                    const shape=a[4];
                    //var tit=__.ui.parts.bottomEditTitle.q.q.text();
                    //tit=tit.replace(/ /g,'').replace(/#/g,'').split(',');
                    //return u+'?package='+encodeURIComponent(tit[0]);
                    return u+'?shapeid='+encodeURIComponent(shape);
                    }
                  ,zap:true
                }
                ,done:function(options){
                  __.data.linkages[this._name]={
                    options:options
                  };
                  } //-onComplete
              });
              if (1) {
                this._registerLinkage({
                  _name:'externalWebBrain'
                  ,docLink:{
                    find:{
                      //https://webbrain.com/brainpage/brain/09335629-E824-3836-6E1A-8A30325D2C09#-8
                      href:function(){return location.href;}
                    }
                    ,zap:true
                  }
                });
              }
              if (1) {
                this._registerLinkage({
                  _name:'BitBucket'
                  ,topBar:{
                    title:'Repository Folder'
                    ,image:'http://mrobbinsassoc.com/images/icons/md/bitbucket-16.png'
                    }
                  ,docLink:{
                    find:{
                      href:'https://bitbucket.org/'
                    }
                    ,target:'_blank'
                  }
                  ,linkItem:{
                    isNew:true
                    ,target:'_blank'
                    ,url:__.ui.parts.bottomEditTitle.q.q.text()
                    ,title:'BitBucket'
                    ,image:'http://mrobbinsassoc.com/images/icons/extensions/bitbucket-48.png'
                  }
                });
              }
              if (1) {
                this._registerLinkage({
                  _name:'FolderMarkdowns'
                  ,docLink:{
                    find:{
                      href:['aip://open/',/(\.md$|\.md%3F)/]
                    }
                    ,href:null
                    ,click:function(evt){
                      this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
                      //find text
                      const brn='https://webbrain.com/brainpage/brain/';//09335629-E824-3836-6E1A-8A30325D2C09
                      const me=$(this);
                      /// var code=me.next();
                      /// var code_txt=code.text();
                      /// console.log('code_txt',code_txt);
                      /// // find thought with code
                      /// var thoughts=$('.thought');
                      /// console.log('thoughts',thoughts)
                      /// var tgt;
                      /// thoughts.each(function(){
                      ///   var me=$(this);
                      ///   var txt=me.text();
                      ///   if (!tgt&&txt===code_txt) {
                      ///     tgt=me;
                      ///   }
                      /// });
                      /// if (tgt) {
                      ///   console.log('tgt.click',tgt); //simulate
                      ///   window.TGT=tgt;
                      ///   tgt.click();
                      ///   return;
                      /// }
                      const data=me.attr('data-href');
                      let rt=data.substr('aip://open/'.length);
                      rt=decodeURIComponent(rt);
                      if (rt.indexOf('?')===-1) {
                        location.href=data;
                        return;
                      }
                      const qs=rt.substr(rt.indexOf('?')+1);
                      //C:\_\keyprism3\.assets\esdoc\README.md?brain_uid=09335629-E824-3836-6E1A-8A30325D2C09&thought_id=20&vp_url=keyprism3.vpp://shape/YcUAPVqGAqAAAhK3/nEwRvVqGAqAAAg1x
                      const qu=__.utils.parseQueryString(qs);
                      //noinspection JSUnresolvedVariable
                      if (!qu.brain_uid||!qu.thought_id) {
                        location.href=data;
                        return;
                      }
                      //noinspection JSUnresolvedVariable
                      const brain_uid=qu.brain_uid;
                      //noinspection JSUnresolvedVariable
                      const thought_id=qu.thought_id;
                      //console.log('click',evt);
                      if (location.href.indexOf(brn+brain_uid)!==-1) {
                        console.log('location.hash','#-'+thought_id);
                        location.hash='#-'+thought_id;
                      }else{
                        console.log('location.href',brn+brain_uid+'#-'+thought_id);
                        location.href=brn+brain_uid+'#-'+thought_id;
                      }
                    }
                  }
                });
              }
              } //-_registerLinkage
            ,_stringMatcher:function(str,match){            //ui.docLinkages.
              if (!str) {
                return false;
              }
              if ('string'===typeof match) {
                return str.indexOf(match)!==-1;
              }else if (match instanceof RegExp) {
                return str.match(match)!==null;
              }else if ($.isArray(match)) {
                for (let x=0;x<match.length;x++) {
                  const r=this._stringMatcher(str,match[x]);
                  if (!r) {
                    return false;
                  }
                }
                return true;
              }
              return false;
              } //-_urlHas
            ,_linkageDataCall:function(linkageName){        //ui.docLinkages.
              const dl=__.data.linkages[linkageName];
              if (!dl||!dl.linkItem) {return;}
              const linkItem=dl.linkItem;
              if (linkItem.target==='_content_pane') {
                const msg={
                  from:window.name
                  ,action:'load'
                  ,target:'_content_pane'
                  ,url:linkItem.docUrl
                };
                __.utils.messageTop(msg);
              }else{
                window.open(linkItem.docUrl,linkItem.target||'_blank');
              }
              } //-_linkageDataCall
            ,_linkageLinkItem:function(linkage){            //ui.docLinkages.
              /// ,linkItem:{
              ///   title:'Package Diagram'
              ///   ,url:''
              ///   ,image:'http://mrobbinsassoc.com/images/icons/icons-ext/_vpp-48.png'
              ///   ,del:true
              ///   ,target:'_content_pane'
              ///   ,find:{
              ///     title:/\$explhere$/
              ///   }
              /// }
              const parts=__.ui.parts;
              if (!linkage.linkItem||!linkage.linkItem.find) {return $([]);}
              const find=linkage.linkItem.find;
              let q;//=qs.q;
              const that=this;
              const items=parts.linkItem.q.q;
              items.each(function(){
                const me=$(this);
                const title=me.find(parts.linkItemTitle.q).text();
                const url=me.find(parts.linkItemUrl.q).text();
                let mc=0;
                let mt=0;
                mt+=find.title?1:0;
                mt+=find.url?1:0;
                if (find.title&&that._stringMatcher(title,find.title)) {mc++;}
                if (find.url&&that._stringMatcher(url,find.url)) {mc++;}
                if (!q&&mc===mt) {q=me;}
              });
              return q?q:$([]);
              } //-_linkageLinkItem
            ,_linkageDocLinks:function(linkage){            //ui.docLinkages.
              if (!linkage.docLink||!linkage.docLink.find) {return $([]);}
              const find=linkage.docLink.find;
              const qq=$('a');
              let q=$([]);//=qs.q;
              const that=this;
              qq.each(function(){
                const me=$(this);
                const href=me.attr('href');
                if (me.parent().get(0).tagName==='LI') {
                  if (that._stringMatcher(href,__.utils.defunction(find.href))) {q=q.add(me);}
                }
              });
              return q;
              } //-_linkageDocLinks
            ,_linkageDocLink:function(linkage){             //ui.docLinkages.
              /// ,docLink:{
              ///   find:{
              ///     href:['/vp/publish/index.html?url=','Package']
              ///   }
              ///   ,extractor:__.ui.docLinkages.extractors.urlEquals
              ///   ,zap:true
              /// }
              if (!linkage.docLink||!linkage.docLink.find) {return $([]);}
              const find=linkage.docLink.find;
              const qq=$('a');
              let q;//=qs.q;
              const that=this;
              qq.each(function(){
                const me=$(this);
                const href=me.attr('href');
                if (me.parent().get(0).tagName==='LI') {
                  if (!q&&that._stringMatcher(href,__.utils.defunction(find.href))) {q=me;}
                }
              });
              return q?q:$([]);
              } //-_linkageDocLink
            ,_docLinkZap:function(docLink){                 //ui.docLinkages.
              const link=docLink;
              if (!link.length) {return;}
              const p=link.parent();
              const tag=p.get(0).tagName;
              if (tag==='LI') {
                if (p.prev().length===0) {p.parent().before('<p><em>none</em></p>');p.parent().remove();
                }else{p.remove();}
              }else{link.remove();}
              } //-_docLinkZap
            ,_linkageDocLinkZap:function(linkage){          //ui.docLinkages.
              const link=this._linkageDocLink(linkage);
              this._docLinkZap(link);
              } //-_linkageDocLinkZap
            ,_linkageDocLinksUrls:function(linkage){        //ui.docLinkages.
              const links=this._linkageDocLinks(linkage);
              const a=[];
              links.each(function(){
                const me=$(this);
                let url=me.attr('href');
                if (linkage.docLink&&linkage.docLink.extractor) {url=linkage.docLink.extractor(url);}
                a.push(url);
              });
              return a;
              } //-_linkageDocLinksUrls
            ,_linkageDocLinkUrl:function(linkage){          //ui.docLinkages.
              const q=this._linkageDocLink(linkage);
              if (!q.length) {return null;}
              const url=q.attr('href');
              if (linkage.docLink&&linkage.docLink.extractor) {return linkage.docLink.extractor(url);}
              return url;
              } //-_linkageDocLinkUrl
            ,_linkageDocLinksFixups:function(linkage){      //ui.docLinkages.
              const urls=this._linkageDocLinksUrls(linkage);
              const links=this._linkageDocLinks(linkage);
              for (let x=0;x<urls.length;x++) {
                //var url=urls[x];
                const link=$(links.get(x));
                if (linkage.docLink.href!==undefined) {
                  link.attr('data-href',link.attr('href'));
                  link.attr('href',linkage.docLink.href);
                }
                if (linkage.docLink.target!==undefined) {link.attr('target',linkage.docLink.target);}
                if (linkage.docLink.click) {link.css('cursor','pointer');link.on('click',linkage.docLink.click);}
                if (linkage.docLink.zap) {this._docLinkZap(link);}
              }
              return urls;
              } //-_linkageDocLinksFixups
            ,_linkageDocLinkFixup:function(linkage){        //ui.docLinkages.
              const url=this._linkageDocLinkUrl(linkage);
              const q=this._linkageDocLink(linkage);
              if (linkage.docLink.target) {q.attr('target',linkage.docLink.target);}
              if (linkage.docLink.zap) {this._linkageDocLinkZap(linkage);}
              return url;
              } //-_linkageDocLinkFixup
            ,_linkageProcessItem:function(linkage, docUrl){ //ui.docLinkages.
              //console.log('_linkageProcessItem',linkage);
              const parts=__.ui.parts;
              const container=parts.linkItemsContainer.q.q;
              if (linkage.topBar) {//target,image
                const topBar=linkage.topBar;
                const linkObject={};
                if (topBar.target==='_content_pane') {
                  linkObject.msg={
                    from:window.name
                    ,action:'load'
                    ,target:'_content_pane'
                    ,url:docUrl
                  };
                }else{
                  linkObject.url=docUrl;
                }
                if (topBar.image) {
                  linkObject.image=topBar.image;
                }
                if (topBar.text) {
                  linkObject.text=topBar.text;
                }
                if (topBar.title) {
                  linkObject.title=topBar.title;
                }
                __.ui.alter._items.topBarTableCenter.addLink(linkObject);
                //,addLink:function(data){
                  //msg, text, image
                  //OR url, text, image
              }
              const linkItem=linkage.linkItem;
              if (!linkItem) {return;}
              let html;
              let item;
              let my;
              if (linkItem.isNew) {
                const data={};//img title url
                if (linkItem.title) {data.title=linkItem.title;}
                if (linkItem.image) {data.image=linkItem.image;}
                if (linkItem.url) {data.url=linkItem.url;}
                html=__.utils.linkItemHtml(data);
              }else{
                item=this._linkageLinkItem(linkage);
                if (item.length===0) {return;}
                html=item.outerHtml();
              }
              container.append(html);
              if (item) {my=item.next();
              }else{my=container.find(parts.linkItem.q).last();
              }
              if (item&&linkItem.zap) {item.remove();}
              //
              const linkItem_title=my.find(parts.linkItemTitle.q);
              let linkItem_title_v;
              if (linkItem.title) {linkItem_title_v=linkItem.title;}
              if (linkItem_title_v!==undefined) {linkItem_title.html(linkItem_title_v);}
              //
              const linkItem_url=my.find(parts.linkItemUrl.q);
              let linkItem_url_v;
              //noinspection ConstantIfStatementJS
              if (false) {
              }else if (linkItem.url===true) {linkItem_url_v=docUrl;
              }else if (linkItem.url==='') {linkItem_url_v=linkItem.url;
              }else if (linkItem.url) {linkItem_url_v=linkItem.url;
              }
              if (linkItem_url_v!==undefined) {linkItem_url.html(linkItem_url_v);}
              //
              const linkItem_image=my.find(parts.linkItemImage.q);
              let linkItem_image_v;
              if (linkItem.image) {linkItem_image_v=linkItem.image;}
              if (linkItem_image_v!==undefined) {
                linkItem_image.attr('src',linkItem_image_v).css('width','32px').css('height','32px');
              }
              //
              if (linkItem.target==='_content_pane') {
                my.css('cursor','crosshair');
                my.on('click',function(){
                  const msg={
                    from:window.name
                    ,action:'load'
                    ,target:'_content_pane'
                    ,url:docUrl
                  };
                  __.utils.messageTop(msg);
                });
              }else{
                my.css('cursor','pointer');
                my.on('click',function(){
                  window.open(docUrl,linkItem.target||'_blank');
                });
              }
              if ($.isArray(linkItem.docUrl)) {
                linkItem.push(docUrl);
              }else{
                linkItem.docUrl=docUrl;
              }
              //
              if (linkage.done) {
                linkage.done({docUrl:docUrl,my:my});
              }
              }
            ,_processLinkage:function(linkage){             //ui.docLinkages.
              const docUrls=this._linkageDocLinksFixups(linkage);
              for (let x=0;x<docUrls.length;x++) {
                this._linkageProcessItem(linkage,docUrls[x]);
              }
              //
              } //-_cloneLast
            ,_processLinkages:function(){                   //ui.docLinkages.
              const linkages=Object.keys(this.linkages);
              for (let x=0;x<linkages.length;x++) {
                const n=linkages[x];
                //console.log('linkage:'+n);
                const linkage=this.linkages[n];
                this._processLinkage(linkage);//url,text,title,icon,target,msg,del
              }
              } //-_processLinkage
            ,onHashChange:function(){                       //ui.docLinkages.
              console.log('onHashChange',location);
              this._processLinkages();
              '#bottomEdit a[href^="http"]:not([target])'.q.attr('target','_blank');
              } //-onHashChange
            ,_init_:function(){                             //ui.docLinkages.
              __.utils.__initializer.bind(this)();
              //if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
              //this.popupIcon._init();
              //this._registerLinkages();
              } //-_init_
            ,_init:function(){                              //ui.docLinkages.
              if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
              this._init_();
              } //-_init
            } //-docLinkages
          ,_parts_init:function(){         //ui.
            this && this["UNUSED MEMBER\n"] && this["UNUSED MEMBER\n"](this._parts_init); // !unum - lint hack for webstorm
            for (const n in this.parts) {
              if (!this.parts.hasOwnProperty(n)) {continue;}
              const part=this.parts[n];
              if (!part instanceof Object) {continue;}
              if (!part.on) {continue;}
              const events=Object.keys(part.on);
              for (let x=0;x<events.length;x++) {
                const en=events[x];
                const evt=part.on[en];
                $(document).on(en,part.q,evt);
              }
            }
            } //-_parts_init
          ,_iniData:function(){            //ui.
            __.data.iniData={};
            '.gwt-HTML>UL:eq(0)>li'.q.each(function(){
              const me=$(this);
              const codes=me.find('code');
              if (codes.length===2) {
                const c1=codes.first().text();
                //noinspection UnnecessaryLocalVariableJS
                const c2=codes.last().text();
                __.data.iniData[c1]=c2;
              }
            });
            } //-_iniData
          ,onHashChange:function(){        //ui.
            const that=this;
            this._iniData();
            console.log('window.name',window.name);
            if (window.name==='_brain_pane') {
              setTimeout(function(){
                that.docLinkages.onHashChange();
              },__.set.onHashChange.timeout);
            }
            } //-onHashChange
          ,onLoad:function(){              //ui.
            this._iniData();
            this.alter._init();
            this.onHashChange();
            } //-onLoad
          ,onMessage:function(data){       //ui.
            if (data.data.from==='VisualParadigm') {
              console.log('VisualParadigm onMessage',data.event);
            }
            } //-onMessage
          ,_init_:function(){              //ui.
            __.utils.__initializer.bind(this)();
            // if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
            // this._parts_init();
            // this.docLinkages._init();
            'onHashChange'._sub([this.onHashChange,this]);
            'onLoad'._sub([this.onLoad,this]);
            'onMessage'._sub([this.onMessage,this]);
            //this.viz._init();// keep at bottom
            } //-_init_
          ,_init:function(){               //ui.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            this._init_();
            } //-_init
          } //-ui
        ,events:{                          //dispatchObjectContainer
          _name:'event'
          ,dom:{                           //dispatchObject
            _name:'dom'
            ,node_removed:function(event){  //events.dom
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](event); // !unup - lint hack for webstorm
              //console.log('node_removed',event);
              } //-node_removed
            ,node_inserted:function(event){ //events.dom
              //console.log('node_inserted',event);
              const me=$(event.target);
              if (me.attr('class')==='gwt-PopupPanel') {
                //console.log('gwt-PopupPanel inserted');
                ///<div class="gwt-PopupPanel" style="left: 615px; top: 139px; z-index: 990; visibility: visible; position: absolute; clip: rect(auto auto auto auto); overflow: visible;">
                ///  <div class="popupContent">
                ///    <img class="gwt-Image" src="https://webbrain.com/icon?brain=09335629-E824-3836-6E1A-8A30325D2C09&amp;pa�mp;unique=1489963142000&amp;maxWidth=200&amp;maxHeight=200&amp;match=false">
                ///  </div>
                ///</div>
                // setTimeout(function(){
                //   console.log(me.outerHtml());
                // },1000);
                //if ($('.thought.active.hover').length) {
                //  console.log('.thought.active.hover',me.length);
                //  me.on('click',function(evt){
                //    console.log('.thought.active.hover:CLICK');
                //    __.ul.docLinkages.popupIcon.onClick(evt);
                //  });
                //
                //  // setTimeout(function(){
                //  // },200);
                //}
                //me.on('click',function(evt){});
              }
              } //-node_inserted
            } //-dom
          ,kbd:{                           //dispatchObject
            _name:'kbd'
            ,k_ad33:function(evt){         //events.kbd. - pgup.a.D
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
              __.actions.midBarUp();
              return false;
              } //-k_au34
            ,k_ad34:function(evt){         //events.kbd. - pgdn.a.D
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
              __.actions.midBarDown();
              return false;
              } //-k_au34
            ,k_asd33:function(evt){        //events.kbd. - pgup.as.D
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
              __.actions.rightFrameUp();
              return false;
              } //-k_asu33
            ,k_asd34:function(evt){        //events.kdb. - pgdn.as.D
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](evt); // !unup - lint hack for webstorm
              __.actions.rightFrameDown();
              return false;
              } //-k_asu34
            } //-kbd
          ,doc:{                           //dispatchObject
            _name:'doc'
            ,_17_ct:0
            ,_keysdown:{                   //dataContainer
              } //-_keysdown
            ,cas:function(){               //events.doc.
              let cas='';
              //noinspection JSUnresolvedVariable
              if (__.events.doc._keysdown._17!==undefined) {cas+='c';}
              //noinspection JSUnresolvedVariable
              if (__.events.doc._keysdown._18!==undefined) {cas+='a';}
              //noinspection JSUnresolvedVariable
              if (__.events.doc._keysdown._16!==undefined) {cas+='s';}
              return cas;
              } //-cas
            ,_do_call:function(code,evt){  //events.doc.
              if (__.data.showkeys) {console.log('code:'+code);}
              //console.log('code:'+code);
              code._bc({evt:evt});
              if (typeof __.events.kbd[code]==='function') {
                //console.log('press:'+code);
                if (this._check_call(__.events.kbd[code])) {
                  return __.events.kbd[code](evt);
                }
              }else if (jQuery.isArray(__.events.kbd[code])) {
                const a=__.events.kbd[code];
                for (let x=0;x<a.length;x++) {
                  if (typeof a[x]==='function') {
                    console.log('press:'+x+' '+code);
                    if (!this._check_call(a[x])) {
                      console.log('item failed _check_call :'+x+' '+code);
                      continue;
                    }
                    const rv=a[x](evt);
                    if (rv!==undefined) {
                      if (rv===false) {
                        // return 'continue'
                        return rv;
                      }
                    }
                  }
                }
              }
              } //-_do_call
            ,_check_call:function(fo){     //events.doc.
              if (fo.me===undefined) {
                return true;
              }
              console.log('_check_call:j:'+fo.me.k.j);
              if (fo.me.k.j.indexOf('c')===-1&&fo.me.k.j.indexOf('a')===-1&&fo.me.k.j.indexOf('s')===-1) {
                console.log('_check_call:plainkey?:'+fo.me.k.j);
                // plain key
                let kc=fo.me.k.j.substr(1);
                kc=parseInt(kc);
                console.log('_check_call:plainkey?:kc:'+kc);
                // enter esc space 0-9
                const aa=[13,27,32,48,49,50,51,52,53,54,55,56
                 // - = bs
                 ,189,187,8
                 // a-z
                 ,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90
                 // [ ] \
                 ,219,221,220
                 // ; '
                 ,186,222
                 // ,./
                 ,188,190,191
                 // ins hom pu del end pd
                 ,45,36,33,46,35,34
                 // left right up down
                 ,37,39,38,40
                 // f1-f12  3  4  5    6   7   8   9  10   11  12
                 //,112,113,114,115,116,117,118,119,120,121,122,123
                 // num / * - + .
                 ,111,106,109,107,110
                 // num 0-9    5   6   7   8   9
                 ,96,97,98,99,100,101,102,103,104
                 ];
                console.log('_check_call:aa.indexOf('+kc+'):'+aa.indexOf(kc));
                if (aa.indexOf(kc)!==-1) {
                  if (__.state.inEditor()) {
                    console.log('exit inEditor:'+kc+' '+fo.me.n);
                    return false;
                  }
                }
              }
              // return true if should call
              //noinspection JSUnresolvedVariable
              let w=fo.me.W;
              //console.log('fo,fo.me:',fo,fo.me);
              if (w===undefined) {
                return true;
              }
              //console.log('w',w);
              w=w.split(',');
              //console.log('w',w);
              //w=__.utils.cleanFor(w,'string');
              //console.log('w',w);
              //console.log('w.length',w.length);
              const ay=[];
              const an=[];
              for (let x=0;x<w.length;x++) {
                const i=w[x];
                if (typeof i!=='string') {
                  continue;
                }
                if (i.substr(0,1)==='!') {
                  an.push(i.substr(1));
                }else{
                  ay.push(i);
                }
              }
              //console.log('ay',ay,'an',an);
              //ay=__.utils.cleanFor(ay,'string');
              //an=__.utils.cleanFor(an,'string');
              //console.log('ay',ay,'an',an);
              function tryIt(s){
                const f=__.state['is'+s];
                if (typeof f!=='function') {
                  console.error('state Fn not found:is'+s+'()');
                  return false;
                }
                //noinspection UnnecessaryLocalVariableJS
                const rv=__.state['is'+s]();
                return rv;
              }
              let yy=false;
              for (let x=0;x<ay.length;x++) {
                if (tryIt(ay[x])) {
                  yy=true;
                }
              }
              if (ay.length===0) {
                yy=true;
              }
              let nn=false;
              for (let x=0;x<an.length;x++) {
                if (tryIt(an[x])) {
                  nn=true;
                }
              }
              if (yy&&(!nn)) {
                //console.log(fo,'yy:'+yy+' nn:'+nn+' rv:true');
                return true;
              }
              //console.log(fo,'yy:'+yy+' nn:'+nn+' rv:false');
              return false;
              } //-_check_call
            ,keypress:function(evt){       //events.doc.
              if (__.data.showkeys) {console.log('document.keypress',evt.keyCode);}
              const cas=__.utils.cas(evt);
              const foc=$(':focus');
              if (foc.length===1&&foc.prop('tagName')==='TEXTAREA') {return;}
              const code='k_'+cas+'p'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keypress
            ,keyup:function(evt){          //events.doc.
              if (__.data.showkeys) {console.log('document.keyup',evt.keyCode);}
              //const foc=$(':focus');
              //console.log('document.keyup.tagName',foc.prop('tagName'));
              const cas=__.utils.cas(evt);
              if (this._keysdown['_'+evt.keyCode]!==undefined) {
                delete this._keysdown['_'+evt.keyCode];
              }
              const code='k_'+cas+'u'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keyup
            ,keydown:function(evt){        //events.doc.
              const foc=$(':focus');
              if (0) {
                if (foc.length===1&&foc.prop('tagName')==='TEXTAREA') {
                  if (evt.keyCode!==17&&evt.keyCode!==18&&evt.keyCode!==16) {
                    return;
                  }
                }
              }
              if (this._keysdown['_'+evt.keyCode]!==undefined) {return;}
              if (__.data.showkeys) {console.log('document.keydown',evt.keyCode);}
              //if (document.sk) {console.log('document.keydown',evt.keyCode);}
              this._keysdown['_'+evt.keyCode]=new Date();
              const cas=__.utils.cas(evt);
              const code='k_'+cas+'d'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keydown
            } //-doc
          ,win:{                           //dispatchObject
            _name:'win'
            ,resize:function(event){       //events.win.
              this && this["UNUSED PARAM\n"] && this["UNUSED PARAM\n"](event); // !unup - lint hack for webstorm
              console.log('win.resize');
              __.actions.reportWindowData();
              } //-resize
            ,hashChange:function(event){   //events.win.
              'onHashChange'._bc({event:event});
              } //-hashChange
            ,message:function(event){      //events.win.
              if (event.data.action==='reportWindowData') {
                __.data.windowData[event.data.from]=event.data.windowData;
              }
              if (event.data.action==='brainNav') {
                //console.log('message',event.data);
                //alert('WEBBRAIN',JSON.stringify(event.data.action));
                location.hash='#-'+event.data.thought_id;
              }
              'onMessage'._bc({event:event, data:event.data});
              } //-message
            } //-win
          } //-event
        ,inits:{                           //functionsContainer
          _name:'inits'
          ,bug:false
          ,protos:function(){              //inits.
            this.bug&&console.log('bugging:'+arguments.callee.name);
            if (arguments.callee.initialized) {console.error('already initialized');return;}arguments.callee.initialized=true;
            const __entityMap = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': '&quot;',
              "'": '&#39;',
              "/": '&#x2F;'
              };//-__entityMap
            String.prototype.escapeHTML = function() {
              return String(this).replace(/[&<>"'\/]/g, function (s) {
                  return __entityMap[s];
              });
              }; //-escapeHTML
            String.prototype._of=function(that){
              const s=this.toString();
              return that[s];
              }; //-_of
            String.prototype.qo=function(){
              const s=''+this;
              return $(s);
              }; //-qo
            String.prototype._ropf=function(o,fn){
              const n=''+this;
              Object.defineProperty(o,n, {
                get: fn
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropf
            String.prototype._ropq=function(o,sel){
              const n=''+this;
              Object.defineProperty(o, n, {
                get: function(){
                  return $(sel);
                }
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropq
            String.prototype._ropqc=function(o,sel){
              const n=''+this;
              Object.defineProperty(o, n, {
                get: function(){
                  if (!arguments.callee.cache) {
                    arguments.callee.cache=$(sel);
                  }
                  return arguments.callee.cache;
                }
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropqc
            String.prototype._pf=function(o,get_f,set_f){
              const n=''+this;
              Object.defineProperty(o, n, {
                get: get_f
                ,set: set_f
                ,enumerable: true
                ,configurable: false
              });
              }; //-_pf
            's'._ropf(String.prototype,function(){
              console.log(''+this,this.q[0]);
              return this.q;
              }); // -q
            'q'._ropf(String.prototype,function(){
              return this.qo();
              }); // -q
            'e'._ropf(String.prototype,function(){
              const q=this.qo();
              console.info(this+':',q.length);
              const dp=q.getDomPath();
              console.info(dp);
              const t='2px dotted red';
              location.href='aip://clip/'+encodeURI(dp);
              return q
               .css('border',t)
               .css('border-left',t)
               .css('border-top',t)
               .css('border-bottom',t)
               .css('border-right',t)
               .css('box-shadow','inset 0px 0px 10px 2px #F00')
               .css('-webkit-filter','brightness(5) contrast(1.6)');
            });
            'ee'._ropf(String.prototype,function(){
              const q=this.qo();
              console.info(this+':',q.length);
              return q
               .css('border','')
               .css('border-left','')
               .css('border-top','')
               .css('border-bottom','')
               .css('border-right','')
               .css('box-shadow','')
               .css('-webkit-filter','');
            });
            'exists'._ropf(String.prototype,function(){
              const s=''+this;
              return s.q.length!==0;
            });
            '_one'._ropf(String.prototype,function(){
              const s=''+this;
              return s.q.length===1;
            });
            'p'._ropf(String.prototype,function(){
              const s=''+this;
              if (s.exists) {
                if (s.q.length===1) {
                  return s.q.getDomPath();
                }
                const a=[];
                s.q.each(function(){
                  const me=$(this);
                  a.push(me.getDomPath());
                });
                return a;
              }
              return null;
            });
            'singleSpace'._ropf(String.prototype,function(){
              const s=''+this;
              return s.replace(/\s{2,}/g, ' ');
            });
            '_trim'._ropf(String.prototype,function(){
              const s=''+this;
              return $.trim(s);
            });
            '_abbr'._ropf(String.prototype,function(){
               let s=''+this;
               if (s==='') {
                 return '';
               }
               s=s.replace(/[^a-zA-Z0-9]/g,' ');
               const a=[];
               let p_type;
               const m={su:true,sl:true,sn:true,nl:true,nu:true,lu:true,uu:true,ln:true,un:true};
               for(let x=0;x<s.length;x++){
                 const e=s.substr(x,1);
                 let is_type;//ulns
                 if ('0123456789'.indexOf(e)>=0){is_type='n';
                 }else if('abcdefghijklmnopqrstuvwxyz'.indexOf(e)>=0){is_type='l';
                 }else if('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e)>=0){is_type='u';
                 }else{is_type='s';
                 }
                 if(p_type===undefined){
                   if(is_type!=='s'){
                     a.push(e);
                   }
                 }else{
                   //noinspection JSUnusedAssignment
                   if (m[p_type+is_type]){
                     a.push(e);
                   }
                 }
                 p_type=is_type;
               }
               return a.join('').toUpperCase();
            });
            '_numwrap'._ropf(String.prototype,function(){
               const s=''+this;
               return '&#9129;'+s+'&#9131;';
            });
            '_f4'._ropf(String.prototype,function(){
               const s=''+this;
               setTimeout(function(){
                 s.q.focus();
               },4000);
               return s.q[0];
            });
            '_viz'._ropf(String.prototype,function(){
               const s=''+this;
               function comp(s){
                 const co=tinycolor(s);
                 //noinspection JSUnresolvedFunction
                 const hsl=co.toHsl();
                 const c=1;
                 const a=0.5;
                 const b=0.5;
                 //noinspection UnnecessaryLocalVariableJS
                 const v=Math.sqrt(a*hsl.h*a*hsl.h + b*hsl.s*b*hsl.s + c*hsl.l*c*hsl.l);
                 return v;
               }
               const v0=comp(s);
               let at=10000;//Number.Infinity;
               let found;
               //noinspection JSUnresolvedVariable
               vizcolors.forEach(function(cc){
                 const v=comp(cc.c);
                 //console.log('v',v);
                 const dif=Math.abs(v0-v);
                 //console.log('dif',dif);
                 if (dif<at) {
                   //console.log('found..',cc);
                   at=dif;
                   found=cc;
                 }
               });
               if (found) {
                 return found;
               }
            });
            '_l'._ropf(String.prototype,function(){
               const s=''+this;
               console.log(s);
            });
            '_i'._ropf(String.prototype,function(){
               const s=''+this;
               console.info(s);
            });
            '_w'._ropf(String.prototype,function(){
               const s=''+this;
               console.warn(s);
            });
            if (1) {
              'delimiter'._ropf(String.prototype,function(){
                const s=this.toString();
                //var dels=String.fromCharCode(13)+String.fromCharCode(9)+'|:.,;_=-'+' ';
                const dels=(String.fromCharCode(13)+String.fromCharCode(9)+'|,;'+' '+':.-_').split('');
                for (let x=0;x<dels.length;x++) {
                  const ss=dels[x];
                  if (s.indexOf(ss)!==-1) {
                    return ss;
                  }
                }
                return '';
              });
              String.prototype.inList=function(list,del){
                const s=this.toString();
                if (typeof list==='string') {
                  let d=list.delimiter;
                  if (d==='') {
                    d=' ';
                  }
                  del=d;
                  list=list.split(del);
                }
                return list.indexOf(s)!==-1;
              };
              String.prototype.hasItem=function(item,del){
                const s=this.toString();
                return item.inList(s,del);
              };
            }
            //'.simple-balloon.app-filters-popover .navigation li.selected'._f4
            String.prototype._abbr2=function(allows){
              let s=''+this;
              if (s==='') {
                return '';
              }
              const allows2=allows.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
              const re=new RegExp('[^a-zA-Z0-9'+allows2+']','g');
              s=s.replace(re,' ');
              const s0=s.replace(/ /g,'');
              const a=[];
              let p_type;
              const m={su:true,sl:true,sn:true,nl:true,nu:true,lu:true,uu:true,ln:true,un:true};
              for(let x=0;x<s.length;x++){
                const e=s.substr(x,1);
                let is_type;//ulns
                if ('0123456789'.indexOf(e)>=0){is_type='n';
                }else if('abcdefghijklmnopqrstuvwxyz'.indexOf(e)>=0){is_type='l';
                }else if('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e)>=0){is_type='u';
                }else{is_type='s';
                }
                if(p_type===undefined){
                  if(is_type!=='s'){
                    a.push(e);
                  }else{
                    if (allows.indexOf(e)>=0) {a.push(e);}
                  }
                }else{
                  //noinspection JSUnusedAssignment
                  if (m[p_type+is_type]){
                    a.push(e);
                  }else{
                    if (allows.indexOf(e)>=0) {a.push(e);}
                  }
                }
                p_type=is_type;
              }
              if (a.length===1) {
                a.push(s0.substr(1,2));
              }
              return a.join('').toUpperCase();
            };
            String.prototype._bc=function(o,that_){return radio(this.toString()).broadcast(o,that_);};
            String.prototype._sub=function(a1,a2,a3,a4){return radio(this.toString()).subscribe(a1,a2,a3,a4);};
            } //-protos
          ,jquery_addons:function(){       //inits.
            if (arguments.callee.initialized) {console.error('already initialized');return;}arguments.callee.initialized=true;
            //noinspection JSUnresolvedVariable
            (function($,sr){ //smartresize event
              /// // usage:
              /// $(window).smartresize(function(){
              ///   // code that takes it easy...
              /// });
              const debounce = function (func, threshold, execAsap) {
                let timeout;
                return function debounced () {
                  let obj = this;
                  const args = arguments;
                  function delayed () {
                    if (!execAsap){
                      //noinspection JSUnresolvedFunction
                      func.apply(obj, args);
                    }
                    timeout = null;
                  }
                  if (timeout){
                    clearTimeout(timeout);
                  } else if (execAsap){
                    //noinspection JSUnresolvedFunction
                    func.apply(obj, args);
                  }
                  timeout = setTimeout(delayed, threshold || 100);
                };
              };
              // smartresize
              jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
            })(jQuery,'smartresize');
            //noinspection JSUnresolvedVariable
            (function($){ //replaceText
              $.fn.replaceText = function( search, replace, text_only ) {
                return this.each(function(){
                  let node = this.firstChild,val,new_val,remove = [];
                  if ( node ) {
                    do {
                      if ( node.nodeType === 3 ) {
                        val = node.nodeValue;new_val = val.replace( search, replace );
                        if ( new_val !== val ) {
                          if ( !text_only && /</.test( new_val ) ) {
                            $(node).before( new_val );remove.push( node );
                          } else {
                            node.nodeValue = new_val;
                          }
                        }
                      }
                    } while ( node = node.nextSibling );
                  }
                  remove.length && $(remove).remove();
                });
              };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function($){
              $.fn.visibles = function() {
                return this.filter(function(){
                  //noinspection JSUnresolvedFunction
                  return !this.isVisible();
                });
              };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function($){ //.withText
              $.fn.withText = function( search ) { //+ text_only second arg unused
                const rv=this.contents().filter(
                  function(){
                    if (this.nodeType!==3) {
                      return false;
                    }
                    //var me=$(this);
                    const txt=this.nodeValue;
                    if (typeof search==='object') {//re
                      return search.test(txt);
                    }
                    return txt.indexOf(search)!==-1;
                  }
                );
                return rv.parent();
             };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function( $ ){ //.getDomPath
              const getStringForElement = function (el) {
                let string = el.tagName.toLowerCase();
                if (el.id) {
                  string += "#" + el.id;
                }
                if (el.className) {
                  if (typeof el.className==='string') {
                    if (el.className!=='') {
                      string += "." + el.className.replace(/\s+/g,' ').replace(/\s/g, '.');
                    }
                  }
                }
                string=string.replace(/\.\.*/,'.');
                return string;
              };
              $.fn.getDomPath = function(string) {
                if (typeof(string) === "undefined") {
                  string = true;
                }
                const p = [];
                const el = $(this).first();
                el.parents().not('html').each(function() {
                  p.push(getStringForElement(this));
                });
                p.reverse();
                p.push(getStringForElement(el[0]));
                return string ? p.join(" > ") : p;
              };
            })( jQuery );
            (function( $, undefined ) { //.simulate
              const rkeyEvent = /^key/,
                rmouseEvent = /^(?:mouse|contextmenu)|click/;
              $.fn.simulate = function( type, options ) {
                return this.each(function() {
                  new $.simulate( this, type, options );
                });
              }; //-simulate
              $.simulate = function( elem, type, options ) {
                const method = $.camelCase( "simulate-" + type );
                this.target = elem;
                this.options = options;
                if ( this[ method ] ) {
                  this[ method ]();
                } else {
                  this.simulateEvent( elem, type, options );
                }
              }; //-simulate
              $.extend( $.simulate, {
                keyCode: {
                  BACKSPACE: 8,
                  COMMA: 188,
                  DELETE: 46,
                  DOWN: 40,
                  END: 35,
                  ENTER: 13,
                  ESCAPE: 27,
                  HOME: 36,
                  LEFT: 37,
                  NUMPAD_ADD: 107,
                  NUMPAD_DECIMAL: 110,
                  NUMPAD_DIVIDE: 111,
                  NUMPAD_ENTER: 108,
                  NUMPAD_MULTIPLY: 106,
                  NUMPAD_SUBTRACT: 109,
                  PAGE_DOWN: 34,
                  PAGE_UP: 33,
                  PERIOD: 190,
                  RIGHT: 39,
                  SPACE: 32,
                  TAB: 9,
                  UP: 38
                }, //-keyCode
                buttonCode: {
                  LEFT: 0,
                  MIDDLE: 1,
                  RIGHT: 2
                } //-buttonCode
              });
              $.extend( $.simulate.prototype, {
                simulateEvent: function( elem, type, options ) {
                  const event = this.createEvent( type, options );
                  this.dispatchEvent( elem, type, event, options );
                }, //-simulateEvent
                createEvent: function( type, options ) {
                  if ( rkeyEvent.test( type ) ) {
                    return this.keyEvent( type, options );
                  }
                  if ( rmouseEvent.test( type ) ) {
                    return this.mouseEvent( type, options );
                  }
                }, //-createEvent
                mouseEvent: function( type, options ) {
                  let event, eventDoc, doc, body;
                  options = $.extend({
                    bubbles: true,
                    cancelable: (type !== "mousemove"),
                    view: window,
                    detail: 0,
                    screenX: 0,
                    screenY: 0,
                    clientX: 1,
                    clientY: 1,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    button: 0,
                    relatedTarget: undefined
                  }, options );
                  if ( document.createEvent ) {
                    event = document.createEvent( "MouseEvents" );
                    //noinspection JSDeprecatedSymbols
                    event.initMouseEvent( type, options.bubbles, options.cancelable,
                      options.view, options.detail,
                      options.screenX, options.screenY, options.clientX, options.clientY,
                      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                      options.button, options.relatedTarget || document.body.parentNode );
                    // IE 9+ creates events with pageX and pageY set to 0.
                    // Trying to modify the properties throws an error,
                    // so we define getters to return the correct values.
                    if ( event.pageX === 0 && event.pageY === 0 && Object.defineProperty ) {
                      eventDoc = event.relatedTarget.ownerDocument || document;
                      doc = eventDoc.documentElement;
                      body = eventDoc.body;
                      Object.defineProperty( event, "pageX", {
                        get: function() {
                          return options.clientX +
                            ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                            ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                        }
                      });
                      Object.defineProperty( event, "pageY", {
                        get: function() {
                          return options.clientY +
                            ( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
                            ( doc && doc.clientTop || body && body.clientTop || 0 );
                        }
                      });
                    }
                  } else if ( document.createEventObject ) {
                    event = document.createEventObject();
                    $.extend( event, options );
                    // standards event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
                    // old IE event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ms533544(v=vs.85).aspx
                    // so we actually need to map the standard back to oldIE
                    event.button = {
                      0: 1,
                      1: 4,
                      2: 2
                    }[ event.button ] || ( event.button === -1 ? 0 : event.button );
                  }
                  return event;
                }, //-mouseEvent
                keyEvent: function( type, options ) {
                  let event;
                  options = $.extend({
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    keyCode: 0,
                    charCode: undefined
                  }, options );
                  if ( document.createEvent ) {
                    try {
                      event = document.createEvent( "KeyEvents" );
                      //noinspection JSUnresolvedFunction
                      event.initKeyEvent( type, options.bubbles, options.cancelable, options.view,
                        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                        options.keyCode, options.charCode );
                    // initKeyEvent throws an exception in WebKit
                    // see: http://stackoverflow.com/questions/6406784/initkeyevent-keypress-only-works-in-firefox-need-a-cross-browser-solution
                    // and also https://bugs.webkit.org/show_bug.cgi?id=13368
                    // fall back to a generic event until we decide to implement initKeyboardEvent
                    } catch( err ) {
                      event = document.createEvent( "Events" );
                      event.initEvent( type, options.bubbles, options.cancelable );
                      $.extend( event, {
                        view: options.view,
                        ctrlKey: options.ctrlKey,
                        altKey: options.altKey,
                        shiftKey: options.shiftKey,
                        metaKey: options.metaKey,
                        keyCode: options.keyCode,
                        charCode: options.charCode
                      });
                    }
                  } else if ( document.createEventObject ) {
                    event = document.createEventObject();
                    $.extend( event, options );
                  }
                  if ( !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() ) || (({}).toString.call( window.opera ) === "[object Opera]") ) {
                    event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
                    event.charCode = undefined;
                  }
                  return event;
                }, //-keyEvent
                dispatchEvent: function( elem, type, event ) {
                  if ( elem[ type ] ) {
                    elem[ type ]();
                  } else if ( elem.dispatchEvent ) {
                    elem.dispatchEvent( event );
                  } else if ( elem.fireEvent ) {
                    elem.fireEvent( "on" + type, event );
                  }
                }, //-dispatchEvent
                simulateFocus: function() {
                  let focusinEvent,
                    triggered = false;
                  const element = $( this.target );
                  function trigger() {
                    triggered = true;
                  }
                  element.bind( "focus", trigger );
                  element[ 0 ].focus();
                  if ( !triggered ) {
                    focusinEvent = $.Event( "focusin" );
                    focusinEvent.preventDefault();
                    element.trigger( focusinEvent );
                    element.triggerHandler( "focus" );
                  }
                  element.unbind( "focus", trigger );
                }, //-simulateFocus
                simulateBlur: function() {
                  let focusoutEvent,
                    triggered = false;
                  const element = $( this.target );
                  function trigger() {
                    triggered = true;
                  }
                  element.bind( "blur", trigger );
                  element[ 0 ].blur();
                  // blur events are async in IE
                  setTimeout(function() {
                    // IE won't let the blur occur if the window is inactive
                    if ( element[ 0 ].ownerDocument.activeElement === element[ 0 ] ) {
                      element[ 0 ].ownerDocument.body.focus();
                    }
                    // Firefox won't trigger events if the window is inactive
                    // IE doesn't trigger events if we had to manually focus the body
                    if ( !triggered ) {
                      focusoutEvent = $.Event( "focusout" );
                      focusoutEvent.preventDefault();
                      element.trigger( focusoutEvent );
                      element.triggerHandler( "blur" );
                    }
                    element.unbind( "blur", trigger );
                  }, 1 );
                } //-simulateBlur
              });
              /** complex events **/
              function findCenter( elem ) {
                const document = $( elem.ownerDocument );
                elem = $( elem );
                const offset = elem.offset();
                //noinspection JSUnresolvedFunction
                return {
                  //noinspection JSUnresolvedFunction
                  x: offset.left + elem.outerWidth() / 2 - document['scrollLeft'](),
                  //noinspection JSUnresolvedFunction
                  y: offset.top + elem.outerHeight() / 2 - document['scrollTop']()
                };
              }
              function findCorner( elem ) {
                const document = $( elem.ownerDocument );
                elem = $( elem );
                const offset = elem.offset();
                //noinspection JSUnresolvedFunction
                return {
                  x: offset.left - document['scrollLeft'](),
                  y: offset.top - document['scrollTop']()
                };
              }
              $.extend( $.simulate.prototype, {
                simulateDrag: function() {
                  let i = 0;
                  const target = this.target;
                  const eventDoc = target.ownerDocument;
                  const options = this.options;
                  const center = options.handle === "corner" ? findCorner( target ) : findCenter( target );
                  let x = Math.floor( center.x );
                  let y = Math.floor( center.y );
                  let coord = { clientX: x, clientY: y };
                  //noinspection JSUnresolvedVariable
                  const dx = options.dx || ( options.x !== undefined ? options.x - x : 0 );
                  //noinspection JSUnresolvedVariable
                  const dy = options.dy || ( options.y !== undefined ? options.y - y : 0 );
                  //noinspection JSUnresolvedVariable
                  const moves = options.moves || 3;
                  this.simulateEvent( target, "mousedown", coord );
                  for ( ; i < moves ; i++ ) {
                    x += dx / moves;
                    y += dy / moves;
                    coord = {
                      clientX: Math.round( x ),
                      clientY: Math.round( y )
                    };
                    this.simulateEvent( eventDoc, "mousemove", coord );
                  }
                  if ( $.contains( eventDoc, target ) ) {
                    this.simulateEvent( target, "mouseup", coord );
                    this.simulateEvent( target, "click", coord );
                  } else {
                    this.simulateEvent( eventDoc, "mouseup", coord );
                  }
                } //-simulateDrag
              });
            })( jQuery );
            $.fn.extend({ //.hasClasses
              hasClasses: function (selectors) {
                const self = this;
                selectors=typeof selectors==='string'?selectors.split(' '):selectors;
                for (const i in selectors) {
                  if (!selectors.hasOwnProperty(i)) {
                    continue;
                  }
                  if ($(self).hasClass(selectors[i])) {
                    return true;
                  }
                }
                return false;
              } // fn
            });
            /*
             * outerHtml
             * https://github.com/JamesMGreene/jquery.outerHtml
             *
             * Copyright (c) 2013 James M. Greene
             * Licensed under the MIT license.
             */
            (function($) { //.outerHtml
              'use strict';
              //noinspection PointlessBooleanExpressionJS
              const hasNativeOuterHTML = !!('outerHTML' in $('<div></div>').get(0));
              // Prefer the native `outerHTML` property when possible
              const getterFn = function() {
                const target = this.get(0);
                // If the browser supports the `outerHTML` property on elements AND if `target` is an element node
                if (hasNativeOuterHTML && target.nodeType === 1) {
                  return target.outerHTML;
                }else {
                  return $('<div></div>').append(this.eq(0).clone()).html();
                }
              }; //-getterFn
              const setterFn = function(value) {
                // Do not attempt to replace anything using the native `outerHTML` property setter
                // even if it exists: it is riddled with bugs!
                return $('<div id="jquery-outerHtml-transformer"></div>').append(value).contents().replaceAll(this);
              }; //-setterFn
              // Detect jQuery 1.8.x bug (for which the value here is `false`)
              let doesNotLeaveTempParentOnDetachedDomElement = true;
              $.fn.outerHtml = function(value) {
                if (arguments.length) {
                  if (doesNotLeaveTempParentOnDetachedDomElement) {
                    return setterFn.call(this, value);
                  }
                  else {
                    // Fix for jQuery 1.8.x bug: https://github.com/JamesMGreene/jquery.outerHtml/issues/1
                    const parentsOfThis = (function() {
                      const parents = new Array(this.length);
                      this.each(function(i) {
                        parents[i] = this.parentNode || null;
                      });
                      return parents;
                    }).call(this);
                    return setterFn['call'](this, value).map(function(i) {
                      if (!parentsOfThis[i]) {
                        if (this.parentNode) {
                          return this.parentNode.removeChild(this);
                        }
                      }
                      else if (parentsOfThis[i] !== this.parentNode) {
                        // Appending to the end: this doesn't seem right but it should cover the detached DOM scenarios
                        return parentsOfThis[i].appendChild(this);
                      }
                      return this;
                    });
                  }
                }
                else {
                  return getterFn.call(this);
                }
              }; //-outerHtml
              // Detect jQuery 1.8.x bug (for which the value here is `false`)
              doesNotLeaveTempParentOnDetachedDomElement = (function() {
                const parent = $('<s>bad</s>').outerHtml('<div>good</div>').get(0).parentNode;
                return (parent.nodeName === '#document-fragment' && parent.nodeType === 11);
              })();
            }(jQuery));
            } //-jquery_addons
          ,libs:function(){                //inits.
            __.libs._init();
            } //-libs
          ,hooks:function(){               //inits.
            __.hooks._init();
            } //-hooks
          ,styles:function(){              //inits.
            __.style._init();
            } //-styles
          ,ui:function(){                  //inits.
            __.ui._init();
            } //-ui
          ,_init_:function(){              //inits.
            __.utils.body_msg('inits...');
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
            this.protos();
            this.jquery_addons();
            this.libs();
            this.hooks();
            this.styles();
            this.ui();
            //__.inits.messaging();
            //__.ctrls._init();
            //__.inits.dom_hook();
            //+this.keyset();
            //+this.key_hook();
            //__.inits.styles();
            'onLoad'._bc();
            __.utils.body_msg('inits done!');
            //this.fixes();
            } //-_init_
          ,_init:function(){               //inits.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            //__.utils.addScript('http://mrobbinsassoc.com/projects/keyprism3/tinycolor.js');
            this._init_();
            } //-_init
          } //-inits
        ,init:{                            //main
          _name:'init'
          ,_init_:function(){ //init.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init_');}
            __.inits._init();
            } //-_init_
          ,_init:function(){ //init.
            if (__.set.bugInits) {console.info('bugInits:'+this._name+'_init');}
            //console.info('__.init._init');
            this._init_();
            console.log('__.init() completed');
            } //-_init
          } //-init
        }; //-window.__
      const __=window.__;
      (function(){
        function waiter(){
          if (!__.state.isViewLoaded()) {
            console.log('!__.state.isViewLoaded() in WebBrain');
            setTimeout(waiter,500);
            return;
          }
          setTimeout(function(){
            console.log('__.init._init() in WebBrain');
            __.init._init();
          },100);
        }
        waiter();
      }());// - function
    })();
  } // waitJq
  waitJq()
})();

