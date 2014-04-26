/*  Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.
    ToolsRel: 8.52.10 */
var gFocusObj = null;
var bRichTextEnabled = 0;
var gRichTextField = null;
var bTimer=null;
var objBeforeOrAfterFocusSave = null;  
var objToBeFocus = null;               

if (window.showhide == null)
{
window.showhide = function (obj, bShow)
    {
    if (obj == null)
        return;
    if (bShow)
        {
		var scrollY = ptCommonObj2.getScrollY();
        var x = ptCommonObj2.getScrollX();

        if (browserInfoObj2.isIE && ("ltr"==="rtl"))
            x = obj.parentNode.scrollWidth - obj.parentNode.clientWidth - obj.parentNode.scrollLeft;
        x = (x > 0) ? (0-x) : x;
        if (obj.parentNode.tagName.toLowerCase() !== "body") {
            var topCoord = getPgltTopY(obj);  
            scrollY = topCoord.y;
            x = topCoord.x;
        }
        obj.style.top = scrollY;
        obj.style.right = x;  
    
        obj.style.visibility = "visible";
        obj.style.display = "block";
        }
    else
        {
        obj.style.visibility = "hidden";
        obj.style.display = "none";
        }
    }
}

function getPgltTopY(obj) 
{
  
  var topY = ptCommonObj2.getScrollY();	
  var topX = ptCommonObj2.getScrollX();	
  var objGP= ptUtil.getGrandParent(obj); 
  
  
  if (objGP.style.height != "" && browserInfoObj2.isIE) {
      
      topY = objGP.scrollTop;
      if ("ltr" === "ltr")
          topX = (objGP.scrollLeft > 0) ? -objGP.scrollLeft : 0;
      else
          topX = (objGP.offsetLeft > 0 && ((objGP.scrollWidth-objGP.scrollLeft) == objGP.clientWidth))? 0: (0-(objGP.scrollWidth-objGP.scrollLeft-objGP.clientWidth));  
  }else {
      var gpScrollTop = objGP.scrollTop;
      
      var p = obj.parentNode;
      while (p && ((p.tagName.toLowerCase() !== "li") && (p.tagName.toLowerCase()!== "body")))
          p = p.parentNode;
      if (p) {
          if (p.tagName.toLowerCase()== "body") {
              return {x:topX, y:topY};  
          }
          
          var pgltHeader = ptUtil.getElemsByClass("PTPAGELETHEADER", p, "table");
          if (p.tagName.toLowerCase() === "li" && objGP.style.height != "") {
              
              topY = pgltHeader.length ? p.offsetTop+pgltHeader[0].offsetHeight+4 : p.offsetTop;		
              topX = (objGP.scrollWidth!=objGP.clientWidth) ? 20 : 0 ;
          } else {
              
              topY = (topY > p.offsetTop) ? (topY - p.offsetTop) : (gpScrollTop ? gpScrollTop+pgltHeader[0].offsetHeight+4 : pgltHeader[0].offsetHeight+4);	
              if ((p.offsetLeft + p.offsetWidth) > document.body.clientWidth) {
                  topX = (p.offsetLeft + p.offsetWidth) - document.body.clientWidth - document.body.scrollLeft;
                  topX = (topX < 0)? 0 : topX;
              } else {
                  if ("ltr" === "rtl") {
                      topX = (p.offsetLeft > 0 && ((document.body.scrollWidth-document.body.scrollLeft) >= document.body.clientWidth))? 0: (0-p.offsetLeft);
                  }else
                      topX = 0;  
              }
          }
      }  
  }
  return {x:topX, y:topY}; 
}


function setSaveText_win0(txt)
{
var saveobj = document.getElementById("SAVED_win0");
if (saveobj)
   {
   document.getElementById("ptStatusText_win0").innerHTML = txt;
   showhide(saveobj, true);
   document.getElementById("saveWait_win0").style.display = "";
   }
}

function processing_win0(opt,waittime)
{
var waitobj = document.getElementById("WAIT_win0");
var saveobj = document.getElementById("SAVED_win0");
var saveWaitObj = document.getElementById("saveWait_win0");
if (opt == 0)
{
    showhide(waitobj, false);
    showhide(saveobj, false);
    return;
}
if (opt == 1)
{
    if (saveobj && (saveobj.style.visibility != "hidden") && (saveobj.style.display != "none")
       && (saveWaitObj.style.display != "none"))
       return;
    showhide(waitobj, true);
    showhide(saveobj, false);
    if(typeof bTimer != "undefined" && bTimer != null)
      clearTimeout(bTimer);
    return;
}
if (opt == 2)
{
    showhide(waitobj, false);
    setSaveText_win0('Saved');
    if (saveWaitObj)
        saveWaitObj.style.display = "none";
    bTimer = setTimeout("processing_win0(0)",waittime);
}
}

function isAltKey(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return false;
if (evt.altKey)
    return true;
if (evt.modifiers)
    return (evt.modifiers & Event.ALT_MASK) != 0;
return false;
}

function isCtrlKey(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return false;
if (evt.ctrlKey)
    return true;
if (evt.modifiers)
    return (evt.modifiers & Event.CONTROL_MASK) != 0;
return false;
}

function isShiftKey(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return false;
if (evt.shiftKey)
    return true;
if (evt.modifiers)
    return (evt.modifiers & Event.SHIFT_MASK) != 0;
return false;
}

function getKeyCode(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return 0;
if (evt.keyCode)
    return evt.keyCode;
if (evt.which)
    return evt.which;
return 0;
}

function cancelBubble(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return;
if (typeof evt.cancelBubble != "undefined")
    evt.cancelBubble = true;
if (typeof evt.stopPropagation != "undefined" && evt.stopPropagation)
    evt.stopPropagation();
}

function isPromptKey(evt)
{
if (isAltKey(evt) && getKeyCode(evt) == "5".charCodeAt(0))
{
    cancelBubble(evt);
    return true;
}
return false;
}

function getEventTarget(evt)
{
if (!evt && window.event)
    evt = window.event;
if (!evt)
    return null;
if (evt.srcElement)
    return evt.srcElement;
if (evt.target)
    return evt.target;
return null;
}

function getModifiers(evt)
{
var res = "";
if (isAltKey(evt))
    res += "A";
if (isCtrlKey(evt))
    res += "C";
if (isShiftKey(evt))
    res += "S";
return res;
}

var nLastKey_win0 = 0;

function doKeyDown_win0(evt)
{
var target = getEventTarget(evt);

if (target && target.form && target.form.name != "win0")
    return findHandler("doKeyDown_" + target.form.name, evt);

nLastKey_win0 = getKeyCode(evt);
if (nLastKey_win0 != "\t".charCodeAt(0)) {

if (isGridNav(evt))
    ptGridObj_win0.doArrowNavGrid(evt);

if (isTypeAheadEl(evt))
     ptTAObj_win0.KeyUpDown(evt);

    return true;
}

if (isCtrlKey(evt))
    return tryFocus(oFirstTab_win0);
if (isAltKey(evt) || (isShiftKey(evt) && !isGridNav(evt)))
    return true;

if (target == oLastTab_win0)
{
if (oFirstTB_win0)
    {
    if (!bTabOverTB_win0)
        return true;
    }
if (oFirstPg_win0)
    {
    if (!bTabOverPg_win0)
        return tryFocus(oFirstPg_win0);
    }
if (bTabOverNonPS_win0 || oFirstTB_win0 != null || oFirstPg_win0 != null)
    return tryFocus(oFirstTab_win0);
return true;
}
if (target == oLastTB_win0)
{
  if (oFirstPg_win0)
  {
    if (!bTabOverPg_win0)
       return tryFocus(oFirstPg_win0);
  }
  if (bTabOverNonPS_win0 || oFirstPg_win0 != null)
    return tryFocus(oFirstTab_win0);
  return true;
}

if (target == oLastPg_win0)
{
  if (bTabOverNonPS_win0)
    return tryFocus(oFirstTab_win0);
  return true;
}

if (nLastKey_win0 == "\t".charCodeAt(0) && isTypeAheadEl(evt))
{
    ptTAObj_win0.KeyUpDown(evt);
    return true;
}

}

