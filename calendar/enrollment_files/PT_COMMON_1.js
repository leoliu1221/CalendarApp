/*  Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.
    ToolsRel: 8.52.10 */
// JScript File PT common functions

var gFocusId = null;
function PT_createStandardObjects()
{
    browserInfoObj2 = new PT_browserInfo();  // Create browser info object
    browserInfoObj2.init();
    ptCommonObj2 = new PT_common();  // Create common object for utility functions.
    ptConsole2 = new PT_console();   // debugger console
    ptRC2 = new PT_RC();     // related content object
}

function PT_console()
{
this.el = null;
this.enabled = false;
this.activated = false;
}

PT_console.prototype = {
isActive: function() {
return this.activated;
},
isEnabled:function(){
if (this.el && this.enabled) return true;
return false;
},
enable:function(){
if (this.isEnabled()) return;
this.enabled = true;
this.el = document.getElementById("pt_console");
var oBody = document.body;
oObj = document.createElement("div");
oObj.setAttribute("id", "pt_console");
oBody.appendChild(oObj);
this.el = document.getElementById("pt_console");
this.el.consoleModal=this;
this.el.innerHTML="<input type=button id='COPYCONSOLE' value='Copy' onclick='ptConsole2.copy();' alt='copy to clipboard' title='copy to clipboard'><input type=button id='CLEARCONSOLE' onclick='ptConsole2.clear();' value='Clear' alt='clear console' title='clear console'><input type=button id='HIDECONSOLE' onclick='ptConsole2.hide();' value='Hide' alt='hide console' title='hide console'><input type=button id='CLOSECONSOLE' onclick='ptConsole2.deactive();' value='Close' alt='close console' title='close console'>";

},
active:function(){
if (!this.enabled) return false;
if (!this.el)
{
this.el = document.getElementById("pt_console");
if (!this.el) return null;
}
if (this.el.innerHTML == "")
    this.el.innerHTML="<input type=button id='COPYCONSOLE' value='Copy' onclick='ptConsole2.copy();' alt='copy to clipboard' title='copy to clipboard'><input type=button id='CLEARCONSOLE' onclick='ptConsole2.clear();' value='Clear' alt='clear console' title='clear console'><input type=button id='HIDECONSOLE' onclick='ptConsole2.hide();' value='Hide' alt='hide console' title='hide console'><input type=button id='CLOSECONSOLE' onclick='ptConsole2.deactive();' value='Close' alt='close console' title='close console'>";

this.show();
this.activated = true;
},
deactive:function(){
if (!this.enabled) return false;
this.hide();
if (this.el)
    this.el.innerHtml = "";
this.el = null;
this.activated = false;
},
show:function(){
if (!this.el) return false;
this.el.style.display = "block";
this.el.style.top = 75 + 'px';
this.el.style.left = (ptCommonObj2.getViewportWidth(window) - this.el.clientWidth - 10) + 'px';
},
hide:function(){
if (!this.el) return false;
this.el.style.display = "none";
},
copy:function(){
if (!this.el) return false;
var txt='';
for (var i=0; i<this.el.childNodes.length; i++) {
    var node=this.el.childNodes[i];
    if (node.nodeName.toLowerCase() == 'div')
    {
    if (node.lastChild.nodeName.toLowerCase() == 'textarea')
        txt=txt+node.lastChild.value+'\n\n';
    }
 }
if (browserInfoObj2.isIE)
    clipboardData.setData("Text", txt);
else 
    this.append(txt);
},
clear:function(){
if (!this.el) return false;
while(this.el.lastChild && this.el.lastChild.type!='button') {
this.el.removeChild(this.el.lastChild);
}
},
append:function(msg){
if (!this.el) return false;
var txtNode=document.createElement('textarea');//document.createTextNode(msg);
txtNode.className='debugtext';
txtNode.readOnly = 'true';
txtNode.value=msg;
var domEl=document.createElement('div');
domEl.appendChild(txtNode);
domEl.className='debugtext';
this.el.appendChild(domEl);
}
} 

function PT_browserInfo()
{
    this.browser=''; // Complete user agent information
    this.isOpera=false; // Is the browser "Opera"
    this.isIE=false; // Is the browser "Internet Explorer"
    this.isFF=false; // Is the browser "Firefox"
    this.isNetscape; // Is the browser "Netscape"
    this.isMozilla = false;
    this.isSafari = false;
    this.version=''; // Browser version
    this.isMacOS=false;
    this.isSafari2x = false;
    this.isiPad = false;
    this.isiOS5 = false;
}

PT_browserInfo.prototype = {
init:function(){
this.browser = navigator.userAgent.toLowerCase();
//this.isMacOS = (this.browser.toLowerCase().indexOf('macintosh')!= -1)?true:false;
this.isOpera = (this.browser.toLowerCase().indexOf('opera')>=0)?true:false;
this.isFF = (this.browser.toLowerCase().indexOf('firefox')>=0)?true:false;
this.isNetscape = (this.browser.toLowerCase().indexOf('netscape')>=0)?true:false;
this.isIE = (this.browser.toLowerCase().indexOf('msie')>=0)?true:false;
this.version = navigator.appVersion.replace(/.*?MSIE (\d\.\d).*/g,'$1')/1;
this.isSafari = /webkit/.test(this.browser);
this.isMozilla = /mozilla/.test(this.browser) && !/(compatible|webkit)/.test(this.browser);
//this.isSafari2x = browserInfoObj2.Safari2x(this.browser);
this.isSafari2x = this.Safari2x(this.browser);
this.isiPad = (this.browser.toLowerCase().indexOf('ipad')>=0)?true:false;
this.isiOS5 = /os 5/i.test(this.browser);
},

// Check for Safari 2.x.
// Note that Safari 2.x does not have the version info in the user agent. We will need to use the WebKit build information
// to determine the actual version. For details, see http://developer.apple.com/internet/safari/uamatrix.html
Safari2x : function (userAgent) {
    if (userAgent == null)
        return false;
    var bSafari2x = false;
    var WEBKITBUILD412 = 412.0;      // Safari 2.0
    var WEBKITBUILD419DOT3 = 419.3;  // Safari 2.0.4
    var WEBKITSTR = "applewebkit/";  // webkit build string
    var HTMLSTR = " (khtml";         // the actual webkitbuild is before
    var webKitBuild = 0;             // default value of webkit build

    var i = userAgent.toLowerCase().indexOf(WEBKITSTR);
    var j = userAgent.toLowerCase().indexOf(HTMLSTR);
    if (i >= 0 && j >= 0) {
        var b = i + WEBKITSTR.length; // beginning of webkit build
        var webKitBuildLen = j - b;   // length of webKit build
        webKitBuild = userAgent.substring(b, b + webKitBuildLen);
        //alert("i,j,b,webKitBuildLen,webKitBuild = " + i +","+ j+","+ b+","+webKitBuildLen+","+ webKitBuild);
        if (webKitBuild >= WEBKITBUILD412 && webKitBuild <= WEBKITBUILD419DOT3)
            bSafari2x = true;
    }
    return bSafari2x;
}
} 

/* Constructor */
function PT_common()
{}

PT_common.prototype = {

isHTMLTemplate : typeof(bPSHTMLtemplate) !== "undefined" && bPSHTMLtemplate,

 //  cancelEvent() function only returns false. It is used to cancel selections and drag
cancelEvent : function()
    {
        return false;
    },

//used by popup getclient height
    getViewportHeight: function(oWin) {
        if (!oWin) oWin = window;
        if (oWin.innerHeight != oWin.undefined)
            return oWin.innerHeight;
        if (oWin.document.compatMode == 'CSS1Compat')
            return oWin.document.documentElement.clientHeight;
        if (oWin.document.body)
            return oWin.document.body.clientHeight;
        return oWin.undefined;
    },
    // get client width. used in popup for prompt and message dialog
    getViewportWidth: function(oWin) {

        if (!oWin) oWin = window;
        if (oWin.innerWidth != oWin.undefined)
            return oWin.innerWidth;
        if (oWin.document.compatMode == 'CSS1Compat')
            return oWin.document.documentElement.clientWidth;
        if (oWin.document.body)
            return oWin.document.body.clientWidth;
        return oWin.undefined;
    },

getMouseCoords : function(ev)
{
   
   
   if('ltr'=='rtl' && browserInfoObj2.isIE)
      {
      var scLeft= parseInt((document.body.scrollWidth - document.body.clientWidth- document.body.scrollLeft),10);
      var newX=ev.clientX;
      if (scLeft > 0 && ev.clientX>=scLeft)
          newX = ev.clientX - scLeft; 
      if(ev.pageX || ev.pageY)
         return {x:newX, y:ev.pageY};
      else
         return {x:newX, y:ev.clientY + document.body.scrollTop  - document.body.clientTop};
      }

   if(ev.pageX || ev.pageY)
      return {x:ev.pageX, y:ev.pageY};

   return { x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,  y:ev.clientY + document.body.scrollTop  - document.body.clientTop };
},

getMouseOffset : function(target, ev)
{
    ev = ev || window.event;
    
    var docPos    = this.getPosition(target);
    var mousePos  = this.getMouseCoords(ev);
    return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
},

getPosition2 : function(e, formName)
{
    var left = 0;
    var top  = 0;
    var oParent=null;
    var SGRIDLEFTSIDE = "divgbl";              // grid left-side: frozen side
    var SGRIDRIGHTSIDE = "divgbr";     // grid right-side: unfrozen side
    var SGRIDLEFTSIDE_FIREFOX = "tdgbl";       // grid left-side: frozen side
    var SGRIDRIGHTSIDE_FIREFOX = "tdgbr";      // grid right-side: unfrozen side
    var bFound=false;
    var nLen=0;

    while (e.offsetParent)
        {
        if (e.tagName!='HTML')
           {
           if ('ltr' =='rtl')
              {
              if (!(e.offsetLeft<0 && e.scrollLeft ==0)) 
                 left += e.offsetLeft;
              }
           else 
              left += e.offsetLeft;
           
           top  += e.offsetTop;
           if ('ltr' != 'rtl')  
              {
              if (!bFound && (e.id.search(SGRIDLEFTSIDE) == 0 || e.id.search(SGRIDRIGHTSIDE) == 0) )
                  nLen = SGRIDLEFTSIDE.length;
              else if (!bFound && (e.id.search(SGRIDLEFTSIDE_FIREFOX) == 0 || e.id.search(SGRIDRIGHTSIDE_FIREFOX) == 0) ) 
                  nLen = SGRIDLEFTSIDE_FIREFOX.length;
              if (!bFound && nLen >0) 
                 {
                 bFound = true;
                 var gridID = e.id.substring(nLen);
                 nLen=0;
                 var sScript = "var oScrollPos = ptGridObj_" + formName +".getScrollPos(gridID);";
                 eval(sScript);   // get saved scrollLeft and scrollTop for the concerned grid -- note: something special in AJAX update of html DOM
                 top -= oScrollPos.y;
                 if (e.id.search(SGRIDRIGHTSIDE) == 0 || e.id.search(SGRIDRIGHTSIDE_FIREFOX) == 0)      // grid horizontal scroll is in the unfrozen section
                     left -= oScrollPos.x;
                 }  
              }  // end of  if ('ltr' != 'rtl') 
           }        // end of if (e.tagName!='HTML')
        else
           oParent=e.offsetParent;
        e  = e.offsetParent;
        }   // end of while loop
    
    if ('ltr' =='rtl')
       {
       if (!(e.offsetLeft<0 && e.scrollLeft ==0)) 
           left += e.offsetLeft;
       }
    else
       left += e.offsetLeft;
    top  += e.offsetTop;

    return {x:left, y:top};
},

getPosition : function(e)
{
    var left = 0;
    var top  = 0;
    var oParent=null;
    while (e.offsetParent)
    {
        if (e.tagName!='HTML')
           {
           if ('ltr' =='rtl')
              {
              if (!(e.offsetLeft<0 && e.scrollLeft ==0)) 
                 left += e.offsetLeft;
              }
           else 
              left += e.offsetLeft;
           top  += e.offsetTop;
           }
        else
           oParent=e.offsetParent;
        e  = e.offsetParent;
    }
    
    if ('ltr' =='rtl')
       {
       if (!(e.offsetLeft<0 && e.scrollLeft ==0)) 
           left += e.offsetLeft;
       }
    else
       left += e.offsetLeft;
    top  += e.offsetTop;

    return {x:left, y:top};
},

//method will return the top coordinate(pixel) of an object. used in drag & drop
getTopPos : function(inputObj)
{
  if (inputObj == null)
      return 0;
  var returnValue = inputObj.offsetTop;
  while((inputObj = inputObj.offsetParent) != null){
    if(inputObj.tagName!='HTML'){
        returnValue -=inputObj.scrollTop;
        returnValue += inputObj.offsetTop;
        if(document.all)returnValue+=inputObj.clientTop;
    }
  }
  //if (window == top) returnValue -= 94; //don't count pagelet header

  return returnValue;
},
// getLeftPos() method will return the left coordinate(pixel) of an object. Used in drag & drop
getLeftPos:function(inputObj)
{
  if (inputObj == null)
      return 0;
  var returnValue = inputObj.offsetLeft;
  if (inputObj.offsetParent)
  {
  while((inputObj = inputObj.offsetParent) != null){
    if(inputObj.tagName!='HTML'){
        returnValue -=inputObj.scrollLeft;
        returnValue += inputObj.offsetLeft;
        if(document.all)returnValue+=inputObj.clientLeft;
    }
  }
  }

  return returnValue;
},

//get name and value pair for an element
getNV:function(el)
{
 var nv="";
 if (el == null || el.disabled)
    return nv;
 switch(el.type)
 {
    case "button":
      if (el.checked)
        nv = el.name + "=" + encodeURIComponent(el.value)+"&";
      break;
   case "radio":
     if (el.checked)
        nv = el.name + "=" + encodeURIComponent(el.value)+"&";
      break;
   case "select-one":
        if (el.selectedIndex>-1)
        nv = el.name + "=" + encodeURIComponent(el.options[el.selectedIndex].value)+"&";
        break;
   case "select-multiple":
        var i=0;
        for (i=0;i<el.options.length;i++)
           {
           if (el.options[i].selected)
               nv += (el.name + "=" + encodeURIComponent(el.options[i].value)+"&");
           }
        break;
    default:
       nv = el.name + "=" +encodeURIComponent(el.value)+"&";
  }
  return nv;
},
// available on IE only. Find the current active element and set focus.
setActiveFocus:function()
{
  var b = navigator.userAgent.toLowerCase();
  if (b.indexOf("msie")!=-1)
  {
  var cObj = document.activeElement;
  if (cObj)
  {
  //alert(cObj.type);
  cObj.setActive();
  cObj.focus();
  }
  }
},

tryFocus:function(obj)
{
if (!this.tryFocus0(obj))    
    gFocusId = obj.id;
return;
},

tryFocus0:function(obj)
{
if (obj && typeof obj.focus != "undefined" && !obj.disabled && obj.style.visibility!="hidden")
{
    var b = navigator.userAgent.toLowerCase();
    obj.focus();
    if (b.indexOf("msie")!=-1)
        obj.setActive();
    if (window.focusHook)
        focusHook(obj);
    return false;
}
return true;
},

//set resize cursor
setResizeCursor:function(evt){var o=getEO(evt);if (o && o != "undefined")    o.style.cursor='E-resize';},

//get event obj
getEO:function(evt)
{
if (!evt)
    evt = event;
if (!evt)
    evt = window.event;
if (!evt)
    return null;
if (browserInfoObj2.isIE)
    return evt.srcElement;
else
    return evt.target;
},

//is PIA ajax req
isAJAXReq:function(form, name)
{

if (form.enctype && form.enctype.indexOf('multipart') != -1 && name.indexOf("#ICOK") != -1)
    return false;

if (typeof window.bUIMsg != 'undefined' && window.bUIMsg)
    return false;

if (!name)
    return false;

//for new modal
if (typeof window.winParent != 'undefined' && window.winParent != null) 
    return true;

/*if (!(typeof bPSHTMLtemplate == "undefined" || !bPSHTMLtemplate))
    return false;*/

var BrType = new PT_browserInfo();
BrType.init();
var bSfr=BrType.isSafari;
if(bSfr)
  {
//disable ajax support for chart for now(7lines) for SAFARI
    /// ImageMap!!
   if( name.indexOf('$alic')!=-1
    || name.indexOf('$agdn')!=-1
    || name.indexOf('$mvsk')!=-1
    || name.indexOf('$area')!=-1
    || name.indexOf('$right_arrow')!=-1
    || name.indexOf('$left_arrow')!=-1
    || name.indexOf('$expand')!=-1
    )
    {
     return false;
     }

   }

if (name.indexOf('ICQryName') != -1
  || name.indexOf('ICQryDownload') != -1
  || name.indexOf("ICCustPage") != -1
  || name.indexOf("#ICCancelCustPage") != -1
  || name.indexOf("#ICSaveCustPage") != -1
  || name.indexOf("#ICRestDflt") != -1
//|| (name.indexOf('#KEY')!=-1 && name != '#KEYA5' && name.charCodeAt(4) != 13)  
    )
    {
   return false;
    }
else
    {
   return true;
    }
},

//is PIA search page, not add, but search
isSearchSearchPage:function(form)
{
    if (form)
        {
        var searchMsg = "Search";
        var oElement = form.elements["#ICSearch"];
        var cElement = form.elements["#ICCancel"];
        if (cElement != null)       
            return false;
        if (oElement != null && oElement.value.indexOf(searchMsg)==0 && searchMsg.length==oElement.value.length)
            return true;
        }
},

//is PIA search page
isSearchPage:function(form)
{
    if (form)
        {
        var oElement = form.elements["#ICSearch"];
        if (oElement != null)
            return true;
        }
},



getAbsolutePosition:function(element) 
{
    var r = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
          var tmp = this.getAbsolutePosition(element.offsetParent);
          r.x += tmp.x;
          r.y += tmp.y;
    }
    return r;
},

getRelativeCoordinates:function(event, reference) 
{
    var x = 0;
    var y = 0;
    event = event || window.event;
    var el = event.target || event.srcElement;

    if (!window.opera && typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the reference element.
      var e = document.getElementById(reference);
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = this.getAbsolutePosition(document.getElementById(reference));
      x = event.pageX  - pos.x;
      y = event.pageY - pos.y;
    }

    // Subtract distance to middle
    return { x: x, y: y };
},


// move universal srch div
moveUnivSrchDiv:function()
{
  if (!parent.updSrchGrpList) {
    return;
  }

  try {
    var elemPortal = document.getElementById("ptus_portal");
     var univSrch = "ptus_universalSrch";
    var usDiv = document.getElementById(univSrch);
     if (elemPortal && elemPortal.parentNode)
        usDiv = elemPortal.parentNode;

    if (usDiv) {
      if (usDiv.parentNode.id != 'pthdr2srchgbl') {    
        srchhdr = parent.document.getElementById("pthdr2srchgbl");
        if (!srchhdr) {
            var searchHdrElems = parent.document.getElementsByName("searchhdr");
            if (searchHdrElems) {
                srchhdr = searchHdrElems[0];
            }
        }
 
        if (srchhdr) { 
          // remove universalSrch div from pia content page 
          usDiv = usDiv.parentNode.removeChild(usDiv);
 
          // if (!isCrossDomain(top) && typeof(top.ptIframe) != "undefined") {
          if (!isCrossDomain(top)) {
             // remove it, if parent document already has an element with that name
             var tmp = parent.document.getElementById(univSrch);
             if (tmp)
                  tmp.parentNode.removeChild(tmp);
 
             var newNode = parent.document.createElement("div");
             newNode.style.visibility="hidden";
             newNode.style.display = "none";
             newNode.innerHTML = usDiv.innerHTML; 
             newNode.id = univSrch;       
             srchhdr.appendChild(newNode);

            
            parent.updSrchGrpList();            
          }
        } 
      }
    }
  } catch (e) {
     alert(e.message);
  }
},


// expand or collapse search criteria
expandOrCollapseSearchCriteria:function(form)
{
    var elemAdv = document.getElementById(form.name+'divSEARCHADV');
    if (elemAdv && elemAdv.style.display == 'none')
        this.expandSearchCriteria(form, false);
    else
        this.expandSearchCriteria(form, true);
},


// expand or collapse search criteria
expandSearchCriteria:function(form, bExpand)
{
    var elemAbove = document.getElementById(form.name+'divSEARCHABOVE');
    var elemAdv = document.getElementById(form.name+'divSEARCHADV');
    var elemBelow = document.getElementById(form.name+'divSEARCHBELOW');
    var elemImgCollapse = document.getElementById('collapseSrchCriteria');
    var elemImgExpand = document.getElementById('expandSrchCriteria');
    var elemImgSrchInstructions = document.getElementById('srchInstructions');
    var elemTblPsTabs = document.getElementById('tblpstabs');    

    if (bExpand) {
        if (elemAbove) {
            elemAbove.style.display="block";
        }
        if (elemAdv) {
            elemAdv.style.display="block";
        }
        if (elemBelow) {
            elemBelow.style.display="block";
        }
        if (elemImgExpand) {
            elemImgExpand.style.display="inline-block";
        }
        if (elemImgCollapse) {
            elemImgCollapse.style.display="none";
        }
        if (elemImgSrchInstructions) {
            // elemImgSrchInstructions.style.visibility="visible";
            elemImgSrchInstructions.style.display="block";
        }
    }
    else {
        if (elemAbove) {
            elemAbove.style.display="none";
        }
        if (elemAdv) {
            elemAdv.style.display="none";
        }
        if (elemBelow) {
            elemBelow.style.display="none";
        }
        if (elemImgExpand) {
            elemImgExpand.style.display="none";
        }
        if (elemImgCollapse) {
            elemImgCollapse.style.display="inline";
        }
        if (elemImgSrchInstructions) {
            elemImgSrchInstructions.style.display="none";
        }
    }

    // set the Search criteria groupbox width
    var elemSrchCriteria = document.getElementById(form.name+'divSrchCriteria');
    var elemTblSrchFlds = document.getElementById(form.name+'tblSrchFlds');
    var elemTblSrchKeyword = document.getElementById(form.name+'tblSrchKeyword');

    var elemKeywordSrchHelp = document.getElementById('keywordsrchhelp');

    if (elemSrchCriteria && (elemTblSrchFlds || elemTblSrchKeyword || elemKeywordSrchHelp)) {
        var tblWidth0 = 0;
        var tblWidth1 = 0;
        var tblWidth2 = 0;

        if (elemTblSrchKeyword)
             tblWidth0 = elemTblSrchKeyword.offsetWidth;
        if (elemTblSrchFlds)
            tblWidth1 = elemTblSrchFlds.offsetWidth;
        var wid = tblWidth0;
        if (tblWidth1 > tblWidth0)
            wid = tblWidth1;

        // in case of component search invoked from global search
        // check if elemKeywordSrchHelp is null or not, else error inside wsrp   
        if ((wid <= 0) && (elemKeywordSrchHelp))
            wid = elemKeywordSrchHelp.offsetWidth;

        if (wid > 10)
            elemSrchCriteria.style.width = wid;
    }
    
    // move the help image
    var elemTblKeywrodSrchHelp = document.getElementById('tblkeywordsrchhlp');    
    var elemTabs = document.getElementById('PSTAB');
    if (elemTblKeywrodSrchHelp && elemTabs)    
        elemTblKeywrodSrchHelp.width = elemTabs.offsetWidth;    
},


