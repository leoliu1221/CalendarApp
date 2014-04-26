/*  Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.
    ToolsRel: 8.52.10 */
// JScript File
/* Constructor */

/* PT_MOpopup Constructor for mouse-over popup  */
function PT_MOpopup()
{}

PT_MOpopup.prototype = {
init:function()
{
this.focusElem = null;             // onfocus element
this.bFocus=true;                  // run focus code or not
this.bIs_shown = false;            // popup is visible or not flag; true - visible; false - invisible
this.nOpenDelay = 1;               // time in seconds before popup opens
this.nCloseDelay = 0.6;            // time in seconds before popup closes
this.tHandle=null;                 // timer handle
this.nDefWidth = 250;              // popup default width
this.nDefHeight = 200;             // popup default height
this.nMinHeight = 40;              // popup minimum height
this.nMinWidth = 60;               // popup minimum width
this.MOcurrWidth = this.nDefWidth;    // final popup width
this.MOcurrHeight = this.nDefHeight;  // final popup height
this.MOPopContainer="MOpopupContainer";      // popup container - <table>
this.MOPopupInner ="MOpopupInner";           // popup inner - <td>
this.MOPopFrame = "MOdivpopupFrame";         // popup content - <div>
this.x=0;                          // popup left coordinate
this.y=0;                          // popup top coordinate
this.hoverId=null;                 // mouse-overed control id
this.hoverpopupId=null;            // popup page div id to retrieve popup page content to be displayed
this.bNetscp=0;                    // Netscape browser
this.bSafari=0;                    // Safari browser
this.bIE=0;                        // IE browser
this.fontW=7;                      // browser font width
this.fontW2=9;                     // our message catalog style font width
this.fontH=18;                     // brower font height
this.agt=navigator.userAgent.toLowerCase();
if(this.agt.indexOf("safari")!=-1)
  this.bSafari=1;
else if(navigator.appName=="Netscape")
  this.bNetscp=1;
else
  this.bIE=1;
},

GetElementTop:function(object)    // get object's offsetTop
{
if (!object)
   return 0;
var nTop=object.offsetTop;
var MyParent=object.offsetParent;
while(MyParent!=null && MyParent.className != "PTPAGELET")
{
   nTop+=MyParent.offsetTop;
   MyParent=MyParent.offsetParent;
}
return nTop;
},

GetElementleft:function(object)  // get object's offsetLeft
{
if (!object)
   return 0;
var nLeft=object.offsetLeft;
var MyParent;
  MyParent=object.offsetParent;

while(MyParent!=null && MyParent.className != "PORTLET-SECTION-HEADER")
{
   nLeft+=MyParent.offsetLeft-MyParent.scrollLeft;
   if(this.bSafari)
        MyParent=MyParent.parentNode;
  else
    MyParent=MyParent.offsetParent;
}

nLeft+=document.body.scrollLeft; //for IE
return nLeft;
},

SetIEDivSize:function(hPop)   // For IE browser, set width and height of div for static text
{
var viewportWidth = ptCommonObj2.getViewportWidth()*0.9;      // viewable width
var nMaxChars = viewportWidth/this.fontW;                    // maximun number of characters per line
var nExtraLines=0;
var nCharPerLine=hPop.offsetWidth/this.fontW+1;              // 7 pixel width per character for the smallest browser font
var nLines=hPop.offsetHeight/this.fontH+1;                   // 18 pixel height for browser font
if (nCharPerLine > nMaxChars) {                          // allow only nMaxChars characters per line
    nExtraLines = nCharPerLine/nMaxChars+1;              // extra lines if width > 50 characters
    this.nDefWidth=nMaxChars*this.fontW2;                // 9 pixels width per character
    this.nDefHeight = (nLines + nExtraLines)*this.fontH ;
}
else {
    this.nDefWidth= hPop.offsetWidth+this.fontW2;
    this.nDefHeight = hPop.offsetHeight+this.fontH;
}
},

SetDivSizeManually:function(hPop)   
{
var viewportWidth = ptCommonObj2.getViewportWidth()*0.9;      // viewable width
var viewportHeight = ptCommonObj2.getViewportHeight()*0.9;    // viewable height
var nMaxLines = viewportHeight/this.fontH;                   // maximun lines   
var nMaxChars = viewportWidth/this.fontW;                    // maximun number of characters per line
if (browserInfoObj2.isIE)
    var sText = hPop.innerText;
else
    var sText = hPop.textContent;

var sArray=sText.split('\n');
var nCharPerLine=0;
var nEmptylines=0;
for (i=0; i<sArray.length; i++) {
     if (sArray[i].length > nCharPerLine)
         nCharPerLine = sArray[i].length;
     if (!browserInfoObj2.isIE) {
         if (sArray[i].length == 0)
             nEmptylines++;
         else
             nEmptylines = 0;
     }
}

var nLines=sArray.length;           
        
if (!browserInfoObj2.isIE) 
    nLines = nLines - nEmptylines;

if (nCharPerLine > nMaxChars) 
    this.nDefWidth = nMaxChars * this.fontW;                // this.fontW pixels width per character
else 
    this.nDefWidth= nCharPerLine * this.fontW;

if (!browserInfoObj2.isIE) 
    var nfontH = this.fontH - 2;
else
    var nfontH = this.fontH;

if (nLines > nMaxLines)
    this.nDefHeight = nMaxLines * nfontH;
else
    this.nDefHeight = nLines * nfontH;

},

SetDivSize:function(hPop)   // set width and height of div for static text
{
    var viewportWidth = ptCommonObj2.getViewportWidth()*0.9;           // viewable width
    
    if (browserInfoObj2.isIE && (viewportWidth-30) > 60)
        viewportWidth = viewportWidth - 30;                          

    
    if (hPop.offsetWidth == 0 || hPop.offsetHeight == 0) {
        this.SetDivSizeManually(hPop);
        return;  
    }

    
    if (browserInfoObj2.isIE && hPop.offsetWidth > viewportWidth)     
        this.SetIEDivSize(hPop);
    else {
        this.nDefWidth= hPop.offsetWidth+this.fontW2;
        this.nDefHeight = hPop.offsetHeight+this.fontH;
    }
},

// for accessibility, display popup
StartAccess:function(event, hoverId,popupId, nWidth, nHeight)
{
this.StartPopup(hoverId,popupId, nWidth, nHeight);
cancelBubble(event);
return false; // cancel event
},

// for accessibility, hide popup
StopAccess:function(event)
{
this.StopPopup();
cancelBubble(event);
return false; // cancel event
},

StartAccessibilityPopup:function(hoverId,popupId, nWidth, nHeight)   // called by an html control's ENTER press key event to display popup
{
  //window.status="StartPopup:hoverID="+hoverId +", "+ hoverId.length + ";this.MOPopContainer="+this.MOPopContainer +", "+ (this.MOPopContainer).length ;       // debug
  if (hoverId.length == 0)   // popup is in display
      return;

  var hPop = document.getElementById(popupId);      // get popup page control
  this.hoverId=hoverId;
  this.hoverpopupId=popupId;
  this.tHandle = null;
  this.ShowAccessibilityPopup();
},

ShowAccessibilityPopup:function()   // display popup page; called by StartPopup function
{
  this.tHandle = null;
  if (this.hoverpopupId == null || this.hoverpopupId=="" ) return;

  var hPop = document.getElementById(this.hoverpopupId);  // get popup content div
  var hp = document.getElementById(this.MOPopContainer);        // get popup container - <table>
  var popupFrame = document.getElementById(this.MOPopFrame);     // get popup content - <div>
  hp.style.display = "block";
  popupFrame.innerHTML=hPop.innerHTML;
  popupFrame.style.dislay='block';

  if (popupFrame)
      popupFrame.style.cursor = "Pointer";                 // set cursor for popup content frame
  this.bIs_shown = true;
  this.bFocus = true;
  hp.style.top=1+"px";    // position at top-left
  hp.style.left=1+"px";
  hp.style.visibility = "Visible";
  hp.style.zIndex="1";
  if (document.activeElement != null && document.activeElement.tagName != null && document.activeElement.tagName.indexOf("BODY") <0) {
      this.focusElem = document.activeElement;            // save focused control to be restored when popup page is hidden
      if (this.focusElem != null)
          this.focusElem.blur();
  }
  else
      this.focusElem=null;

  bMOPopupDisplay_win1=true;
  for (var i=0; i<document.forms.length; i++)
      {
      document.forms[i].style.visibility="hidden";
      if (!this.bIE)
          document.forms[i].style.display="none";
      }

  if (this.bIE)
      popupFrame.childNodes[0].focus();  // set focus on the image indicating the start of the popup
  else
      popupFrame.children[0].focus();  // set focus on the image indicating the start of the popup

},

StartPopup:function(hoverId,popupId, nWidth, nHeight)   // called by an html control's mouse-over event to display popup
{
  //window.status="StartPopup:hoverID="+hoverId +", "+ hoverId.length + ";this.MOPopContainer="+this.MOPopContainer +", "+ (this.MOPopContainer).length ;       // debug
  if (bAccessibility_win1)     // if it is in accessibility mode, display accessibility popup
      {
      this.StartAccessibilityPopup(hoverId,popupId, nWidth, nHeight);
      return;
      }

  
  if ((hoverId.toLowerCase()).indexOf((this.MOPopContainer).toLowerCase()) == 0 && hoverId.length == (this.MOPopContainer).length)
  {
     if (this.tHandle != null)
        clearTimeout(this.tHandle);
     if (this.bIs_shown == true)
         return;
     this.ShowPopup();
  }
  else  // mouse-over a control on an non-popup page
  {
     this.nDefWidth = 250;              // popup default width
     this.nDefHeight = 200;             // popup default height
     if (this.tHandle != null)
         clearTimeout(this.tHandle);
     if (hoverId != null && hoverId != "") {
         var hItem = document.getElementById(hoverId);      // get mouse-overed control
         if (hItem)
            hItem.style.cursor = "Pointer";                 // set cursor for mouse-overed control
     }

     var hPop = document.getElementById(popupId);      // get popup page control
     
     
     
     var MOpopupDiv = document.getElementById("MOpopupDiv");     // get the temporary popup html holder - <div>
     MOpopupDiv.innerHTML=hPop.innerHTML;
     
     
     
     if ((nWidth== 0 || nHeight==0) && popupId != null && popupId != "") {
         if (hPop)   {       // set default popup width/height for message catalog message
            this.SetDivSize(MOpopupDiv);
            this.MOcurrHeight=this.nDefHeight;
            this.MOcurrWidth=this.nDefWidth;
         }
     }
     else {   // regular popup page, i.e. non-catalog popup

         if (hPop) {                                       // set popup page height and width
            this.MOcurrHeight = nHeight;
            if (typeof (MOpopupDiv.firstChild) != 'undefined' && MOpopupDiv.firstChild != null && typeof (MOpopupDiv.firstChild.firstChild) != 'undefined' && (MOpopupDiv.firstChild.firstChild) != null ) {
                var nWid = MOpopupDiv.firstChild.firstChild.getAttribute("width");
                if (typeof nWid != "undefined" && nWid != null && nWid != "")
                    this.MOcurrWidth =  parseInt(nWid); 
                else
                    this.MOcurrWidth =  nWidth;
            }
            else
                this.MOcurrWidth =  nWidth;
         }
     }

     MOpopupDiv.innerHTML='t';         // reset the temporary popup content holder - <div>
     this.hoverId=hoverId;
     this.hoverpopupId=popupId;

     if (this.MOcurrWidth <=20)        // popup width <= 20 pixels
         this.MOcurrWidth = this.nDefWidth;                 // take popup default width

     if (this.MOcurrHeight <= 20)    // popup height <= 20 pixels
         this.MOcurrHeight = this.nDefHeight;               // take popup default height
     this.tHandle=setTimeout("MOpopupObj_win1.ShowPopup()",this.nOpenDelay * 1000);
  }
},

SetFocusFlag:function(bValue)   // set focus flag
{
  if (!bAccessibility_win1)  // not accessibility mode
     this.bFocus = bValue;
},

ShowPopup:function()   // display popup page; called by StartPopup function
{
  this.tHandle = null;
  if (this.hoverpopupId == null || this.hoverpopupId=="" ) return;
  var hp = document.getElementById(this.hoverpopupId);  // get popup content div
  this.UpdatePopup(hp.innerHTML);             // use popup content to update popup container.
  hp = document.getElementById(this.MOPopContainer);             // get popup container
  var popupFrame = document.getElementById('MOdivpopupFrame');  // get popup content frame div
  if (popupFrame)
      popupFrame.style.cursor = "Pointer";                 // set cursor for popup content frame
  this.bIs_shown = true;
  this.bFocus = true;
  hp.style.top=this.y+"px";
  hp.style.left=this.x+"px";
  hp.style.display = "block";
  hp.style.visibility = "visible";
  hp.style.zIndex="1";
  if (document.activeElement != null && document.activeElement.tagName != null && document.activeElement.tagName.indexOf("BODY") <0) {

      this.focusElem = document.activeElement;            // save focused control to be restored when popup page is hidden
      if (this.focusElem != null)
          this.focusElem.blur();
  }
  else
      this.focusElem=null;

},


//StopPopup:function()   // called by an html control's mouse-out event to close popup
StopPopup:function(bNoDelay)   // called by an html control's mouse-out event to close popup, bNoDely is passed, Hides popup immediately
{
  if (this.tHandle != null)
      clearTimeout(this.tHandle);
  if (this.hoverId != null || this.hoverId != "") {
      var hItem = document.getElementById(this.hoverId);  // get mouse-overed control
      if (hItem)
          hItem.style.cursor = "";                 // reset cursor for mouse-overed control
  }
  this.tHandle = null;
  if ((bAccessibility_win1) || (typeof bNoDelay !="undefined"))  // accessibility mode
     this.HidePopup();
  else
     this.tHandle=setTimeout("MOpopupObj_win1.HidePopup()", 1000 * this.nCloseDelay);
},

HidePopup:function()  // called by StopPopup function to close popup
{
  var PopContainer = document.getElementById(this.MOPopContainer);      // get popup container to hide it
  PopContainer.style.visibility = "Hidden";

  this.bIs_shown = false;
  if (bAccessibility_win1)   // unhide form elements in accessiblity mode
     {
     var nLen = document.forms.length;
     for (var i=0; i<nLen; i++)
         {
         document.forms[i].style.visibility="visible"
         if (!this.bIE)
             document.forms[i].style.display="block";
         }   
     }
  if (this.focusElem != null && this.bFocus)  {                   // restore focus 
     try {
         this.focusElem.focus(); 
     }
     catch(err){}
  }

},

UpdatePopup:function(sHTML)  // update popup with html content and set position and size of popup
{
    var MOpopContainer = document.getElementById(this.MOPopContainer);        // get popup container - <table>
    var MOpopupInner = document.getElementById(this.MOPopupInner);      // get popup inner - <td>
    var MOpopFrame = document.getElementById(this.MOPopFrame);     // get popup content - <div>
    MOpopFrame.scrollTop=0;                                          // reset scrollbar position
    MOpopFrame.scrollLeft=0;                                         // reset scrollbar position
    MOpopContainer.style.display = "block";
    MOpopupInner.style.display = "block";
    hItem=document.getElementById(this.hoverId);                     // get mouse-over item

    
    if (!hItem) 
    {
        var RegExp1 = /^win\d+div/
        if (this.hoverId.search(RegExp1) > -1) 
        {
           this.hoverId = (this.hoverId).replace(RegExp1, "");
           hItem=document.getElementById(this.hoverId);  
        }
    }

    var viewportHeight = ptCommonObj2.getViewportHeight();            // viewable height
    var viewportWidth = ptCommonObj2.getViewportWidth();              // viewable width
	// set popup width according to viewable area
	if (this.bIE && (viewportWidth-30) > 60)
	    viewportWidth = viewportWidth - 30;                          // adjust viewable width for IE
    else if (!this.bIE && (viewportWidth-50) > 60)
	    viewportWidth = viewportWidth - 50;                          // adjust viewable width for non-IE

	if (this.MOcurrWidth > 0)  {
	   if (this.MOcurrWidth > viewportWidth)
	  	  this.MOcurrWidth = viewportWidth;
    }
    else
	   this.MOcurrWidth = viewportWidth;

    // set popup left coordinate
    var nLeft1=this.GetElementleft(hItem);                               // hovered item leftoffset
    var nLeft=nLeft1 - document.body.scrollLeft;                         // hovered item visible left coordinate
    var nSaveLeft = 0;
    if (nLeft<0)  {                                                      // scroll was moved to the right
        nSaveLeft = nLeft;
        nLeft=-nLeft;
    }
    var nRight = nLeft + this.MOcurrWidth;                               // right coordinate based on visible area
    var nDiff = viewportWidth - nRight; // difference between the right-end of the visible area and the popup right coordinate

    if (nDiff >0)       // popup width is not too big for the visible area
        this.x = nLeft1;
    else {              // popup width is too big for the visible area
        this.x = nLeft1+nDiff;
        if (this.x <0)     
            this.MOcurrWidth = this.MOcurrWidth + this.x;  // reduce popup width
    }

     if (this.MOcurrWidth <this.nMinWidth)
        this.MOcurrWidth = this.nMinWidth;       // give it a minimum width

    if (this.x <=0) {
        if (nSaveLeft <0)
            this.x = document.body.scrollLeft + 1;
        else
            this.x = 1;
    }

    // set popup height according to viewable area and its top coordinate
    var nHtop1=this.GetElementTop(hItem);                                // hovered item topoffset coordinate
    var nHtop=nHtop1 - document.body.scrollTop;                          // hovered item visible top coordinate
    var nAbHeight = nHtop - 41;                                          // height when display above mouse-over item
    var nBelHeight = viewportHeight - (nHtop + hItem.offsetHeight)-40;   // height when display below mouse-over item
    if (!this.bIE) {                                                     // adjust viewable height for non-IE browsers
        nAbHeight = nAbHeight - 15;
        nBelHeight = nBelHeight -15;
    }
    if (this.MOcurrHeight > nAbHeight && this.MOcurrHeight > nBelHeight) {
       if (nAbHeight > nBelHeight) {
          this.MOcurrHeight = nAbHeight;
          this.y = nHtop1 - this.MOcurrHeight-40;           // y when displayed above hovered item
       }
       else {
          this.MOcurrHeight = nBelHeight;
          this.y = nHtop1 + hItem.offsetHeight+9;           // y when displayed below hovered item
       }

    }
    else if (this.MOcurrHeight <= nAbHeight)
          this.y = nHtop1 - this.MOcurrHeight-36;           // y when displayed above hovered item
    else if (this.MOcurrHeight <= nBelHeight)
          this.y = nHtop1 + hItem.offsetHeight+9;           // y when displayed below hovered item

    if (this.y<0) {
        this.MOcurrHeight = this.MOcurrHeight + this.y;     // reduce popup height
        this.y = 0;
    }

    if (this.MOcurrHeight < this.nMinHeight)
        this.MOcurrHeight = this.nMinHeight;                // give it a minimum height

    MOpopFrame.innerHTML=sHTML;
    MOpopFrame.style.dislay='block';
    MOpopContainer.style.width = (this.MOcurrWidth) + "px";          // popup width
    MOpopContainer.style.height = (this.MOcurrHeight)  + "px";           // popup height
    MOpopupInner.style.width = (this.MOcurrWidth) + "px";            // popup width
    MOpopupInner.style.height = (this.MOcurrHeight)  + "px";           // popup height
    MOpopFrame.style.width = (this.MOcurrWidth) + "px";
    
    
    MOpopFrame.scrollLeft=500;  
    
    if (MOpopFrame.scrollLeft>0 && (this.MOcurrWidth+MOpopFrame.scrollLeft)<viewportWidth)  {  
        this.MOcurrWidth=this.MOcurrWidth+MOpopFrame.scrollLeft;
        MOpopFrame.innerHTML=sHTML;
        MOpopContainer.style.width = (this.MOcurrWidth) + "px";          // popup width
	    MOpopupInner.style.width = (this.MOcurrWidth) + "px";            // popup width
        MOpopFrame.style.width = (this.MOcurrWidth) + "px";
    }

    MOpopFrame.scrollLeft=0; 
    if (!this.bIE && !browserInfoObj2.isSafari)
        MOpopFrame.style.height = "100%";
    else
        MOpopFrame.style.height = (this.MOcurrHeight) + "px";
//window.status="h="+this.MOcurrHeight+";w="+this.MOcurrWidth;  //debug

}
}