function getLastKey_win0()
{
var nTemp = nLastKey_win0;
nLastKey_win0 = 0;
return nTemp;
}

function doKeyUp_win0(evt)
{

var target = getEventTarget(evt);
if (target && target.form && target.form.name != "win0")
    return findHandler("doKeyUp_" + target.form.name, evt);
var key = getKeyCode(evt);
var keyChar = String.fromCharCode(key);
if (isCtrlKey(evt) && key == 220) //debugger console ctl-\
        {
        ptConsole2.active();
        return false;
        }
if (keyChar == "\r" || key == 27)
    {
    
    if (target != null && target.id.indexOf("$delete") != -1)
        {
        if(!evt)return;
        DeleteCheck2_win0(target.id);
        return;
        }
    if (key == 27  && typeof (bDoModal_win0) != "undefined" && bDoModal_win0 && modalID != null) 
        {
        doUpdateParent(document.win0, '#ICCancel');
        return;
        }   
    return;
    }

if (!routeKeyEvent(evt))
    return false;
var bAlt = isAltKey(evt);
var bCtrl = isCtrlKey(evt);
var bNotMine = false;
if (bAlt)
    {
    if (bCtrl || altKey_win0.indexOf(keyChar) < 0)
        if (keyChar == "9" || key == 220 || key == 186)
            return true;
        else if ( keyChar != "2" )
            bNotMine = true;
    }
else if (bCtrl)
    {
    if (key == 88 || key == 120) //debugger console ctl-x
        {
        ptConsole2.deactive();
        return false;
        }
    keyChar = String.fromCharCode(key | 0x40);
    if (ctrlKey_win0.indexOf(keyChar) < 0)
        bNotMine = true;
    }
else
    {
    if (baseKey_win0.indexOf(keyChar) < 0)
    bNotMine = true;
    }

if (bNotMine) {

    
    if (bAlt || bCtrl) {
            
        
        var navFrame = parent.frames["NAV"];
        if (!navFrame) {
            navFrame = parent.frames["UniversalHeader"];
        }    
        if (navFrame && navFrame.parentKeyHandler && !isCrossDomain(navFrame)) {
            navFrame.parentKeyHandler(window, key, bAlt, bCtrl);
        
        } else if (parent.ptIframe && parent.ptIframe.parentKeyHandler && !isCrossDomain(parent)) {
            parent.ptIframe.parentKeyHandler(window,key,bAlt,bCtrl);
        }
    }
    if (isGridNav(evt)) //for grid
        ptCommonObj2.terminateEvent(evt);

    if (isTypeAheadEl(evt)) // for type ahead suggest
        ptTAObj_win0.GiveOptions(evt);

    return true;
}


var code = getModifiers(evt) + keyChar;
if (target && target.name)
    document.win0.ICFocus.value = target.name;

if (code == "A8")
    if (!doDeleteKey_win0(target))
        return false;
if (code == "A\xbf")
{
    if (window.FindString_win0
    && document.win0.ICFind
    && findScroll(target))
    {
        if (!FindString_win0(document.win0.ICFind))
            return false;
    }
else
    return false
}

if (code == "A7")
    if (!doInsertKey_win0(target))
        return false;

if (code == "A\xbc" || code == "A\xbe" || code == "A\xde")
    if (!activeLink(target,code))
        return false;

if (code == 'A5')
{
var id_s = target.id.split("$")[0];
var occ_s = target.id.split("$")[1];
var pid = id_s+"$prompt";
if (occ_s && typeof occ_s != "undefined")
pid +="$"+occ_s;
var pobj = document.getElementById(pid);
var operation = "";
if (!pobj || typeof pobj == "undefined" ) {
     pid = id_s+"$spellcheck";
     if (occ_s && typeof occ_s != "undefined")
     pid +="$"+occ_s;
     pobj = document.getElementById(pid);
     if (pobj && typeof pobj != "undefined" ) operation = "$spellcheck";
   }

if (!pobj || typeof pobj == "undefined" ) {
    pid = target.id+"$prompt";
    pobj = document.getElementById(pid);
    if (!pobj || typeof pobj == "undefined" )
        return false;
}
}

if (saveWarningKeys_win0.indexOf(code) >= 0)
{
   var url = "javascript:submitAction_win0(document.win0, \'#KEY" + code;
   if (code == 'A5')
         url = url  + "\', " + target.id + ")";
   else
        url = url + "\')";
   if (!saveWarning("", null, "", url))
        return false;
}

if (key == 13 && !ptCommonObj2.isSearchPage(target.form)) //enter key pressed
{
 if (modalZoomName != null) {
    doUpdateParent(document.win0, '#ICReturn');
    return;
 }
 else if (typeof event != "undefined")
    submitAction_win0(document.win0, event.srcElement.id);
 else // for firefox
    submitAction_win0(document.win0, evt.target.id);
}else
{
if (target && target.form)
    addchg_win0(target);
if (code == 'A5')
 submitAction_win0(document.win0, "#KEY" + code + operation, target.id);
else {
 if (bAlt && (key == 49)) //Alt+1 = Saving
    setSaveText_win0('Saving...', true, false);
 submitAction_win0(document.win0, "#KEY" + code);
 }
}

return false;
}

function activeLink(obj, akey)
{
var scrl = findScroll(obj);
var btnid;
if (!scrl) {
    
    if (akey == "A\xbc")
        btnid = "#ICPrevPage";
    else if (akey == "A\xbe")
        btnid = "#ICNextPage";
    else
        return false;

    var btn = document.getElementById(btnid);
    if (btn)
        return true;
    else
        return false;
    }
if (akey == "A\xbc")
    btnid = "\$hup\$";
else if (akey == "A\xbe")
    btnid = "\$hdown\$";
else if (akey == "A\xde")
    btnid = "\$hviewall\$";
btnid = scrl.id.replace(/\$scroll[im]?\$/,btnid);
var btn = document.getElementById(btnid);
if (btn)
    return true;
return false;
}

function findHandler(handlerName, evt)
{
var obj = window[handlerName];
if (typeof obj == "function")
    return obj(evt);
return true;
}

function keyHandler(keyCode, bIsAlt, bIsCtrl)
{
return keyHandler_win0(keyCode, bIsAlt, bIsCtrl);
}

function keyHandler_win0(keyCode, bIsAlt, bIsCtrl)
{
var keyChar = String.fromCharCode(keyCode);
var code = "";
if (bIsAlt)
{
    code = "A";
    if (bIsCtrl || altKey_win0.indexOf(keyChar) < 0)
        return false;
}
else if (bIsCtrl)
{
    code = "C";
    keyChar = String.fromCharCode(keyCode | 0x40);
    if (ctrlKey_win0.indexOf(keyChar) < 0)
        return false;
}
else
    return false;
code += keyChar;

if (code  == "A8" || code == "A\xbf" || code == "A7")
    return false;

if (target && target.form)
    addchg_win0(target);

submitAction_win0(document.win0, "#KEY" + code);
return true;
}

