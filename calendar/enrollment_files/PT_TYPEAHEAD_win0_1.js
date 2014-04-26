function PT_typeahead()
{} 

PT_typeahead.prototype = {  
init:function(oWin,oDoc,oForm,url_up,url_dn,url_close,nDelayTime){
    this.oWin = oWin;
    this.oDoc = oDoc;
    this.oForm = oForm;
    this.url_up = url_up;
    this.url_dn = url_dn;
    this.url_close = url_close;
    this.arrOptions=new Array();    
    this.arrHeaders=new Array();    
    this.arrMatches=new Array();    
    this.strLastValue="";
    this.bMadeRequest;
    this.theTextBox=null;
    this.objLastActive;
    this.currentValueSelected=-2;
    this.bNoResults = false;
    this.nDelayTime=nDelayTime;
    this.isDelayTiming =true;
    this.isTiming =true;
    this.isOpera=(navigator.userAgent.toLowerCase().indexOf('opera')!=-1);
    this.countForId=0;
    this.currentTotalRow=0;        //789561
    this.startPos=0;
    this.maxRange=3;         // number of items to be displayed in the typeahead list per page
    this.ndisplay=1;         // 1 - display below the typeahead item; 0 - display above the typeahead item
    this.bScrolldownImage=0; // 1- scrolldown image tag included; 0 - no scrolldown image tag included
    this.bStartNewList = 0;  // 1 - start a new typeahead list; 0 - NOT start a new typeahead list 
    this.promptWidth=0;
    this.opValue=-1;
    this.bodyScrollTop=0;
    this.bodyScrollLeft=0;
    this.noMatchingDataMessage = "No matching values were found.";
    this.undeStart="<span class='spanMatchText'>";
    this.undeEnd="</span>";
    this.selectSpanStart="<span style='width:100%;display:block' class='spanNormalElement' onmouseover='ptTAObj_win0.SetHighColor(this)' ";
    this.selectSpanEnd='</span>';    
    this.tableStart="<table class='PSSRCHRESULTSTITLE' id='ttable' dir=\'"+'ltr'+"' cellpadding='1' cellspacing='0'>";
    this.tableEnd="</table>";    
    this.trStart="<tr align=\'"+'left'+"\'>";
    this.trEnd="</tr>";
    this.tdScrollStart="<td class='PSSRCHRESULTSEVENROW' align='center' colspan='";
    this.tdODDStart="<td class='PSSRCHRESULTSODDROW' nowrap='nowrap'>";
    this.tdEVENStart="<td class='PSSRCHRESULTSEVENROW' nowrap='nowrap'>";
    this.tdEnd="</td>";
    this.thStart="<th scope='col' class='PSTARESULTSHDR' nowrap='nowrap'><span class='PSTARESULTSHDR'>";
    this.thEnd="</span></th>";
    this.header="<tr align=\'"+'left'+"\'><th scope='col' class='PSTARESULTSHDR' ><span class='PSTARESULTSHDRR' name='#ICSortCol0'>User ID</span></th><th scope='col' class='PSTARESULTSHDR' ><span class='PSTARESULTSHDR' name='#ICSortCol1'>Description</span></th></tr>";    
    this.bTabPressed = false;
    this.bKeyUp = false;
    this.bKeyDown = false;
    this.UnsupportedKeycode = '[?)(|}{]';   
    this.SpecialKeycode = '*+';             
    this.bFoundSpecialKeycode = false;      
    this.lastIntKey = -1;
    this.bGrabHighlighted = false;        
    this.bInitialOnBlur = true;
    this.typeAheadProcessedValue = "";  
    this.currentTypeAheadField = "";    
    this.bStaledResult = false;         
    this.bLostFocus = true;                
    this.bInProcess = false;
    
    
    this.BACKSPACE  = 8;
    this.TAB         = 9;
    this.ENTER        = 13;
    this.SHIFT        = 16;
    this.CTRL       = 17;
    this.CAPLOCK    = 20;
    this.ESCAPE     = 27; 
    this.END        = 35; 
    this.LEFTARROW  = 37;
    this.UPARROW    = 38;
    this.RIGHTARROW = 39;
    this.DOWNARROW  = 40;
    this.EQUALSIGN    = 187;
    this.FORWARDSLASH = 191;
    this.OPENBRACKET  = 219;
    this.BACKSLASH    = 220;
    this.CLOSEBRACKET = 221;
    var ptObj = oDoc.getElementById("pt_typeahead0");
    if (ptObj)
        ptObj.style.display = 'none';
    //ptConsole2.enable();
},
resetTextBox:function(theTextBox){
    this.theTextBox=theTextBox;
},
OnPromptLaunch:function(oDoc) {
    if (!oDoc || typeof oDoc == 'undefined') return;
    el=oDoc.getElementById('pt_typeahead0');
    if (el && typeof el != 'undefined')
        el.innerHTML="<span id='pt_typeahead' class='spanTextDropdown'></span>";
},
SetProperties:function(xElem, xColNum, xHidden,xserverCode,
    xignoreCase,xmatchAnywhere,xmatchTextBoxWidth,
    xshowNoMatchMessage,xuseTimeout,xtheVisibleTime)
{
    var props={
        elem:xElem,
        colnum:xColNum,
        hidden:xHidden,
        serverCode:xserverCode,
        regExFlags: ( (xignoreCase)?"i":""),
        regExAny:((xmatchAnywhere)?"":"^"),              //768087
        matchAnywhere:xmatchAnywhere,
        matchTextBoxWidth:xmatchTextBoxWidth,
        theVisibleTime:xtheVisibleTime,
        showNoMatchMessage:xshowNoMatchMessage,
        useTimeout:xuseTimeout
    };
    this.AddHandler(xElem);
    return props;
},
AddHandler:function(objText){
     objText.onblur=function(){
        ptTAObj_win0.bLostFocus = true;
        if(this.obj.useTimeout) { 
            if (!browserInfoObj2.isSafari || !ptTAObj_win0.bInitialOnBlur)
                ptTAObj_win0.StartTimeout();
            else if (ptTAObj_win0.bInitialOnBlur)
                ptTAObj_win0.bInitialOnBlur = false;
        }
     }
},

KeyUpDown:function(e) {
    if (typeof ptTAObj_win0.oWin == 'undefined') 
        return;
    this.bTabPressed = false;
    this.bKeyUp = false;
    this.bKeyDown = false;
    var intKey=-1;
    if (this.theTextBox)
        addchg_win0(this.theTextBox);
    if (ptTAObj_win0.oWin.event) 
        intKey=ptTAObj_win0.oWin.event.keyCode;
    else
        intKey = e.which;
     if (intKey == this.CTRL) //ignore ctl\
            return true;
    if(intKey==this.UPARROW){
        this.bKeyUp = true;
        ptTAObj_win0.MoveHighlight(-1);
        ptTAObj_win0.GrabHighlighted();
        return true;
    }
    else if(intKey==this.DOWNARROW){
        this.bKeyDown = true;
        ptTAObj_win0.MoveHighlight(1);
        ptTAObj_win0.GrabHighlighted();
        return true;
    }
    else if(intKey==this.ESCAPE) {
        ptTAObj_win0.HideTheBox();         //ICE#1850813000
        return true;
    }
    else if(intKey==this.TAB) {
        this.bTabPressed = true;                //ICE#1858794000
        ptTAObj_win0.HideTheBox();
           
        
        if (this.theTextBox != null) {
            var thisObj = this.theTextBox.attributes.getNamedItem('onchange');
            if (thisObj != null && thisObj.nodeValue != null) 
                this.theTextBox.onchange();
        }
        return true;
    }
    return false;
},
GiveOptions:function(e) {
    if (typeof ptTAObj_win0.oWin == 'undefined') 
        return;
    var intKey=-1;
    if (ptTAObj_win0.oWin.event) {    
        intKey=ptTAObj_win0.oWin.event.keyCode;
        this.theTextBox=ptTAObj_win0.oWin.event.srcElement;
    }
    else{
        intKey = e.which;
        this.theTextBox = e.target;
    }

      if (intKey == this.CTRL || intKey == this.TAB) { 
        this.lastIntKey = intKey;                     
        return true;
    }

      if (intKey == this.SHIFT || intKey == this.END) { 
        this.lastIntKey = intKey;                 
        return true;
    }

    if (ptTAObj_win0.CancelTypeAhead(this.theTextBox)) return false;

    
    if (intKey == this.BACKSPACE || this.lastIntKey != this.BACKSPACE) {
        ptTAObj_win0.EraseDelayTimeout();
    }

    
    if ((intKey == this.SHIFT && this.lastIntKey == this.TAB) ||
        (intKey == this.SHIFT && this.lastIntKey == this.SHIFT)) { 
        this.lastIntKey = intKey;
        return false;
    } 

    this.lastIntKey = intKey;
    if((intKey>=this.LEFTARROW && intKey<=this.DOWNARROW)) {
        return false;
    }

    
    if (intKey==48||intKey==57||intKey==this.EQUALSIGN||
        intKey==this.FORWARDSLASH||intKey==this.OPENBRACKET || intKey==this.BACKSLASH ||intKey==this.CLOSEBRACKET ) {
        var regE = new RegExp(this.UnsupportedKeycode,this.theTextBox.obj.regExFlags); 
        this.theTextBox.value=this.theTextBox.value.replace(regE,'');
        this.theTextBox.value=this.theTextBox.value.replace(']','');
        //this.theTextBox.value=this.theTextBox.value.replace('\\','');
        this.theTextBox.value=this.theTextBox.value.replace('[','');
    }
    ptTAObj_win0.resetTextBox(this.theTextBox);
    if(this.theTextBox.value.length==0&&!this.isOpera){
        ptTAObj_win0.arrOptions=new Array();
        ptTAObj_win0.HideTheBox();
        ptTAObj_win0.strLastValue='';
    }
    if(this.objLastActive==this.theTextBox){
        if(intKey==this.ENTER){ 
            ptTAObj_win0.GrabHighlighted();
            this.theTextBox.blur();
        }
    }    
    if (this.theTextBox.value.length==0) 
        ptTAObj_win0.HideTheBox();
    else {
        if ( ptTAObj_win0.bInProcess || (this.objLastActive!=this.theTextBox) ||
             ((this.theTextBox.value.length!=0) && (this.theTextBox.value.length > ptTAObj_win0.strLastValue.length)) ||
             (this.theTextBox.value.indexOf(ptTAObj_win0.strLastValue)!=0) ||
             (ptTAObj_win0.arrOptions.length==0 && !this.bNoResults) ||
             (this.theTextBox.value.length <= ptTAObj_win0.strLastValue.length) ) {
              ptTAObj_win0.StartDelayTimeout();
        } else {
            if (this.theTextBox.obj.nMaxRows==ptTAObj_win0.arrOptions.length)
                ptTAObj_win0.DoTypeAhead();
            else {
                ptTAObj_win0.BuildList(this.theTextBox.value);
            }
        }
    }
    return true;
},
DoTypeAhead:function(){
    if ((ptTAObj_win0.arrOptions.length > 0 && !this.bNoResults)
        && (this.objLastActive == null || this.objLastActive.id == this.theTextBox.id)
        && this.theTextBox.value.indexOf(ptTAObj_win0.strLastValue) == 0
        ) // LOCAL MATCH
        {
        var bShowMatch = this.theTextBox.obj.showNoMatchMessage;
        this.theTextBox.obj.showNoMatchMessage = false;
        ptTAObj_win0.BuildList(this.theTextBox.value);
        this.theTextBox.obj.showNoMatchMessage = bShowMatch;
        if (!this.bNoResults) {
            ptTAObj_win0.strLastValue=this.theTextBox.value;
            return;
        }
        }

    if (ptTAObj_win0.theTextBox.value.length==0 || typeof ptTAObj_win0.theTextBox.value == "undefined")      //791953
        ptTAObj_win0.HideTheBox();
    else {
        ptTAObj_win0.bMadeRequest=true;
        ptTAObj_win0.bInProcess = true;
        ptTAObj_win0.TypeAhead(ptTAObj_win0.theTextBox.value);
        ptTAObj_win0.objLastActive=ptTAObj_win0.theTextBox;
        ptTAObj_win0.bInProcess = false;
    }
    ptTAObj_win0.strLastValue=this.theTextBox.value;
},

TypeAhead:function(xStrText){
    if (this.CheckSpecialKeycode(xStrText))
        this.bFoundSpecialKeycode = true;
    ptTAObj_win0.SetOpValue(this.theTextBox);
    this.theTextBox.obj.hidden.value=this.theTextBox.name;
    this.bLostFocus = false;    
    eval(this.theTextBox.obj.serverCode);
    ptTAObj_win0.RestoreOpValue(this.theTextBox);
    this.bInitialOnBlur = true;
},
buildChoices:function(){
    this.oWin.gFocusId = this.theTextBox.id;
    if (typeof this.oWin.modWin != 'undefined' && this.oWin.modWin != null) {
        return;
    }
    
    if (this.bLostFocus) {
        return; 
    }

    this.bStartNewList = 1;
    if (this.RestoreTextBox())
        {    
        this.BuildList(ptTAObj_win0.strLastValue.replace(/\\/g,'\\\\'));
        bMadeReqiest = false;
        this.startPos = 0;
        this.bFoundSpecialKeycode = false;
        }
},
RestoreTextBox:function(){
    var tempColNum = this.theTextBox.obj.colnum;
    var tempMaxRows = this.theTextBox.obj.nMaxRows;
    this.theTextBox = document.getElementById(this.theTextBox.id);

    if (this.theTextBox == null || typeof this.theTextBox.name == "undefined")    
        return false; 
    else {
        tryFocus(this.theTextBox);
        this.theTextBox.value = this.theTextBox.value;
        if (!this.theTextBox.obj)
            initTypeAheadEl(this.theTextBox);


        this.theTextBox.obj.colnum = tempColNum;
        this.theTextBox.obj.nMaxRows = tempMaxRows;
        
        
        var thisObj = this.theTextBox.attributes.getNamedItem('onchange');
        if (thisObj != null && thisObj.nodeValue != null) {
            this.theTextBox.onchange();
        }
        return true;
    }
},

EscapeHTMLSymbol:function(theText) {
    //for bug 14014957, fix common escape/decode issue
    theText = theText.replace(/&/gi,'&amp;').replace(/'/gi, '&#039;').replace(/</gi,'&lt;').replace(/>/gi,'&gt;').replace(/%/,'&#037;').replace(/ /gi, '&nbsp;');
    theText = theText.replace(/"/gi,"&quot;") // " just to close the quote in replace
    return theText;
},
TAFieldHasFocus:function() {
    var bTAFieldHasFocus = false; 
    if (typeof PFieldList_win0!='undefined' && PFieldList_win0) {
         for (var i = 0; i < PFieldList_win0.length; i++) {
            var fname = PFieldList_win0[i][0];    
            var nStop = PFieldList_win0[i][1];
            for (var j=0; j<nStop; j++) {        
                var name = fname;    
                var nsuffix = "";
                if (nStop>1) {    
                    nsuffix = '$'+j;   
                    name = fname+nsuffix;
                } else if (ptTAObj_win0.oDoc.getElementById(fname+'$'+j)) {
                    nsuffix = '$'+j;   
                    name = fname+nsuffix;
                }
                var el = ptTAObj_win0.oDoc.getElementById(name);
                if (el && el.getAttribute("focus") == "true") {
                    bTAFieldHasFocus = true;
                    return bTAFieldHasFocus;
                }
            }    
         } 
    }

    if (bTAFieldHasFocus)
        return bTAFieldHasFocus;

    if (typeof EFieldList_win0!='undefined' && EFieldList_win0) {
         for (var i = 0; i < EFieldList_win0.length; i++) {
            var fname = EFieldList_win0[i][0];    
            var nStop = EFieldList_win0[i][1];
            for (var j=0; j<nStop; j++) {        
                var name = fname;    
                var nsuffix = "";
                if (nStop>1) {    
                    nsuffix = '$'+j;   
                    name = fname+nsuffix;
                } else if (ptTAObj_win0.oDoc.getElementById(fname+'$'+j)) {
                    nsuffix = '$'+j;   
                    name = fname+nsuffix;
                }
                var el = ptTAObj_win0.oDoc.getElementById(name);
                if (el && el.getAttribute("focus") == "true") {
                    bTAFieldHasFocus = true;
                    return bTAFieldHasFocus;
                }
            }    
         } 
    }
    return bTAFieldHasFocus;
},
SetProcessedTypeAheadValue:function(theText) {
    this.typeAheadProcessedValue = theText;     
    this.bStaledResult = false;                 
    this.currentTypeAheadField = document.getElementById(this.theTextBox.id);    
    
    if ( this.typeAheadProcessedValue == '' ||  
        this.typeAheadProcessedValue != this.EscapeHTMLSymbol(this.currentTypeAheadField.value) ) {
        this.bStaledResult = true;
    }
},
SetMaxRange:function(theTextBoxInt,nMatchLength) {
    var selectedPosX=0;
    var selectedPosY=0;
    var theElement=theTextBoxInt;
    if(!theElement) 
        return;
    var theElemHeight=theElement.offsetHeight;
    var divgbr = null;
    var divgbrId = null;
    var divgblr = null; 
    var divgblrId = null;
    this.maxRange=3;
    var XYposition = ptCommonObj2.getPosition2(theElement, "win0");
    selectedPosY= XYposition.y;
    selectedPosX= XYposition.x;       
    
        var viewportHeight = ptCommonObj2.getViewportHeight();
        var nBelHeightLeft =  viewportHeight + document.body.scrollTop - (selectedPosY+theElemHeight);     // space below typeahead item
        var nAbvHeightLeft =  viewportHeight - (nBelHeightLeft+theElemHeight);   // space above typeahead item
        var nMinHeight = theElemHeight*3;                                      // one row to up scroll, one row for heading, one row for down scroll
        var nBelMaxRange = Math.floor((nBelHeightLeft - nMinHeight)/theElemHeight);
        var nAbvMaxRange = Math.floor((nAbvHeightLeft - nMinHeight)/theElemHeight);
        
        if (nBelMaxRange >= nMatchLength || nBelMaxRange >= this.maxRange)
        {
            if (nBelMaxRange >= nMatchLength)
               this.maxRange = nMatchLength;
            else
               this.maxRange = nBelMaxRange;
            this.ndisplay = 1;    // display below item
            return {x:selectedPosX, y:(selectedPosY+theElemHeight)};
        }
        else if (nAbvMaxRange>= nMatchLength || nAbvMaxRange >= this.maxRange)   
        {
            if (nAbvMaxRange >= nMatchLength) 
               this.maxRange = nMatchLength;
            else
               this.maxRange = nAbvMaxRange;
            this.ndisplay = 0;  // display above item 
            return {x:selectedPosX, y:selectedPosY};
        }
        else if (nBelMaxRange > nAbvMaxRange && nBelMaxRange > 0)    
        {
            this.maxRange = nBelMaxRange;
            this.ndisplay = 1;    // display below item
            return {x:selectedPosX, y:(selectedPosY+theElemHeight)};
        }
        else if (nAbvMaxRange > 0)
        {
            this.maxRange = nAbvMaxRange;
            this.ndisplay = 0;    // display above item
            return {x:selectedPosX, y:selectedPosY};
            
        }
        else        
        {
        this.maxRange = 1;
            this.ndisplay = 1;    // display below item
        return {x:selectedPosX, y:(selectedPosY+theElemHeight)};
    }


},

BuildList:function(theText){
    
    if (this.bTabPressed) {
        this.bTabPressed = false;
        return;
    }
    
    
    if (this.bStaledResult) {
        return;  
    }    
    
    var theElemWidth=this.theTextBox.offsetWidth;
    var theMatches = null;
    var matchGrid = null;
    var xPosElement = ptTAObj_win0.oDoc.getElementById("pt_typeahead");

    this.SetMatchesArr(theText);
    var mLengthA= ptTAObj_win0.arrMatches.length;
    var boxPos = this.SetMaxRange(this.theTextBox,mLengthA);    // set maximum number of list items and position of the list
    theMatches = this.MakeMatchesArr(theText);
    if(theMatches.length>0) 
        matchGrid=this.CreateGrid(theMatches,mLengthA);

    if (matchGrid) {
           xPosElement.innerHTML=matchGrid;
           ptTAObj_win0.oDoc.getElementById("OptionsList_0").className="spanNormalElement";
           this.currentValueSelected=-1;
           this.bNoResults=false;
           if (this.ndisplay == 0) {    // display typeahead box above the typeahead item
              
              
              if (this.bStartNewList) {
                  this.bStartNewList = 0;   
                  var nListH = this.maxRange * this.theTextBox.offsetHeight + this.theTextBox.offsetHeight;
                  if (this.bScrolldownImage) // scrolldown image tag 
                     nListH = nListH + 3;
                  boxPos.y = boxPos.y - nListH;
              }
              else
                  boxPos.y = boxPos.y - xPosElement.scrollHeight;
           }
        }
        else {
                this.bStartNewList = 0;
                this.currentValueSelected=-2;
                this.bNoResults=true;
                if(this.theTextBox.obj.showNoMatchMessage) 
                   ptTAObj_win0.oDoc.getElementById("pt_typeahead").innerHTML="<span class='noMatchData' style='white-space:nowrap;background-color: rgb(226,226,226);'>"+this.noMatchingDataMessage+"</span>";    
                else 
                   this.HideTheBox();
        }

    this.SetElementPosition(this.theTextBox, boxPos.x, boxPos.y);
},
SetColNum:function(colnum,nMaxRows){
    this.theTextBox.obj.colnum=colnum;
    this.theTextBox.obj.nMaxRows=nMaxRows;
},    
SetElementPosition:function(theTextBoxInt, selectedPosX, selectedPosY ){
    var theElement=theTextBoxInt;
    if(!theElement) 
        return;
    var theElemHeight=theElement.offsetHeight;
    var theElemWidth=theElement.offsetWidth;

    var el = ptTAObj_win0.oDoc.getElementById("pt_typeahead0");
    if (el && typeof el != 'undefined')
        el.style.display='block';
    
    var xPosElement = ptTAObj_win0.oDoc.getElementById("pt_typeahead");
        if('ltr' == 'ltr') 
            xPosElement.style.left = selectedPosX;
        else {
            var viewportWidth = ptCommonObj2.getViewportWidth(); 
            xPosElement.style.left = selectedPosX + theElemWidth ;        
            xPosElement.style.right = viewportWidth - selectedPosX - theElemWidth; 
        }

        if(theTextBoxInt.obj.matchTextBoxWidth)
        xPosElement.style.width=theElemWidth;

        xPosElement.style.top=selectedPosY;
        xPosElement.style.display='block';
        
        if(theTextBoxInt.obj.useTimeout){
            xPosElement.onmouseout=ptTAObj_win0.StartTimeout;
            xPosElement.onmouseover=ptTAObj_win0.EraseTimeout;
        }
        else {
            xPosElement.onmouseout=null;
            xPosElement.onmouseover=null;
        } 
    //commented out until feed back
        // ptTAObj_win0.AutoWinAdj(xPosElement);   
},
SetOpValue:function(theTextBox) {
    var name=theTextBox.name;
    if (name.indexOf('$to')>0)
        name = name.split('$')[0];
    var elOP=this.oWin.document.getElementById(name+"$op");
    if (elOP==null || elOP.value=="1") return;
    ptTAObj_win0.opValue=elOP.value;
    elOP.value=1;
    return;
},
RestoreOpValue:function(theTextBox) {
    var name=theTextBox.name;
    if (name.indexOf('$to')>0)
        name = name.split('$')[0];
    var elOP=this.oWin.document.getElementById(name+"$op");
    if (elOP==null) return;
    if (ptTAObj_win0.opValue != -1) {
        elOP.value = ptTAObj_win0.opValue;
        ptTAObj_win0.opValue = -1;
    }
    return;
},
CancelTypeAhead:function(theTextBox) {
if (!ptCommonObj2.isSearchPage(this.oForm)) return false;
    var name=theTextBox.name;
    if (name.indexOf('$to')>0)
        name = name.split('$')[0];
    var elOP=this.oWin.document.getElementById(name+"$op");
    if (elOP==null ||elOP.value=="1" || elOP.value=="2")    //search criteria 'begins with' and '='  
        return false; 
    else 
        return true;
},
GetRegExPattern:function(theTextBox,compareStr) {
    /*var elOP=this.oWin.document.getElementById(theTextBox.name+"$op");
    if ((elOP!=null) && (elOP.value == "8"))
        return compareStr;            //search by 'contains'
    else*/        //797957
        return theTextBox.obj.regExAny+compareStr;        //search by 'Begin with'
},

SetMatchesArr:function(xCompareStr){
    this.countForId=0;
    this.currentTotalRow=0;        //789561
    ptTAObj_win0.arrMatches=new Array();
    var tmpArray=new Array();
    this.DecodeArrOptions();
    if (!this.bFoundSpecialKeycode) {
        var pattern=this.GetRegExPattern(this.theTextBox,xCompareStr);
        if(pattern.length > 0) {        //791953 
            var regExp=new RegExp(pattern,this.theTextBox.obj.regExFlags);
            for(var i=0;i<ptTAObj_win0.arrOptions.length;i++){
                var theMatch=ptTAObj_win0.arrOptions[i][this.theTextBox.obj.colnum].match(regExp);
                if (theMatch) {
                        tmpArray[ptTAObj_win0.arrMatches.length]=ptTAObj_win0.arrOptions[i][this.theTextBox.obj.colnum];
                        ptTAObj_win0.arrMatches[ptTAObj_win0.arrMatches.length]=ptTAObj_win0.arrOptions[i];
                }
            }
        }
    } 
    else {
        for(var i=0;i<ptTAObj_win0.arrOptions.length;i++) {
            var str = ptTAObj_win0.arrOptions[i][this.theTextBox.obj.colnum];
            var theMatch = this.StrStartsWith(str, xCompareStr);
            if (theMatch) {
                    tmpArray[ptTAObj_win0.arrMatches.length]=ptTAObj_win0.arrOptions[i][this.theTextBox.obj.colnum];
                    ptTAObj_win0.arrMatches[ptTAObj_win0.arrMatches.length]=ptTAObj_win0.arrOptions[i];
            }
        }
    }
},
StrStartsWith:function(str, prefix) 
{
    if ((str == null) || (prefix == null))
           return false;
        
    var str1 = str.substring(0, prefix.length).toUpperCase();
    var str2 = prefix.toUpperCase();
    if (str1 === str2)
        return true;
    else
        return false;
},
CheckSpecialKeycode:function(str) {
    for (var i=0; i< this.SpecialKeycode.length; i++) {
        if (str.indexOf(this.SpecialKeycode.charAt(i)) != -1) 
            return true;
    }
    return false;
}, 

MakeMatchesArr:function(xCompareStr){
    this.countForId=0;
    this.currentTotalRow=0;
    var matchArray=new Array();
    for(var i=this.startPos;(i<ptTAObj_win0.arrMatches.length && (i-this.startPos)<this.maxRange);i++){
        var matchRowArr=new Array();
        for (var j=0;j<ptTAObj_win0.arrOptions[i].length;j++) {
            if (j==this.theTextBox.obj.colnum) {
                matchRowArr[matchRowArr.length]=this.CreateBold(ptTAObj_win0.arrMatches[i][j],xCompareStr,i);
            }
            else        //789561 - selection on other sugguestion columns
                matchRowArr[matchRowArr.length]=this.CreateBoldOtherCol(ptTAObj_win0.arrMatches[i][j],i);
        }
        matchArray[matchArray.length]=matchRowArr;
    }
    return matchArray;
},
CheckDup:function(tmpArray,value){
    /*if (typeof(bSearchDialog_win0)=="undefined" || !bSearchDialog_win0)
        return false;
    for (var j=0;j<tmpArray.length;j++){
        var regExp=new RegExp(value,this.theTextBox.obj.regExFlags);
        var bDup = tmpArray[j].match(regExp);
        if (bDup) return true;
    }*/
    return false;
},
ScrollUp:function(){
    this.startPos = this.startPos - this.maxRange+1;
    if (this.startPos < 0 )
        this.startPos = 0;
    this.BuildList(ptTAObj_win0.strLastValue);
    var xPosElement = ptTAObj_win0.oDoc.getElementById("pt_typeahead");
    xPosElement.onmouseover();
    this.MoveHighlight(1);
},
ScrollDown:function(){
    this.startPos = this.startPos + this.maxRange-1;
    if (this.startPos < ptTAObj_win0.arrMatches.length)
    this.BuildList(ptTAObj_win0.strLastValue);
    var xPosElement = ptTAObj_win0.oDoc.getElementById("pt_typeahead");
    xPosElement.onmouseover();
    this.MoveHighlight(1);
},
CreateGrid:function(matchArray,mLengthA) {
    var matchGrid = this.tableStart;
        this.bScrolldownImage=0; // 0 - no scrolldown image tag 
    if (this.arrHeaders.length>0){
        matchGrid +=this.trStart;
        for (var i=0;i<this.arrHeaders.length;i++) 
            matchGrid +=this.thStart+this.arrHeaders[i]+this.thEnd;
        matchGrid +=this.trEnd;
    }
    var odd=true;
    var mLength = matchArray.length;
    var nCol = matchArray[0].length;
    
    if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
        var sCloseTAResult = "<img align='right' src='"+this.url_close+"'/ onclick='ptTAObj_win0.HideTheBox()'>";
        matchGrid=matchGrid+this.trStart;
        matchGrid=matchGrid+sCloseTAResult; 
        matchGrid=matchGrid+this.trEnd;
    }
    if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)  { 
        var sScrollUp = "<img align='absmiddle' src='"+this.url_up+"'/ onclick='ptTAObj_win0.ScrollUp()'>";
    } else {
        var sScrollUp = "<img align='absmiddle' src='"+this.url_up+"'/ onmouseover='ptTAObj_win0.ScrollUp()'>";
    }    
    sScrollUp = this.tdScrollStart+nCol+"'>"+sScrollUp+this.tdEnd
    if (this.startPos>0 && (mLength>=this.maxRange || this.startPos+mLength==mLengthA)){
        matchGrid=matchGrid+this.trStart;
        matchGrid=matchGrid+sScrollUp; 
        matchGrid=matchGrid+this.trEnd;
    }
    odd=false;
    for (var i=0;i<matchArray.length;i++){
        matchGrid += this.trStart;
        for (var j=0;j<matchArray[i].length;j++){
            if (odd) matchGrid += this.tdODDStart+matchArray[i][j]+this.tdEnd;
            else matchGrid += this.tdEVENStart+matchArray[i][j]+this.tdEnd;
        }
        if (odd) 
            odd=false; 
        else 
            odd=true;
        matchGrid += this.trEnd;
    }
    if (((this.startPos+this.maxRange) < ptTAObj_win0.arrMatches.length) && mLength>=this.maxRange){
          if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) { 
            var sScrollDown = "<img align='absmiddle' src='"+this.url_dn+"'/ onclick='ptTAObj_win0.ScrollDown()'>";
        } else {
            var sScrollDown = "<img align='absmiddle' src='"+this.url_dn+"'/ onmouseover='ptTAObj_win0.ScrollDown()'>";
        }
                this.bScrolldownImage=1; // 1 - include scrolldown image tag 
         sScrollDown = this.tdScrollStart+nCol+"'>"+sScrollDown+this.tdEnd;
        matchGrid=matchGrid+this.trStart; 
        matchGrid=matchGrid+sScrollDown; 
        matchGrid=matchGrid+this.trEnd;
    }
    matchGrid += this.tableEnd;
    return matchGrid;
},
// xStr          - string to be searched 
// xTextMatch - the value to be searched in the string xStr
// xVal       - index of the matching string
CreateBold:function(xStr,xTextMatch,xVal) {
    selectSpanMid="onclick='ptTAObj_win0.SetText("+xVal+")'"+"id='OptionsList_"+this.countForId+"' theArrayNumber='"+xVal+"'>";
    if (!this.bFoundSpecialKeycode) {
        var regExp=new RegExp(xTextMatch,this.theTextBox.obj.regExFlags);   //768087
        aStart=xStr.search(regExp);
    } else {
        aStart = this.StrStartsWith(xStr, xTextMatch) ? 0 : -1;
    }
    xTextMatch = xTextMatch.replace(/\\\\/g,'\\'); //Resolution 826172:Removing the escape character to get correct length
    //for bug 14014957, fix common escape/decode issue
    var preMatchedText = xStr.substring(0, aStart);  
    var matchedText=xStr.substring(aStart,aStart+xTextMatch.length);
    var postMatchedText = xStr.substring(aStart+xTextMatch.length);
    this.countForId++;
    this.currentTotalRow++;
    return this.selectSpanStart+selectSpanMid+this.EscapeHTMLSymbol(preMatchedText)+this.undeStart+this.EscapeHTMLSymbol(matchedText)+this.undeEnd+this.EscapeHTMLSymbol(postMatchedText)+this.selectSpanEnd;
},
// selection on other suggestion columns
CreateBoldOtherCol:function(xStr,xVal) {
    selectSpanMid="onclick='ptTAObj_win0.SetText("+xVal+")'"+"id='OptionsList_"+this.countForId+"' theArrayNumber='"+xVal+"'>";
    this.countForId++;
    //for bug 14014957, fix common escape/decode issue
    return this.selectSpanStart+selectSpanMid+this.EscapeHTMLSymbol(xStr)+this.selectSpanEnd;
},
MoveHighlight:function(xDir){
    if(this.currentValueSelected>=-1){
        newValue=parseInt(this.currentValueSelected)+parseInt(xDir);
        if(newValue>-1 && newValue<this.currentTotalRow){            //789561
            this.currentValueSelected=newValue;
            this.SetHighColor(null);
         }
        if (newValue == this.currentTotalRow && ((this.startPos+this.maxRange) < ptTAObj_win0.arrMatches.length)){
            this.ScrollDown();
            this.currentValueSelected=0;
            ptTAObj_win0.GrabHighlighted();
            this.MoveHighlight(xDir);
        }
        if (newValue == -1 && this.startPos>0){
            this.ScrollUp();
            this.currentValueSelected=this.currentTotalRow;
            ptTAObj_win0.GrabHighlighted();
            this.MoveHighlight(xDir);
        }
    }
},
SetHighColor:function(theTextBox){
    if(theTextBox){
    this.currentValueSelected=theTextBox.id.slice(theTextBox.id.indexOf("_")+1,theTextBox.id.length);
    }
    var odd=false;
    var totalCol=ptTAObj_win0.arrMatches[0].length;
    for(i=0;i<this.currentTotalRow;i++){
        var tObj = ptTAObj_win0.oDoc.getElementById('OptionsList_'+i*totalCol);
        var trObj = tObj.parentNode.parentNode;
          for (var j=0; j<trObj.childNodes.length; j++) {
            var node=trObj.childNodes[j];
            if (odd)
                node.className='PSSRCHRESULTSODDROW';
            else
                node.className='PSSRCHRESULTSEVENROW';
          }
        if (odd) odd=false; else odd=true;
    }

    //789561 - fix for mouse over other suggestion columns
    if (theTextBox) {
        var selectOBJ=ptTAObj_win0.oDoc.getElementById('OptionsList_'+this.currentValueSelected);
        this.currentValueSelected = selectOBJ.getAttribute("theArrayNumber") - this.startPos;        //point to the row
    }
    else
        var selectOBJ=ptTAObj_win0.oDoc.getElementById('OptionsList_'+this.currentValueSelected*totalCol);
 
    var trObj = selectOBJ.parentNode.parentNode;
      for (var j=0; j<trObj.childNodes.length; j++) {
        var node=trObj.childNodes[j]; 
        node.className='spanHighElement';
    }
},
IsSelectedUnique:function(xVal){
    var bUnique = true; 
    var selectedValue;
    var aboveValue;
    var belowValue;  

    selectedValue = this.DecodeValue(ptTAObj_win0.arrMatches[xVal][this.theTextBox.obj.colnum]);
    if (xVal > 0) 
       aboveValue = this.DecodeValue(ptTAObj_win0.arrMatches[xVal -1][this.theTextBox.obj.colnum]);

    if (xVal + 1 < ptTAObj_win0.arrMatches.length) 
       belowValue= this.DecodeValue(ptTAObj_win0.arrMatches[xVal + 1][this.theTextBox.obj.colnum]);

    if (selectedValue == aboveValue || selectedValue == belowValue)
       bUnique = false;

    return bUnique; 
},
GetIndexBasedOnSelectedVal:function(xVal) {
   var index = 0;
   var i = xVal;
   var aboveValue;
   var selectedValue = this.DecodeValue(ptTAObj_win0.arrMatches[xVal][this.theTextBox.obj.colnum]);

   while (i > 0) {
       aboveValue = this.DecodeValue(ptTAObj_win0.arrMatches[i -1][this.theTextBox.obj.colnum]);
       if (selectedValue == aboveValue) 
          i--;
       else
          break;
   }
   index = xVal - i;
   return index;
},
UpdateControlField:function(xVal) {
    var rowNum =  this.GetIndexBasedOnSelectedVal(xVal);  
    var val = '#ICRow' + rowNum;
    document.win0.target = window.name;
    document.win0.ICAction.value = val;
    aAction_win0(document.win0, val);
},
SetText:function(xVal){
    tryFocus(this.theTextBox);
    this.theTextBox.value=this.DecodeValue(ptTAObj_win0.arrMatches[xVal][this.theTextBox.obj.colnum]);
    
    if (!ptTAObj_win0.IsSelectedUnique(xVal)) {
        this.UpdateControlField(xVal);
    } 
    addchg_win0(this.theTextBox);
    
    
    var thisObj = this.theTextBox.attributes.getNamedItem('onchange');
    if (thisObj != null && thisObj.nodeValue != null) 
        this.theTextBox.onchange();
    
    if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
        ptTAObj_win0.HideTheBox(); 
    }    
},
DecodeValue:function(xVal) {
    var newValue=xVal;
    //for bug 14014957, fix common escape/decode issue    
    newValue = newValue.replace(/&quot;/gi,'"'); // " 
    newValue = newValue.replace(/&#039;/gi, '\'').replace(/&acute;/gi,'\'').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#037;/,'%').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi,'&');
    return newValue;
},
GrabHighlighted:function(){
    if(this.currentValueSelected>=0){
        this.bGrabHighlighted = true;
        xVal = this.currentValueSelected+this.startPos;        //index of match array
        this.theTextBox.value=this.DecodeValue(ptTAObj_win0.arrMatches[xVal][this.theTextBox.obj.colnum]);
    }
},
AutoWinAdj:function(xPosElement){
    ptTAObj_win0.bodyScrollLeft=ptTAObj_win0.oDoc.body.scrollLeft; 
    ptTAObj_win0.bodyScrollTop=ptTAObj_win0.oDoc.body.scrollTop;
    var t1=parseInt(xPosElement.offsetHeight,10);
    var t2=parseInt(document.body.offsetHeight,10)-(parseInt(xPosElement.style.top,10)-ptTAObj_win0.oDoc.body.scrollTop);
    if (t1>t2)
        ptTAObj_win0.oDoc.body.scrollTop=t1-t2+10;

    t1=parseInt(xPosElement.offsetWidth,10);
    t2=parseInt(document.body.offsetWidth,10)-(parseInt(xPosElement.style.left,10)-ptTAObj_win0.oDoc.body.scrollLeft);
    if (t1>t2) {
        if (ptTAObj_win0.oDoc.win0.ICActionPrompt.value=='true') {
             var o=ptTAObj_win0.oWin.parent.document.getElementById('popupContainer');
             ptTAObj_win0.promptWidth = Math.max(0,o.style.width.replace('px',''));
             var newW=ptTAObj_win0.promptWidth+t1-t2+20+'px';
             o.style.width = newW;
             o=ptTAObj_win0.oWin.parent.document.getElementById('popupFrame');
             o.style.width = newW;
             o=ptTAObj_win0.oWin.parent.document.getElementById("popupTitleBar");
             o.style.width = newW;
         }
         var selectedPosX=0;
         var selectedPosY=0;
         var theElement=xPosElement;
         if(!theElement) return;
         var theElemHeight=theElement.offsetHeight;
         var theElemWidth=theElement.offsetWidth;
         while(theElement!=null){
             selectedPosX+=theElement.offsetLeft;
             selectedPosY+=theElement.offsetTop;
             theElement = theElement.offsetParent;
         }
         if ((t1-t2+20) > selectedPosX)
             ptTAObj_win0.oDoc.body.scrollLeft=selectedPosX-20;
         else
             ptTAObj_win0.oDoc.body.scrollLeft=t1-t2+20;
            }
},
AutoWinUnAdj:function(){
    ptTAObj_win0.oDoc.body.scrollLeft=ptTAObj_win0.bodyScrollLeft; 
    ptTAObj_win0.oDoc.body.scrollTop=ptTAObj_win0.bodyScrollTop;        
    if (!ptTAObj_win0.oDoc.win0.ICActionPrompt || ptTAObj_win0.oDoc.win0.ICActionPrompt.value!='true') {
        ptTAObj_win0.promptWidth=0;return;
    }
    if (ptTAObj_win0.promptWidth==0) return;
    var o=ptTAObj_win0.oWin.parent.document.getElementById('popupContainer');
    o.style.width = ptTAObj_win0.promptWidth+'px';
    o=ptTAObj_win0.oWin.parent.document.getElementById('popupFrame');
    o.style.width = ptTAObj_win0.promptWidth+'px';
    o=ptTAObj_win0.oWin.parent.document.getElementById("popupTitleBar");
    o.style.width = ptTAObj_win0.promptWidth+'px'; 
},
ClearResultData:function() {
    ptTAObj_win0.arrHeaders.length = 0;
    ptTAObj_win0.arrOptions.length = 0;
    ptTAObj_win0.arrMatches.length = 0;
},
DecodeArrOptions:function() {
    if (typeof ptTAObj_win0.arrOptions == 'undefined') 
        return;
    for (var i=0;i<ptTAObj_win0.arrOptions.length;i++) {
        for (var j=0;j<ptTAObj_win0.arrOptions[i].length;j++) {
            ptTAObj_win0.arrOptions[i][j] = this.DecodeValue(ptTAObj_win0.arrOptions[i][j]);
        }
    }
},
HideTheBox:function(){
    //commented out until feed back
    //ptTAObj_win0.AutoWinUnAdj();
    this.bGrabHighlighted = false;
    var el=ptTAObj_win0.oDoc.getElementById('pt_typeahead0');
    if (el && typeof el != 'undefined')
        el.style.display='none';
    ptTAObj_win0.oDoc.getElementById('pt_typeahead').style.display='none';
    ptTAObj_win0.currentValueSelected=-2;
    ptTAObj_win0.EraseTimeout();
    ptTAObj_win0.EraseDelayTime();
    this.startPos = 0;
    
    ptTAObj_win0.ClearResultData();    
},
IsGrabHighlighted:function() {    
    if (this.bGrabHighlighted)
        return true;

    return false;
},
EraseDelayTime:function(){
    clearTimeout(ptTAObj_win0.isDelayTiming);
    ptTAObj_win0.isDelayTiming=false;
},
StartDelayTimeout:function(){
    if (!ptTAObj_win0.theTextBox) return;
    ptTAObj_win0.isDelayTiming=setTimeout("ptTAObj_win0.DoTypeAhead()",this.nDelayTime);
},
EraseDelayTimeout:function(){
    clearTimeout(ptTAObj_win0.isDelayTiming);
    ptTAObj_win0.isDelayTiming=false;
},
EraseTimeout:function(){
    clearTimeout(ptTAObj_win0.isTiming);
    ptTAObj_win0.isTiming=false;
},
StartTimeout:function(){
    if (!ptTAObj_win0.theTextBox) 
        return
    ptTAObj_win0.isTiming=setTimeout("ptTAObj_win0.HideTheBox()",ptTAObj_win0.theTextBox.obj.theVisibleTime);
}
}

var ptTAObj_win0 = new PT_typeahead();