generateABNSearchResults:function(form)
{
  try {
    var globalSearch = false;
    var abnSearchResults = document.getElementById(form.name+'divabnsearchresults');
    if (!abnSearchResults) {
        abnSearchResults = document.getElementById(form.name+'divabnsearchresultsGbl');
        if (abnSearchResults)
            globalSearch = true;
    }
    if (abnSearchResults) {

        var abntbl = document.getElementById("ptabndt");
        var abnlist = document.getElementById("ptabndatalist");
        if (abntbl || abnlist) {    
            
            if (!globalSearch) {
                var abnSearchResultsGbl = abnSearchResults.cloneNode(true);
                 abnSearchResultsGbl.id = form.name+'divabnsearchresultsGbl';
                  abnSearchResultsGbl = abnSearchResults.parentNode.appendChild(abnSearchResultsGbl);
                  abnSearchResults = abnSearchResults.parentNode.removeChild(abnSearchResults);
                  abnSearchResultsGbl = abnSearchResultsGbl.parentNode.removeChild(abnSearchResultsGbl);
                  abnSearchResults.style.display = "block";
                  abnSearchResultsGbl.style.display = "block";
            }
            else {
                abnSearchResults = abnSearchResults.parentNode.removeChild(abnSearchResults);
                abnSearchResults.style.display = "block";
                var abnSearchResultsGbl = abnSearchResults;
            }
      
            
            var doclocation = document.location.href;
            var index = doclocation.indexOf('?');
            var actionurl = '';
            if (index > 0) {
              actionurl = doclocation.substr(0,index);
            }
            else {
              actionurl = doclocation;
            }
            
            
            if (this.isClass(abnSearchResults,"ptabncustom")) {
              
              if (typeof(top.pthNav) !== "undefined" && top.pthNav.abn.search) {
                  top.pthNav.abn.search.add(actionurl,abnSearchResults,this.setABNCustomSearchFormParams(form));
              }
              if (typeof(top.searchGbl) !== "undefined") {
                  top.searchGbl.add(actionurl,abnSearchResultsGbl, this.setABNCustomSearchFormParams(form));
              }
            } else { 
                  if (!globalSearch && typeof(top.pthNav) !== "undefined" && top.pthNav.abn.search) { 
                      top.pthNav.abn.search.add(actionurl,abnSearchResults);
                      if (typeof(top.searchGbl) !== "undefined") {
                          top.searchGbl.add(actionurl,abnSearchResultsGbl);
                      }
                  }
                  else if (typeof(top.searchGbl) !== "undefined") { 
                      top.searchGbl.add(actionurl,abnSearchResultsGbl);
                  }
              }
        }
      }
  } catch (e) {}
},

// set the NV params for custom search
setABNCustomSearchFormParams:function(form)
{
    var customSearchParams = "{\"ptCustomSearch\":[";
    var bFirstParam = true;
    for (var i = 0; i < form.elements.length; i++) {    
        var tempId = form.elements[i].id;
        if ((tempId == "#ICIncludeHistory" || tempId == "#ICCorrectHistory" ||
             tempId == "#ICMatchCase") && !form.elements[i].checked) {
             continue;
          } else {    // exclude unchecked checkbox and radio button
            if (form.elements[i].tagName == "INPUT" &&
                 (form.elements[i].type == "checkbox" || form.elements[i].type == "radio") ) {
                if (!form.elements[i].checked) {
                    continue;
                }
            }
            if (tempId == "ICRefresh" || tempId == "okbuttonModal" || form.elements[i].type == "button") {
                continue;
            }    
         }
        
        // e.g. var customSearch = "{\"ptCustomSearch\":[{\"name\":\"snap\",\"value\":\"myvalue1\"},{\"name\":\"crackle\",\"value\":\"myvalue2\"},{\"name\":\"pop\",\"value\":\"myvalue3\"}]}";
        if (!bFirstParam) { customSearchParams += ","; }
        bFirstParam = false;
        
        // res # 842245
        var paramValue = form.elements[i].value;
        if (tempId == "ICAction")
            paramValue = "";            
    var paramValue = form.elements[i].value;

        customSearchParams += this.getCustomSearchNV(form.elements[i].name, paramValue);
    } // for
        
    if (!bFirstParam) { customSearchParams += ","; }

    customSearchParams += this.getCustomSearchNV('ICABNSEARCHRESULT', '1');
    customSearchParams += ']}';
    return customSearchParams;
},

// get NV for custom search param
getCustomSearchNV:function(paramName, paramValue)
{
    return "{\"name\":\"" + paramName + "\",\"value\":\"" + paramValue + "\"}";
},

// submitAction from dropdown menu search results
submitABNAction:function(form,name)
{
    if (!/\/h\/\?tab=/.test(location)) { 
        parent.pthNav.abn.search.doSubmitABN(name);
    } else {
        pthNav.abn.search.doSubmitABN(name);
    }
},

isClass:function(el,cName) {
  if (!el) { return false; }

  
  var classes = el.className;
  if (!classes) { return false; }
        
  
  if (classes === cName) { return true; }

  
  var whiteSpace = /\s+/;
  if (!whiteSpace.test(classes)) { return false; }

  
  
  var c = classes.split(whiteSpace);
  for (var i = 0; i < c.length; i++) {
    if (c[i] === cName) { return true; }
  }
  return false;
},

clearABNSearchResults:function() {
    try { 
        var dn = top.document.domain;
        try { 
            if (typeof(top.pthNav) !== "undefined" && 
                typeof(top.pthNav.abn) !== "undefined" && 
                typeof(top.pthNav.abn.search) !== "undefined") { 
                top.pthNav.abn.search.clearData(true);
            }     
        } catch (ex2) {} 
    } catch (ex1) {}
},
//is PIA prompt req
isPromptReq:function(name)
{
if (name && (name.indexOf("$prompt")!=-1 || name == '#KEYA5'))
    return true;
else
    return false;
},
//for PIA collasible group box
expcolGrp:function(id,colurl,colalt,expurl,expalt)
{
var objGrp = document.getElementById("divgrp"+id);
var objimg = document.getElementById(id+"$img");
if (objGrp.style.display=="none")
{
    objGrp.style.display="block";
    objimg.src = colurl;
    objimg.title = colalt;
    objimg.alt = colalt;
}
else
{
    objGrp.style.display="none";
    objimg.src = expurl;
    objimg.title = expalt;
    objimg.alt = expalt;
}
},


//get name and  value pair from the url
getParam:function(url,name)
{
    var queryString = null;
    if (url.indexOf("?")!=-1)
       queryString = new String(url.substring(url.indexOf("?")+1,url.length));
    var paramList = null;
    if (queryString)
        paramList = queryString.split("&");
    if (paramList)
    {
        for (var j = 0; j < paramList.length; j++)
        {
            var tmp = new String(paramList[j]);
            if (tmp.indexOf(name+"=")!=-1)
            {
               return tmp.substring(tmp.indexOf(name+"=")+name.length+1,tmp.length);
            }
        }
    }
    return null;
},
canFocus:function(obj)
{
if (!obj) return false;
if (!obj.type && !obj.href) return false;
if (obj && typeof obj.focus != "undefined" && !obj.disabled && obj.style.visibility!="hidden")
    return true;
else
    return false;
},
getPixValue:function(v)
{
if (v && (v.indexOf('px')!=-1 || v.indexOf('em')!=-1 ))
    return new Number(v.substring(0,v.length-2).valueOf());
else
    return new Number(v.valueOf());
},
 getHeight: function(o) {
    if (!o || typeof o == 'undefined') return 0;
    var h = o.style.height;
    if (typeof h != 'undefined' && h != "")
        return this.getPixValue(h);
    else if (typeof o.height != 'undefined' && o.height != "")
        return o.height;
    else return 0;
},
getWidth: function(o) {
    if (!o || typeof o == 'undefined') return 0;
    var w = o.style.width;
    if (typeof w != 'undefined' && w != "")
        return this.getPixValue(w);
    else if (typeof o.width != 'undefined' && o.width != "")
        return o.width;
    else return 0;
},
terminateEvent:function(e)
{
e = e || window.event;
if (e.stopPropagation != undefined) e.stopPropagation();
else if (e.cancelBubble != undefined) e.cancelBubble = true;
if (e.preventDefault != undefined) e.preventDefault();
else e.returnValue = false;
},


fadeElement:function(elID, fade, min_opacity, max_opacity, speed, istep){
  var step;
  var t = 0;
  if ((typeof(istep) == "undefined") || (istep == null))
    istep=1;
  if (fade) {
    // fade out
    for (step = max_opacity; step >= min_opacity; step=step-istep) {
      setTimeout("ptCommonObj2.setOpaq('" + elID + "', " + step + ")", (t*speed));  //translucent
      t++;
    }
  }else {
    // fade in
    for (step = min_opacity; step <= max_opacity; step=step+istep) {
      setTimeout("ptCommonObj2.setOpaq('" + elID + "', " + step + ")", (t*speed));  //display
      t++;
    }
  }
  return t;
},
setOpaq:function(elID, opacity) {
  var el = document.getElementById(elID);
  el.style.opacity = (opacity / 100);
  el.style.filter="alpha(opacity=" + opacity + ")";
},

    showPopupMask: function(oWin, id, bModaless) {
        if (typeof oWin == 'undefined') return;
        if (typeof bModaless == 'undefined') bModaless = false;
        this.setMaskSize(oWin, id);
        this.popMask.style.display = "block";
        if (!bModaless && oWin.document.getElementById("pthnavcontainer")) {//nav poked out, so hide it for now
            oWin.document.getElementById("pthnavcontainer").style.display = "none";
        }
    },
    setMaskSize: function(oWin, id) {
        if (typeof oWin == 'undefined') return;
        var nMaxMaskHeight = 10266;  // maximum mask height for IE browser.  Exceeding it will cause mask not to be displayed in IE browser.
        var popHeight = nMaxMaskHeight;        
        if (typeof id == 'undefined') id = 'pt_modalMask';
        this.popMask = oWin.document.getElementById(id);
        if (typeof this.popMask == 'undefined' || this.popMask == null) {
            var oBody = oWin.document.body;
            var oObj = oWin.document.createElement("div");
            oObj.setAttribute("id", "pt_modalMask");
            oBody.appendChild(oObj);
            this.popMask = oWin.document.getElementById("pt_modalMask");
        }
        if (this.popMask) {
            var theBody = oWin.document.getElementsByTagName("BODY")[0];
            var fullHeight = ptCommonObj2.getViewportHeight(oWin);
            var fullWidth = ptCommonObj2.getViewportWidth(oWin);
            // Determine what's bigger, scrollHeight or fullHeight / width
            theBody.style.overflow = 'hidden';
            if (fullHeight > theBody.scrollHeight)
                popHeight = fullHeight;
            else
                popHeight = theBody.scrollHeight;
                
            if (popHeight > nMaxMaskHeight)  // maximum height in IE
                popHeight = nMaxMaskHeight;

            this.popMask.style.height = popHeight + "px";
            this.popMask.style.width = (theBody.scrollWidth+18) + "px";
        }
    },

    hidePopupMask: function(oWin, id, bModaless) {
        if (typeof oWin == 'undefined') return;
        if (typeof bModaless == 'undefined') bModaless = false;
        if (typeof id == 'undefined') id = 'pt_modalMask';
        this.popMask = oWin.document.getElementById(id);
        if (!bModaless && oWin.document.getElementById("pthnavcontainer")) {
            oWin.document.getElementById("pthnavcontainer").style.display = "block";
        }
        if (this.popMask) {
        	this.popMask.style.display = "none";
        	var theBody = oWin.document.getElementsByTagName("BODY")[0];  
        	if (typeof MTop().ptDialog != 'undefined' && typeof MTop().ptDialog.overflow != 'undefined')      
            	theBody.style.overflow = MTop().ptDialog.overflow;
		} 
	},
	
	getScrollX: function() { return browserInfoObj2.isSafari ? window.scrollX : document.body.scrollLeft; },
	getScrollY: function() { return browserInfoObj2.isSafari ? window.scrollY : document.body.scrollTop; }
} 

function PT_RC()
{}

PT_RC.prototype = {
    
    isEnabled:function() {

        var bIsEnabled = false;

        
        if ( (window.top.document.getElementById('ptifrmtarget') == null) &&
             (window.top.document.getElementById('TargetContentFrame') == null) ) {
            return bIsEnabled;
        }

        
        if (typeof window.top.ptrc.onAddChangeEvent != 'function') {
            return bIsEnabled;
        }

        bIsEnabled = true;

        return bIsEnabled;
    },

    
    isFrame:function() {
        return (window.top.document.getElementById('TargetContentFrame') != null) ? true : false;
    },

    
    isIFrame:function() {
        return  ((window.top.document.getElementById('ptifrmtarget') != null) ? true:false);
    }
}


function getYScroll(){
return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
}

function getXScroll(){
return window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft || 0;
}
function ptLoadingStatus_empty(display)
{
clearupTimeout2(); // clear timers for session timeout when request is submitted.
var objFrame =  top.frames['TargetContent'];
var waitobj = null;
if ((typeof(window.parent.popupObj_empty) != "undefined") &&
    window.parent.popupObj_empty.isShown) {
   
   waitobj = document.getElementById("WAIT_empty");
}
else if (objFrame) {
   waitobj = objFrame.document.getElementById("WAIT_empty");
}
else {
   waitobj = document.getElementById("WAIT_empty");
}

if (waitobj) {
  if ((typeof display == "undefined") || (display != 0)) {
    waitobj.style.top = getYScroll();
    var x = getXScroll();
    waitobj.style.right = (x > 0) ? (0 - x) : x;
    waitobj.style.display="block";
    waitobj.style.visibility="visible";
  }
  else {
    waitobj.style.display="none";
    waitobj.style.visibility="hidden";
  }
}
}
function positionWAIT_empty(){
var waitobj = null;
var savedobj = null;
var objFrame =  top.frames['TargetContent'];
if (objFrame) {
  waitobj = objFrame.document.getElementById("WAIT_empty");
}
else {
  waitobj = document.getElementById("WAIT_empty");
  savedobj = document.getElementById("SAVED_empty");
}

if (waitobj && waitobj.style.display != "none" && waitobj.style.visibility != "hidden")
  keepObjTopRight(waitobj);
if (savedobj && savedobj.style.display != "none" && savedobj.style.visibility != "hidden")
  keepObjTopRight(savedobj);
}
function keepObjTopRight(waitobj) {
   waitobj.style.position = "absolute";
   if (window.frames.length)
       waitobj.style.top = document.body.scrollTop + "px";
   else {
       if (document.body.scrollTop >= 50)
           waitobj.style.top = document.body.scrollTop + "px";
       else
           waitobj.style.top = 50 + "px";
   }
   waitobj.style.right = (document.body.scrollLeft > 0) ? ((0-document.body.scrollLeft) + "px") : (document.body.scrollLeft + "px");
}

if (typeof(ptCommonObj2) === "undefined") 
{
var browserInfoObj2;
var ptCommonObj2;            //Object of PT common
var ptConsole2;
var ptRC2;

PT_createStandardObjects();     
}