function doDeleteKey_win0(obj)
{
if (!window.DeleteCheck2_win0)
    return false;
var scroll = findScroll(obj);
if (!scroll)
    return false;
if (scroll.id.search(/^(.*)(\$scroll[im]?\$)(.*)$/,"$fdelete$") < 0)
    buttonid = scroll.id;
else
    buttonid =  RegExp["$1"] + "$fdelete$" +  RegExp["$3"];
if (document.getElementById(buttonid))
    return DeleteCheck2_win0(buttonid);
if (obj.name == null || obj.name.search(/\$(\d*)(\$\$\d*)?$/) < 0)
    return false;
var row = RegExp.$1;
if (buttonid.search(/^(.*)(\$fdelete\$)(.*)$/) < 0)
    return false;
buttonid = RegExp["$1"] + "$delete$" + row + "$$" + RegExp["$3"];

if (document.getElementById(buttonid))
    return DeleteCheck2_win0(buttonid);
return false;
}

function doInsertKey_win0(obj)
{
if (!window.AddMultiple_win0)
    return false;
var scroll = findScroll(obj);
if (!scroll)
    return false;
var bHasInsertBtn = false;
if (scroll.id.search(/^(.*)(\$scroll[im]?\$)(.*)$/,"$fnew$") < 0)
    buttonid = scroll.id;
else
    buttonid =  RegExp["$1"] + "$fnew$" +  RegExp["$3"];
if (document.getElementById(buttonid))
    bHasInsertBtn = true;
if (obj.name == null || obj.name.search(/\$(\d*)(\$\$\d*)?$/) < 0)
    return false;
var row = RegExp.$1;
if (buttonid.search(/^(.*)(\$fnew\$)(.*)$/) < 0)
    return false;
buttonid = RegExp["$1"] + "$new$" + row + "$$" + RegExp["$3"];
if (!bHasInsertBtn)
{
    if(document.getElementById(buttonid))
        bHasInsertBtn = true;
}
if (!bHasInsertBtn)
{
    /* try multiple insert key */
    buttonid = RegExp["$1"] + "$newm$" + row + "$$" + RegExp["$3"];
    if(document.getElementById(buttonid))
        bHasInsertBtn = true;
}
if (bHasInsertBtn)
{
    if (scroll.id.match(/\$scrollm\$/))
        return AddMultiple_win0(document.win0.ICAddCount);
    if (scroll.id.match(/\$scrolli\$/))
        return true;
}
return false;
}

function findScroll(obj)
{
while (obj)
{
    if (typeof obj.id  != "undefined")
        if (obj.id.match(/\$scroll/))
            return obj;
    if (typeof obj.parentNode != "undefined")
        obj = obj.parentNode;
    else    if (typeof obj.offsetParent != "undefined")
        obj = obj.offsetParent;
    else
        return null;
}
}

if (window.doKeyPress_win0 == null)
{
window.doKeyPress_win0 = function (evt)
    {
    var target = getEventTarget(evt);
    if (target && target.form)
         addchg_win0(target);

    if (target && target.form && target.form.name != "win0")
        return findHandler("doKeyPress_" + target.form.name, evt);

    var key = getKeyCode(evt);
    var keyChar = String.fromCharCode(key);
    if (key==27)    
        {
        if (!(glObjTr.isEmpty(glObjTr.sOpen))){
            glObjTr.removePrevMenu(evt);
            return true;
        }
        
        if (typeof(MOpopupObj_win0.bIs_shown) != "undefined" && MOpopupObj_win0.bIs_shown)
            return MOpopupObj_win0.StopAccess(evt);   // close mouseover popup
         if (typeof (bDoModal_win0) != "undefined" && bDoModal_win0)
            return true;
        else if (isTypeAheadEl(evt))        //ICE#1850813000
                return true;
    }

    if (keyChar != "\r" && key != 27)
        return true;

    
    
    var objGridZoom = document.getElementById("ICZoomGrid");
    if (objGridZoom && typeof objGridZoom != "undefined")
       {
       if (keyChar == "\r" && !(target.href || typeof target.onclick == "function") && objGridZoom.value == 1 && target.id != "ICOKZG")
           return true;
       }


    
    if (!routeKeyEvent(evt))
        return false;

    if (target && key != 27)
        {
        if ((typeof target.onclick == "function" || target.href)
        && target.type != "radio" && target.type != "checkbox")
            return true;
        if (target.type == "textarea")
            return true;
        }
    var code = getModifiers(evt) + keyChar;

    if (target && target.name)
        document.win0.ICFocus.value = target.name;

   /*var rc = ShowOrCloseModalOnEnter(key, target, "#KEY" + code);
    if (rc == 1)
        return true;
    else if (rc == -1)
        return false;*/

    
    if ((key == 13) && isTypeAheadEl(evt) && ptTAObj_win0.IsGrabHighlighted())
        {
    ptTAObj_win0.HideTheBox();
    return false;
        }
    
    submitAction_win0(document.win0, "#KEY" + code);
    return false;
    }
}

var oFirstTab_win0 = null;
var oLastTab_win0 = null;
var oFirstTB_win0 = null;
var oLastTB_win0 = null;
var oFirstPg_win0 = null;
var oLastPg_win0 = null;

var nFirstTBIndex = 5000;        var nFirstPgIndex = 10000;

function checkTabIndex(obj)
{
if (obj.tabIndex && obj.tabIndex >= 0)
{
    if (obj.tabIndex < nFirstTBIndex)
    {
        if (oLastTab_win0 == null || obj.tabIndex > oLastTab_win0.tabIndex)
            oLastTab_win0 = obj;
        if (oFirstTab_win0 == null || obj.tabIndex < oFirstTab_win0.tabIndex)
            oFirstTab_win0 = obj;
    }
    else if (obj.tabIndex < nFirstPgIndex)
    {
        if (oLastTB_win0 == null || obj.tabIndex > oLastTB_win0.tabIndex)
            oLastTB_win0 = obj;
        if (oFirstTB_win0 == null || obj.tabIndex < oFirstTB_win0.tabIndex)
            oFirstTB_win0 = obj;
    }
    else
    {
        if (oLastPg_win0 == null || obj.tabIndex > oLastPg_win0.tabIndex)
            oLastPg_win0 = obj;
        if (oFirstPg_win0 == null || obj.tabIndex < oFirstPg_win0.tabIndex)
            oFirstPg_win0 = obj;
    }
}
}

function setEventHandlers_win0(sFirst, sLast, bMac)
{
var focus1, focus2;
focus1 = function (evt) {doFocus_win0(this, true, true);};
focus2 = function (evt) {doFocus_win0(this, false, true);};
fchange = function(evt) {addchg_win0(this); };

var i;

if (sFirst!="")
{
    var docanchors = document.anchors;
    var docanclen = docanchors.length;

    for (i = 0; i < docanclen; ++i)
    {
        if (docanchors[i].name == sFirst) break;
    }
    for (++i; i < docanclen; ++i)
    {
        var anc =  docanchors[i];
        if (anc.name == sLast) break;
        checkTabIndex(anc);
        checkAccessKeys(anc);
                if  (typeof anc.onfocus != "function")
            anc.onfocus = focus1;
    }
}

var frm = document.win0;
if (!frm) return;
var frmlen = frm.length;
objBeforeOrAfterFocusSave = null;        
var objBefore = null;  
var bAfter = 0;    
var b = navigator.userAgent.toLowerCase();
var bIE = (b.indexOf("msie") != -1) ? 1:0;
var bIE8 = (bIE && b.indexOf("trident/4.0;") != -1) ? 1:0;       

for (i = 0; i < frmlen; ++i)
{
    var frmi  =  frm[i];
    
    if (frmi.type=="hidden") 
        continue;
    
    
    if (bIE8 && objToBeFocus && !objBeforeOrAfterFocusSave && !frmi.isDisabled)  
    {
        if (frmi.id != objToBeFocus)
           {
           objBefore = frmi;
           if (bAfter && objBefore) 
              {
              objBeforeOrAfterFocusSave = objBefore;
              bAfter = 0;
              }
           }
        else 
           {
           if (objBefore)
               objBeforeOrAfterFocusSave = objBefore;
           else
               bAfter = 1;
           }
    }   
    
    checkTabIndex(frmi);
    checkAccessKeys(frmi);

    if (typeof frmi.onblur != "function") {
        frmi.onblur = fchange;
    }

     if (typeof frmi.onchange != "function") {
        frmi.onchange = fchange;
    }

    if (typeof frmi.onfocus != "function")
    {
    if (typeof frmi.onclick == "function")
        frmi.onfocus = focus1;
    else
        frmi.onfocus = focus2;
    }
}
}