/* PT_Helppopup Constructor for Embedded Help popup  */
function PT_Helppopup()
{}

PT_Helppopup.prototype = {
init:function()
{
this.focusElem = null;             // onfocus element
this.bFocus=true;                  // run focus code or not
this.bIs_shown = false;            // popup is visible or not flag; true - visible; false - invisible
this.nOpenDelay = 1;               // time in seconds before popup opens
this.nCloseDelay = 0.6;            // time in seconds before popup closes
this.tHandle=null;                 // timer handle
this.nDefWidth = 250;              // popup default width
this.nDefHeight = 200;             // popup default height
this.minWidth  = 341;
this.minHeight = 150; 
this.HelpcurrWidth = this.nDefWidth;    // final popup width
this.HelpcurrHeight = this.nDefHeight;  // final popup height
this.Helppop="HelppopupContainer";     // popup container id
this.x=0;                          // popup left coordinate
this.y=0;                          // popup top coordinate
this.hoverId=null;                 // mouse-overed control id
this.hoverpopupId=null;            // popup page div id to retrieve popup page content to be displayed
this.bFirefox=0;                   // Firefox browser
this.bSafari=0;                    // Safari browser
this.bIE=0;                        // IE browser
this.fontW=7;                      // browser font width
this.fontW2=9;                     // our message catalog style font width
this.fontH=18;                     // brower font height
this.moveCounter = -1;
this.isSwanSS = ((typeof(ptStyleSheet) == "undefined") || (ptStyleSheet.indexOf("SWAN") != -1)) ? true : false;
this.startEventPos = new Array();
this.startPosWindow = new Array();
this.startWindowSize = new Array();
this.agt=navigator.userAgent.toLowerCase();
if(this.agt.indexOf("safari")!=-1)
  this.bSafari=1;
else if(this.agt.indexOf("firefox")!=-1)
  this.bFirefox=1;
else
  this.bIE=1;
this.haslabel="false";
this.isSwanSS = ((typeof(ptStyleSheet) == "undefined") || (ptStyleSheet.indexOf("SWAN") != -1)) ? true : false;
},

GetElementTop:function(evt, object)    // get object's offsetTop
{
//return evt.clientY;
if(evt.pageY) return evt.pageY;
else if (evt.clientY)
   return evt.clientY + (document.documentElement.scrollTop ?  document.documentElement.scrollTop : document.body.scrollTop);
else return null;
},

GetElementleft:function(evt, object)  // get object's offsetLeft
{
//return evt.clientX;
if(evt.pageX) return evt.pageX;
else if (evt.clientX)
   return evt.clientX + (document.documentElement.scrollLeft ?  document.documentElement.scrollLeft : document.body.scrollLeft);
else return null;
},

SetDivSize:function(hPop)   // set width and height of div for static text
{
   var tempw = this.minWidth;
   var temph = 0;
   var maxWidth  = ptCommonObj2.getViewportWidth()*0.8;
   var maxHeight  = ptCommonObj2.getViewportHeight()*0.8;
   var pos=0;	
   while(pos != -1) {
      if (this.bIE) {
          pos = hPop.innerHTML.indexOf("<BR>", pos + 4);	
          if(pos != -1)	
             temph += this.fontH;		
          }
      else {
          pos = hPop.innerHTML.indexOf("<br>", pos + 4);
          if(pos != -1)
             temph += this.fontH*1.01;			
          }
   }
   while((hPop.innerHTML.length * this.fontW *  this.fontH > tempw * temph) && (tempw != maxWidth || temph != maxHeight)) //increase the size
   {
      if(tempw < maxWidth)  tempw = tempw + this.minWidth * 0.1;
      else tempw = maxWidth;
      if(temph < maxHeight) temph = temph + this.minHeight * 0.1;	
      else temph = maxHeight;   	
   } 
   if(temph < this.minHeight)
      temph = this.minHeight;
   if(temph > maxHeight)
      temph = maxHeight;

   this.nDefWidth = tempw;
   this.nDefHeight = temph;
    return;    
},

StartAccessibilityPopup:function(hoverId,popupId, nWidth, nHeight)   // called by an html control's ENTER press key event to display popup
{
  //window.status="StartPopup:hoverID="+hoverId +", "+ hoverId.length + ";this.MOpop="+this.MOpop +", "+ (this.MOpop).length ;       // debug
  if (hoverId.length == 0)   // popup is in display
      return;

  var hPop = document.getElementById(popupId);      // get popup page control
  var hPop = document.getElementById(popupId);      // get popup page control     
  this.hoverId=hoverId;
  this.hoverpopupId=popupId;
  this.tHandle = null;
  this.ShowAccessibilityPopup();
},

ShowAccessibilityPopup:function()   // display popup page; called by StartPopup function
{
  this.tHandle = null;
  if (this.hoverpopupId == null || this.hoverpopupId=="" ) return;

  var hPop = document.getElementById(this.hoverpopupId);  // get popup content div
  var hp = document.getElementById(this.Helppop);        // get popup container - <table>
  var popupFrame = document.getElementById("HelpdivpopupFrame");     // get popup content - <div>
  hp.style.display = "block";
  popupFrame.innerHTML=hPop.innerHTML;
  popupFrame.style.dislay='block';

  if (popupFrame)
      popupFrame.style.cursor = "Pointer";                 // set cursor for popup content frame
  this.bIs_shown = true;
  this.bFocus = true;
  hp.style.top=1+"px";    // position at top-left
  hp.style.left=1+"px";
  hp.style.visibility = "Visible";
  hp.style.zIndex="1";
  if (document.activeElement != null && document.activeElement.tagName != null && document.activeElement.tagName.indexOf("BODY") <0) {
      this.focusElem = document.activeElement;            // save focused control to be restored when popup page is hidden
      if (this.focusElem != null)
          this.focusElem.blur();
  }
  else
      this.focusElem=null;

  bHelpPopupDisplay_win1=true;
  for (var i=0; i<document.forms.length; i++)
      {
      document.forms[i].style.visibility="hidden";
      if (!this.bIE)
          document.forms[i].style.display="none";
      }

  if (this.bIE)
      popupFrame.childNodes[0].focus();  // set focus on the image indicating the start of the popup
  else
      popupFrame.children[0].focus();  // set focus on the image indicating the start of the popup

},

// for accessibility, display popup
StartAccess:function(event, hoverId,popupId, nWidth, nHeight,labeltext)
{
this.StartAccessibilityPopup(hoverId,popupId, nWidth, nHeight);
cancelBubble(event);
return false; // cancel event
},

// for accessibility, hide popup
StopAccess:function(event)
{
this.StopPopup();
cancelBubble(event);
return false; // cancel event
},

StartPopup:function(evt,hoverId,popupId, nWidth, nHeight, labeltext, helptext)   // called by an html control's onclick event to display popup
{
  evt = evt || window.event;
  this.isSwanSS = ((typeof(ptStyleSheet) == "undefined") || (ptStyleSheet.indexOf("SWAN") != -1)) ? true : false;
  if ((hoverId.toLowerCase()).indexOf((this.Helppop).toLowerCase()) == 0 && hoverId.length == (this.Helppop).length)
  {
     if (this.tHandle != null)
        clearTimeout(this.tHandle);
     if (this.bIs_shown == true)
         return;
     this.ShowPopup(evt);
  }
  else
  {
     this.nDefWidth = 250;              // popup default width
     this.nDefHeight = 200;             // popup default height
     if (this.tHandle != null)
         clearTimeout(this.tHandle);
     if (hoverId != null && hoverId != "") {
         var hItem = document.getElementById(hoverId);      // get mouse-overed control
     }
    var HelppopTitleBarMiddle = document.getElementById("HelppopupTitleBarMiddle");
    var HelppopTitle = document.getElementById("HelppopupTitle"); 
    if (HelppopTitle) {        
        ptEvent.add(HelppopTitle,"mousedown",HelppopupObj_win1.InitMovePopup);       
        ptEvent.add(document,"mouseup",HelppopupObj_win1.StopMovePopup);
        ptEvent.add(document,"mousemove",HelppopupObj_win1.MovePopup);
     }          
         HelppopTitle.innerHTML="<span class='PTPOPUP_TITLE'>" + helptext +" - " + labeltext+"</span>";
         this.haslabel="true";
     }


     var hPop = document.getElementById(popupId);      // get popup page control
     
     
     
     var HelppopupDiv = document.getElementById("HelppopupDiv");     // get the temporary popup html holder - <div>
     HelppopupDiv.innerHTML=hPop.innerHTML;
     
     
     
     if ((nWidth== 0 || nHeight==0) && popupId != null && popupId != "") {
         if (hPop)   {       // set default popup width/height for message catalog message
            this.SetDivSize(HelppopupDiv);
            this.HelpcurrHeight=this.nDefHeight;
            this.HelpcurrWidth=this.nDefWidth;
         }
     }
     else {   // regular popup page, i.e. non-catalog popup

         if (hPop) {                                       // set popup page height and width
            this.HelpcurrHeight = HelppopupDiv.offsetHeight;
            this.HelpcurrWidth = HelppopupDiv.offsetWidth;
         }
     }

     HelppopupDiv.innerHTML='t';         // reset the temporary popup content holder - <div>
     this.hoverId=hoverId;
     this.hoverpopupId=popupId;
     if (this.HelpcurrWidth <=20)        // popup width <= 20 pixels
         this.HelpcurrWidth = this.nDefWidth;                 // take popup default width

     if (this.HelpcurrHeight <= 20)    // popup height <= 20 pixels
         this.HelpcurrHeight = this.nDefHeight;               // take popup default height
     HelppopupObj_win1.ShowPopup(evt);
},

SetFocusFlag:function(bValue)   // set focus flag
{
     this.bFocus = bValue;
},

ShowPopup:function(evt)   // display popup page; called by StartPopup function
{
  this.tHandle = null;
  if (this.hoverpopupId == null || this.hoverpopupId=="" ) return;
  var hp = document.getElementById(this.hoverpopupId);  // get popup content div
  this.UpdatePopup(evt,hp.innerHTML);             // use popup content to update popup container.
  hp = document.getElementById(this.Helppop);             // get popup container
  var popupFrame = document.getElementById('HelpdivpopupFrame');  // get popup content frame div
  this.bIs_shown = true;
  this.bFocus = true;
  hp.style.top=this.y+"px";
  hp.style.left=this.x+"px";
  hp.style.display = "block";
  hp.style.zIndex=300;
  hp.style.visibility = "Visible";
  if (document.activeElement != null && document.activeElement.tagName != null && document.activeElement.tagName.indexOf("BODY") <0) {

      this.focusElem = document.activeElement;            // save focused control to be restored when popup page is hidden
      if (this.focusElem != null)
          this.focusElem.blur();
  }
  else
      this.focusElem=null;
  HelppopupObj_win1.SetHeader();
  HelppopupObj_win1.SetShadow();
  var HelppopContainer = document.getElementById("HelppopupContainer");
  var HelppopFrame = document.getElementById("HelpdivpopupFrame");
  HelppopFrame.focus();
  ptEvent.add(HelppopContainer,"keypress",HelppopupObj_win1.HandleEscapeKey);
  cancelBubble(evt);
},

SetHeader:function() {
var HelppopTitleBar = document.getElementById("HelppopupTitleBar");
var HelppopupTitleBarMiddle = document.getElementById("HelppopupTitleBarMiddle");
var HelppopupTitle = document.getElementById("HelppopupTitle");
HelppopTitleBar.style.width = this.nDefWidth;
if (this.bIE) {
  if(this.isSwanSS)
     HelppopupTitleBarMiddle.style.width = this.nDefWidth - 6;
  else
     HelppopupTitleBarMiddle.style.width = this.nDefWidth - 4;
}
else
{
  if(this.isSwanSS)
    HelppopupTitleBarMiddle.style.width = this.nDefWidth - 8;
  else 
    HelppopupTitleBarMiddle.style.width = this.nDefWidth - 6;
}
HelppopupTitle.style.width = this.nDefWidth - 43;
},

SetShadow:function() {
var HelppopShadow = document.getElementById("HelppopupShadow");
var HelppopShadowTop = document.getElementById("HelppopupShadowTop");
var HelppopShadowBottom = document.getElementById("HelppopupShadowBottom");
var HelppopShadowBottomMiddle = document.getElementById("HelppopupShadowBottomMiddle");

if(!this.bIE && !this.isSwanSS && 'ltr' == 'rtl') {
  HelppopShadowBottom.style.width = this.HelpcurrWidth + 1;
  HelppopShadowBottomMiddle.style.width = this.HelpcurrWidth - 19;
}
else {
  HelppopShadowBottom.style.width = this.HelpcurrWidth + 2;
  HelppopShadowBottomMiddle.style.width = this.HelpcurrWidth - 18;
}
if(!this.bIE)
  HelppopShadowTop.style.height = this.HelpcurrHeight - 1; // it was 11
else
  HelppopShadowTop.style.height = this.HelpcurrHeight - 1;
},

HandleEscapeKey:function(evt) {
  if(evt.type=="keypress") {
    var kC=keyPressHandler(evt);
    if (kC!=27) return;
  }
  var hp = document.getElementById("HelppopupContainer");
  if(hp)
    ptEvent.remove(hp,"keypress",HelppopupObj_win1.HandleEscapeKey);
  cancelBubble(evt);
  HelppopupObj_win1.StopPopup();
},

StopPopup:function()   // called by an html control's mouse-out event to close popup
{
  var hp = document.getElementById("HelppopupContainer");      // get popup container to hide it
  var HelppopupInner = document.getElementById("HelppopupInner");      // get popup inner - <td>
  var HelppopFrame = document.getElementById("HelpdivpopupFrame");     // get popup content - <div>
  if (hp)
      hp.style.visibility = "Hidden";
  if (this.hoverId != null || this.hoverId != "") {
      var hItem = document.getElementById(this.hoverId);  // get mouse-overed control
      if (hItem)
          hItem.style.cursor = "";                 // reset cursor for mouse-overed control
  }
  if ((typeof bAccessibility_win1 != 'undefined') && (bAccessibility_win1))   // unhide form elements in accessiblity mode
     {
     for (var i=0; i<document.forms.length; i++)
         {
         document.forms[i].style.visibility="visible"
         if (!this.bIE)
             document.forms[i].style.display="block";
         }
     }

  if (this.focusElem != null && this.bFocus)  {                   // restore focus
     try {
         this.focusElem.focus();
     }
     catch(err){}
  }
  this.bIs_shown = false;

},

InitMovePopup:function(e){
    var HelppopContainer = document.getElementById("HelppopupContainer");        // get popup container - <table>
    if(document.all) e = event;
    if(document.all) e = event; 
    var HelppopInner = document.getElementById("HelppopupInner");  
    var HelpDragframe = document.getElementById('HelpDragFrame');   // frame to be dragged 
    var XYposition = ptCommonObj2.getPosition(HelppopInner);  
    HelppopupObj_win1.moveCounter = 1;
    HelppopupObj_win1.startEventPos = [e.clientX,e.clientY];
    HelppopupObj_win1.startPosWindow = [XYposition.x,XYposition.y];  
    if (HelpDragframe)  {
        HelpDragframe.style.width= HelppopInner.offsetWidth;
        HelpDragframe.style.height= HelppopInner.offsetHeight;        
        HelpDragframe.style.top= XYposition.y + 'px';
        HelpDragframe.style.left= XYposition.x + 'px';
        HelpDragframe.style.display="block"; 
  	    HelpDragframe.style.zIndex="999";
    }  
},

StopMovePopup:function(e) {
    if(HelppopupObj_win1.moveCounter>=1){      
        var HelppopContainer = document.getElementById("HelppopupContainer");         	
        var XYposition = ptCommonObj2.getPosition(document.getElementById('HelpDragFrame'));
        HelppopContainer.style.left = XYposition.x + "px";       
        HelppopContainer.style.top = XYposition.y + "px";     
        var HelpDragframe = document.getElementById('HelpDragFrame');   // frame to be dragged
        if (HelpDragframe) {
    	    HelpDragframe.style.zIndex=-1;
    	    HelpDragframe.style.display="none";
    	    HelpDragframe.style.width= 0+'px';
    	    HelpDragframe.style.height= 0+'px';
    	    HelpDragframe.style.top= 0;
    	    HelpDragframe.style.left= 0;
        }
        HelppopupObj_win1.moveCounter=0;
    }
},

MovePopup:function(e) {
    if(document.all)
        e = event;

    var HelpDragframe = document.getElementById('HelpDragFrame');   // frame to be dragged
    if(HelppopupObj_win1.moveCounter>=1 && HelpDragframe){        
        var mx = e.clientX;
        var my = e.clientY; 

            HelpDragframe.style.left = HelppopupObj_win1.startPosWindow[0] + mx - HelppopupObj_win1.startEventPos[0] + 'px';       
        var mx = e.clientX;
        var my = e.clientY;
            HelpDragframe.style.top = HelppopupObj_win1.startPosWindow[1] + my - HelppopupObj_win1.startEventPos[1] + 'px';         
    }
},

UpdatePopup:function(evt,sHTML)  // update popup with html content and set position and size of popup
{
    var HelppopContainer = document.getElementById(this.Helppop);        // get popup container - <table>
    var HelppopupInner = document.getElementById("HelppopupInner");      // get popup inner - <td>
    var HelppopFrame = document.getElementById("HelpdivpopupFrame");     // get popup content - <div>

    HelppopFrame.scrollTop=0;                                          // reset scrollbar position
    HelppopFrame.scrollLeft=0;                                         // reset scrollbar position
    //HelppopContainer.style.display = "block";
    //HelppopupInner.style.display = "block";
    hItem=document.getElementById(this.hoverId);                     // get mouse-over item
    var viewportHeight = ptCommonObj2.getViewportHeight();            // viewable height
    var viewportWidth = ptCommonObj2.getViewportWidth();              // viewable width
    // set popup width according to viewable area
    if (this.bIE && (viewportWidth-30) > 60)
        viewportWidth = viewportWidth - 30;                          // adjust viewable width for IE
    else if (!this.bIE && (viewportWidth-50) > 60)
        viewportWidth = viewportWidth - 50;                          // adjust viewable width for non-IE

    if (this.HelpcurrWidth > 0)  {
       if (this.HelpcurrWidth > viewportWidth)
          this.HelpcurrWidth = viewportWidth;
    }
    else
       this.HelpcurrWidth = viewportWidth;

    // set popup left coordinate
    var nLeft=this.GetElementleft(evt, hItem);                               // hovered item leftoffset
    if('ltr' == 'ltr') {
        nLeft = nLeft + 20;
    }
    else {
        if(this.bIE)
          nLeft = nLeft - 2*this.HelpcurrWidth - 20;
        else
          nLeft = nLeft - this.HelpcurrWidth - 20;
    }
    this.x = nLeft;

    // set popup top coordinate
    var nTop=this.GetElementTop(evt, hItem);

    this.y = nTop + 20;

    if (this.HelpcurrHeight < this.nMinHeight)
        this.HelpcurrHeight = this.nMinHeight;                // give it a minimum height

    HelppopContainer.style.width = this.HelpcurrWidth;          // popup width
    HelppopupInner.style.width = this.HelpcurrWidth;            // popup width
    HelppopupInner.style.height = this.HelpcurrHeight;          // popup height
    HelppopFrame.innerHTML=sHTML;
    //HelppopFrame.style.dislay='block';
    if (this.bIE)
        HelppopFrame.style.width = (this.HelpcurrWidth) + "px";
    else
        HelppopFrame.style.width = (this.HelpcurrWidth) - 25 + "px";
    
    
    HelppopFrame.scrollLeft=500;
    
    if (HelppopFrame.scrollLeft>0 && (this.HelpcurrWidth+HelppopFrame.scrollLeft)<viewportWidth)  {
        this.HelpcurrWidth=this.HelpcurrWidth+HelppopFrame.scrollLeft;
        HelppopFrame.innerHTML=sHTML;
        HelppopContainer.style.width = this.HelpcurrWidth;          // popup width
        HelppopupInner.style.width = this.HelpcurrWidth;            // popup width
        HelppopFrame.style.width = (this.HelpcurrWidth) - 10 + "px";
    }
    else if(!this.bIE && !this.isSwanSS)
        HelppopupInner.style.width = this.HelpcurrWidth - 3;
    HelppopFrame.scrollLeft=0;
    if (!this.bIE)
        HelppopFrame.style.height = (this.HelpcurrHeight) - 35 + "px"; // it was 45
    else
        HelppopFrame.style.height = (this.HelpcurrHeight) + "px";
//window.status="h="+this.MOcurrHeight+";w="+this.MOcurrWidth;  //debug

}
}

var MOpopupObj_win1 = new PT_MOpopup();   // create mouse-over popup object
MOpopupObj_win1.init();
var HelppopupObj_win1 = new PT_Helppopup();   // create mouse-over popup object
HelppopupObj_win1.init();