if (typeof(ptEvent) === "undefined") {
var ptEvent = {
    fnList : [],
    huid: 100,
    hList: {},
    done: false,
    init : function () {

        if (!ptEvent.done) {
            ptEvent.done = true;

            if (ptEvent.fnList) {
                for ( var i = 0, fl = ptEvent.fnList.length; i < fl; i++ ) {
                    ptEvent.fnList[i].apply(document);
                }
                ptEvent.fnList = null;
            }

            
            ptEvent.add(window, "unload", ptEvent.remove);

            
            if (browserInfoObj2.isMozilla) {
                document.removeEventListener( "DOMContentLoaded", ptEvent.init, false );
            }
        }
    },

    load : function (f) {

        if (ptEvent.done) {
            f.apply(document);
        } else {
           ptEvent.fnList.push(f);
        }
    },

    onDOMLoad : function (f) {
      if ((browserInfoObj2.isSafari) && (document.readyState == "complete")){
        
        ptEvent.safariTimer = setInterval(function () {
            
            ptEvent.load(f);
            
            clearInterval(ptEvent.safariTimer);
            ptEvent.safariTimer = null;            
        }, 10); 
      }
      else
        ptEvent.load(f);
    },

    
    add : function (element, type, data) {

        
        
        if (browserInfoObj2.isIE && element.setInterval != undefined)
            element = window;

        if (data) {
            handler = data;
            handler.data = data;
        }

        
        if ( !handler.huid )
            handler.huid = this.huid++;

        
        if (!element.events) {
            element.events = {};
        }

        if (!element.handle) {
            element.handle = function() { 

                
                var retVal;
    
                
                if (typeof ptEvent == "undefined") {
                    return retVal;
                }
                   
                retVal = ptEvent.handle.apply(element,arguments);
                return retVal;
             };
        }

        
        var handlers = element.events[type];

        
        if (!handlers) {
            handlers = element.events[type] = {}; 
               
            
            if (element.attachEvent) {
                element.attachEvent("on" + type, element.handle);
            } else if (element.addEventListener) {
                element.addEventListener(type, element.handle, false);
            }
        }

        
        handlers[handler.huid] = handler;
    },

    
    remove : function (element, type, handler) {

        var elEvents = element.events, ret;
        if (elEvents) {

            
            if (type && type.type) {
                handler = type.handler;
                type = type.type;
            }
               
            if (!type) {
                for (type in elEvents) {
                    this.remove( element, type );
                }
            } else if (elEvents[type]) {

                
                if (handler) {
                    delete elEvents[type][handler.huid];
                } else {
                   
                    
                    for (handler in element.events[type]) {
                        delete elEvents[type][handler];
                    }
                }
    
                
                for (ret in elEvents[type]) { 
                    break;
                }

                if (!ret) {

                    if (element.detachEvent) {
                        element.detachEvent("on" + type,element.handle);
                    } else if (element.removeEventListener) {
                        element.removeEventListener(type,element.handle,false);
                    }

                    ret = null;
                    delete elEvents[type];
                }
            }
    
            
            for ( ret in elEvents ) {
                break;
            }

            if ( !ret ) {
                element.handle = element.events = null;
            }
        }
    },

    
    handle : function (event) {

        var retVal;

        
        event = ptEvent.fix(event || window.event || {}); 

        var c = this.events && this.events[event.type];

        var args = [].slice.call(arguments,1);
        args.unshift(event);

        for (var j in c) {
            
            

            var temp = c[j];

            args[0].handler = c[j];
            args[0].data = c[j].data;

            
            var hRetVal = c[j].apply( this, args );
    
            if ( retVal !== false ) {
                retVal = hRetVal;
            }
    
            if ( hRetVal === false ) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        
        if (browserInfoObj2.isIE) {
            event.target = event.preventDefault = event.stopPropagation = 
            event.handler = event.data = null;
           }
        return retVal;
    },

    
    fix : function (event) {

        
        if (!event.target && event.srcElement)
            event.target = event.srcElement;

        
        if (event.pageX == undefined && event.clientX != undefined) {
            if (typeof document == "undefined" || typeof document == "unknown") return event;
            var e = document.documentElement, b = document.body;
            event.pageX = event.clientX + (e.scrollLeft || b.scrollLeft);
            event.pageY = event.clientY + (e.scrollTop || b.scrollTop);
        }
                
        
        if (browserInfoObj2.isSafari && event.target.nodeType == 3) {

            
            
            var originalEvent = event;
            event = {};
            event = originalEvent;
            
            
            event.target = originalEvent.target.parentNode;
            
            
            
            event.preventDefault = function() {
                return originalEvent.preventDefault();
            };
            event.stopPropagation = function() {
                return originalEvent.stopPropagation();
            };
        }
        
        
        if (!event.preventDefault)
            event.preventDefault = function () { event.returnValue = false; };
            
        if (!event.stopPropagation)
            event.stopPropagation = function () { event.cancelBubble = true; };
        return event;
    }
}; 

new function () {
    
    if (browserInfoObj2.isMozilla) {
        document.addEventListener( "DOMContentLoaded", ptEvent.init, false );

    
    } else if (browserInfoObj2.isIE && window == top) {
        (function(){
            if (ptEvent.done) { return; }

            try {
                
                document.documentElement.doScroll("left");
            } catch( error ) {
                setTimeout( arguments.callee, 0 );
                return;
            }
            
            ptEvent.init();
        })();

    
    
    } else if (browserInfoObj2.isSafari) {
        
        ptEvent.safariTimer = setInterval(function () {

                
                if ( document.readyState == "loaded" || 
                    document.readyState == "complete" ) {
    
                    
                    clearInterval(ptEvent.safariTimer);
                    ptEvent.safariTimer = null;
    
                    
                    ptEvent.init();
                }
            }, 10); 
    }
    ptEvent.add(window,"load",ptEvent.init);
}; 
} 

var ptUtil = {
    
    
    
    
    id : function (s) {
        if (typeof s == "string") { return document.getElementById(s); }
        return s;
    },

    
    
    
    
    
    getElems : function (pNode,crit) {

        var elems = [];
        var elName;
        var cName;
        var id;
        var t;

        if (!pNode || !crit) return elems;
        
        
        var re = /^([a-z0-9_-]+)(.)([a-z0-9\\*_-]*)/i;
        var m = re.exec(crit);

        if (m && m[2] === ".") {
            elName = m[1];
            cName = m[3];
        } else {
            
            re = /^([a-z0-9_-]+)(#)([a-z0-9\\*_-]*)/i;
            m = re.exec(crit);
            if (m && m[2] === "#") {
                elName = m[1];
                id = m[3];
            } else {
                
                elName = crit;
            }
        }
            
        if (elName || cName) {
            var cNode;
            for (var i = 0; i < pNode.childNodes.length; i++) {
                cNode = pNode.childNodes[i];

                
                if (cNode.nodeType === 1) {
                    
                    if (elName && cName) {
                        if (cNode.nodeName.toLowerCase() === elName && 
                            ptUtil.isClassMember(cNode,cName)) {
                            elems.push(cNode);
                        }
                    } else if (elName && cNode.nodeName.toLowerCase() === elName) {
                        elems.push(cNode);
                    } else if (ptUtil.isClassMember(cNode,cName)) { 
                        elems.push(cNode);
                    }
                    
                    
                    t = ptUtil.getElems(cNode,crit);
                    if (t[0]) elems = elems.concat(t);
                }
            }
        } else if (id) {
            
            elems.push(ptUtil.id(id));
        }
        return elems;
    },

    
    
    
    
    appendHTML : function (pNode,html,cNodeTag) {
    
        if (!pNode || !html) return;

        if (cNodeTag) {
            
            var elems = ptUtil.getElems(pNode,cNodeTag);
            for (var i = 0; i < elems.length; i++) {
                ptUtil.appendNodeFromHTML(elems[i],html);
            }    
        } else {
            ptUtil.appendNodeFromHTML(pNode,html);
        }
    },

    appendNodeFromHTML : function (n,html) {
    
        
        if ( html && typeof html == "string" ) {

            var div = document.createElement("div");
            div.innerHTML = html;
            
            if (!browserInfoObj2.isIE && div.childNodes.length > 1)
                {
                if (browserInfoObj2.isFF)
                    div = div.lastChild;
                else
                    div.childNodes[1];
                }
            else
                div = div.firstChild;

            n.appendChild(div);
        }
    },        

    
    
    
    
    
    
    swapClass : function (pNode,fClass,tClass,cNodeTag) {

        
        if (!pNode || !fClass || !tClass) return;    

        if (cNodeTag) {
            var elems = ptUtil.getElems(pNode,cNodeTag);
            for (var i = 0; i < elems.length; i++) {
                ptUtil.removeClass(elems[i],fClass);
                ptUtil.addClass(elems[i],tClass);
            }
        } else {
            ptUtil.removeClass(pNode,fClass);
            ptUtil.addClass(pNode,tClass);
        }
    },

    
    
    
    addClass : function (el, cName) {
        
        if (el && !ptUtil.isClassMember(el,cName)) {

            if (el.className) {
                
                el.className = el.className.replace(/^\s+|\s+$/g, "");
                el.className += " " + cName;
            } else {
                el.className += "" + cName;
            }
        }
    },

    
    
    
    removeClass : function (el, cName) {

        
        
        
        if (el) {
            el.className = el.className.replace(new RegExp("\\b"+ cName+"\\b\\s*", "g"), "");
        }
    },

    
    
    
    isClassMember : function (el, cName) {

        if (!el) { return false; }

        
        var classes = el.className;
        if (!classes) { return false; }
        
        
        if (classes === cName) { return true; }

        
        var whiteSpace = /\s+/;
        if (!whiteSpace.test(classes)) { return false; }

        
        
        var c = classes.split(whiteSpace);
        for (var i = 0; i < c.length; i++) {
            if (c[i] === cName) { return true; }
        }
        return false;

    },

    
    getElemsByClass : function (searchClass,node,tag) {

        var classElems = [];

        if (!node) { node = document; }

        if (!tag) {    tag = "*"; }

        var els = node.getElementsByTagName(tag);
        var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");

        for (var i = 0, j = els.length; i < j; i++) {
            if (pattern.test(els[i].className) ) { classElems.push(els[i]); }
        }
        return classElems;
    },

    
    
    
    getCSSValue : function (el,prop) {
        if (!el) { return null; }
        var cssProp = prop;
        var retVal = null;
        
        if (cssProp === "float") {
            cssProp = browserInfoObj2.isIE ? "styleFloat" : "cssFloat";
        }
        
        if (el.style[cssProp]) {
            retVal = el.style[cssProp];

          
         } else if (el.currentStyle) {
            retVal = el.currentStyle[cssProp];

            
            
            if ( !/^\d+(px)?$/i.test(retVal) && /^\d/.test(retVal) ) {

                
                var left = el.style.left, rsLeft = el.runtimeStyle.left;

                
                el.runtimeStyle.left = el.currentStyle.left;
                el.style.left = retVal || 0;
                retVal = el.style.pixelLeft + "px";

                
                el.style.left = left;
                el.runtimeStyle.left = rsLeft;
            }

        
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
            retVal = document.defaultView.getComputedStyle(el,"")[cssProp];
        }
        return retVal;

    },

    
    
    
    
    setCSSValue : function (el,prop,value) {

        var cssProp = prop;
        if (cssProp === "float") {
            cssProp = browserInfoObj2.isIE ? "styleFloat" : "cssFloat";
        }

        el.style[cssProp] = value;

    },

    
    winSize : function () {

        var de = document.documentElement;
        var height = window.innerHeight || self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
        var width = window.innerWidth || self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
        return {height:height, width:width};
    },    

    
    getNextSibling : function (node,nodeType,styleClass) {

        if (!node) { return null; }
    
        var sibling = node.nextSibling;
        while (sibling) {
            if (sibling.nodeName.toLowerCase() === nodeType) {
                if (styleClass && styleClass !== "") {
                    if (this.isClassMember(sibling,styleClass)) {
                        return sibling;
                    }
                } else {    
                    return sibling;
                }
            }
            sibling = sibling.nextSibling;
        }
        return null;
    },

    
    getPrevSibling : function (node,nodeType,styleClass) {

        if (!node) { return null; }
    
        var sibling = node.previousSibling;
        while (sibling) {
            if (sibling.nodeName.toLowerCase() === nodeType) {
                if (styleClass && styleClass !== "") {
                    if (this.isClassMember(sibling,styleClass)) {
                        return sibling;
                    }
                } else {    
                    return sibling;
                }
            }
            sibling = sibling.previousSibling;
        }
        return null;
    },

    
    getGrandParent : function (pNode) {
        if (pNode.parentNode) 
            return pNode.parentNode.parentNode;
        else
            return null;
    },

        
    getFirstChild : function (node) {
        var firstChild;
        if (node.firstElementChild) {
            firstChild = node.firstElementChild;
        } else {
            firstChild = node.firstChild;
            while (firstChild && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
        }
        return firstChild;
    },

    
    getKeyCode : function (evt) {

        if (!evt && window.event) {    evt = window.event; }
        if (!evt) {    return 0; }
        if (evt.keyCode) { return evt.keyCode; }
        if (evt.which) { return evt.which; }
        return 0;
    },

    
    isAltKey : function (evt) {

        if (!evt && window.event) {    evt = window.event; }
        if (!evt) {    return false; }
        if (evt.altKey) { return true; }
        if (evt.modifiers) { return (evt.modifiers & Event.ALT_MASK) != 0; }
        return false;
    },

    
    isCtrlKey : function (evt) {

        if (!evt && window.event) {    evt = window.event; }
        if (!evt) {    return false; }
        if (evt.ctrlKey) { return true; }
        if (evt.modifiers) { return (evt.modifiers & Event.CONTROL_MASK) != 0; }
        return false;
    },

    
    isShiftKey : function (evt) {

        if (!evt && window.event) {    evt = window.event; }
        if (!evt) { return false; }
        if (evt.shiftKey) { return true; }
        if (evt.modifiers) { return (evt.modifiers & Event.SHIFT_MASK) != 0; }
        return false;
    }
}; 

PTRTE_CheckImages = function (URI, UrlID, EditorField)
{
  
  if ((typeof URI == "undefined") || (URI == "")) URI = location.href;
  if ((typeof UrlID == "undefined") || (UrlID == "")) UrlID = "PT_RTE_IMG_DB_LOC";

  
  var baseUri = URI.replace("psp", "psc");
  var serverUri = baseUri.split("/psc/")[0];
  baseUri = serverUri + baseUri.match(/\/ps(c|p)\/?([^\/]*)?\/?([^\/]*)?\/?([^\/]*)?\//)[0];
  var URLoc = baseUri + "s/WEBLIB_PTRTE.ISCRIPT1.FieldFormula.IScript_RTE_IMAGE_ATTACH?URLId=" + UrlID;
  var psSiteName = (URI.split("/"))[4];
  psSiteName = (psSiteName.split("_"))[0];

  
  var objEditorField = null;
  if ((typeof EditorField != "undefined") && (EditorField != "")) {
    objEditorField = document.getElementById(EditorField);
  }
  if (objEditorField == null) {
    objEditorField = document.body;
  }

  
  var objImages = objEditorField.getElementsByTagName('img');

  
  if (typeof document.body.RTFImages == "undefined") document.body.RTFImages = new Array(0);

  
  var imgStr = "";
  for (var i=0; i<objImages.length; i++) {
    var img = objImages[i];

    if ((!img.id) || (!img.src)) continue;

    var tempval = img.id.split("###");
    var ImgID = tempval[0];
    var filename = tempval[1];

    if ((UrlID == ImgID) && !img.PTRTEImageVerified) {
      img.PTRTEImageVerified = "PENDING";

      imgStr = imgStr + "&Params=" + filename;

      document.body.RTFImages.push(img);

      
      tempval = img.src.split("/");
      img.oracletempimagesrc = serverUri + "/cs/" + psSiteName + "/cache/" + tempval[tempval.length-1];
    }
  }

  
  if (imgStr != "") {
    var PTRTELoader = new net2.ContentLoader(
      URLoc + imgStr,
      null, null, "GET",
      function () {
        
        
        if (typeof document.body.RTFImages != "undefined") {
          for (var i=0; i<document.body.RTFImages.length; i++) {
            var img = document.body.RTFImages[i];
            if ((img) && (typeof img.oracletempimagesrc != "undefined")) {
              if (img.src != img.oracletempimagesrc) {
                img.src = img.oracletempimagesrc;
              } else {
                img.src = img.oracletempimagesrc + "?reload";
              }
              img.PTRTEImageVerified = "DONE";
            }
          }
        }
      },
      function () {
        
      },
      null,
      "application/x-www-form-urlencoded"
    );
  }
} 


//new modal
function PT_Dialog()
{ }

PT_Dialog.prototype = {
    init: function(closeUrl, closeAlt) {
        this.arrModalMsgs = new Array();
        this.arrModalDialogs = new Array();
        this.arrModelessDialogs = new Array();
        this.cObj = MTop().document.getElementById("pt_modals");
        if (typeof this.cObj == 'undefined' || this.cObj == null) {
            var oBody = MTop().document.body;
            oObj = document.createElement("div");
            oObj.setAttribute("id", "pt_modalMask");
            oBody.appendChild(oObj);
            oObj = document.createElement("div");
            oObj.setAttribute("id", "pt_modalMaskCover");
            oBody.appendChild(oObj);
            oObj = document.createElement("div");
            oObj.setAttribute("id", "pt_modals");
            oObj.setAttribute("CLASS", "PSMODAL");
            oBody.appendChild(oObj);
            this.cObj = MTop().document.getElementById("pt_modals");
            this.cObj.innerHTML = "<div id='ptModalShadow' class='popupDragFrame' style='cursor:nw-resize'>&nbsp;</div>";
        }
        this.idCount = 0;
        this.zIndexBase = 9999;
        MTop().modlessId = -1;
        MTop().hideModId = -1;
        MTop().PTMODFRAME_ = "ptModFrame_";           // iframe for modal/modeless dialog
        MTop().PTMOD_ = "ptMod_";                     // DIV container for the iframe for modal/modeless dialog
    },
    processOptions: function(options, modObj, sHostUrl) {
        if (MTop().oParentWin != null)
            this.overflow = MTop().oParentWin.document.body.style.overflow;
        if (typeof options == "undefined") return;
        var optionArr = options.split(";");
        this.bModeless = 0;
        this.bClose = 0;
        this.sCancelName = '';
        this.sTitle = '';
        this.bPIA = false;
        this.bCrossDomain = false;
        this.width = -1;
        this.height = -1;
        for (var i = 0; i < optionArr.length; i++) {
            var name = optionArr[i].split("@")[0];
            var value = optionArr[i].split("@")[1];
            switch (name) {
                case "closeUrl":
                    this.closeUrl = convToABSUrl(value,sHostUrl);
                    break;
                case "closeAlt":
                    this.closeAlt = value;
                    break;
                case "resizeUrl":
                    this.resizeUrl = convToABSUrl(value,sHostUrl);
                    break;
                case "resizeAlt":
                    this.resizeAlt = value;
                    break;
                case "moveAlt":
                    this.moveAlt = value;
                    break;
                case "bModeless":
                    this.bModeless = value;
                    break;
                case "bClose":
                    if (value.indexOf("1") != -1)
                        this.bClose = true;
                    break;
                case "bPIA":
                    if (value.indexOf("1") != -1)
                        this.bPIA = true;
                    break;
                case "bCrossDomain":
                    if (value.indexOf("1") != -1)
                        this.bCrossDomain = true;
                    break;
                case "sCancelName":
                    this.sCancelName = value;
                    break;
                case "sTitle":
                    this.sTitle = value;
                    break;
                case "width":
                    this.width = new Number(value.valueOf());
                    break;
                case "height":
                    this.height = new Number(value.valueOf());
                    break;
            }
        }
        modObj.bClose = this.bClose;
        modObj.bPIA = this.bPIA;
        modObj.bCrossDomain = this.bCrossDomain;
        modObj.bModeless = this.bModeless;
        modObj.width = this.width;
        modObj.height = this.height;
        if (this.sCancelName.length > 0)
            modObj.sCancelName = this.sCancelName;
        else
            modObj.sCancelName = "";
        if (this.sTitle.length > 0)
            modObj.sTitle = this.sTitle;
        else
            modObj.sTitle = "";
    },
    
    showModalDialog: function(url, oParentWin, options, msg, onclose, form, name, pollContent) {
        if (!this.arrModalDialogs)
            this.init();
        MTop().oParentWin = oParentWin;
        MTop().modId = this.idCount;
        this.closeModalMsg(null, this.idCount - 1);
        modObj = document.createElement("div");
        modObj.setAttribute("id", MTop().PTMOD_ + this.idCount);
        this.processOptions(options, modObj, url);
        this.checkRemoveModeless(this.bModeless);
        if (this.bModeless) {
            modObj.bRemove = false;
            MTop().modlessId = MTop().modId;
        }
        if (typeof onclose != "undefined" && onclose)
            modObj.onclose = onclose;
        if (typeof form != "undefined" && form)
            modObj.form = form;
        if (typeof name != "undefined" && name)
            modObj.name = name;

        modObj.oParentWin = oParentWin;
        modObj.bCustMove = false;
        modObj.bCustResize = false;
        modObj.bCustResizeDone = false;  
        modObj.bMsg = (typeof msg == "undefined" || !msg) ? false : true;
        modObj.oParentWin.bProcess = true;
        var dWidth = 1;
        var dHeight = 1;
        if (modObj.width != -1)
            dWidth = modObj.width;
        if (modObj.height != -1)
            dHeight = modObj.height;
        var fullWidth = ptCommonObj2.getViewportWidth();
        var fullHeight = ptCommonObj2.getViewportHeight();
        if (fullHeight > 160) fullHeight -= 80;

        var default_top = (fullHeight - dHeight) / 2 + MTop().document.body.scrollTop + 'px';
        var default_left = (fullWidth - dWidth) / 2 + MTop().document.body.scrollLeft + 'px';

        var sHtml = "";
        sHtml += "<div id='ptModTable_" + this.idCount + "' class='PSMODALTABLE' style='top:" + default_top + ";left:" + default_left + ";'>";
        //header
        sHtml += "<div id='ptModHeader_" + this.idCount + "' class='PSMODALHEADER'>";
        sHtml += "<div id='popupTitleBarLeftImage'>&nbsp;</div>";
        sHtml += "<div style='float:left;height:22px;'>";
        sHtml += "<div id='ptModTitleBar_" + this.idCount + "' alt='" + this.moveAlt + "' title='" + this.moveAlt + "' style='float:left;' CLASS='PSMODALTITLE'><span id='ptModTitle_" + this.idCount + "' class='PTPOPUP_TITLE'></span></div>";
        if (modObj.bClose || modObj.bModeless) {
            sHtml += "<div id='ptModControl_" + this.idCount + "' style='float:left;' class='PSMODALCLOSE'><img id='ptModClose_" + this.idCount + "' src='" + this.closeUrl + "' alt='" + this.closeAlt + "' onclick='";
            if (modObj.bModeless)
                sHtml += "closeModal(" + this.idCount + ");'/></div>";
            else
                sHtml += "doCloseModal(this);'/></div>";
        } sHtml += "</div>";
        sHtml += "<div id='popupTitleBarRightImage'>&nbsp;</div>";
        sHtml += "</div>";
        
        if (url)
           url = url.replace(/'/g, '%27');
        if (modObj.bMsg)
            sHtml += "<div id='ptModContent_" + this.idCount + "' CLASS='PSMODALCONTENT'>" + msg + "</div>";
        else {
            sHtml += "<div id='ptModContent_" + this.idCount + "' CLASS='PSMODALCONTENT'><iframe frameborder=0 id='" + MTop().PTMODFRAME_ + this.idCount + "' name='" + MTop().PTMODFRAME_ + this.idCount + "' src='" + url + "' width=" + dWidth + " height=" + dHeight + "></iframe></div>";
        }
        if (!modObj.bMsg)
            sHtml += "<div id='ptModBottom_" + this.idCount + "' class='PSMODALBOTTOM'><img id='ptModResize_" + this.idCount + "' class='PSMODALRESIZE' src='" + this.resizeUrl + "' alt='" + this.resizeAlt + "'/></div>";

        sHtml += "</div>";
        modObj.innerHTML = sHtml;
        this.cObj.appendChild(modObj);
        modObj = MTop().document.getElementById(MTop().PTMOD_ + this.idCount);
        modObj.style.zIndex = this.zIndexBase + this.idCount * 10;

        var oresize = MTop().document.getElementById("ptModResize_" + this.idCount);
        var oshadow = MTop().document.getElementById("ptModalShadow");  

        if (oresize && !browserInfoObj2.isIE)
            oresize.style.cssFloat = 'right';
        if ('ltr' == 'rtl') {
            if (oresize)
            oresize.style.cursor = 'ne-resize';   
            oshadow.style.cursor = 'ne-resize';   
        }
        this.cObj.style.display = "block";
        this.cObj.style.backgroundColor = "#ffffff";
        var id = this.idCount;
        this.idCount++;
        if (modObj.bMsg) {
            oParentWin.modWin = modObj;
            this.resizeModalDialog(id);
            return modObj;
        }
        else {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            if (typeof pollContent !== "undefined" && pollContent && !modObj.bCrossDomain) {
                (function testForContent() {
                    if (oframe) {
                        try {
                            obj = oframe.contentWindow.document.body;
                        } catch (ex) {
                            oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
                            setTimeout(testForContent,0);
                            return;
                        }
                    } else {
                        oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
                        setTimeout(testForContent,0);
                        return;
                    }
                    return oframe;
                })();
            } else {
                return oframe;
            }
        }
    },

    addMsg: function(msg, window, options) {
        if (!this.arrModalDialogs) this.init();
        var msgReq = new Array(msg, window, options);
        this.arrModalMsgs.push(msgReq);
    },

    isAnyMsg: function() {
        if (!this.arrModalMsgs) return false;
        if (this.arrModalMsgs.length > 0) return true;
        return false;
    },
    playMsg: function() {
        if (!this.isAnyMsg()) return;
        var msgReq = this.arrModalMsgs.shift();
        showModalDialog_pt(null, msgReq[1], msgReq[2], msgReq[0]);

    },
    setMsgFocus: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (modObj.oParentWin.gFocusObj != null) {
            modObj.oParentWin.gFocusObj.blur();
            modObj.parentfocusElID = modObj.oParentWin.gFocusObj.id;
        }
        var oContent = MTop().document.getElementById("ptModContent_" + id);
        var elements = oContent.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            switch (el.type) {
                case "button":
                case "radio":
                case "input":
                case "select":
                case "textarea":
                    if (!ptCommonObj2.tryFocus0(el)) return el;
                    break;
                default:
            }
        } // loop thru all elements
        ptCommonObj2.tryFocus0(oContent);
        return oContent;
    },
    getMsgCancelId: function(id, cancelId) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        var oContent = MTop().document.getElementById("ptModContent_" + id);
        var elements = oContent.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            switch (el.type) {
                case "button":
                    if (el.id == cancelId) return el.id;
                    break;
                default:
            }
        }
        return null;
    },
    isParentModal: function(oParentWin) {
        if (typeof oParentWin.modalID != 'undefined' && oParentWin.modalID != null) 
            return true;
        return false;
    },
    isParentLive: function(oParentWin) {
        if (!this.isParentModal(oParentWin)) return true;
        var tmp = "";
        if (oParentWin.name.indexOf("modWin_") != -1)
            tmp = oParentWin.name.split("modWin_");
        else if (oParentWin.name.indexOf(MTop().PTMODFRAME_) != -1)
            tmp = oParentWin.name.split(MTop().PTMODFRAME_);
        else if (oParentWin.name.indexOf(MTop().PTMOD_) != -1)
            tmp = oParentWin.name.split(MTop().PTMOD_);
        if (tmp == "") return false;
        if (tmp[1] != "undefined" && tmp[1] != "") {
            pmodObj = MTop().document.getElementById(MTop().PTMOD_ + tmp[1]);
            if (typeof pmodObj.bRemove != 'undefined' && pmodObj.bRemove) return false;
        }
        return true;
    },
    isParentModeless: function(oParentWin) {
        var tmp = oParentWin.name.split(MTop().PTMODFRAME_);
        if (tmp[1] != "undefined" && tmp[1] != "" && tmp[1] == MTop().modlessId)
            return true;
        return false;
    },
    isModeless: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (typeof modObj != 'undefined' && modObj)
            return modObj.bModeless;
        else
            return false;
    },
    isWinModeless:function(win) {
        return this.isParentModeless(win);
    },
    restoreModeless: function() {
        if (MTop().modlessId > -1) {
            var modlessObj = MTop().document.getElementById(MTop().PTMOD_ + MTop().modlessId);
            if (modlessObj)
                modlessObj.style.display = "block";
        }
    },
    hideModeless: function() {
        if (MTop().modlessId > -1) {
            var modlessObj = MTop().document.getElementById(MTop().PTMOD_ + MTop().modlessId);
            if (modlessObj)
                modlessObj.style.display = "none";
        }
    },
    checkRemoveModeless: function(bOpenModeless) {
        if (bOpenModeless)
            this.closeModalDialog(MTop().modlessId);
        if (MTop().modlessId != -1) {
            var modelessObj = MTop().document.getElementById(MTop().modlessId);
            if (modelessObj && modelessObj.bRemove) {
                alert(modelessObj.bRemove + ' ' + bOpenModeless);
          
                modelessObj.innerHTML = "";
                this.cObj.removeChild(mmodelessObj);
            }
        }
    },
    closeModalMsg: function(obj, id) {
        var modObj = null;
        if (typeof id != "undefined")
            modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        else {
            try {
                modObj = obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode; //MTop().document.getElementById(MTop().PTMOD_ + id);
            }
            catch (e) { return; }
        }
        if (!modObj || !modObj.bMsg) return;
        modObj.oParentWin.modWin = null;

        if (modObj.oParentWin.winParent) {
            this.AddHandler(modObj.oParentWin.modalID);
            ptCommonObj2.hidePopupMask(modObj.oParentWin);
        }
        else {
            if (this.isParentModeless(modObj.oParentWin))
                ptCommonObj2.hidePopupMask(modObj.oParentWin);
            else {
                this.restoreModeless();
                ptCommonObj2.hidePopupMask(MTop());
            }
        }
        if (modObj.parentfocusElID != null && this.isParentLive(modObj.oParentWin))
            ptCommonObj2.tryFocus0(modObj.oParentWin.document.getElementById(modObj.parentfocusElID));

        modObj.innerHTML = "";
        this.cObj.removeChild(modObj);
        if (typeof modObj.oParentWin.modalID != 'undefined' && modObj.oParentWin.modalID != null) {
            var pmodObj = MTop().document.getElementById(MTop().PTMOD_ + modObj.oParentWin.modalID);
            MTop().oParentWin = pmodObj.oParentWin;
            MTop().modId = modObj.oParentWin.modalID;
        }
        else {
            MTop().oParentWin = null;
            MTop().modId = -1;
        }
        this.playMsg();
    },
    doCloseModalDialog: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (!modObj) return;
        if (modObj.bPIA && modObj.bModeless) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            if (oframe) {
                oWin = oframe.contentWindow;
                var bChanged = checkFrameChanged(oWin);
                if (bChanged) {
                    var saveCancelEvent = 'javascript:doCloseModal0(' + id + ')';
                    return oWin.psConfirmSW("", saveCancelEvent, oWin);
                }
            }
        }
        this.doCloseModalDialog0(id);

    },
    doCloseModalDialog0: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (!modObj) return;
        if (modObj.bPIA) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            var oWin = oParentWin;

            if (oframe) {
                oWin = oframe.contentWindow;
                oWin.doCancel(modObj.sCancelName);
            }
            else {
                if (this.getMsgCancelId(id, "#ICCancel"))
                    oWin.doCancelMsg();
                else
                    this.closeModalMsg(null, id);
            }
        } else if (modObj.bClose || modObj.bModeless) return this.closeModalDialog(id);

    },
    getFirstParentWin: function() {
        for (var id = MTop().modId; id > -1; id--) {
            var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
            if (modObj) {
                if (modObj.oParentWin.winParent == null) return modObj.oParentWin;
            }
        }
    },
    getFirstModObj: function() {
        for (var id = MTop().modId; id > -1; id--) {
            var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
            if (modObj) {
                if (modObj.oParentWin.winParent == null) return modObj;
            }
        }
    },
    closeHideModal: function() {
        if (typeof MTop().hideModId == 'undefined' || MTop().hideModId == -1) return false;
        this.closeModalDialog(MTop().hideModId);
        return true;
    },
    hideModalDialog: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (!modObj) return;
        MTop().hideModId = id;
        modObj.style.display = "none";
    },
    closeModalAll: function() {
        for (var id = MTop().modId; id > -1; id--) {
            var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
            if (modObj) {
                modObj.innerHTML = "";
                this.cObj.removeChild(modObj);
            }
        }
        MTop().oParentWin = null;
        MTop().modId = -1;
        MTop().hideModId = -1;
        ptCommonObj2.hidePopupMask(MTop());
    },

    closeModalDialog: function(id) {
        if (typeof id == 'undefined') 
            {
            this.closeModalAll();
            return;
            }

        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        if (!modObj)
            return;
        
        var oWin = null;
        if (!modObj.bCrossDomain) 
            {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            oWin = oframe.contentWindow;
            }    
            
        if (modObj.bPIA && modObj.bModeless) 
            {
            var bChanged = checkFrameChanged(oWin);
            if (bChanged) 
                {
                var saveCancelEvent = 'javascript:closeModal0(' + id + ')';
                return oWin.psConfirmSW("", saveCancelEvent, oWin);
                }
            }
        this.closeModalDialog0(id);
    },

    closeModalDialog0: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);

        if (typeof modObj.onclose != "undefined") {
            eval(modObj.onclose);
        }
        var bModeless = modObj.bModeless;    // modeless page flag
        if (!modObj.bModeless && id != MTop().hideModId) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            var pWin = null;             
            try
            {
               var oWin = oframe.contentWindow;
               pWin = oWin.winParent;
            }
            catch (e) 
            {
              pWin=null;
            }
            if (pWin && pWin.winParent) {
                this.AddHandler(pWin.modalID);
                ptCommonObj2.hidePopupMask(pWin);
            }
            else {
                this.restoreModeless();
                ptCommonObj2.hidePopupMask(MTop());
            }
        }

        if (bModeless) {
            modObj.style.display = "none";
            modObj.style.zIndex = "-1";
            modObj.bRemove = true;
            var theBody = MTop().document.getElementsByTagName("BODY")[0];
            theBody.style.overflow = "auto";
            theBody.style.zIndex = "1";
        } else {
            modObj.innerHTML = "";
            this.cObj.removeChild(modObj);
        }
        if (id == MTop().hideModId) {
            try { 
                if (typeof modObj.oParentWin.winParent != 'undefined' && modObj.oParentWin.winParent != null) {
                    var pmodObj = MTop().document.getElementById(MTop().PTMOD_ + modObj.oParentWin.modalID);
                    MTop().oParentWin = modObj.oParentWin;
                    MTop().modId = modObj.oParentWin.modalID;
                }
                else {
                    MTop().oParentWin = null;
                    MTop().modId = -1;
                }
            } catch (ex) {
                MTop().oParentWin = null;
                MTop().modId = -1;
            }
            MTop().hideModId = -1;
        }
        else if (bModeless)
            MTop().modlessId = -1;
        else {
            if (typeof modObj.oParentWin.modalID != 'undefined' && modObj.oParentWin.modalID != null) {
                var pmodObj = MTop().document.getElementById(MTop().PTMOD_ + modObj.oParentWin.modalID);
                MTop().oParentWin = pmodObj.oParentWin;
                MTop().modId = modObj.oParentWin.modalID;
            }
            else {
                MTop().oParentWin = null;
                MTop().modId = -1;
            }
        }
    },

    resizeModalDialog: function(id, bCenter, w, h) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        var oheader = MTop().document.getElementById("ptModHeader_" + id);
        var oTitle = MTop().document.getElementById("ptModTitle_" + id);
        var otb = MTop().document.getElementById("ptModTable_" + id);
        var obottom = MTop().document.getElementById("ptModBottom_" + id);
        var oContent = MTop().document.getElementById("ptModContent_" + id);
        var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
        var oWin = null;
        var fullWidth = ptCommonObj2.getViewportWidth();
        var fullHeight = ptCommonObj2.getViewportHeight();
        if (oframe)
            oWin = oframe.contentWindow;
        bCenter = (typeof bCenter == "undefined") ? true : bCenter;
        w = (typeof w == "undefined") ? 0 : w;
        h = (typeof h == "undefined") ? 0 : h;
        if (modObj.bCrossDomain) {
            w = (w == -1) ? parseInt(fullWidth * 0.4, 10) : w;
            h = (h == -1) ? parseInt(fullHeight * 0.5, 10) : h;
        }
        if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
            // initialize modal sizing based on viewport if needed 
            w = (w <= 0) ? parseInt(fullWidth * 0.8, 10) : w;
            h = (h <= 0) ? parseInt(fullHeight * 0.5, 10) : h;
        }
        var h_win = h;
        if (fullHeight > 160) fullHeight -= 50;

        if (bCenter) {
            if (modObj.bMsg) {
                w = otb.scrollWidth;
                h = otb.scrollHeight;
            }
            else if (!modObj.bCrossDomain) {
                try {
                    w = oWin.document.body.scrollWidth;
                } catch (e) {}
                var aObj = oWin.document.getElementById("ACE_width");
                var w2 = 0;
                if (aObj && aObj.width != "")
                    w2 = new Number(aObj.width).valueOf();
                try {
                    h = oWin.document.body.scrollHeight;
                    offw = w - oWin.document.body.clientWidth;
                    offh = h - oWin.document.body.clientHeight;
          if (oWin.document.body.scrollWidth > w2) 
              w2 = oWin.document.body.scrollWidth
                } catch(e) {
                    // set offset based on viewport
                    if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
                        h = h_win;
                        offw = w;
                        offh  = h;
                    }
                }
                
                var minW = 0;       
                var minH = 0;       
                
                
                if (!modObj.bMsg && !modObj.bCustResizeDone && oWin.document.body.innerHTML.indexOf("javascript:DatePrompt_win") != -1 && (w < 350 || h < 350))
                   {
                   minW = 400;
                   minH = 400;
                   }


                if (oWin.modalZoomName != null) {
                    var zObj = oWin.document.getElementById(oWin.modalZoomName);
                    if (zObj && zObj.innerHTML.indexOf("CKEDITOR") != -1) {
                        w += 48;
                        h += 90;
                    } else if (zObj) {
                        var aObj = zObj.firstChild;
                        if (aObj && aObj.width != "")
                            w2 = new Number(aObj.width).valueOf();
                    }
                }
                if (w2 > 0 && w > (w2 + 38))
                    w = w2 + 38;
                if (w < minW) w = minW;
                if (h < minH) h = minH;
            }


            var maxW = fullWidth;
            var maxH = fullHeight;
            if (w > maxW) w = maxW;
            if (h > maxH) h = maxH;
        }
        if (!modObj.bCustMove) {
            if (h != maxH)
                otb.style.top = (fullHeight - h) / 2 + MTop().document.body.scrollTop + 'px';
            else {
                otb.style.top = 25 + MTop().document.body.scrollTop + 'px';
                h = maxH - 50;
            }

            if (w != maxW)
                otb.style.left = (fullWidth - w) / 2 + MTop().document.body.scrollLeft + 'px';
            else {
                otb.style.left = 40 + MTop().document.body.scrollLeft + 'px';
                w = maxW - 80;
            }
        }
        oheader.style.display = 'block';
        if (!modObj.bCustResize) {
            try {
                if (!modObj.bCrossDomain && !modObj.bMsg && oWin.modalZoomName == null && oWin.document.body.clientHeight < oWin.document.body.scrollHeight) {
                    w += 18;
                }
            } catch (e) {}
            modObj.style.width = w + 4 + 'px';
            modObj.style.height = h + 'px';
            oheader.style.width = w + 4 + 'px';
            otb.style.width = modObj.style.width;
            otb.style.height = h - ptCommonObj2.getHeight(oTitle) + 'px';
            oContent.style.height = otb.style.height;
            if (obottom)
                obottom.style.width = oContent.style.width;
            if (!modObj.bMsg) {
                oframe.style.width = w + 'px';
                oframe.style.height = otb.style.height;
                if (!modObj.bCrossDomain) {
                    h_win = h - ptCommonObj2.getHeight(oTitle);
                    try {
                        oWin.document.body.scrollTop = 0;
                        oWin.document.body.scrollLeft = 0;
                    } catch (e) {}
                }
            }
        }
        if (bCenter) {
            this.AddHandler(id);
            if (modObj.bCrossDomain) {
                if (!modObj.bModeless)
                    ptCommonObj2.showPopupMask(MTop());
            }
            else {
                if (!modObj.bMsg)
                    oParentWin = oWin.winParent;
                else
                    oParentWin = modObj.oParentWin;
                var bPModeless = this.isParentModeless(oParentWin);
                if (!oParentWin.winParent && !modObj.bModeless && !bPModeless) {
                    this.hideModeless();
                }
                if (!oParentWin.ptConsole2.isActive() && !modObj.bModeless) {
                    if (oParentWin.winParent) {
                        this.RemoveHandler(oParentWin.modalID);
                        ptCommonObj2.showPopupMask(oParentWin);
                    }
                    else {
                        if (bPModeless)
                            ptCommonObj2.showPopupMask(oParentWin);
                        else
                            ptCommonObj2.showPopupMask(MTop());
                    }
                }                
            }
        }

        modObj.oParentWin.bProcess = false;
        this.setModalDialogTitle(id);
        if (modObj.bMsg) this.setMsgFocus(id);
        return true;

    },
    setModalDialogTitle: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        var oTitleBar = MTop().document.getElementById("ptModTitleBar_" + id);
        var oContent = MTop().document.getElementById("ptModContent_" + id);
        var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
        var oTitle = MTop().document.getElementById("ptModTitle_" + id);
        var oTitleText = null;
        if (modObj.sTitle.length > 0)
            oTitle.innerHTML = modObj.sTitle;
        else {
            try {
                var oTitleText = null;
                if (modObj.bMsg)
                    oTitleText = MTop().document.getElementById("msgTitle");
                else
                    oTitleText = oframe.contentWindow.document.getElementsByTagName("title")[0];
                if (typeof oTitleText != 'undefined' && oTitleText){
                    var sTitle = "";
                    if (modObj.bMsg)
                        sTitle = oTitleText.innerHTML;
                    else {
                    var oObj = document.createElement("div");
                    oObj.innerHTML = (typeof oTitleText.text != "undefined") ? oTitleText.text : oTitleText.innerHTML;
                    var sTitle = "";
                    if (browserInfoObj2.isIE)
                        sTitle = oObj.outerText;
                    else
                        sTitle = oObj.textContent;
                    }
                    oTitle.innerHTML = sTitle;
                }
            } catch (e) {
                oTitle.innerHTML = "";
            }

        }
        var octl = MTop().document.getElementById("ptModControl_" + id);
        if (octl) octl.style.cssFloat = 'right';
        var newWidth = (oContent.clientWidth - 21);  
        if (newWidth > 0)  
            oTitleBar.style.width = newWidth + 'px';   
        // fixup modal title header width when needed
        if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            if (!oframe) return;
            oWin = oframe.contentWindow;
            var theBody = oWin.document.getElementsByTagName("BODY")[0];
            if (!theBody) return;
            var fullWidth = ptCommonObj2.getViewportWidth();
            var bFixupHeaderWidth  = theBody.scrollWidth > fullWidth ? true : false;
            if (bFixupHeaderWidth) {
                newWidth = theBody.scrollWidth;  // based on scrollwidth as the dialog width
                var oHeader = MTop().document.getElementById("ptModHeader_" + id);
                oHeader.style.width = newWidth + 'px';  
                newWidth = newWidth - 21;  
                if (newWidth > 0)  
                    oTitleBar.style.width = newWidth + 'px';  
            }
        }            
    },
    showModelessDialog: function(url, obj, option) {
    },
    setEvent: function(obj) {
        ptEvent.add(obj, "mouseup", MTop().ptDialog.onmouseup);
        ptEvent.add(obj, "mousemove", MTop().ptDialog.onmousemove);
        ptEvent.add(obj, "dragstart", MTop().ptDialog.cancelEvent);
        ptEvent.add(obj, "selectstart", MTop().ptDialog.cancelEvent);
    },

    removeEvent: function(obj) {
        ptEvent.remove(obj, "mouseup", MTop().ptDialog.onmouseup);
        ptEvent.remove(obj, "mousemove", MTop().ptDialog.onmousemove);
        ptEvent.remove(obj, "dragstart", MTop().ptDialog.cancelEvent);
        ptEvent.remove(obj, "selectstart", MTop().ptDialog.cancelEvent);
    },
    cancelEvent: function(e) {
        return false;
    },
    onmouseup: function() {
        var id = MTop().ptDialog.moveId;
        var shadowObj = MTop().document.getElementById("ptModalShadow");
        if (!shadowObj.bMousedown) return;
        shadowObj.bMousedown = false;
        var XYposition = ptCommonObj2.getPosition(shadowObj);
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        var oHeader = MTop().document.getElementById("ptModHeader_" + id);
        var otb = MTop().document.getElementById("ptModTable_" + id);
        var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
        var oWin = null;
        if (oframe)
            oWin = oframe.contentWindow;
        if (shadowObj.bMove) {
            otb.style.left = XYposition.x + 'px';
            otb.style.top = XYposition.y + 'px';
            shadowObj.bMove = false;
            modObj.bCustMove = true;
        } else if (shadowObj.bResize) {
            MTop().ptDialog.resizeModalDialog(id, false, ptCommonObj2.getWidth(shadowObj), ptCommonObj2.getHeight(shadowObj));
            //resize zoom grid
            if (oWin && oWin.modalZoomName != null) {
                var zObj = oWin.document.getElementById(oWin.modalZoomName);
                if (zObj && zObj.innerHTML.indexOf("CKEDITOR") == -1)
                    oWin.resizeZoomGrid(oWin.modalZoomName,ptCommonObj2.getWidth(modObj), ptCommonObj2.getHeight(modObj));
            }    
            shadowObj.bResize = false;
        }
        shadowObj.style.left = "0px";
        shadowObj.style.top = "0px";
        shadowObj.style.width = "0px";
        shadowObj.style.height = "0px";
        shadowObj.style.zIndex = -1;
        shadowObj.style.display = "none";

        MTop().ptDialog.removeEvent(document);

        if (!modObj.bCrossDomain) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            if (oframe) {
                var oWin = oframe.contentWindow;
                var oDoc = oWin.document;
                MTop().ptDialog.removeEvent(oDoc);
            }
        }            
        
        if (modObj.bModeless) {
            ptCommonObj2.hidePopupMask(top, 'pt_modalMaskCover', true);
        }
        document.body.style.cursor = "auto";
    },

    onmousemove: function(e) {//moving
        e = e || window.event;
        var mousePos = ptCommonObj2.getMouseCoords(e);
        var shadowObj = MTop().document.getElementById("ptModalShadow");
        var x = mousePos.x;
        var y = mousePos.y;       
        if (typeof shadowObj.bMousedown == 'undefined' || !shadowObj.bMousedown) return;
        var xdiff = parseInt((x - shadowObj.mouse_x) + 0);
        var ydiff = parseInt((y - shadowObj.mouse_y) + 0);
        shadowObj.mouse_x = x;
        shadowObj.mouse_y = y;
        if (xdiff == 0 && ydiff == 0) return;
        if (shadowObj.bMove) {
            shadowObj.style.left = xdiff + shadowObj.offsetLeft + "px";
            shadowObj.style.top = ydiff + shadowObj.offsetTop + "px";
        }
        else if (shadowObj.bResize) {
            modObj.bCustResize = false;
            var newWidth = xdiff + shadowObj.clientWidth;    
            var newHeight = ydiff + shadowObj.clientHeight;  
            if (newWidth > 0)
                shadowObj.style.width = newWidth + "px";  
            if (newHeight > 0)
                shadowObj.style.height = newHeight + "px";  
            modObj.bCustResizeDone = true;  
        }
    },

    onMouseDown: function(e) {
        e = e || window.event;
        var eObj = ptCommonObj2.getEO(e);
        var mousePos = ptCommonObj2.getMouseCoords(e);
        var x = mousePos.x;
        var y = mousePos.y;
        var id = eObj.id.split("_")[1];
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        var shadowObj = MTop().document.getElementById("ptModalShadow");
        var otb = MTop().document.getElementById("ptModTable_" + id);
        var oHeader = MTop().document.getElementById("ptModHeader_" + id);
        var oBottom = MTop().document.getElementById("ptModBottom_" + id);  
        var sizeBottom = oBottom ? (oBottom.offsetHeight - 5) : 0;     
        if (modObj.bModeless) {
            ptCommonObj2.showPopupMask(top, 'pt_modalMaskCover', true);
        }
        shadowObj.mouse_x = x;
        shadowObj.mouse_y = y;
        MTop().ptDialog.moveId = id;
        shadowObj.style.left = ptCommonObj2.getLeftPos(otb) + "px";
        shadowObj.style.top = ptCommonObj2.getTopPos(otb) + "px";
        shadowObj.style.width = ptCommonObj2.getWidth(otb) + "px";
                
        shadowObj.style.height = ptCommonObj2.getHeight(otb) + oHeader.offsetHeight + sizeBottom + "px";
        shadowObj.style.zIndex = modObj.style.zIndex + 10;
        shadowObj.style.display = "block";
        shadowObj.bMousedown = true;
        shadowObj.mouseOffset = ptCommonObj2.getMouseOffset(modObj, e);

        MTop().ptDialog.setEvent(document);

        if (!modObj.bCrossDomain) {
            var oframe = MTop().document.getElementById(MTop().PTMODFRAME_ + id);
            if (oframe) {
                oWin = oframe.contentWindow;
                var oDoc = oWin.document;
                MTop().ptDialog.setEvent(oDoc);
            }
        }
        
    },
    RemoveHandler: function(id) {
        var oTitleBar = MTop().document.getElementById("ptModTitleBar_" + id);
        var obottom = MTop().document.getElementById("ptModBottom_" + id);
        var octl = MTop().document.getElementById("ptModControl_" + id);
        var oresize = MTop().document.getElementById("ptModResize_" + id);
        if (obottom) {
            obottom.style.height = "0px";
            oresize.style.display = "none";
        }
        oTitleBar.onmousedown = null;
        if (octl) octl.style.display = "none";
        oTitleBar.style.cursor = "auto";
    },
    AddHandler: function(id) {
        var modObj = MTop().document.getElementById(MTop().PTMOD_ + id);
        modObj.bMove = false;
        modObj.bMousedown = false;
        modObj.bResize = false;

        var oTitleBar = MTop().document.getElementById("ptModTitleBar_" + id);
        var oTitle = MTop().document.getElementById("ptModTitle_" + id);
        var octl = MTop().document.getElementById("ptModControl_" + id);
        if (octl) octl.style.display = "block";
        var shadowObj = MTop().document.getElementById("ptModalShadow");
        oTitleBar.style.cursor = "move";
        oTitleBar.onmousedown = function(e) { //engage in move
            document.body.style.cursor = "move";
            var shadowObj = MTop().document.getElementById("ptModalShadow");
            shadowObj.bMove = true;
            shadowObj.style.cursor="";  
            MTop().ptDialog.onMouseDown(e);
        }
        var obottom = MTop().document.getElementById("ptModBottom_" + id);
        if (obottom) {
            var oresize = MTop().document.getElementById("ptModResize_" + id);
            oresize.style.display = "block";
            obottom.style.display = "block";
            obottom.style.height = "14px";
            obottom.onmousedown = function(e) { //engage in resize
                var shadowObj = MTop().document.getElementById("ptModalShadow");
                shadowObj.bResize = true;
                shadowObj.style.cursor = ('ltr'=='ltr') ? 'nw-resize' : 'ne-resize';
                MTop().ptDialog.onMouseDown(e);
            }
        }
    }
}