if (window.setKeyEventHandler_win0 == null)
{
    window.setKeyEventHandler_win0 = function ()
    {
    if (typeof(baseKey_win0) != "undefined")
        {
        document.onkeyup = doKeyUp_win0;
        if (baseKey_win0.indexOf("\r") >= 0 || baseKey_win0.indexOf("\x1b") >= 0)
            document.onkeypress = doKeyPress_win0;
        }
    document.onkeydown = doKeyDown_win0;
    }
}
var oTop = null;
var oBottom = null;
if (window.routeKeyEvent == null)
  {
  window.routeKeyEvent = function(evt)
  {
  if (!isAltKey(evt) || isCtrlKey(evt))
  return true;
  var key = getKeyCode(evt);
  var keyChar = String.fromCharCode(key);
  if (keyChar == "9"  && oTop != null)
  {
  oTop.focus();
  return false;
  }
  if (key == 220 && oBottom != null)
  {
  oBottom.focus();
  return false;
  }
    return true;
    }
  }
if (window.checkAccessKeys == null)
{
window.checkAccessKeys = function(obj)
{
  var attr = obj.getAttribute("PSaccesskey");
  if (attr == "9")
    oTop = obj;
  else if (attr == "\\")
    oBottom = obj;
}
}
function setFocus_win0(fldname, indx, oDoc0)
{
gRichTextField = fldname;
if(typeof CKEDITOR != 'undefined')
   {
   for ( var instanceName in CKEDITOR.instances )
       {

       if (instanceName == fldname)
          {
          bRichTextEnabled = 1;
          gRichTextField = fldname;

          }
       }
   }

if (bRichTextEnabled == 0)
   {
   var oDoc = null;
   if (!oDoc0 || typeof oDoc0 == "undefined")
       oDoc = document;
   else
       oDoc = oDoc0;
   
   var obj = null;
   if (oDoc.win0)
      {
      obj = oDoc.win0.elements[fldname];
      if (!obj)
          obj = oDoc.win0[fldname];
      }
      
   if (!obj)
      obj = oDoc.getElementById(fldname);
      
   if (!obj) 
      return false;
      
   if (indx >= 0 && obj.length && indx < obj.length)
      obj = obj[indx];
      
   if (!oDoc0 || typeof oDoc0 == "undefined")
      return !tryFocusNew(obj);
   else
      return !tryFocus0New(obj);
   }
}

function tryFocusNew(obj)
{
if (!tryFocus0New(obj))
    gFocusObj = obj;
return;
}

function tryFocus0New(obj)
{
  if (obj && typeof obj.focus != "undefined" && !obj.disabled && obj.style.visibility!="hidden")
    {
    var b = navigator.userAgent.toLowerCase();
    var bIE = (b.indexOf("msie") != -1) ? 1:0;
    var bIE8 = (bIE && b.indexOf("trident/4.0;") != -1) ? 1:0;       
    
    if (!bIE8)
       {
       try {            // check access violation because of trying to focus on invisible field
           obj.focus();
           }
       catch (err) {
           return true;
           }
       
       if (b.indexOf("msie")!=-1)
           obj.setActive();
       }
    else         
       {
       setTimeout(function(){delayFocus(obj.id);}, 0);    
       }   
   
   if (window.focusHook)
        focusHook(obj);

    var gn = isGridEl(null,obj.id);
    if (gn != null)
       ptGridObj_win0.doScrollOnFocus(gn, obj);
    return false;
    }
return true;
}

function tryFocus(obj)
{
if (!tryFocus0(obj))
    gFocusObj = obj;
return;
}


function tryFocus0(obj)
{
if (obj && typeof obj.focus != "undefined" && !obj.disabled && obj.style.visibility!="hidden")
{
    var b = navigator.userAgent.toLowerCase();
    try {            // check access violation because of trying to focus on invisible field
       obj.focus();
    }
    catch (err) {
       return true;
    }
    if (b.indexOf("msie")!=-1)
       obj.setActive();

    if (window.focusHook)
        focusHook(obj);

var gn = isGridEl(null,obj.id);
if (gn != null)
    ptGridObj_win0.doScrollOnFocus(gn, obj);
return false;
}
return true;
}

function setFocusSecPageMessage_win0()
{
var obj;
obj = document.getElementById("#ICOK");
if (obj)
    return tryFocus(obj);
obj = document.getElementById("#ICYes");
if (obj)
    return tryFocus(obj);
obj = document.getElementById("#ICAbort");
if (obj)
    return tryFocus(obj);
obj = document.getElementById("#ICRetry");
if (obj)
    return tryFocus(obj);
}


function delayFocus(id) 
{ 
var obj = document.getElementById(id);
var tgName = obj.tagName;
if (tgName.indexOf("SELECT") >=0) 
   {  
   if (objBeforeOrAfterFocusSave)
      objBeforeOrAfterFocusSave.focus(); 
   }
else if (tgName.indexOf("INPUT") >=0) 
   {
   var idArray = id.split("$");
   var tmp = idArray[0];
   idArray.shift();
   var promptId = tmp.concat("$prompt$", idArray.join());
   var fObject = document.getElementById(promptId);  
   if (fObject)
       fObject.focus();
   else
       {
       if (objBeforeOrAfterFocusSave)
           {
           try {
               objBeforeOrAfterFocusSave.focus();
               }
           catch (err)
               {} 
           }
       }
   }

try {
     obj.focus(); 
     obj.setActive();
     } 
catch (err)
   {} 
   
}


if (typeof CKEDITOR != 'undefined') CKEDITOR.on( 'instanceReady', function( ev )
{
                 ev.editor.dataProcessor.writer.setRules( 'p',
                      {
                           indent : false,
                           breakBeforeOpen : false,
                           breakAfterOpen : false,
                           breakBeforeClose : false,
                           breakAfterClose : false
                         });

for ( var instanceName in CKEDITOR.instances )
{
if (instanceName == gRichTextField)
{
CKEDITOR.instances[instanceName].focus();
}
}
});


function keyPressHandler(e)
{
    var kCode  = (window.event) ? event.keyCode : e.keyCode;   // MSIE or Firefox?
    return kCode;
}

function UpdateEditorLinkedField()
{
   for ( var instanceName in CKEDITOR.instances )
      {
      if (document.getElementById(instanceName) != null)
         replaceImageSource(instanceName);
      }
}

function positionWAIT_win0(){
var waitobj = null;
var savedobj = null;
var objFrame =  top.frames['TargetContent'];
if (objFrame) {
  waitobj = objFrame.document.getElementById("WAIT_win0");
  savedobj = objFrame.document.getElementById("SAVED_win0");
}
else {
  waitobj = document.getElementById("WAIT_win0");
  savedobj = document.getElementById("SAVED_win0");
}

if (waitobj && waitobj.style.display != "none" && waitobj.style.visibility != "hidden")
  keepObjTopRight(waitobj);
if (savedobj && savedobj.style.display != "none" && savedobj.style.visibility != "hidden")
  keepObjTopRight(savedobj);
}

function isGridEl(evt,objid)
{
if (typeof ptGridObj_win0 == "undefined" || !ptGridObj_win0)
    return null;

if (typeof gridList_win0 == "undefined" || typeof gridFieldList_win0 == "undefined")
    return null;

var obj = null;
var id = '';
var nRowCnt = 0;
var idarr = '';

if (!objid || typeof objid == "undefined") {
    obj = getEventTarget(evt);
    if (!obj || !obj.id) return null;
    id = obj.id;
    nRowCnt = 0;
    idarr = id.split("$");
    if (idarr.length<2) return null;
    if (isNaN(idarr[1]))
        nRowCnt = idarr[2];
    else
        nRowCnt = idarr[1];
}
else {
    id = objid;
    idarr = id.split("$");
    if (idarr.length<2) return null;
    nRowCnt = idarr[1];
}

for (var i = 0; i < gridList_win0.length; i++)
{
var gn = gridList_win0[i][0];
var gc = document.getElementById('divgc'+gn);
if (!gc || typeof gc == "undefined") continue;

var gfields = gridFieldList_win0[i];
for (var j = 0; j < gfields.length; j++)
{
    var gfield = gfields[j].replace(/%c/,nRowCnt);
    if (id==gfield)
        return gn;
}
}
return null;
}

function getGridRowID(oContrl)
{
   var obj = oContrl;
   var bGrid = false;
   if (!obj)
       return null;
   if (!obj.id)
       return null;
   
   while (obj && obj.tagName != 'HTML' && obj.tagName != 'FORM')
        {
        if (obj.tagName == "TD")
           {
           if (obj.className.indexOf("GRIDROW") != -1 || obj.className.indexOf("GRIDODDROW") != -1 || obj.className.indexOf("GRIDEVENROW") != -1)    // control is in a grid   
               {
               bGrid = true;
               obj = obj.parentNode;
               continue;
               }
           else
               return null;
           }
        
        
        else if (bGrid && (obj.nodeName).indexOf("TR")==0 && ( (obj.id).indexOf("tr")==0 ||  (obj.id).indexOf("ftr")==0) )    
           {
           if (isMoreThanOneGridRow(obj))                                  // more than one row
               return obj.id;
           else
               return null;
           }
        else
           obj = obj.parentNode;
        }  
      

   return null;
}

function getNextSibling(obj)
{
   if (!obj)
       return null;

   var oElement = obj.nextSibling;
   while (oElement) 
         {
         if (oElement.nodeType == 1)
            return oElement; 
         else
            oElement = oElement.nextSibling;
         } 

   return null;
}

function getPrevSibling(obj)
{
   if (!obj)
       return null;

   var oElement = obj.previousSibling;
   while (oElement) 
         {
         if (oElement.nodeType == 1)
            return oElement; 
         else
            oElement = oElement.previousSibling;
         } 

   return null;
}

function isMoreThanOneGridRow(oRowObject)
{
   if (!oRowObject)
      return false;
  
   var nCnt=1;
   var objNextSib = getNextSibling(oRowObject);
   var objPrevSib = getPrevSibling(oRowObject);

   if (objNextSib && (objNextSib.nodeName).indexOf("TR")==0 && ((objNextSib.id).indexOf("tr") == 0 || (objNextSib.id).indexOf("ftr") == 0) )
       nCnt++;

   if (objPrevSib && (objPrevSib.nodeName).indexOf("TR")==0 && ((objPrevSib.id).indexOf("tr") == 0 || (objPrevSib.id).indexOf("ftr") == 0) )
       nCnt++;

   return (nCnt > 1 ? 1 : 0);
}

function isGridNav(evt)
{
var gn = this.isGridEl(evt);
if (typeof ptGridObj_win0 != "undefined" && ptGridObj_win0 && gn != null)
{
    evt= (evt)? evt: ((event)? event:null);
    var key = getKeyCode(evt);
    if (isShiftKey(evt) && key<=40 && key>=37)
        return true;
}
return false;
}


function initTypeAheadEl(el) {
        var oWin = window;
        var oDoc = document;
        var form = el.form;
        var pId = el.name + "$prompt";
        if (document.getElementById(pId))
            icAction = pId;
        else if (ptCommonObj2.isSearchSearchPage(form)) 
            icAction = '#ICSrchTypAhd';
        else 
            {
            var nsuffixIndex = el.name.lastIndexOf('$');
            if (nsuffixIndex > -1)
                {
                var fname = el.name.slice(0, nsuffixIndex);
                var nsuffix = el.name.slice(nsuffixIndex + 1, el.name.length);
                }
            else
                var fname = el.name;
            icAction = fname + "$prompt";
            if (nsuffixIndex > -1)
                icAction += "$" + nsuffix;
            }
        var serverScript = "ptTAObj_win0.oWin.pAction_win0(ptTAObj_win0.oDoc.win0,'" + icAction + "');";
        el.obj = oWin.ptTAObj_win0.SetProperties(el, 0, form.ICTypeAheadID, serverScript, true, false, false, true, true, 500); //default search 'Begin with'
 }

 function isTypeAheadEvtTgt(el) {
        if (el && el.form && !el.form.ICTypeAheadID) return false;
        if (!el || el.type != 'text') return false;       
        if (typeof el.obj != 'undefined')
            return true;
        else if (typeof PFieldList_win0 != 'undefined' && PFieldList_win0) {
            var fname = el.name.split('$')[0];
            for (var i = 0; i < PFieldList_win0.length; i++) {
                if (fname == PFieldList_win0[i][0] || el.name == PFieldList_win0[i][0]) {
                    initTypeAheadEl(el);
                    return true;
                }
            }
        }
        if (ptCommonObj2.isSearchSearchPage(el.form)) {
            if (typeof EFieldList_win0 != 'undefined' && EFieldList_win0) {
                for (var i = 0; i < EFieldList_win0.length; i++) {
                    if (fname == EFieldList_win0[i][0] || el.name == EFieldList_win0[i][0]) {
                        initTypeAheadEl(el);
                        return true;
                    }
                }
            }
        }

        return false;
 }


function isTypeAheadEl(evt)
{
    var el = getEventTarget(evt);
    return isTypeAheadEvtTgt(el);
}

function isTypeAheadField(id)
{
     var el = document.getElementById(id);
      return isTypeAheadEvtTgt(el);
}

function GenerateABN() {

    
    var abnContainer = document.getElementById("ptabncontainer");

    if (abnContainer) {

        
        var abnBCContainer = document.getElementById("ptabnbccontainer");

        
        var abnFlyOutContainer = document.getElementById("ptabnfocontainer");

        
        if (abnBCContainer)
            {
            var abnBCData = abnBCContainer.removeChild(abnBCContainer.firstChild);
            abnBCContainer.parentNode.removeChild(abnBCContainer);
        }

        
        if (abnFlyOutContainer)
            {
            var abnFlyOutData = abnFlyOutContainer.parentNode.removeChild(abnFlyOutContainer);
        }

        
        if (abnContainer) {
            var abnData = abnContainer.removeChild(abnContainer.firstChild);
            abnContainer.parentNode.removeChild(abnContainer);
        }

        try {
            if (!isCrossDomain(parent) && typeof(parent.ptIframe) !== "undefined") {
                if (typeof(parent.pthNav) !== "undefined") {
                    
                    parent.pthNav.abn.updateBC(abnBCData, abnFlyOutData);
                    parent.pthNav.abn.addData(abnData);
                }
            }
        } catch (e) {}
    }

}