function showModal(url, parentWin, options, msg, onclose,bResize,pollContent) {
    if (ptConsole2.isActive() && !bPerf)
        ptConsole2.append((new Date()).valueOf() + "modal url:\n" + url + "\n");

    if (parentWin.modWin != 'undefined' && parentWin.modWin != null) {
        closeModal(parentWin.modWin.modalID);
        parentWin.modWin = null;
    }

    if (typeof options !== "undefined" && options) {
        options = options + 'closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';        
    } else {
        options = 'closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';
    }
        
    parentWin.modWin = showModalDialog_pt(url, parentWin, options, msg, onclose, null, null, pollContent);
    if (typeof(pollContent) !== "undefined" && pollContent) {
        setModWinParent();
    } else {
        var nDelay = 1000;
        if (!browserInfoObj2.isIE) { nDelay = 2000; }
        if (typeof bResize != 'undefined' && bResize) { nDelay = 0; }
        parentWin.setModWinID = window.setTimeout('setModWinParent();', nDelay);
    }
}

function setModlessWinParent() {
    setModWinParent(window.modLessWin);
}

function setModWinParent(modlessWin) {
    if (MTop().modId == -1) return;
    var modWin = window.modWin;
    var bModless = false;
    if (typeof modlessWin != 'undefined') { modWin = modlessWin; bModless = true; }
    var modObj = MTop().document.getElementById(MTop().PTMOD_ + MTop().modId);
    var bPIA = modObj.bPIA;
    var obj = null;
    var pId = null;
    var owin = null;
    var modErrObj = null;
    if (modObj.bCrossDomain) {
        MTop().ptDialog.resizeModalDialog(MTop().modId, true, modObj.width, modObj.height);
        return;
    }
    try {
        obj = modWin.contentWindow.document.body;
        if (obj == null || !modWin.contentWindow.modalID) {
            if (bModless)
                setModWinID = window.setTimeout('setModlessWinParent();', 1000);
            else
                setModWinID = window.setTimeout('setModWinParent();', 1000);
        } 
        var id = modWin.id;
        pId = id.split("_")[1];
        if (!bPIA) {  
            modWin.contentWindow.winParent = window;
            modWin.contentWindow.dialogArguments = window;
            modWin.contentWindow.modalID = pId;
            modWin.contentWindow.name = "modWin_" + pId;
        }
        owin = modWin.contentWindow;        
        if (bModless)
            window.modlessWin = owin;
        else
            window.modWin = owin;
         var modDoc = modWin.contentWindow.document;
        modErrObj = modDoc.getElementById("PSMODAL_FATAL");
        if (typeof setModWinID != 'undefined' && setModWinID != null)
            window.clearTimeout(setModWinID);
        if (modErrObj) {
            pWin = getFirstParentWin();
            var formname = modObj.form.name;
            oForm = pWin.document.getElementById(formname);
            var modObj = getFirstModObj;
            var name = modObj.name;
            var sTxt = modErrObj.innerHTML;
            var xmlResponse = sTxt.substring(5, sTxt.length - 5);
            if (ptConsole2.isActive() && !bPerf)
                ptConsole2.append((new Date()).valueOf() + " modal FATAL ERROR abort response:\n" + xmlResponse);
            closeModal();
            var sScript = 'var postUrl=postUrl_' + oForm.name + ';';
            eval(sScript);
            loader = new pWin.net2.ContentLoader(postUrl, oForm, name, null, null, null, null, null, true, true, null, false, xmlResponse);
        } else {
         modErrObj = modDoc.getElementById("PSMODAL_ERR");
        //ptCommonObj2.hidePopupMask(window.modWin, 'pt_modalMaskCover');
        if (modErrObj) {       
            var sTxt = modErrObj.innerHTML;
            var xmlResponse = sTxt.substring(5, sTxt.length - 5);
            if (ptConsole2.isActive() && !bPerf)
            ptConsole2.append((new Date()).valueOf() + " modal abort response:\n" +xmlResponse);
            closeModal(pId); 
            var sScript = 'var postUrl=postUrl_' + modObj.form.name + ';';
            eval(sScript);
            loader = new net2.ContentLoader(postUrl, modObj.form, modObj.name, null, null, null, null, null, true, true, null, false, xmlResponse);
        } else if (pId && owin && (!bPIA)) {
            MTop().resizeModalDialog_pt(pId);   
        }
    }
    }
    catch (err) {
        if (bModless)
            setModWinID = window.setTimeout('setModlessWinParent();', 1000);
        else
            setModWinID = window.setTimeout('setModWinParent();', 1000);
        return;
    }
   
}