function GenerateFakeBC() {

    
    var bcContainer;
    try {
    if(top.frames['TargetContent'] && top.frames['TargetContent'].document)
        bcContainer = top.frames['TargetContent'].document.getElementById("pt_fakeBC");
    }
    catch (e) {}

    if (bcContainer) {

        
        var abnBCData = bcContainer.removeChild(bcContainer.firstChild);
        bcContainer.parentNode.removeChild(bcContainer);

        try {
            if (!isCrossDomain(parent) && typeof(parent.ptIframe) !== "undefined") {
                if (typeof(parent.pthNav) !== "undefined") {
                    
                    parent.pthNav.FakeBCUpdate(abnBCData);                    
                }
            }
        } catch (e) {}
        return;
    }        
}

function preSubmitWorkCenter_win0(arg1, arg2) {
   var isWorkCenter = top.document.getElementById('ptalPgltAreaFrame');
   if(!isWorkCenter || !arg1)     {       return true; }

   if((parent.ptIframe) &&  (parent.ptIframe.isWorkCenterDirty())) { 
   var cancelFn = function(arg1, arg2) { 
                     var tgtFrameForm = top.frames['TargetContent'].document.forms[0]; 
                     if(tgtFrameForm && (tgtFrameForm.ICChanged)) 
                             tgtFrameForm.ICChanged.value='-1'; 
                     submitAction_win0(arg1, arg2);
                     return; 
                }
    if(parent.ptIframe.saveWarningForWorkCenter(cancelFn,null ,1,arg1, arg2)) 
        return false; 
} 
return true;
}

function preSubmitProcessSpellcheck_win0(form, name) {
    var spellcheckobj = document.getElementById('SPELLCHECKSTRING');
    if (spellcheckobj && spellcheckobj != 'undefined' && RTEspellcheck == true) {
        var spellcheckstring = spellcheckobj.value;
        spellcheckobj.value = ReplaceRTESpellSpaces(spellcheckstring);
    }
}

function preSubmitProcessCKEDITOR_win0(form, name) {
    if (typeof CKEDITOR != 'undefined') UpdateEditorLinkedField();
}

function preSubmitProcess_win0(form, name) {
 
    if (name.indexOf('#ICQryDownload') == -1) { processing_win0(1, 3000); }
    if ((name.indexOf('$delete') > 0 || name.indexOf('$srt') > 0) && typeof (preID_win0) != 'undefined' && preID_win0 != null) preID_win0 = null; //for grid row highlight
    if (form == null) {
        form = document.forms['win0'];
        form.style.display = 'block';
    }
    preSubmitProcessSpellcheck_win0(form, name);
    preSubmitProcessCKEDITOR_win0(form, name);
}

function aAction0_win0(form, name, params, bAjax, bPrompt)
{
if (typeof bSearchDialog_win0 != 'undefined' && !bDoModal_win0 && bSearchDialog_win0 && form.ICAction.value.indexOf("\x1b") >=0) 
    {
    processing_win0(0, 3000);
    return;
    }

if (loader != null && loader.GetInProcess2()) return;

if (loader != null && loader.GetInProcess())
   {
   if (loader.GetWaitingICAction() == "" && loader.GetInProcessICActionValue() != name && name == "#ICSave") 
       loader.SetWaitingObject(form, name, params, bAjax, bPrompt);
   return;    
   }

if (ptGridObj_win0)
ptGridObj_win0.saveScrollPos();

form.ICResubmit.value=nResubmit;
form.ICAction.value=name;
form.ICXPos.value = ptCommonObj2.getScrollX();
form.ICYPos.value = ptCommonObj2.getScrollY();

if (typeof bAjax != "undefined" && !bAjax && (typeof params == "undefined" || params == null || params == "") && (typeof popupObj_win0.isModalWidget == "undefined" || !popupObj_win0.isModalWidget))
    form.submit();
else if (typeof params == "undefined" || !params)
loader=new net2.ContentLoader(postUrl_win0,form,name,null,null,null,null,null,bAjax, bPrompt);
else
 loader=new net2.ContentLoader(postUrl_win0,form,name,null,null,null,params,null,bAjax, bPrompt);
}

function pAction_win0(form, name, efieldname)
{
if(typeof CKEDITOR != 'undefined')UpdateEditorLinkedField();

if ((loader != null) && (loader.GetInProcess())) return;
form.ICAction.value = name;
form.ICXPos.value = ptCommonObj2.getScrollX();
form.ICYPos.value = ptCommonObj2.getScrollY();
if (typeof form.ICTypeAheadID != 'undefined' && form.ICTypeAheadID.value != '') {
    var flag = form.ICActionPrompt.value;
    form.ICActionPrompt.value = 'false';
    var ret = aAction_win0(form, name, "", true, true);
    form.ICActionPrompt.value = flag;
    return ret;
}
else {
    form.ICActionPrompt.value = 'true';
    return aAction_win0(form, name, "", true, true);
}
}

function mAction_win0(form, name, height, width, title, bModalElement, bSizeOnLoad)
{
    form.ICAction.value = name;
	form.ICXPos.value = ptCommonObj2.getScrollX();
    form.ICYPos.value = ptCommonObj2.getScrollY();
    aAction_win0(form, name, null, true, false);
}


//new modal

function doModeless(url, options) {
    if (options == -1 || options.indexOf("bCrossDomain@1") == -1)
        url +='&ICDoModeless=1';
    if (ptConsole2.isActive() && !bPerf)
        ptConsole2.append((new Date()).valueOf() + "modeless url:\n" +url +"\n");
        
    if (typeof MTop().window.modLessWinArr == 'undefined') 
        MTop().window.modLessWinArr = new Array();
    if (options != -1)
        options = options + 'bModeless@1;bPIA@1;closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';
    else
        options = 'bModeless@1;bPIA@1;closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';
    window.modLessWin = showModalDialog_pt(url, window, options);
    
        function checkForReadiness() 
            {
            if (window.modLessWin.contentWindow)
                {
                try {
                    if (window.modLessWin.contentWindow.document.readyState == "complete")
                        {   
                        setModWinID = setModlessWinParent();
                        return;
                        }
                    setTimeout(checkForReadiness, 1000);    
                    }
                catch (err)
                    {
                    setTimeout(checkForReadiness, 1000);
                    }
                }
            }

    checkForReadiness();
    MTop().window.modLessWinArr.push(window.modLessWin); 
}


/*function setModlessWinParent() {
    setModWinParent(window.modLessWin);
}*/

function doTransfer(url) {
       loader2 = new net2.ContentLoader(url, null, null,'GET');
}

function doModlessOnLoad_win0() {
if (window.name.length == 0)
    window.name = "win0";
document.win0.target = window.name;

}

function doModal(url,bPrompt, oParentWin, sCancelName, form, name) {
    if (ptConsole2.isActive() && !bPerf)
        ptConsole2.append((new Date()).valueOf() + "modal url:\n" + url +"\n");
   
    if (oParentWin.modWin != 'undefined' && oParentWin.modWin != null) {
        closeModal(oParentWin.modWin.modalID);    
        oParentWin.modWin = null;
    }

    var options = 'bPIA@1;closeUrl@' + modalCloseUrl + ';closeAlt@' + modalCloseAlt + ';resizeUrl@' + modalResizeUrl + ';resizeAlt@' + modalResizeAlt + ';moveAlt@' + modalMoveAlt + ';';
     if (bPrompt)
        options += "bClose@1;";
    if (typeof sCancelName != "undefined" && sCancelName != null && sCancelName.length > 0)
        options += 'bClose@1;sCancelName@' + sCancelName + ';';
    window.modWin = showModalDialog_pt(url, window, options, null, null, form, name);
    
        function checkForReadiness() 
            {
            if (window.modWin.contentWindow)
                {
                try {
                    if (window.modWin.contentWindow.document.readyState == "complete")
                        {   
                        setModWinID = setModWinParentPIA();
                        return;
                        }
                    setTimeout(checkForReadiness, 1000);    
                    }
                catch (err)
                    {
                    setTimeout(checkForReadiness, 1000);
                    }
                }
            }

     checkForReadiness();
}

function setWinParent_win0() {
       // ptCommonObj2.showPopupMask(window,'pt_modalMaskCover');
  
}

function setModWinParentPIA() {
    if (setModWinParent())
        document.win0.ICResubmit.value = 0;
}

function doCancelMsg() {
    aAction_win0(document.win0, '#ICCancel');
}

function isModalCancel(name) {
    if (window.modalID) {
        if (name.indexOf(getCancelId(window.modalID)) != -1)            
            return true;
    }
}

function getCancelId (modid) {
        var modObj = MTop().document.getElementById("ptMod_" + modid);
        if (modObj.sCancelName.length > 0) return modObj.sCancelName;

        var sCloseId = '#ICCancel';
        if (!document.getElementById(sCloseId) && document.getElementById("#ICReturn"))
            sCloseId = '#ICReturn';
        return sCloseId;
}

function doCancel(sCancelName) {

    var sCloseId= '';
    if (typeof sCancelName != 'undefined' && sCancelName.length > 0)
        sCloseId = sCancelName;
    else {
        sCloseId= '#ICCancel';
       /* if (!document.getElementById(sCloseId) && document.getElementById("#ICReturn"))
            sCloseId = '#ICReturn';*///not support currently from zoom control
    }
    if (typeof window.bMFormSubmit != 'undefined') {
        if (!window.bMFormSubmit) 
            document.win0.ICAction.value = "None";
        else {
            winParent.modWinClosed = null;
            return;
         }
    }
    
    if (browserInfoObj2.isIE && typeof window.modWin != 'undefined' && window.modWin != null) {
        var win = window.modWin;
        var fm = win.document.win0;
        if (!fm) fm = window.document.win0;
        fm.ICAction.value = sCloseId;
        document.win0.ICAction.value = "None";
    }
    try {
        document.win0.target = winParent.name;
        if (document.win0.ICAction.value != "None") return;
        if (typeof window.bMFormSubmit != 'undefined')
            winParent.modWinClosed = null;
        winParent.nResubmit = 0;
    
        if (window.document.win0.enctype.indexOf('multipart') != -1 && typeof window.bMFormSubmit != 'undefined' && !window.bMFormSubmit) {
            winParent.document.win0.ICAction.value = "None";
            winParent.MTop().ptCommonObj2.hidePopupMask();
            closeModal(modalID);
        }
        /*else if (!document.getElementById(sCloseId) && typeof bSearchDialog_win0 != 'undefined' && bSearchDialog_win0)        
            winParent.aAction_win0(document.win0, '#ICModClosed'); *///close all children
        else if (sCloseId != "#ICCancel")
            aAction_win0(document.win0, sCloseId);
        else
            winParent.aAction_win0(document.win0, sCloseId);
        if (winParent.winParent)
            ptCommonObj2.hidePopupMask(winParent);
        else
            ptCommonObj2.hidePopupMask(MTop());
    }
    catch (err) {
         closeModal();
    }
}

function closeModWin_win0() {
    if ((typeof window.modWinClosed != 'undefined') && window.modWinClosed) {
        window.modWin = null;
        window.modWinClosed = false;
        return;
    }
    if (window.modWin) {
        try {
        window.modWin.document.win0.ICAction.value = '#ICCancel';
        closeModal(window.modWin.modalID); }
        catch (err) {
        }
    }
    window.modWin = null;
}


function onParentUnload_win0() {
    if ((typeof window.modWin != 'undefined') && window.modWin)    closeModWin_win0();
}

function doModalOnLoad_win0(bStartUp) {
    mTop = MTop();   // top window
    if (!mTop || typeof mTop.oParentWin == 'undefined' || !mTop.oParentWin) return;
    if (bStartUp) {
        winParent = mTop.oParentWin;
        dialogArguments = mTop.oParentWin;
        modalID = mTop.modId;
        window.name = "modWin_" + mTop.modId;  

        if (modalZoomName != null) {
            var zObj = winParent.document.getElementById(modalZoomName);
            if (zObj) zObj.style.display = 'none';
        }
        if ((mTop.modlessId == -1 || mTop.modlessId != mTop.modId) 
                && typeof winParent.document.win0 != 'undefined')
            winParent.processing_win0(0, 3000);
        resizeModalDialog_pt(modalID);   
    }    
    else if (modalID != null) {
       if (modalZoomName != null) {
        var zObj = document.getElementById(modalZoomName);
        if (zObj && zObj.innerHTML.indexOf("CKEDITOR") == -1) {
            var modObj = MTop().document.getElementById(MTop().PTMOD_ + modalID);
            resizeZoomGrid(modalZoomName,ptCommonObj2.getWidth(modObj), ptCommonObj2.getHeight(modObj));
            }
        }
        resizeModalDialog_pt(modalID, true);
    }

    if (window.document.win0.enctype.indexOf('multipart') != -1)
        window.bMFormSubmit = false;
}

function doUpdateParent(form, name) {
    if (winParent.bDefer && name.indexOf("#ICCancel") != -1 && bPromptPage_win0) {
        winParent.bCleanHtml = false;
        winParent.loader = null;
        winParent.document.win0.ICStateNum.value = document.win0.ICStateNum.value;
        winParent.aAction_win0(winParent.document.win0, '#ICCancel');
    } else {
        form.target = winParent.name;
        form.ICAction.value = name;
        if (typeof CKEDITOR != 'undefined') UpdateEditorLinkedField();
        winParent.loader = null;
        winParent.aAction_win0(form, name);
    }
}

function doModalMFormSubmit_win0(form, name) {
    if (name.indexOf("#ICCancel") != -1) {
       winParent.bCleanHtml = false;
       winParent.loader = null;
       winParent.document.win0.ICStateNum.value = document.win0.ICStateNum.value;
       winParent.aAction_win0(winParent.document.win0, '#ICCancel');
       window.winParent.modWin = null;
       closeModal(window.modalID);
       return;
    }
    window.bMFormSubmit = true;  
    submitAction_win0(form, name);
    doModalMFormClose_win0();
}

function doModalMFormClose_win0() {
        winParent.bUpLoadProgress  = true;
        winParent.nResubmit = 1;
        winParent.document.win0.ICStateNum.value = document.win0.ICStateNum.value;
        winParent.loader = null;
        winParent.aAction_win0(winParent.document.win0, 'Resubmit');
        if (typeof window.winParent != 'undefined' && window.winParent.winParent != null)
            ptCommonObj2.hidePopupMask(window.winParent);            
        else
            ptCommonObj2.hidePopupMask(MTop());
        hideModal(window.modalID);                        
}

function doUpdateFirstParent(form, name, firstParent) {
        form.target = firstParent.name;
        form.ICAction.value = name;
        if (typeof CKEDITOR != 'undefined') UpdateEditorLinkedField();
        firstParent.loader = null;
        firstParent.aAction_win0(form, name);
        if (typeof window.winParent != 'undefined' && window.winParent.winParent != null)
            ptCommonObj2.hidePopupMask(window.winParent);
        else
            ptCommonObj2.hidePopupMask(MTop());
        hideModal(window.modalID);
}