function showModalDialog_pt(url, obj, options, msg, onclose, form, name, pollContent) {
    return MTop().ptDialog.showModalDialog(url, obj, options, msg, onclose, form, name, pollContent);
}

function resizeModalDialog_pt(id, bReload) {

    if (typeof bReload != 'undefined' && bReload) {
    return MTop().ptDialog.resizeModalDialog(id, true);
    }

    return MTop().ptDialog.resizeModalDialog(id);
}

function hideModal(id) {
    return MTop().ptDialog.hideModalDialog(id);
}
function closeHideModal(id) {
    return MTop().ptDialog.closeHideModal(id);
}

function closeModalAll() {
    return MTop().ptDialog.closeModalAll();
}

function closeModal(id) {
    return MTop().ptDialog.closeModalDialog(id);
}

function closeModal0(id) {
    return MTop().ptDialog.closeModalDialog0(id);
}

function doCloseModal(obj) {
    var id = obj.id.split("_")[1];
    return MTop().ptDialog.doCloseModalDialog(id);
}

function doCloseModal0(id) {
    return MTop().ptDialog.doCloseModalDialog0(id);
}

function getFirstParentWin() {
    return MTop().ptDialog.getFirstParentWin();
}

function getFirstModObj() {
    return MTop().ptDialog.getFirstModObj();
}

function addMsg(msg, oParentWin, options)
{  
   if (typeof oParentWin == 'undefined') {
        oParentWin = window;
        options = 'closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';
    }
    return MTop().ptDialog.addMsg(msg, oParentWin, options);
}

function isAnyMsg() {
    return MTop().ptDialog.isAnyMsg();
}
function playMsg() {
    return MTop().ptDialog.playMsg();
}

function showModalMessage(msg, obj, option) {
    return MTop().ptDialog.showModalMessage(msg, obj, option);
}

function closeMsg(obj,id) {
    return MTop().ptDialog.closeModalMsg(obj,id);
}

function isModeless(id) {
    return MTop().ptDialog.isModeless(id);
}

function isWinModeless(win) {
    return MTop().ptDialog.isWinModeless(win);
}

function MTop() {
    try {
		//use top.document.getElementsByTagName("BODY")[0] != null to judge if frameset template is not used in top window
		//typeof top.gFocusId != 'undefined' is always true which can't be used to judge this after PT852
        if (typeof top.gFocusId != 'undefined' && top.document.getElementsByTagName("BODY")[0] != null)
            return top;
        else if (typeof top.ModalTop != 'undefined' && top.ModalTop)
            return top.ModalTop;
    }
    catch (err) {
    }
    return getTargetFrame(top.frames);
}

function getTargetFrame(frames) {
    for (var j = 0; j < frames.length; ++j) {
        var objFrame = frames[j];
        if (objFrame && typeof objFrame.gFocusId != 'undefined' && (objFrame.name == "TargetContent" || objFrame.name == "rightF")) {
            top.ModalTop = window;
            return objFrame;
        }
       if (objFrame.frames.length > 0 && !isCrossDomain(objFrame))
            return getTargetFrame(objFrame.frames);
    }
}

if (window == top) 
    ptDialog = new PT_Dialog();
else if ((typeof top.gFocusId == 'undefined' || top.document.getElementsByTagName("BODY")[0] == null) && (window.name == "TargetContent" || window.name == "rightF"))
    ptDialog = new PT_Dialog();
//MOVED FROM PT_COPYURL


function CopyUrlToClipboard(msg)
{
if (!msg || msg=='undefined')
    msg = strCurrUrl;
// strCurrUrl contains the url to copy to the clipboard
if (navigator.appName == "Netscape")
    {
    // Netscape 7.1 Copy to Clipboard
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    if (!str)
        {
        alert("no support 1");
        return;
        }
    str.data=msg;
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return;
    trans.addDataFlavor("text/unicode");
    trans.setTransferData("text/unicode",str,strCurrUrl.length*2);
    // ICE#:1437732000 - var Iclip and var clip
    var Iclip = Components.interfaces.nsIClipboard;
    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Iclip);
    if (!clip)
        {
        alert("no support 2");
        return;
        }
    clip.emptyClipboard(clip.kGlobalClipboard);
    clip.setData(trans,null,clip.kGlobalClipboard);
    }
else
    {
    // IE Copy to Clipboard
    clipboardData.setData("Text", msg);
    }
}