function resizeZoomGrid(id, w, h) {
    if (typeof gridList_win0 == 'undefined') return;
    var nMinHeight = 140;  // default minimum height for g zoom
    var exp = "win0" + "div";  //assuming that the overall g content id is always win0divgName$index
    var gNameParts = id.split(exp);
    var gToolBar = "win0" + "divG" + gNameParts[1];
    var gSParts = gNameParts[1].split("$");
    var gName = gSParts[0];
    var gSID = gSParts[0] + "$Si$" + gSParts[1];
    var gScrollAreaID = "divgbr" + gNameParts[1]; //assuming that divgbrgName$index is the Sable area if the g
    var gScrollAreaHdrID = "divghrc" + gNameParts[1];
    var gFrozenAreaID = "divgbl" + gNameParts[1]; //assuming that divgblgName$index is the Sable area if the g
    var gWSContainerTopID = "divgc" + gNameParts[1]; // get the g Sable container name from the C++ function "CRTgFieldOccursHTML::GenerateWSContainerTop"
    var gWSBodyTopID = "divgb" + gNameParts[1]; // get the g Sable body name from the C++ functionCRTgFieldOccursHTML::GenerateWSBodyTop

    for (var g = 0; g < gridList_win0.length; g++) {        
        if (gridList_win0[g][0] == gNameParts[1]) {            
            var gFirstRowID = "tr" + gNameParts[1] + "_row" + (gridList_win0[g][1] + 1); //id of the first data row, needed for resizing
            break;
        }
    }
    var mRight = document.getElementById(gScrollAreaID);
    var mRightHdr = document.getElementById(gScrollAreaHdrID);
    var bIsVSVisible = false;
    if (mRight && mRightHdr) {                
        oColHeader = mRightHdr.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
        oLastColHeader = oColHeader.childNodes[oColHeader.childNodes.length - 1];
        if (oLastColHeader.childNodes[0].tagName == 'SPAN' && (oLastColHeader.childNodes[0].innerHTML == '<NOBR>&nbsp;</NOBR>') || (oLastColHeader.childNodes[0].innerHTML == '<nobr>&nbsp;</nobr>'))
                bIsVSVisible = true;
     }
     if (!bIsVSVisible) return;

    if (mRight && mRightHdr) {
        var nMaxBodyHeight = mRight.childNodes[0].offsetHeight-5;
		if (nMaxBodyHeight < 140) nMinHeight = nMaxBodyHeight;
        if (browserInfoObj2.isSafari)
            nMaxBodyHeight = mRight.offsetHeight;
        var nHdrHeight = mRightHdr.offsetHeight;
        var nOthHeight = 150;
        var nMaxTmpHeight = h - nOthHeight;
        var nMaxHeight = nMinHeight;
        if (nMaxTmpHeight > 0 && nMaxTmpHeight < nMaxBodyHeight && nMaxTmpHeight > nMinHeight)
            nMaxHeight = nMaxTmpHeight;
        else if (nMaxTmpHeight > nMaxBodyHeight)
            nMaxHeight = nMaxBodyHeight;

        var oS = document.getElementById(gSID);  // g table id
        if (browserInfoObj2.isIE)
            mRight.style.height = nMaxHeight + 'px';
        else if (browserInfoObj2.isSafari) {
            mRight.style.height = nMaxHeight + 'px';
            oS.style.height = (nMaxHeight + 29) + 'px';
        }
        else {
            mRight.style.height = nMaxHeight + 'px';
            oS.style.height = (nMaxHeight + 14) + 'px';
        }
        var tObj = document.getElementById(id).childNodes[0];
        var tObj2 = tObj.childNodes[0].childNodes[1].childNodes[0].childNodes[0];
        var tObj3 = document.getElementById(gWSContainerTopID);
        var tObj4 = document.getElementById(gWSBodyTopID);
        tObj.style.height = mRight.style.height;
        tObj2.style.height = mRight.style.height;
        tObj3.style.height = mRight.style.height;
        tObj4.style.height = mRight.style.height;
    }    
    var mLeft = document.getElementById(gFrozenAreaID);
    if (mLeft) {
        mLeft.style.height = (mRight.offsetHeight) + 'px';
    }        
    var mToolBar = document.getElementById(gToolBar);
    if (mToolBar)
        mToolBar.style.width = (mLeft.offsetWidth + mRight.offsetWidth) + 'px';
}

// Search related Actions functions
var raClickPos = {x:0, y:0};

// setRAActionUrl
setRAActionUrl = function(srchUrl)
{		
	var elemUrl = document.getElementById("GSrchRaUrl");	
	if (elemUrl)
		elemUrl.value = srchUrl;
}

// process related actions reponse text
processRelatedActionsResponse = function(respText, fldId)
{
    if (!respText) 
	return;

    var xmlDoc = null;
    var bIsHomePage = false;
    if (typeof(top.searchGbl) != 'undefined')
    	bIsHomePage = top.searchGbl.isHomepage;


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
        var referenceObj = document.getElementById(fldId); 
        if (!referenceObj) { 
            referenceObj = window.top.document.getElementById(fldId); 
            if (referenceObj) { 
                absCord.x = referenceObj.offsetLeft; 
                absCord.y = referenceObj.offsetTop; 

                // on homepage and IE
                if (bIsHomePage && (browserInfoObj2.isIE)) {
		    absCord.x = referenceObj.offsetParent.offsetParent.offsetLeft; 
		    absCord.y = referenceObj.offsetParent.offsetTop;			
                }
            }
            
        } else { 
            absCord = ptCommonObj2.getAbsolutePosition(referenceObj); 
            if (bIsHomePage) {
		absCord.x = referenceObj.offsetLeft; 
		absCord.y = referenceObj.offsetTop;			

		if (browserInfoObj.isIE) {
                    absCord.x = referenceObj.offsetParent.offsetParent.offsetLeft; 
		    absCord.y = referenceObj.offsetParent.offsetTop;			
		} 
            }
        } 

        if (glObjTr) { 
            if (referenceObj) 
                glObjTr.showActionMenu(fldId, absCord.x, absCord.y + referenceObj.offsetHeight, 5, 4, raFormatedString, 'DROPDOWNNAME1'); 
            else 
                glObjTr.showActionMenu(fldId, absCord.x, absCord.y, 5, 4, raFormatedString, 'DROPDOWNNAME1'); 
        } else {
            alert('glObjTr is null');
        }
    } else {
        alert('xmldoc is null');
    }

    document.win0.ICAction.value = ""; 
}

// handle related actions click
getRelatedActions = function(srchUrl, fldId)
{
	var elem = document.getElementById(fldId);
	var prevCursor = elem.style.cursor;
	elem.style.cursor="wait";	
	// setRAActionUrl(srchUrl);
	// submitAction_win0(document.win0, fldId);

	var doclocation = document.location.href;
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

		document.win0.ICAction.value = fldId;

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
		document.win0.ICAction.value = fldId;

		tmpActionUrl = actionurl.concat('?ICAction=' + fldId);
		actionurl = tmpActionUrl.concat('&GSrchRaUrl=' + encodeURIComponent(srchUrl));
		tmpActionUrl = actionurl.concat('&ICAJAX=1');
		actionurl = tmpActionUrl;

		// url,form,name,method,onload,onerror,params,contentType,bAjax,bPrompt,headerArray,isAsync,sXMLResponse)
		// sLoader.req.responseXML, sLoader.req.responseText
		var sLoader = new net2.ContentLoader(actionurl, document.win0, fldId, null,
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

var bIsPagelet_win0 = "false", sPageletName_win0 = "";
ResetGlyph_win0 = function() {
	if (typeof(sGlyphList_win0) !== "undefined" && sGlyphList_win0 !== "") {
		HideGlyph(sGlyphList_win0);
	}
}

setPageletInfoInCtxmenu_win0 = function(isPagelet,sPgltName) {
	bIsPagelet_win0 = (isPagelet === "false") ? "false" : "true";
	sPageletName_win0 = (typeof(sPgltName) !== "undefined" && sPgltName && sPgltName !== "") ? sPgltName : "";
}