function getptBaseURI()
{
    var ptBaseURI = "";
    var nPos = String(location).indexOf('\/psp\/');
    if (nPos != -1)
    {
        ptBaseURI = String(location).substr(nPos,String(location).length);
        var addressLoc = String(ptBaseURI).match(/\/ps(c|p)\/?([^\/]*)?\/?([^\/]*)?\/?([^\/]*)?\//);
        if (addressLoc)
            ptBaseURI = addressLoc[0].replace('\/psp\/','\/psc\/');
        else 
            ptBaseURI = "";
    }
    else 
        ptBaseURI = String(location).match(/\/ps(c|p)\/?([^\/]*)?\/?([^\/]*)?\/?([^\/]*)?\//)[0].replace('psp','psc');
        
    return ptBaseURI;
}

// UniNav: Retaining the local portal context while opening the remote crefs
 
function OpenCrefInUniNav (Tgtobj,TgtLoc){ 
      
          var ptSearchURI = "";
     var ptUnBaseURI = "";
     var ExternalURL = "FALSE";
     if (TgtLoc == "")
       TgtLoc = "_top";
         
     var nUrlPos = String(Tgtobj).indexOf('\/psp\/'); 
     if(nUrlPos === -1)
        var nUrlContPos = String(Tgtobj).indexOf('\/psc\/'); 
 
     if(nUrlContPos === -1)
        ExternalURL = "TRUE";
 
     if(ExternalURL != "TRUE") {

	var PortalLocation = top.document.location.href;
	if(PortalLocation == "")
	PortalLocation = location; 

        var URLArr= String(PortalLocation).split("/");	
        for(var ai = 0; ai < 6; ai++ ){
        if(ai==3) {
             ptUnBaseURI = ptUnBaseURI+"psp"+"/";
        }else {
              ptUnBaseURI = ptUnBaseURI + URLArr[ai]+"/";
        }}

        var SrchURLArr= String(Tgtobj).split("/");
        for(var bi = 6; bi < (SrchURLArr.length); bi++ ){ 
        if((SrchURLArr.length-1) === bi) {
               ptSearchURI = ptSearchURI + SrchURLArr[bi];   
        }else {
            ptSearchURI = ptSearchURI + SrchURLArr[bi]+"/";   
        }}
        ptUnBaseURI = ptUnBaseURI + ptSearchURI  ;

        var paramExist = Tgtobj.indexOf('?');
        var unParam = "?cmd=uninav";
        var temploc = "";

        if(paramExist != -1){
        unParam = "&cmd=uninav";
        }
        if(TgtLoc == "_blank"){
        temploc = "window.open('"+ptUnBaseURI+unParam+"','_blank')";
        } else {
        var TgtLocIndx = String(TgtLoc).indexOf('_');
        if(TgtLocIndx == 0){    
           TgtLoc = String(TgtLoc).slice(1);}
            temploc = TgtLoc+".document.location = '"+ptUnBaseURI+unParam+"'";
        }
        eval(temploc); 
     } else { 
           TgtLoc = "_blank";
           window.open(Tgtobj,TgtLoc); 
     }
}
 



// IWC Inter-Window Communication Changes for 8.52

// Message Events Module
var pm = new Object();

(function($){
  
  // A few vars used in non-awesome browsers.
  var p_interval_id,
    p_previous_hash,
    p_cache_number = 1,
    
    // A var used in awesome browsers.
    rm_callback,
    
    // A few convenient shortcuts.
    window = this,
    FALSE = !1,
    
    // Reused internal strings.
    postMessage = 'postMessage',
    addEventListener = 'addEventListener',
    
    p_accept_message,

    p_handler,

    p_messagehandler,

    p_message,

    p_messageEventDeferred = false,

    p_messageEventsApplied = false,

    p_objFrameArr = new Array(),

    postMessage_supported = window[postMessage] 
  

  $.isFunction = function( obj ) 
    {
        return Object.prototype.toString.call(obj) === "[object Function]";
    };

  // This function postMessage is using browsers API postMessage if it is supported by the browser, 
  // otherwise it puts the message in the url after the hash
  $[postMessage] = function(msg, target_url, target) 
  {
    if (!target_url) 
      return; 
    
    msg = typeof msg === 'string' ? msg : $.param( msg );
    
    
    target = target || parent;

    if (postMessage_supported) 
    {
      var temp_url = target_url.replace( /([^:]+:\/\/[^\/]+).*/, '$1' );
      target[postMessage]( msg, temp_url);
    }
    else 
    {
      if (target_url) 
        target.location = target_url.replace( /#.*$/, '' ) + '#' + (+new Date) + (p_cache_number++) + '&' + msg;
    }
  };
  

$.getFrame = function(fName){
  var frame;
  if (fName == "" || fName == "top") 
    frame = parent;
  else
    frame = top.frames[fName];
  return frame;
};

$.getForm = function(theFrame, pName){
  var theForm; 
  var fDoc = theFrame.document;
  var pglt = fDoc.getElementById(pName);
  if (pglt && typeof pglt != "undefined")
    theForm = pglt.getElementsByTagName('form')[0];
  else 
    if (pName.indexOf("ptpglt") != 0 )
      theForm = fDoc.getElementsByTagName('form')[0];
  return theForm;
};

$.getFormField = function(fDoc, fldName, msgFldNames) {
  fldArr = fDoc.getElementsByName(fldName);
  msgFldArr = msgFldNames.split(",");
  msgFld = fDoc.getElementById(msgFldArr[0]);
  if (!msgFld || typeof msgFld == 'undefined')
    return;
  for (var i = 0; i < fldArr.length; i++)
  {
    if (fldArr[i].form.name == msgFld.form.name)
      return fldArr[i];
  }
  return null;
};

$.isPageletSubscribed = function(eName)
{
  for (var x = 0; x < p_message_data.length; x++)
  {
    if (p_message_data[x][5] == eName && p_message_data[x][2] == "S")
      return true;
  }
  return false;
};

$.removeExistingEventHandler = function(fld, eventName) // removes the existing event handler as well
{
  var eventObject;
  var eventValue;

  if (fld.addEventListener) {
    eventObject = fld.attributes.getNamedItem("onchange");
    if (eventObject != null) eventValue = eventObject.value;
    fld.removeEventListener(eventName, p_handler, false);
  } else {
     eventName = "on" + eventName;
     eventObject = fld.attributes.getNamedItem(eventName);
     if (eventObject != null) eventValue = eventObject.value;
     fld.detachEvent(eventName, p_handler);
  }
  return eventValue;
};

$.getJSONMessageData = function(theFrame, fldDataNames)
{
  var message = "{";
  var fldId;
  var theDoc = theFrame.document;
  fieldNames = fldDataNames.split(",");
  for (var i = 0; i < fieldNames.length; i++)
  {
    fldId = theDoc.getElementById(fieldNames[i]);
    if (!fldId || typeof fldId == 'undefined')
      continue;
    if (i) message += ",";
    message += "'" + fldId + "' : '" + fldId.value + "'";
  }
  message += "}"
  return message;
};

$.getStringMessageData = function(theFrame, eName, fldDataNames)
{
  var message = eName;
  var fldId;
  var theDoc = theFrame.document;
  fieldNames = fldDataNames.split(",");
  for (var i = 0; i < fieldNames.length; i++)
  {
    fldId = theDoc.getElementById(fieldNames[i]);
    if (!fldId || typeof fldId == 'undefined')
      continue;
    message += ",";
    message += fldId.value;
  }
  return message;
};

$.getIWCEventData = function(eventName, eventType)
{
  var iwcArray = new Array();
  for (var x = 0; x < p_message_data.length; x++)
  {
    if (eventName == p_message_data[x].eventName && p_message_data[x].eventType == eventType)
      iwcArray.push(p_message_data[x]);
  }
  return iwcArray;
};

$.attachEvent = function(theFrame, eventName, fldName, eventJSName,  fldDataNames)
{

  var p_messageAfterEvent = "";
  var fld = $.getFormField(theFrame.document, fldName, fldDataNames);
  if (!fld || typeof fld == 'undefined')
    return;
  if (eventJSName == "C")
    eventJSName = "change"
  else 
    if (eventJSName == "L")
      eventJSName = "click"
    else 
      return;
  var eventOnClick = fld.attributes.getNamedItem("onclick");
  var eventOnChange = fld.attributes.getNamedItem("onchange");

  p_handler = function(event) 
  {
    $.GetMessageFrames();
    if ((eventOnChange != null && eventOnChange.nodeValue != null) ||
        (eventOnClick != null && eventOnClick.nodeValue != null))
    {
      var iwcData = $.getIWCEventData(eventName, "P");
      if (iwcData.length)
        $.p_message = iwcData[0].p_message;  //Only one row is possible in publish of an event
    }
    else
    {
      var message = $.getStringMessageData(theFrame, eventName, fldDataNames);
      var thisFrame;
      while (p_objFrameArr.length)
      {
        try 
        {
        thisFrame = p_objFrameArr.shift();
        $.postMessage(message, thisFrame.location.href, thisFrame.window);
        }
        catch(e) {}
      }
    }
  };

  if ((eventOnChange != null && eventOnChange.nodeValue != null) ||
      (eventOnClick != null && eventOnClick.nodeValue != null))
  {
    p_messageAfterEvent = "pm.eventAfterAJAX('" + theFrame.name + "', '" + eventName + "', '" + fldDataNames + "');"
  }
 
  if (fld.addEventListener) {
      fld.addEventListener(eventJSName, p_handler, false);
  } else {
      eventJSName = "on" + eventJSName;
      fld.attachEvent(eventJSName, p_handler);
  }

  return p_messageAfterEvent;
}; 

$.eventAfterAJAX = function(fName, eName, fldDataNames)
{
  //if (!p_messageEventDeferred) return; //Only fire the event after the event happened
  var theFrame = $.getFrame(fName);

  var message = $.getStringMessageData(theFrame, eName, fldDataNames);  
  while (p_objFrameArr.length)
  {
    var thisFrame;
    try 
      {
      thisFrame = p_objFrameArr.shift();
      $.postMessage(message, thisFrame.location.href, thisFrame.window);
      }
    catch(e) {}
  }
  $.p_messageEventDeferred = false;   // resetting the flag
};

$.attachHandler = function(theFrame)
{
  
  var fDoc = theFrame.document;

  p_messagehandler = function(event) {
    
    var eventDataField, eventFunc;
    var eventDataValues = event.data.split(",");
  
    sEventName = eventDataValues[0];   // First value is the Event Name
    var iwcData = $.getIWCEventData(sEventName, "S");  // Get All the records that subscribed to this event
    if (!iwcData.length) 
      return;// Not Subscribed to this event

    for (var x = 0; x < iwcData.length; x++)
    {
      var rtfldDataNames = iwcData[x].eventData;
      var rtfldEvent = iwcData[x].htmlFieldName;
      $.updateDOMFields(rtfldDataNames, eventDataValues, fDoc);

      if (rtfldEvent != null)
      {     
        if (rtfldEvent.indexOf("javascript:") == 0)  
          eventfunc = rtfldEvent;
        else
          eventDataField = fDoc.getElementById(rtfldEvent);
      }

      if (eventDataField != null)
      {
        var clickEvent = eventDataField.attributes.getNamedItem("onclick");
        if (clickEvent && clickEvent.nodeValue != null)
          eventDataField.onclick(); // Click some action button
        else
        {
          var submitStr = "submitAction_" + eventDataField.form.name + "(document.getElementById('" + rtfldEvent + "').form, '" + rtfldEvent + "');";
          eval(submitStr);
        }
      }
      if (eventFunc != null)
        eval(eventFunc); // Execute some javascript function.

      if (iwcData[x].fieldEventType == "F") // Only Pagelet Refresh is required
      {
        var refreshBtn = fDoc.getElementById("rfrsh_" + iwcData[x].crefId);  // Homepage Pagelets
        if (refreshBtn == null) // Work Center Pagelet
        {
          if (rtfldDataNames != null)
          {
            var refreshParams = $.getRefreshParams(rtfldDataNames, eventDataValues); // Refresh with parameters
            reloadPagelet(iwcData[x].crefId, "", refreshParams);
          }
          else
            reloadPagelet(iwcData[x].crefId);
        }
        else
        {
          if (rtfldDataNames != null)
           $.refreshWithParams(refreshBtn, rtfldDataNames, eventDataValues);
          else
            refreshBtn.onclick(); // Simple Refresh
        }
      }
    }

  }

  var source_origin = fDoc.location.protocol + "//" + fDoc.location.host;

  $.accept_message(p_messagehandler, source_origin, 200);
};

$.getRefreshParams = function(fieldNames, eventDataValues)
{
  var paramStr = "";
  var rtfieldNames = fieldNames.split(",");
  for (var i = 0; i < rtfieldNames.length; i++)
    paramStr = "&" + rtfieldNames[i] + "=" + eventDataValues[i+1];
  return paramStr;
};

$.refreshWithParams = function(refreshBtn, fieldNames, fieldValues)
{
  var refreshParams = $.getRefreshParams(fieldNames, fieldValues); // Refresh with parameters
  var refEvent = refreshBtn.attributes.getNamedItem("onclick").nodeValue;
  var strEventArr = refEvent.split(",");
  var urlStr = strEventArr[1].replace(/'/g, "");
  var newUrlStr = urlStr + refreshParams;
  var newRefEvent = refEvent.replace(urlStr, newUrlStr);
  eval(newRefEvent.split(";")[0]);
};

$.updateDOMFields = function(fieldNames, eventDataValues, fDoc)
{
  var fieldFound = false;
  var rtfieldNames = fieldNames.split(",");
  var rtfieldObj = new Array(rtfieldNames.length);
    
  for (var i = 0; i < rtfieldNames.length; i++)
  {
    rtfieldObj[i] = fDoc.getElementById(rtfieldNames[i]);
    if (rtfieldObj[i] && typeof rtfieldObj[i] != 'undefined' && !rtfieldObj[i].disabled)
      fieldFound = true;
  }

  if (!fieldFound)
    return;

  for (var j = 1; j < eventDataValues.length; j++)
    $.updateFieldData(rtfieldObj[j-1], eventDataValues[j]); //Update DOM Fields

  for (var j = 1; j < eventDataValues.length; j++)
  {
    var eventObject = rtfieldObj[j-1].attributes.getNamedItem("onchange"); // Execute any field Change events
    if (eventObject != null && eventObject.nodeValue != null)
    {
      var submitStr = "submitAction_" + rtfieldObj[j-1].form.name + "(document.getElementById('" + rtfieldNames[j-1] + "').form, '" + rtfieldNames[j-1] + "');";
      eval(submitStr);
    }
  }
};

$.updateFieldData = function(fieldObject, fieldValue)
{
  if (fieldObject.type == "select")
  {
    for (var i = 0; i < fieldObject.options.length; i++)
    {
      if (fieldObject.options[i].value == fieldValue)
        fieldObject.options[i].selected = true;
    }
  }
  else
    fieldObject.value = fieldValue; 
  sScript = "addchg_"+ fieldObject.form.name+"(fieldObject);";
  eval(sScript);
  
};

$.GetFramesWithMessages = function(frames)
{
  if (frames)
  {
    for (var j=0; j < frames.length; ++j)
    {
      p_objFrameArr.push(frames[j]);
      
      if ((!isCrossDomain(frames[j])) && (frames[j].frames))
        $.GetFramesWithMessages(frames[j].frames);
    } 
  }
};

  // This function is listener function needs to called in all the frames involved in IWC
  // whenever there is a message send using postMessage, this provides the callback function.

  $.accept_message = p_accept_message = function( callback, source_origin, delay ) 
  {
    if (postMessage_supported) // if browser supports the postMessage API
    {      
      if ( callback ) 
      {        
        rm_callback && p_accept_message();
        
        rm_callback = function(e) 
        {
          if ( ( typeof source_origin === 'string' && 
                 e.origin !== source_origin )
            || ( $.isFunction( source_origin ) && 
                 source_origin( e.origin ) === FALSE ) 
             ) 
          {
            return FALSE;
          }
          callback( e );
        };
      }
      
      if (window[addEventListener]) 
      {
        window[ callback ? addEventListener : 'removeEventListener' ]( 'message', rm_callback, FALSE );
      } 
      else 
      {
        window[ callback ? 'attachEvent' : 'detachEvent' ]( 'onmessage', rm_callback );
      }
      
    } 
    else 
    { 
      // if postMessage is not supported by the browser
      // We will continuously polling the url to see if the value of  document.location.hash has changed
      // if the value is changed we will execute the callback function.
    
      p_interval_id && clearInterval( p_interval_id );
      p_interval_id = null;
      
      if ( callback ) 
      {
        delay = typeof source_origin === 'number' ? source_origin : typeof delay === 'number' ? delay : 100;
        
        p_interval_id = setInterval(function()
        {
          var docHash = document.location.hash,
          re = /^#?\d+&/;
          if ( docHash !== p_previous_hash && re.test( docHash ) ) {
            p_previous_hash = docHash;
            callback({ data: docHash.replace( re, '' ) });
          }
        }, delay );
      }
    }
  };

$.GenerateMessageEvents = function()
{
  if (typeof $.p_message_data == "undefined") 
    $.p_message_data = p_message_data; // To support the work center pagelets
  if (typeof $.p_message_data == "undefined") return;
  for (var x = 0; x < $.p_message_data.length; x++)
  {
    if ($.p_message_data[x].eventType == "P") 
    {
      $.p_message_data[x].p_message = $.attachEvent(window,
                      $.p_message_data[x].eventName, 
                      $.p_message_data[x].htmlFieldName, 
                      $.p_message_data[x].fieldEventType, 
                      $.p_message_data[x].eventData);
      var g_iwcData = $.getIWCEventData($.p_message_data[x].eventName, "P"); //update the global array of events also
      if (typeof $.p_message_data[x].p_message != 'undefined' && $.p_message_data[x].p_message)
        g_iwcData[0].p_message = $.p_message_data[x].p_message;
    }
  }
};

$.GenerateMessageEventsTC = function()
{
  p_message_data = top.p_message_data;
  if (typeof p_message_data == "undefined") return;

  for (var x = 0; x < p_message_data.length; x++)
  {
    if (p_message_data[x].eventApplied) continue;
    if (p_message_data[x].eventType == "P") 
      p_message_data[x].p_message = $.attachEvent(window,
                                         p_message_data[x].eventName, 
                                         p_message_data[x].htmlFieldName, 
                                         p_message_data[x].fieldEventType, 
                                         p_message_data[x].eventData);

  }
};

$.GetMessageFrames = function()
{
  if (top.frames.length)
    $.GetFramesWithMessages(top.frames);
  else
    p_objFrameArr.push(parent);
};

$.GenerateEvents = function()
{
  $.GenerateMessageEvents();
  $.attachHandler(window);
};

$.getFunctionName = function(fn) 
{
   if (fn == null) 
     return null;
   var rgx = /^function\s+([^\(\s]+)/
   var matches = rgx.exec(fn.toString());
   return matches ? matches[1] : "(anonymous)"
};

$.updateMessageEvents = function()
{
  if ($.p_message != null && $.p_message.length > 0) // Executing the Message Event after the AJAX refresh
  {
    var temp_mesg = $.p_message;
    $.p_message = "";
    eval(temp_mesg);
  }
  if (typeof p_message_data != "undefined" && p_message_data.length > 0)
    $.GenerateMessageEvents(); // ReApply the Message Events after the server trip
};

})(pm);

function IWCRecord (crefId, htmlFldName, eventName, eventType, eventData, fldEventType)
{
this.crefId = crefId;
this.htmlFieldName = htmlFldName;
this.eventName = eventName;
this.eventType = eventType;
this.eventData = eventData;
this.fieldEventType = fldEventType;
this.p_message = " ";
};


var glObjTr = {};
glObjTr.oMyArray = new Array();
glObjTr.sOpen = "";
glObjTr.aSource = [];
glObjTr.nTm = "";
glObjTr.aHash = [];
glObjTr.ch127 = String.fromCharCode(127);
glObjTr.ch177 = String.fromCharCode(177);
glObjTr.chDv = String.fromCharCode(176);
glObjTr.dc = "";
glObjTr.nLenNd = 0;
glObjTr.nLenStr = 0;
glObjTr.bUseTopDoc = 0;
glObjTr.bCrtCtxMn= 0;
glObjTr.occNmb=""; 
glObjTr.oOrgChr=new Object();
glObjTr.oRBChr=new Object();
glObjTr.iType = 4;
glObjTr.nDocMode = 7;

glObjTr.bChrtRtMn=0;
glObjTr.bChrtMn=0;
glObjTr.nTop = 0;
glObjTr.nLeft=0;
glObjTr.nChrtScrlTp = 0;
glObjTr.nChrtScrlLf=0;
glObjTr.nMnMaxLfPs =0;
glObjTr.nMnMaxTpPs =0;


glObjTr.findObjTreePT = function (sUCn) {
    for (var s in this.oMyArray) {
        if (this.oMyArray[s].ID == sUCn) {
            break;
        }
    }
    return this.oMyArray[s];
}

glObjTr.addProcTree = function (obj) {
    this.oMyArray.push(obj);
}

glObjTr.procTree = function (sUCn) {
    this.ID = sUCn;
}

glObjTr.procTree.prototype.crtAssocArray = function (sSrv, nPrm) {
    glObjTr.nLenStr = sSrv.length;
    var len = 0,
        len1 = 0,
        len2 = 0,
        len3 = 0,
        len4 = 0,
        len5 = 0;
    var a1 = sSrv.split(glObjTr.chDv + glObjTr.chDv);
    var nTestNode = 0;
    var a2, a3, a4, a5, sDdID, sCont, sParId, sCom = "",
        sIndex = "";
    var aCont = new Array();
    var aTreeStruct = new Array();
    len = a1.length;
    if (len < 2) {
        alert(" the input string is not formated correctly return 0");
    }
    for (var i = 0; i < len; i++) {
        if (a1[i].indexOf(glObjTr.chDv) < 0) {
            sDdID = a1[i];
            sCont = a1[i + 1];
            if (sCont.indexOf(glObjTr.ch127 + glObjTr.ch127) < 0) 
                return 1;
            len1 = sCont.length;
            if (sCont.lastIndexOf(glObjTr.ch127 + glObjTr.ch127) + 2 == len1) {
                sCont = sCont.substr(0, len1 - 2);
            } 
            else
                return 2;
            a2 = sCont.split(glObjTr.ch127 + glObjTr.ch127);
            len2 = a2.length;
            for (var p = 0; p < len2; p++) {
                a3 = a2[p].split(glObjTr.chDv);
                if (a3.length != 2) 
                    return 3;
                sParId = a3[0];
                sCont = a3[1];
                sIndex = sDdID + glObjTr.ch127 + sParId;
                aTreeStruct[sIndex] = [];
                if (sCont.indexOf(',') < 0) 
                    return 4;
                aCont.length = 0;
                a4 = sCont.split(glObjTr.ch127);
                len4 = a4.length;
                nTestNode = nTestNode + len4;
                for (var w = 0; w < len4; w++) {
                    a5 = a4[w].split(',');
                    len5 = a5.length;
                    if (len5 < nPrm) 
                        return 5;
                    if (len5 > nPrm) 
                        a5.length = nPrm;
                    aTreeStruct[sIndex].push(a5);
                }
            }
        } 
        else {
            continue;
        }
    }
    glObjTr.nLenNd = nTestNode;
    return aTreeStruct;
}

glObjTr.changeBkg = function (o) {
    if (o.className == "PT_ORG_ACTION_BG") 
        o.className = "PT_ORG_ACTION_HVR_BG";
    else if (o.className == "PT_ORG_ACTION_HVR_BG") 
        o.className = "PT_ORG_ACTION_BG";
}

glObjTr.showActionMenu = function () {
    var argv = this.showActionMenu.arguments;
    var sParentId = argv[0];
    var nLeft = argv[1];
    var nTop = argv[2];
    var nParametrs = argv[3];
    var nType = argv[4]; 
    var sSrcStr = argv[5];
    var sId = argv[6];
    var sNId = "";
    var nDescr = "";
    glObjTr.iType = parseInt(nType);    
    if (glObjTr.iType < 3) {
        sNId = argv[7];
        nDescr = argv[8];
    }
    var sCntr = sParentId;
    var index = sParentId.indexOf("$$");
    if (index > 1) {
        var temp;
        temp = sParentId.substring(0, sParentId.indexOf('$'));
        sCntr = temp;
    }

    var indexSearch= sParentId.indexOf("relatedActionsPers");
    if (indexSearch > -1) {
        glObjTr.bUseTopDoc = 1;
        glObjTr.nDocMode = window.top.document.documentMode;
    }
    else {
        glObjTr.bUseTopDoc = 0;
    }
    if (this.isEmpty(glObjTr.nDocMode)) { //For IE7
        glObjTr.nDocMode=7;
    }
    var oProcTree = new glObjTr.procTree(sCntr);
    glObjTr.addProcTree(oProcTree);
    var oOrgMn = glObjTr.findObjTreePT(sCntr);
    glObjTr.aHash = oOrgMn.crtAssocArray(sSrcStr, nParametrs);
    var oBr = new PT_browserInfo();
    oBr.init();
    var bIEBr = oBr.isIE;
     
    var sAct="click";
    if(oBr.isiPad){
        sAct="touchstart";
    }
    var sNdDscCtr = "";    
    if (glObjTr.iType < 3) {
        sNdDscCtr = sNId + "$" + nDescr;
    }
    var sNewRootMnID = sCntr + "$$" + unescape(sId) + this.ch127 + "#rt#" + "$" + sNdDscCtr;
    if (glObjTr.sOpen != "") {
        var oOpen;
        if (!glObjTr.bUseTopDoc)
            oOpen = document.getElementById(glObjTr.sOpen);
        else
            oOpen = window.top.document.getElementById(glObjTr.sOpen);
        if (this.isEmpty(oOpen)) {
            if ((glObjTr.sOpen == sNewRootMnID) && (glObjTr.iType > 2)) {
                glObjTr.sOpen = "";
                return; 
            }
            glObjTr.sOpen = "";
        }
    }
    if (glObjTr.sOpen != "") {               
        if (!this.removePrevMenu(sNewRootMnID,1)) {
            glObjTr.sOpen = "";
            return; 
        }
        glObjTr.sOpen = sNewRootMnID;
    } 
    else if (glObjTr.sOpen == "") 
        glObjTr.sOpen = sNewRootMnID;

    if ((glObjTr.iType < 3)||(glObjTr.iType > 4))
    {
        glObjTr.bChrtMn=1;
        glObjTr.nTop = nTop;
        glObjTr.nLeft=nLeft;
    }

    var sIdI = "#rt#";
    var sIdCh = "";
    var o = "";
    this.createMenu(sId, sParentId, nType, sIdI, sIdCh, sNId, nDescr, nLeft, nTop, bIEBr, o);
    if (glObjTr.iType > 2){
        glObjTr.bCrtCtxMn=1;
     }

    if(!glObjTr.bUseTopDoc){
        ptEvent.add(document, sAct, glObjTr.removePrevMenu);
    }
    else{
        ptEvent.add(window.top.document, sAct, glObjTr.removePrevMenu);
    }

}

glObjTr.createMenu = function (sIdEsc, sParentId, nType, sIdIEsc, sIdCh, sNId, nDescr, nLeft, nTop, bIE, o) {
    if (!(this.isEmpty(o))) 
        o.blur();
    var sId = unescape(sIdEsc);
    var sCntr = sParentId;
    var index = sParentId.indexOf("$$");
    if (index > 1) {
        var temp;
        temp = sParentId.substring(0, sParentId.indexOf('$'));
        sCntr = temp;
    }
    var sNdDscCtr = "";
    var sIdI=sIdIEsc;
    if (glObjTr.iType < 3) {
        sNdDscCtr = sNId + "$" + nDescr; 
        sIdI=unescape(sIdIEsc);
    }
    var sSearch = "";
    sSearch = sId + this.ch127 + sIdI;
    var aLoc = glObjTr.aHash[sSearch];
    var len = aLoc.length;
    var aDescr = new Array();
    var aClass = new Array();
    var aIdItem = new Array();
    var aFolder = new Array();
    var aULPar = new Array();
    var aTypePar = new Array();
    var MyCommaRegEx = new RegExp(this.ch177, "g");
    for (var a = 0; a < len; a++) {
        var aItem = new Object();
        aItem = aLoc[a];
        aItem[0] = aItem[0].replace(MyCommaRegEx, ",");
        aItem[2] = aItem[2].replace(MyCommaRegEx, ",");
        aIdItem.push(aItem[0]);
        aClass.push(aItem[1]);
        aDescr.push(aItem[2]);
        if (glObjTr.iType > 2) 
        {
            aItem[3] = aItem[3].replace(MyCommaRegEx, ",");
            aULPar.push(aItem[3]);
            aTypePar.push(aItem[4]);
        }
        var Mystr = sId + this.ch127 + aItem[0];
        if (glObjTr.aHash.isParent(Mystr)) 
            aFolder.push("1");
        else
            aFolder.push("0");
    }
    if (sIdCh != "") 
    {
        var oParnt;
        if (!glObjTr.bUseTopDoc)
            oParnt = document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sIdI);
        else
            oParnt = window.top.document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sIdI);
        if (oParnt) {
            var oParOfParnt = oParnt.parentNode;
            var nlCh = oParOfParnt.children.length;
            for (var j = 0; j < nlCh; j++) {
                oParOfParnt.children[j].className = "PT_ORG_ACTION_BG";
            }
            oParnt.className = "PT_ORG_ACTION_SLCT_BG";
            nTop = oParnt.offsetTop + 6;
            if (!nTop) 
                nTop = 1;
            nLeft = oParnt.offsetLeft + oParnt.clientWidth - 5;
        }
    }
    var sIdLvl = sCntr + "$$" + sId + this.ch127 + sIdI;

       var oDiv;
    if (!glObjTr.bUseTopDoc)
        oDiv = document.getElementById(sIdLvl);
    else 
        oDiv = window.top.document.getElementById(sIdLvl);

    if (oDiv && oDiv.parentNode) {
        var oParTr;
        if (!glObjTr.bUseTopDoc)
            oParTr = document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sIdI);
        else
            oParTr = window.top.document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sIdI);
        if (oParTr) {
            oParTr.className = "PT_ORG_ACTION_HVR_BG";
        }
        oDiv.parentNode.removeChild(oDiv);
        if (bIE) {
            var sOpenShdowId = sIdLvl + "$$1";
            var oOpenShadow = document.getElementById(sOpenShdowId);
            if (oOpenShadow) {
                oOpenShadow.parentNode.removeChild(oOpenShadow);
            }
        }
        if ((glObjTr.iType < 3)||(glObjTr.iType > 4))
        {
            checkController(sCntr);
            this.moveMenuVisible(sCntr);
        } 

        return;
    }

    var oMainObj;
    if (!glObjTr.bUseTopDoc)
          oMainObj=document.getElementById(sParentId);
    else
        oMainObj=window.top.document.getElementById(sParentId);

    if (!glObjTr.bUseTopDoc) 
        var MyList = document.createElement("DIV");
    else 
        var MyList = window.top.document.createElement("DIV");

    if(nType==4 && glObjTr.bUseTopDoc) {
        var oMainObjDiv=oMainObj.parentNode;
        oMainObj=oMainObjDiv;
    }
 
    if((nType==3)||((nType==4)&&(!glObjTr.bUseTopDoc))) { 
        oMainObj=document.body;
    }

    if (sIdCh == "") {
        MyList.id = sCntr + "$$" + sId + this.ch127 + sIdI + "$" + sNdDscCtr;
    } 
    else {
        MyList.id = sCntr + "$$" + sId + this.ch127 + sIdI;
    }
    MyList.className = "RADIUS_DROPDOWN_CORNER SHADOW_DROPDOWN";
    if ((glObjTr.iType > 2)&&(glObjTr.iType < 5)) 
    {
        MyList.className = "RADIUS_MENU_DROPDOWN_CORNER SHADOW_MENU_DROPDOWN";
    }
    if (glObjTr.bUseTopDoc)
        MyList.style.textAlign = "left"; 
    MyList.style.position = "absolute";
    MyList.style.top = nTop + "px";
    MyList.style.left = nLeft + "px";
    MyList.style.border = "1px solid #b8b9bb";
    MyList.style.background = "#fff";
    MyList.style.zIndex = 12000;
    MyList.style.cursor = "default";
    if (glObjTr.sOpen == "") {
        alert("Root menu id is not set?");
        return;
    }
    if (!bIE || glObjTr.nDocMode == 8) { 
        MyList.setAttribute('PSMNU', glObjTr.sOpen);
    }
    var sMyInnerHTML = "";// onclick=\"glObjTr.preventEventPropagation(event);\" 
     sMyInnerHTML += "<table cellspacing=\'0px\' cellpadding=\'0px\' border=0 style=\'border-collapse:collapse;margin-top:8px;margin-bottom:10px; ";
     if(bIE)
      {
       sMyInnerHTML += " margin-left:2px;  ";
      }
     sMyInnerHTML += "\'>";
   
    var sVal = "";
    var sIdIt = "";
    var bCloseWindow = false;
    var sClassIt = "PT_ACTION_LIST_ITEM";
    var nListLen = aDescr.length;
    for (var f = 0; f < nListLen; f++) {
        sClassIt = aClass[f];
        sIdIt = aIdItem[f];
        if (glObjTr.iType < 3) {
            sIdIt = escape(aIdItem[f]);
        }
        sTrClass = "PT_ORG_ACTION_BG";
        var sTrId = sCntr + "$$" + sSearch + "$" + sIdIt;
        if ((aDescr[f] == "--") || (aTypePar[f] == "S")) 
        {
            sMyInnerHTML += "<tr onclick=\"glObjTr.preventEventPropagation(event);\" id=" + sTrId + " >";
            sMyInnerHTML += "<th colspan=2><hr color='#BBBBBB'></th>";
            sMyInnerHTML += "</tr>";
        } 
        else if (aTypePar[f] == "H") 
        {
            if ((this.isEmpty(sClassIt))) {
                sClassIt = "PT_MENU_ACTION_LISTHEAD";
            }
            sMyInnerHTML += "<tr onclick=\"glObjTr.preventEventPropagation(event);\" id=" + sTrId + "   ><td  style=\cursor:default;\'><div id=\'" + sCntr + "$" + "DDBLSTID" + f + "$$0\'  style=\'cursor:default;\' class=\'" + sClassIt + "\'>";
            sVal = aDescr[f];
            if (this.isEmpty(sVal)) {
                sVal = "&nbsp;";
            }
            sMyInnerHTML += sVal;
            sMyInnerHTML += "</div></td>";
            if (browserInfoObj2.isiPad && !bCloseWindow && glObjTr.iType>2){ 
                   sMyInnerHTML += "<td><div class='ptipadclosemenu' style=\"float:right; display:inline; padding-right:10px\" onclick='CloseContextMenuHandler();'></div></td>";
                   bCloseWindow = true;
                   }
            sMyInnerHTML += "</tr>";
        } 
        else if (aTypePar[f] == "M") 
        {
            if ((this.isEmpty(sClassIt))) {
                sClassIt = "PT_MENU_ACTION_LISTITEM";
            }
            sMyInnerHTML += "<tr onclick=\"glObjTr.preventEventPropagation(event);\" id=" + sTrId + "   ><td  style=\cursor:default;\'><div id=\'" + sCntr + "$" + "DDBLSTID" + f + "$$0\'  style=\'cursor:default;\' class=\'" + sClassIt + "\'>";
            sVal = aDescr[f];
            if (this.isEmpty(sVal)) {
                sVal = "&nbsp;";
            }
            sMyInnerHTML += sVal;
            sMyInnerHTML += "</div></td></tr>";
        } 
        else 
        {
            if (nType == "1") 
            {
                if (this.isEmpty(sClassIt)) {
                    sClassIt = "PT_READONLY_LIST_ITEM";
                }
                sMyInnerHTML += "<tr id=" + sTrId + " class=\'" + sTrClass + "\' ddbrd=\"1\" style=\'margin:0px;padding:0px;\' onmouseover=\'glObjTr.changeBkg(this);\' onmouseout=\'glObjTr.changeBkg(this);\'><td ddbrd=\"1\" style=\'border-top:0px;margin:0px;padding:0px;align:top;\'><div ddbrd=\"1\" id=\'" + sCntr + "$" + sIdI + "$" + "DDBLSTID" + f + "$$0\'  style=\'cursor:default;padding-top:0px;valign:top;\' class=\'" + sClassIt + "\'"
                if (aFolder[f] == "0") //Detail
                {
                    sMyInnerHTML += " >";
                } 
                else //folder
                {
                    sMyInnerHTML += " onmousedown=\"glObjTr.createMenu(\'" + escape(sId) + "\',\'" + sCntr + "\',\'" + nType + "\',\'" + sIdIt + "\',\'" + sIdI + "\',\'" + sNId + "\',\'" + nDescr + "\',\'" + nLeft + "\', \'" + nTop + "\',"+bIE+", this);\">";
                }
            } 
            else 
            {
                if (this.isEmpty(sClassIt)) {
                    sClassIt = "PT_ACTION_LIST_ITEM";
                    if ((glObjTr.iType>2)&& (glObjTr.iType<5))
                    {
                        sClassIt = "PT_MENU_ACTION_LISTITEM";
                        if ((sIdCh == "") && (nType == "3")) 
                        sClassIt = "PT_MENU_ACTION_LISTITEM_L0";
                    }
                }
                if (aFolder[f] == "0") //Detail
                {
                    sMyInnerHTML += "<tr  id=" + sTrId + "  style=\'margin:0px;padding:0px;\' class=\'" + sTrClass + "\' onmouseover=\'glObjTr.changeBkg(this);\' onmouseout=\'glObjTr.changeBkg(this);\'><td  style=\'border-top:0px;margin:0px;padding:0px;align:top;cursor:pointer;\'><div id=\'" + sCntr + "$" + "DDBLSTID" + f + "$$0\'  style=\'cursor:pointer;padding-top:0px;valign:top;\' class=\'" + sClassIt + "\'"
                    if (nType == "2") {
                        sMyInnerHTML += " onmousedown=\"MainLink(\'ddb" + chM + nDescr + chM + sIdIt + "\',\'" + sNId + "\',\'" + sCntr + "\');\"   >";
                        sMyInnerHTML += "<a href=\"#\" id=\'" + sCntr + "$" + sIdI + "$" + "DDBLSTATAG" + f + "$$0\' style=\"text-decoration:none; color:#000000;display:block;\"  onclick=\"javascript:MainLink(\'ddb" + chM + nDescr + chM + sIdIt + "\',\'" + sNId + "\',\'" + sCntr + "\'\);\">";
                    } 
                    else {
                        sMyInnerHTML += ">";
                        if (aULPar[f] == "") {
                            aULPar[f] = "javascript:void(0)";
                        }
                        sMyInnerHTML += "<a href=" + aULPar[f] + " id=\'" + sCntr + "$" + sIdI + "$" + "DDBLSTATAG" + f + "$$0\' style=\"text-decoration:none; color:#000000; display:block;\">"; //
                    }
                } 
                else //folder
                {
                    sMyInnerHTML += "<tr onclick=\"glObjTr.preventEventPropagation(event);\" AC=1 FD=1 id=" + sTrId + "  style=\'margin:0px;padding:0px;\' class=\'" + sTrClass + "\' onmouseover=\'glObjTr.changeBkg(this);\' onmouseout=\'glObjTr.changeBkg(this);\'><td AC=1 FD=1 style=\'border-top:0px;margin:0px;padding:0px;align:top;cursor:pointer;\'><div AC=1  FD=1 id=\'" + sCntr + "$" + "DDBLSTID" + f + "$$0\'  style=\'cursor:pointer;padding-top:0px;valign:top;\' class=\'" + sClassIt + "\'"
                    sMyInnerHTML += " >";
                    sMyInnerHTML += "<a AC=1 FD=1 href=\"#\" id=\'" + sCntr + "$" + sIdI + "$" + "DDBLSTATAG" + f + "$$0\' ATG=\"1\" style=\"text-decoration:none; color:#000000;display:block;\"  onclick=\"glObjTr.createMenu(\'" + escape(sId) + "\',\'" + sCntr + "\',\'" + nType + "\',\'" + sIdIt + "\',\'" + sIdI + "\',\'" + sNId + "\',\'" + nDescr + "\',\'" + nLeft + "\', \'" + nTop + "\',"+bIE+",this);\">";                    
                }
            }
            sVal = escape(aDescr[f]);
            if (this.isEmpty(sVal)) {
                sVal = "&nbsp;";
            }
            sMyInnerHTML += sVal;
            if (nType != "1") //action items with A tag
            {
                sMyInnerHTML += "</a>";
            }
            sMyInnerHTML += "</div></td>";
            sMyInnerHTML += "<td  AC=1 style=\'border-top:0px;margin:0px;padding:0px;align:top;cursor:pointer;\'>";
            if (aFolder[f] == "1") 
            {
                sMyInnerHTML += "<div AC=1 class='ptactmenurightarrow'>";
                sMyInnerHTML += "<a AC=1 href=\"#\" style=\"text-decoration:none; display:block;\" onclick=\"glObjTr.createMenu(\'" + escape(sId) + "\',\'" + sCntr + "\',\'" + nType + "\',\'" + sIdIt + "\',\'" + sIdI + "\',\'" + sNId + "\',\'" + nDescr + "\',\'" + nLeft + "\', \'" + nTop + "\',"+bIE+",this);\">";
            }
            else
            {
                sMyInnerHTML += "<div AC=1>";
                if(nType=="2")
                    sMyInnerHTML += "<a AC=1 href=\"#\"  style=\"text-decoration:none; display:block;\"  onclick=\"javascript:MainLink(\'ddb" + chM + nDescr + chM + sIdIt + "\',\'" + sNId + "\',\'" + sCntr + "\'\);\">";
                else if(glObjTr.iType>2)
                    sMyInnerHTML += "<a AC=1 href=" + aULPar[f] + " style=\"text-decoration:none; display:block;\">"; //
            }
            sMyInnerHTML += "&nbsp;";
            if (nType != "1")
            {
                sMyInnerHTML += "</a>";
            }           
            sMyInnerHTML += "</div>";
            sMyInnerHTML += "</td></tr>";
        }
    }
    sMyInnerHTML += "</table>";
    MyList.align = "center";
    MyList.innerHTML = sMyInnerHTML;
    if (sIdCh != "") {
        if (sIdCh == "#rt#") {
            if (!glObjTr.bUseTopDoc)
            oMainObj = document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sNdDscCtr);
            else
                   oMainObj = window.top.document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh + "$" + sNdDscCtr);
        } 
        else {
            if (!glObjTr.bUseTopDoc)
            oMainObj = document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh);
            else
                oMainObj = window.top.document.getElementById(sCntr + "$$" + sId + this.ch127 + sIdCh);
        }
    }
    var oLast = oMainObj.lastChild;
    if (!(this.isEmpty(oLast))) {
        if (oLast.tagName == "DIV") {
            var sI = oLast.id;
            if (!sI.indexOf(sCntr + "$$" + sId + this.ch127)) {
                oMainObj.removeChild(oLast);
                if (bIE) {
                    var sOpenShdowId = sI + "$$1";
    
                var oOpenShadow;
                if (!glObjTr.bUseTopDoc)
                    oOpenShadow = document.getElementById(sOpenShdowId);
                else
                    oOpenShadow = window.top.document.getElementById(sOpenShdowId);
                    if (oOpenShadow) {
                        oOpenShadow.parentNode.removeChild(oOpenShadow);
                    }
                }
            }
        }
    }
    oMainObj.appendChild(MyList);
    for (f = 0; f < nListLen; f++) {
        if (nType != "1") 
        {
            var olistItem;
            if (!glObjTr.bUseTopDoc)
                olistItem = document.getElementById(sCntr + "$" + sIdI + "$DDBLSTATAG" + f + "$$0");
            else
                olistItem = window.top.document.getElementById(sCntr + "$" + sIdI + "$DDBLSTATAG" + f + "$$0");
        }
        if (nType == "1") 
        {
            var olistItem;
            if (!glObjTr.bUseTopDoc)
                olistItem = document.getElementById(sCntr + "$" + sIdI + "$DDBLSTID" + f + "$$0");
            else
                olistItem = window.top.document.getElementById(sCntr + "$" + sIdI + "$DDBLSTID" + f + "$$0");
        }
        sDesc = aDescr[f];
        if ((olistItem) && (!(this.isEmpty(sDesc)))) {
            if (bIE) {
                var oldText = olistItem.innerText;
                olistItem.innerText = unescape(oldText);
            } 
            else {
                var oldText = olistItem.textContent;
                olistItem.textContent = unescape(oldText);
            }
        }
    }
    var mId = MyList.id;
    var oTreeMenu;

    var oTreeMenu;
    if (!glObjTr.bUseTopDoc)
        oTreeMenu = document.getElementById(mId);
    else 
        { 
        oTreeMenu = window.top.document.getElementById(mId);
        }   

    if (bIE && !(this.isEmpty(oTreeMenu)) && !((glObjTr.bUseTopDoc) && (glObjTr.nDocMode ==8)) ) {
        var radSize = parseInt(oTreeMenu.currentStyle['-moz-border-radius']);
         if(!glObjTr.bUseTopDoc)
        var oTreeMenushadow = document.createElement("div");
        else 
            var oTreeMenushadow = window.top.document.createElement("div");
        oTreeMenushadow.id = mId + "$$1";
        oTreeMenushadow.style.position = "absolute";
        oTreeMenushadow.style.top = oTreeMenu.offsetTop;
        oTreeMenushadow.style.left = oTreeMenu.offsetLeft;
        oTreeMenushadow.style.zIndex = 0;
        if ((glObjTr.iType < 3)||(glObjTr.iType ==5)) 
        {
            oTreeMenushadow.style.width = (oTreeMenu.offsetWidth + 7) + "px";
            oTreeMenushadow.style.height = (oTreeMenu.offsetHeight + 2) + "px";
        } 
        else 
        {
                oTreeMenushadow.style.width = (oTreeMenu.offsetWidth + 5) + "px";
                oTreeMenushadow.style.height = (oTreeMenu.offsetHeight + 2) + "px";
            }
        var oParNode = oTreeMenu.parentNode;
        oParNode.insertBefore(oTreeMenushadow, oTreeMenu);
        var sTreeMenushadow = oTreeMenu.currentStyle['-moz-box-shadow'];
        var aTreeMenushadow = sTreeMenushadow.split(" ");
        oTreeMenushadow.style.backgroundColor = aTreeMenushadow[3];
        this.RoundVMLShadow(oTreeMenushadow, radSize);
        this.RoundVML(oTreeMenu, radSize);
    }
    if ((glObjTr.iType < 3)||(glObjTr.iType > 4))
    {
        glObjTr.bChrtMn=1;
        if (sIdCh == "") 
        {
            glObjTr.bChrtRtMn=1;
        }
        checkController(sCntr);

        
        var oMainChart=document.getElementById(sCntr+"$OR1C$$0");
        var oRoundTreeMenu = document.getElementById(mId);
        var myOrgChart=glObjTr.oOrgChr[sCntr];
        var nTpPgltCh1C=0;
        if(myOrgChart.nPglt<1)
            {
            nTpPgltCh1C=oMainChart.offsetTop;
            }
        else
            nTpPgltCh1C=myOrgChart.PgltTop(oMainChart, 0);
        var nMnTpPos=GetElementTop(oRoundTreeMenu)+oRoundTreeMenu.offsetHeight-nTpPgltCh1C+10;
        var nMnLfPos=GetElementleft(oRoundTreeMenu)+oRoundTreeMenu.offsetWidth-oMainChart.offsetLeft+10;

        glObjTr.nMnMaxLfPs=nMnLfPos;
        if (sIdCh == "") 
        {
            glObjTr.nMnMaxTpPs =nMnTpPos;
        }
        if(nMnTpPos>glObjTr.nMnMaxTpPs)
        {
            glObjTr.nMnMaxTpPs=nMnTpPos;     
        }

        this.moveMenuVisible(sCntr);
    } 

}


glObjTr.removePrevMenu = function (sIdOpn,bF) {
    var oBr = new PT_browserInfo();
    oBr.init();
    var bIE = oBr.isIE;
    var sAct="click";
    var bFlag=glObjTr.isEmpty(bF)?0:bF;
    if(oBr.isiPad){ 
          
         if(!bFlag&&((glObjTr.isEmpty(event)||(event.type!="touchstart")||(event.touches&&event.touches.length>1))))
                 return;      
        sAct="touchstart";      
    } 


     if (((typeof sIdOpn == "object")||(glObjTr.isEmpty(sIdOpn))))
      {
        var ev = !bIE ? sIdOpn : event;
        if (glObjTr.isEmpty(ev) && glObjTr.bUseTopDoc) {
            ev=sIdOpn;
        }
        var Mysource = !bIE ? ev.target : ev.srcElement;
        if(!Mysource.getAttribute)
              {
                 return;
                }
        if(bIE && ((glObjTr.iType==4)|| (glObjTr.iType==3))&&(Mysource.getAttribute("FD")))
           {
           glObjTr.preventEventPropagation(ev);
           }
        var nKey=ev.keyCode;
        if ((Mysource.getAttribute("AC"))&&(nKey!=27)) {
            return;
        }
    }
    
    var elmns;
    if (!glObjTr.bUseTopDoc)
        elmns = document.getElementsByTagName("DIV");
    else 
        elmns = window.top.document.getElementsByTagName("DIV");
    
    var nLelm = elmns.length;
    var sOpner = "";
    var bRet = 1;
    if (nLelm) {
        for (var K = 0; K < nLelm; K++) {
            if (elmns[K].getAttribute("PSMNU")) {
                sOpner = elmns[K].getAttribute("PSMNU");
                if (sOpner === sIdOpn) {
                    bRet = 0;
                }
                var sMid = elmns[K].id;
                elmns[K].parentNode.removeChild(elmns[K]);
                glObjTr.sOpen = "";
                if (bIE) {
                    var sOpenShdowId = sMid + "$$1";

                    var oOpenShadow;
                    if (!glObjTr.bUseTopDoc)
                        oOpenShadow = document.getElementById(sOpenShdowId);
                    else 
                        oOpenShadow = window.top.document.getElementById(sOpenShdowId);    

                    if (oOpenShadow) {
                        oOpenShadow.parentNode.removeChild(oOpenShadow);
                    }
                }
                 if ((glObjTr.iType < 3)||(glObjTr.iType > 4))
                    {
                    var sCntr=sMid.substring(0,sMid.indexOf('$'));
                    checkController(sCntr);
                    glObjTr.moveMenuVisible(sCntr);
                    var oMainObj=document.getElementById(sCntr+"$OR1C$$0");
                    oMainObj.scrollTop=glObjTr.nChrtScrlTp;
                    oMainObj.scrollLeft=glObjTr.nChrtScrlLf;
                    glObjTr.nChrtScrlTp =0;
                    glObjTr.nChrtScrlLf=0;
                    } 

                break;
            }
        }
        glObjTr.bCrtCtxMn=0;
        glObjTr.occNmb=""
        glObjTr.bChrtMn=0;
        glObjTr.nTop = 0;
        glObjTr.nLeft=0;
        if(!glObjTr.bUseTopDoc){
            ptEvent.remove(document, sAct, glObjTr.removePrevMenu);
        }
        else{
            ptEvent.remove(window.top.document, sAct, glObjTr.removePrevMenu);
        }
        return bRet;
    } 
    else {
        glObjTr.bCrtCtxMn=0; 
        glObjTr.occNmb=""
        glObjTr.bChrtMn=0;
        glObjTr.nTop = 0;//
        glObjTr.nLeft=0;//

        if(!glObjTr.bUseTopDoc){
            ptEvent.remove(document, sAct, glObjTr.removePrevMenu);
        }
        else{
            ptEvent.remove(window.top.document, sAct, glObjTr.removePrevMenu);
        }
        return bRet;
    }

}

glObjTr.RoundVML = function (oForC, radSize) {
    var vObj = oForC;
    if (glObjTr.bUseTopDoc){
    var width = vObj.offsetWidth;
    var height = vObj.offsetHeight;
    }
    var classID = vObj.className;
    var arcSize = radSize / Math.min(vObj.offsetWidth, vObj.offsetHeight);
    if (arcSize == 0) {
        oForC.style.zIndex = 0;
        return;
    }
    vObj.style.visibility = "visible";
    var strokeColor = vObj.currentStyle.borderColor;
    var strokeWeight = vObj.currentStyle.borderWidth;
    vObj.style.border = 'none';
    var fillColor = vObj.currentStyle.backgroundColor;
    var fillSrc = vObj.currentStyle.backgroundImage.replace(/^url\("(.+)"\)$/, '$1');
    vObj.style.background = 'transparent';
    var margin = vObj.currentStyle.margin;
    vObj.style.margin = '0';
    var styleFloat = vObj.currentStyle.styleFloat;
    vObj.style.styleFloat = 'none';
    var clear = vObj.currentStyle.clear;
    vObj.style.clear = 'none';
    var position = 'absolute';
    vObj.style.position = 'absolute';
    var left = vObj.currentStyle.left;
    vObj.style.left = '0';
    var right = vObj.currentStyle.right;
    vObj.style.right = '0';
    var top = vObj.currentStyle.top;
    vObj.style.top = '0';
    var bottom = vObj.currentStyle.bottom;
    vObj.style.bottom = '0';
    if (!glObjTr.bUseTopDoc){
        var width = vObj.offsetWidth;
        var height = vObj.offsetHeight;
    }
    var oId = vObj.id;
    var sShadowId = oId + "$$1";

    var oShadow;
    if (!glObjTr.bUseTopDoc)
        oShadow = document.getElementById(sShadowId);
    else 
        oShadow = window.top.document.getElementById(sShadowId);

    if (!(this.isEmpty(oShadow))) {
        oShadow.style.visibility = "visible";
    }
 
    vObj.id = "";
    var sRes = '<div id=' + oId + '  PSMNU="' + glObjTr.sOpen + '" class="' + classID + '" style="background: transparent; border: none; padding: 0; margin: ' + margin + '; float: ' + styleFloat + '; clear: ' + clear + '; position: ' + position + '; left: ' + left + '; right: ' + right + '; top: ' + top + '; bottom: ' + bottom + '; width: auto; height: auto;">';
    sRes += '<v:roundrect  arcsize="' + arcSize + '" strokecolor="' + strokeColor + '" strokeweight="' + strokeWeight + '" style="behavior: url(#default#VML);  width:' + width + '; height:' + height + ';  padding: ' + strokeWeight + 'px;">'; //antialias: true;display: inline-block;
    sRes += '<v:fill color="' + fillColor + '"   type="gradient" style="behavior: url(#default#VML);" />';
    sRes += vObj.outerHTML + '</v:roundrect></div>';
    vObj.outerHTML = sRes;
}


glObjTr.RoundVMLShadow = function (vObj, radSize) {
    if (glObjTr.bUseTopDoc){
    var width = vObj.offsetWidth;
    var height = vObj.offsetHeight;
    }
    var arcSize = (radSize + 4) / Math.min(vObj.offsetWidth, vObj.offsetHeight);
    var margin = vObj.currentStyle.margin;
    vObj.style.margin = '0';
    var styleFloat = vObj.currentStyle.styleFloat;
    vObj.style.styleFloat = 'none';
    var clear = vObj.currentStyle.clear;
    vObj.style.clear = 'none';
    var bottom = vObj.currentStyle.bottom;
    vObj.style.bottom = '0';
    var strokeColor = vObj.currentStyle.borderColor;
    var classID = vObj.className;
    vObj.style.border = 'none';
    var fillColor = vObj.currentStyle.backgroundColor;
    vObj.style.background = 'transparent';
    vObj.style.margin = '0';
    var position = 'absolute';
    vObj.style.position = 'absolute';
    var left = vObj.currentStyle.left;
    vObj.style.left = '0';
    var right = vObj.currentStyle.right;
    vObj.style.right = '0';
    var top = vObj.currentStyle.top;
    vObj.style.top = '0';
    var oId = vObj.id;
    vObj.id = "";
    if (!glObjTr.bUseTopDoc){
        var width = vObj.offsetWidth;
        var height = vObj.offsetHeight;
    }
    vObj.style.width = '100%';
    vObj.style.height = '100%';
    var nRel = width / height;
    
    var PopFocus="95%,95%";
    if(nRel<0.6)
     {
       PopFocus="95%,99%";
    }
    height += 2;
    var sRes = '<div id="' + oId + '"   class="' + classID + '" style="background: transparent;visibility:hidden; border: none; padding: 0; margin: ' + margin + '; float: ' + styleFloat + '; clear: ' + clear + '; position: ' + position + '; left: ' + left + '; right: ' + right + '; top: ' + top + '; bottom: ' + bottom + '; width: auto; height: auto;">';
    sRes += '<v:roundrect arcsize="' + arcSize + '" strokecolor="' + strokeColor + '"  stroked="0"  style="behavior: url(#default#VML);  width:' + width + '; height:' + height + ';  ">'; //antialias: true;display: inline-block;    
    sRes+='<v:fill method="linear sigma"  opacity="90%"   color="' + fillColor + '" color2="#D0D0D0" o:opacity2="0.1" angle="0" focus="100%" focusposition="-.01,-.01" focussize=\"'+PopFocus+'\"  type="gradientRadial"  />';
    sRes += vObj.outerHTML + '</v:roundrect></div>';
    vObj.outerHTML = sRes;
}

glObjTr.isEmpty = function (strIn) {
    var m_undef;
    if ((strIn == m_undef) || (strIn.length == 0)) 
        return 1;
    return 0;
}

glObjTr.preventEventPropagation = function (ev) {
    if (ev.preventDefault) {
        ev.preventDefault();
    }
    if (ev.stopPropagation) {
        ev.stopPropagation();
    }
    ev.returnValue = false;
    ev.cancelBubble = true;
    ev.cancel = true;
}

Array.prototype.isParent = function (Mystr) {
    var s;
    var bRet = false;
    for (s in this) {
        if (s == Mystr) {
            bRet = true;
            break;
        }
    }
    return bRet;
}

glObjTr.moveMenuVisible = function (sCntr) {
    if ((glObjTr.iType < 3)||(glObjTr.iType > 4))
        {
        var oMainObj=getObj(strCont+"$OR1C$$0");
        if(this.isEmpty(oMainObj))
            return 0;
        if (glObjTr.bChrtMn)
            {
            var nCurrScrlTp=oMainObj.scrollTop;
            var nCurrScrlLf=oMainObj.scrollLeft;
            if(glObjTr.bChrtRtMn)
                {
                glObjTr.nChrtScrlTp =nCurrScrlTp;
                glObjTr.nChrtScrlLf=nCurrScrlLf;
                glObjTr.bChrtRtMn=0;
                }
            var nMaxScrlLf=glObjTr.nMnMaxLfPs-oMainObj.clientWidth;
            var nMaxScrlTp=glObjTr.nMnMaxTpPs-oMainObj.clientHeight;
            var nMinScrlLf=glObjTr.nLeft;
            var nMinScrlTp=glObjTr.nTop;
            if(nMinScrlLf<nCurrScrlLf)
            {
                oMainObj.scrollLeft=nMinScrlLf;
            }
            if(nMinScrlTp<nCurrScrlTp)
            {
                oMainObj.scrollTop=nMinScrlTp;
            }
            if(nMaxScrlLf>nCurrScrlLf)
            {
                oMainObj.scrollLeft=nMaxScrlLf;
            }
            if(nMaxScrlTp>nCurrScrlTp)
            {
                oMainObj.scrollTop=nMaxScrlTp;
            }
            glObjTr.bChrtMn=0;//Reset
            }
        }
}

function onRCService(url,nOpenMode,szServType,strLabel)
{
if (nOpenMode == "0")
    OpenCrefInUniNav(url, '_blank'); 
else if (nOpenMode == "2")
    {
    if(saveWarning('TargetContent',null, '_top', "javascript:window.open('"+url+"','_self')|javascript:CloseContextMenuHandler()"))
        OpenCrefInUniNav(url, '_top'); 
    }
else if (nOpenMode == "3")
    {
    if(saveWarning('TargetContent',null, '_top', "javascript:window.open('"+url+"','TargetContent')|javascript:CloseContextMenuHandler()"))
        {
        if (szServType == "UPGE")
            parent.pthNav.fakeBCReqCTXMenu = true;
        window.open(url,'TargetContent');     
        }
    }
else if (nOpenMode == "4")  //Modal Window
    {
    var options="";
    if ((typeof(strLabel) != 'undefined') && strLabel && strLabel != '')
        {
        var sTitleText = strLabel;
        var h = String.fromCharCode(160);
        while(sTitleText.indexOf(h) != -1)
            sTitleText = sTitleText.replace(h," ");
        
        options =  'sTitle@ '+ sTitleText + ';';
        }
    
    options = options + 'bPIA@1;bClose@1;';
    showModal(url+"&ICModalJS=1",window,options,null,null,true);
    }

if (window.top.document.getElementById("ptifrmpopup") && window.top.document.getElementById("ptifrmpopup").style.display != "none") { 
        if (typeof(top.searchGbl) != "undefined" && top.searchGbl.win && top.searchGbl.win.popup) {
            top.searchGbl.win.popup.close();
        }
        if (typeof(top.pthNav) != "undefined" && top.pthNav.abn && top.pthNav.abn.search && top.pthNav.abn.search.win && top.pthNav.abn.search.win.popup) { 
        top.pthNav.abn.search.win.popup.close();
}
}
}

var lastChildValid = function(node) {
    if (node.childNodes) {
        var listLength = node.childNodes.length;
        var validEl = null; 
        for (var i = 0;  i < listLength; i++) { 
            var dNode = node.childNodes[(listLength - 1)- i];  
            if (dNode.nodeName !== "#text") {
                validEl = dNode;
                return validEl;
            }
        }
        if (validEl == null)
            return node.lastChild; 
    }
    else return node.lastChild;
}
    
var firstChildValid = function(node) {
    if (node.childNodes) {
        var listLength = node.childNodes.length;
        var validEl = null;
        for (var i = 0;  i < listLength; i++) {
            var dNode = node.childNodes[i];    
            if (dNode.nodeName !== "#text") {
                validEl = dNode;
                return validEl;
            }
        }
        if (validEl == null) 
            return node.firstChild; 
    }
    else return node.firstChild;
}

try {
    if (typeof(top.ptIframe) == "undefined" && typeof(top.searchGbl) !== "undefined" && !top.searchGbl.sForm) {
        ptEvent.load(top.searchGbl.init);
        if (typeof(top.ptIframeHdr) !== "undefined") {
            ptEvent.load(top.ptIframeHdr.init);
        }
    }
}
catch(e) {}


// setRAActionUrl
setRAActionUrl = function(srchUrl)
{    
    var bIsHomePage = false;
    if (typeof(top.searchGbl) !== "undefined") {
        bIsHomePage = top.searchGbl.isHomepage;
    }
    var elemUrl = null;
    if (!bIsHomePage && typeof(ptIframe) !== "undefined") {
        elemUrl = window.frames["TargetContent"].document.getElementById("GSrchRaUrl");
    }
    else
        elemUrl = top.document.getElementById("GSrchRaUrl");
    if (elemUrl)
        elemUrl.value = srchUrl;

};

// process related actions reponse text
processRelatedActionsResponse = function(respText, fldId)
{
    if (!respText) 
        return;

    var xmlDoc = null;
    var bIsHomePage = false;
    if (typeof(top.searchGbl) !== "undefined") {
        bIsHomePage = top.searchGbl.isHomepage;
    }

    if (window.ActiveXObject) {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(respText);
    }
    else {
       var parser=new DOMParser();
       xmlDoc = parser.parseFromString(respText, "text/xml");
    }

    if (xmlDoc) {
        var scriptList = xmlDoc.getElementsByTagName("GENSCRIPT");
        if (scriptList) {
            for (var i=0; i < scriptList.length; i++) {
                eval(scriptList[i].firstChild.data);
            }
        }

        var absCord = {x:0,y:0}; 
        var referenceObj = window.top.document.getElementById(fldId); 
        if (referenceObj) { 
            absCord.x = referenceObj.offsetLeft; 
            absCord.y = referenceObj.offsetTop; 

            // on homepage and IE
            if (bIsHomePage && (browserInfoObj2.isIE)) {
                absCord.x = referenceObj.offsetParent.offsetParent.offsetLeft; 
                absCord.y = referenceObj.offsetParent.offsetTop;			
            }
        } 

        if (glObjTr && raFormatedString) { 
            if (referenceObj) 
                glObjTr.showActionMenu(fldId, absCord.x, absCord.y + referenceObj.offsetHeight, 5, 4, raFormatedString, 'DROPDOWNNAME1'); 
            else 
                glObjTr.showActionMenu(fldId, absCord.x, absCord.y, 5, 4, raFormatedString, 'DROPDOWNNAME1'); 
        } else {
            alert('An error occurred for homepage related actions. Please try accessing results on another page.');
        }
    } else {
        alert('xmldoc is null');
    }

    var elemAction = null;
    if (!bIsHomePage && typeof(ptIframe) !== "undefined")
        elemAction = window.frames["TargetContent"].document.getElementById("ICAction"); 
    else
        elemAction = top.document.getElementById("ICAction");
    if (elemAction) {
        elemAction.value = "";
    }
}

// handle related actions click for persistent search
getRelatedActions = function(srchUrl, fldId)
{
    var elem = top.document.getElementById(fldId);
    var prevCursor = elem.style.cursor;
    elem.style.cursor="wait";    

    var doclocation = top.document.location.href;
    var actionurl = doclocation;
    var index = doclocation.indexOf('/h/?');
    if (index > 0) {
        actionurl = doclocation.replace('/h/?', '/c/PORTAL_ADMIN.PTSF_GLOBAL_SEARCH.GBL?');
        doclocation = actionurl;
    }
    var index = doclocation.indexOf('?');
    if (index > 0) {
        actionurl = doclocation.substr(0, index);
    }

    // http://rtdc79500vmc.us.oracle.com/psc/ps/EMPLOYEE/QE_LOCAL/c/PORTAL_ADMIN.PTSF_GLOBAL_SEARCH.GBL
    // http://rtdc79500vmc.us.oracle.com/psp/ps/Remote_Portal/HCM_Node/c/PORTAL_ADMIN.PTSF_GLOBAL_SEARCH.GBL?cmd=smartnav

    var bRemoteRA = true;
    var respText = "";
    raFormatedString = "";

    // parse local url and srch url
    var localURLArr= actionurl.split('/');
    var srchURLArr= srchUrl.split('/');

    // get local host
    var localHost = localURLArr[2];

    //get srchUrl host
    var srchUrlHost = srchURLArr[2];

    // if both hosts are different
    if ((localHost.length == srchUrlHost.length) && (localHost.indexOf(srchUrlHost) == 0))
        bRemoteRA = false;

    var tmpActionUrl = actionurl;
    var origUrl = actionurl;

    var elemAction = null;
    if (!searchGbl.isHomepage && typeof(ptIframe) !== "undefined")
        elemAction = window.frames["TargetContent"].document.getElementById("ICAction"); 
    else
        elemAction = top.document.getElementById("ICAction");

    if (bRemoteRA) {
        // replace psc to psp
        actionurl = tmpActionUrl.replace('\/psc\/', '\/psp\/');

        // get local portal name
        var portalName = localURLArr[5];

        // get remote portal name
        var remotePortalName = srchURLArr[5];

        // replace local portal name in url to remote portal name    
        tmpActionUrl = actionurl.replace(portalName, remotePortalName);

        // get local env's default local node
        var localNodeName = localURLArr[6];
    
        // get remote env's default local node
        var remoteNodeName = srchURLArr[6];
    
        // replace local node name in url to remote node name    
        actionurl = tmpActionUrl.replace('\/' + localNodeName + '\/', '\/' + remoteNodeName + '\/');
        
        if (elemAction) {
            elemAction.value = fldId;
        }

        // add smartnav req param
        // tmpActionUrl = actionurl.concat('?cmd=uninav');
        tmpActionUrl = actionurl.concat('?cmd=smartnav');

        actionurl = tmpActionUrl.concat('&ICAction=' + fldId);
        tmpActionUrl = actionurl.concat('&GSrchRaUrl=' + encodeURIComponent(srchUrl));
        actionurl = tmpActionUrl.concat('&ICAJAX=1');

        var xmlHttpReq = false;
    
        // Mozilla/Safari
        if (window.XMLHttpRequest) { 
              xmlHttpReq = new XMLHttpRequest();
        } 
        // IE
        else if (window.ActiveXObject) {
            xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlHttpReq.open('POST', actionurl, true);
        xmlHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttpReq.onreadystatechange = function() {
            if (xmlHttpReq.readyState == 4) {
                respText = xmlHttpReq.responseText;
                processRelatedActionsResponse(respText, fldId);
                elem.style.cursor = prevCursor;
            }
        }
        xmlHttpReq.send(null);    
    } else {        
        if (elemAction) {
            elemAction.value = fldId;
        }

        tmpActionUrl = actionurl.concat('?ICAction=' + fldId);
        actionurl = tmpActionUrl.concat('&GSrchRaUrl=' + encodeURIComponent(srchUrl));
        tmpActionUrl = actionurl.concat('&ICAJAX=1');
        actionurl = tmpActionUrl;

        // url,form,name,method,onload,onerror,params,contentType,bAjax,bPrompt,headerArray,isAsync,sXMLResponse)
        // sLoader.req.responseXML, sLoader.req.responseText
        var sLoader = new net2.ContentLoader(actionurl, null, null, null,
                        function() {
                            respText = this.req.responseText;
                            processRelatedActionsResponse(respText, fldId);
                            elem.style.cursor = prevCursor;
                        }, null, null, "application/x-www-form-urlencoded", 
                        true, false, null, false, null);

        if (respText == "") {
            respText = sLoader.req.responseText;
            processRelatedActionsResponse(respText, fldId);
            elem.style.cursor = prevCursor;
        }
    }
}

//Transfer/GenerateComponentURL/GeneratePortalURL/Homepage redirect

function isWorkCenter() {
return top.document.getElementById('ptalPgltAreaFrame');
}

function isPIAUrl(sUrl) {
    if (typeof sUrl == 'undefined' || sUrl == null || sUrl.length == 0) return false;
    if (sUrl.indexOf('/psc/') == -1 ) return false;
    return true;
}

function isPIAComponentUrl(sUrl) {
    if (typeof sUrl == 'undefined' || sUrl == null || sUrl.length == 0) return false;
    if (sUrl.indexOf('/psc/') != -1 && sUrl.indexOf('/c/') != -1) return true;
    return false;
}

function isPIAHtmlTempalteTarget(sUrl, hostWin, topWin, form) {
    if (!isPIAUrl(sUrl)) return false;
    if (typeof form == 'undefined' || form == null) return false;
    if (typeof form.ICType == 'undefined') return false;
    if (typeof form.action != 'undefined' && form.action.indexOf('/psp/') != -1) return true;
    return false;
}

function isPortalUrl(sUrl) {
    if (typeof sUrl == 'undefined' || sUrl == null || sUrl.length == 0) return false;
    if (sUrl.indexOf('/psp/') == -1 ) return false;
    return true;
}

function isPortalHomagPageUrl(sUrl) {
    if (typeof sUrl == 'undefined' || sUrl == null || sUrl.length == 0) return false;
    if (sUrl.indexOf('/psp/') != -1 && sUrl.indexOf('/h/') != -1) return true;
    return false;
}

function isInFrame(sUrl, hostWin, topWin) {
    if (hostWin != topWin && !isUrlFrmModal(sUrl, hostWin)) return true;
    return false;
}

function isPIAPagelet(sUrl, hostWin, topWin, form) {
    if (!isPIAUrl(sUrl)) return false;
    if (typeof form == 'undefined' || form == null) return false;
    if (typeof form.ICFromPagelet == 'undefined' || form.ICFromPagelet.value != 'true') return false;
    return true;
}

function isHostWinPIA(sUrl, hostWin) {
    return isPIAUrl(hostWin.location.href);
}

function isHostWinPortal(sUrl, hostWin) {
    return isPortalUrl(hostWin.location.href);
}

function getPortalName(sUrl) {
    var portalName = null;
    if (!isPIAUrl(sUrl) && !isPortalUrl(sUrl)) return null;
    var pos = sUrl.indexOf('/psp/');
    if (pos == -1) pos = sUrl.indexOf('/psc/');
    var sArr = sUrl.substring(pos, sUrl.length).split('/');
    if (sArr.length > 3)
        portalName = sArr[3];
    return portalName;
}

function getNodeName(sUrl) {
    var nodeName = null;
    if (!isPIAUrl(sUrl) && !isPortalUrl(sUrl)) return null;
    var pos = sUrl.indexOf('/psp/');
    if (pos == -1) pos = sUrl.indexOf('/psc/');
    var sArr = sUrl.substring(pos, sUrl.length).split('/');
    if (sArr.length > 3)
        nodeName = sArr[4];
   return nodeName;
}

function getPSHome(sUrl) {
    var psHome = null;
    if (!isPIAUrl(sUrl) && !isPortalUrl(sUrl)) return null;
    var pos = sUrl.indexOf('/psp/');
    if (pos == -1) pos = sUrl.indexOf('/psc/');
    var sTmp = sUrl.substring(pos, sUrl.length);
    var sArr = sTmp.split('/');
    if (sArr.length > 3)
        psHome = sArr[2].split('_')[0];
    return psHome;
}

function getPSHomeSuffix(sUrl) {
    var psHome = null;
    if (!isPIAUrl(sUrl) && !isPortalUrl(sUrl)) return null;
    var pos = sUrl.indexOf('/psp/');
    if (pos == -1) pos = sUrl.indexOf('/psc/');
    var sTmp = sUrl.substring(pos, sUrl.length);
    var sArr = sTmp.split('/');
    var sArr2 = sArr[2].split('_');
    if (sArr2.length > 1)
        return "_"+sArr2[1];
    else
        return "";
}
function getUrlHost(sUrl) {
    if (!isPIAUrl(sUrl) && !isPortalUrl(sUrl)) return null;
    var pos = sUrl.indexOf('/psp/');
    if (pos == -1) pos = sUrl.indexOf('/psc/');
    if (pos == -1) return null;
    var serverURI = sUrl.substring(0, pos);
    return serverURI;
}

function isRemoteNode(sUrl, hostWin) {
    if (getUrlHost(sUrl) != getUrlHost(hostWin.location.href))
        return true;
    if (getPSHome(sUrl) != getPSHome(hostWin.location.href))
        return true;
    return false;
}

function isUrlFrmModal(sUrl, hostWin) {
    if (typeof hostWin.modalID != 'undefined' && hostWin.modalID != null)
        return true;
    return false;
}

function isRelativeUrl(sUrl) {
    if (sUrl.indexOf('http') == 0) return false;
    return true;
}

function convToABSUrl(sUrl, sHostUrl) {
    if (!isRelativeUrl(sUrl)) return sUrl;
    var sHostURI = getUrlHost(sHostUrl);
    var sReturnUrl = sHostURI + sUrl;
    return sReturnUrl;
}

//added for support remote dashboard in unified navigation
function getContentNode(sUrl){
                if(sUrl.indexOf('&contentNode') != -1){
                                var r = sUrl.match('&contentNode=([^&]*)');
                                if(r){
                                                return r[1];
                                }              
                }else{
                                return null;
                }
}
//end

function isRemoteDashboardURL(sUrl,hostWin) {
    var sHostUrl = hostWin.location.href;
	//added for support remote dashboard in unified navigation
    var sContentNode = getContentNode(sUrl);
    if(sContentNode != null){
        var sPortalNode = getNodeName(sUrl);
        if(sContentNode != sPortalNode)
    		return true;
    }
    //end
    var hptabname = "";
    if (typeof sUrl == 'undefined' || sUrl.length == 0 || sUrl == null) return false;

    var res = document.cookie.match('(^|;)?' + "HPTabName" + '=([^;]*)(;|$)');
    if (res)
         hptabname = res[2];
    if (hptabname != "REMOTEUNIFIEDDASHBOARD")
	return false;
    
    if (isUrlFrmModal(sUrl, window))
    return true;
    if (typeof hostWin.ptNav2Info == "undefined" || hostWin.ptNav2Info.UniNavRequest == "false")
    return false;
    if ((sUrl.indexOf('/psp/') != -1 && sUrl.indexOf('/h/') != -1 && sUrl.indexOf('&pslnkid') != -1 ))
    return true;
    else
    return false;
}

function convToRemoteDashboardURL(sUrl,hostWin) {

    var sHostUrl = hostWin.location.href;

    if (isUrlFrmModal(sUrl, window))
    return sHostUrl;

    var sPortalHostNode = getNodeName(sHostUrl);
    var sContentHostNode = getNodeName(sUrl);

    if(sPortalHostNode != sContentHostNode)
	{
            if (sContentHostNode == hostWin.ptNav2Info.UniNavPortalNode)
	    sUrl = String(sUrl).replace('\/'+sContentHostNode+'\/','\/'+sPortalHostNode+'\/');
	}

    if (isPortalUrl(sUrl) && getPortalName(sUrl) != getPortalName(sHostUrl))
    return sUrl;
	
	//added for support remote dashboard in unifed navigation
    var sContentNode = getContentNode(sUrl);
    if(sContentNode != null){
    	var sPortalNode = getNodeName(sUrl);
        sUrl = String(sUrl).replace('\/'+sPortalNode+'\/','\/'+sContentNode+'\/');
		//sUrl = String(sUrl).replace('&contentNode='+sContentNode,'');
    }
    //end

    var sHostURI = getUrlHost(sHostUrl);
    var sHostPSHome = getPSHome(sHostUrl);
    var sPSHomeSuffix = getPSHomeSuffix(sHostUrl);
    var sHostPortalName = getPortalName(sHostUrl);
    var sNodeName = getNodeName(sHostUrl);
    var UniNavPortalNode = hostWin.ptNav2Info.UniNavPortalNode; 
    var pos = sUrl.indexOf(sNodeName);
    sUrl = encodeURIComponent(sUrl);
    sUrl = sUrl + "&unifieddashboard=y";
    var sReturnURL = sHostURI + '/psp/' + sHostPSHome+sPSHomeSuffix + '/' + sHostPortalName + '/' + UniNavPortalNode +'/'+ 'h/?tab=REMOTEUNIFIEDDASHBOARD' + '&remotedburl=' + sUrl;
    return sReturnURL;			
}


function convToHostURI(sUrl, hostWin) {
    if (!isRemoteNode(sUrl, hostWin) && isHostWinPortal(sUrl, hostWin)) {
        return sUrl.replace('/psc/', '/psp/')
    } 

    var sHostUrl = hostWin.location.href;
    if (isPortalUrl(sUrl) && getPortalName(sUrl) != getPortalName(sHostUrl))
        return sUrl;

    var sHostURI = getUrlHost(sHostUrl);
    var sHostPSHome = getPSHome(sHostUrl);
    var sPSHomeSuffix = getPSHomeSuffix(sUrl);
    var sHostPortalName = getPortalName(sHostUrl);
    var sNodeName = getNodeName(sUrl);
    var pos = sUrl.indexOf(sNodeName);
    var sReturnUrl = sHostURI + '/psp/' + sHostPSHome+sPSHomeSuffix + '/' + sHostPortalName + '/' + sUrl.substring(pos, sUrl.length);
    return sReturnUrl;
}

function preProcessUrl(sUrl, hostWin, topWin, form) {

    sReturnUrl = sUrl;

   //For Remote Dashboard URL, do the conversion and redirect it. 
    if(isRemoteDashboardURL(sUrl,top)) {
       sReturnUrl = convToRemoteDashboardURL(sUrl,top);
       return sReturnUrl;
    }

   //For modeless, work center or homepage url, do nothing
    if (isWorkCenter() || isModeless(modalID) || isPortalHomagPageUrl(sUrl) || !isPIAComponentUrl(sUrl))
        return sReturnUrl;

    //PIA Content in regular/classic target content iframe
    if (isPIAUrl(sUrl) && isInFrame(sUrl, hostWin, topWin) && isHostWinPIA(sUrl, hostWin))
        return sReturnUrl;

    //Modal Window, the first parent is PIA Content in regular/classic target content iframe
    if (isPIAUrl(sUrl) && isUrlFrmModal(sUrl, hostWin) && isHostWinPIA(sUrl, getFirstParentWin()))
        return sReturnUrl;

    //Homepage pagelet or Html Template Pagelet such as Nashboard
    if (!isInFrame(sUrl, hostWin, topWin) && (isPIAPagelet(sUrl, hostWin, topWin, form) || isPIAHtmlTempalteTarget(sUrl, hostWin, topWin, form))) {
        sReturnUrl = convToHostURI(sUrl, hostWin);
        return sReturnUrl;
    }

    //Modal Window, the first parent is Homepage pagelet/Html Template Pagelet such as Nashboard
    if (isPIAUrl(sUrl) && isUrlFrmModal(sUrl, hostWin) && isHostWinPortal(sUrl, getFirstParentWin())) {
        sReturnUrl = convToHostURI(sUrl, getFirstParentWin());
        return sReturnUrl;
    }

    //PIA Content in regular target content iframe, url is psp
    if (isPortalUrl(sUrl) && isHostWinPortal(sUrl, top)) {
        sReturnUrl = convToHostURI(sUrl, top);
        return sReturnUrl;
    }
    return sReturnUrl;
}

function DoUrl(sOrigURL, form) {
    var bWorkCenter = isWorkCenter();
    var sURL = preProcessUrl(sOrigURL, window, top, form);
    if (isPortalUrl(sURL)) {
        this.closeModal();
        top.location.href = sURL;
    }
    else {
        window.location.href = sURL;
    }
}
function getCookieValue(cName) 
{
var s, e, rv = "", ac = document.cookie;
if (ac.length > 0) 
   {
   s = ac.indexOf(cName + "=");
   if (s !== -1) 
      {
      s += cName.length + 1;   
      e = ac.indexOf(";",s);
      if (e === -1) 
         { 
         e = document.cookie.length;
         }
      rv = decodeURIComponent(ac.substring(s,e));
      }
   }
   return rv;
}

function setCookie(name,value,expires,path,domain,secure) 
{
    document.cookie = name + "=" + value +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}
