"use strict"

var Parser = require("htmlparser2").Parser
var CfmlHandler = require('./cfml-handler.js')
var inspect = require('eyes').inspector({maxLength: false})

var openImpliesClose = {
  /*
  tr      : { tr:true, th:true, td:true },
	th      : { th:true },
	td      : { thead:true, th:true, td:true },
	body    : { head:true, link:true, script:true },
	li      : { li:true },
	p       : { p:true },
	h1      : { p:true },
	h2      : { p:true },
	h3      : { p:true },
	h4      : { p:true },
	h5      : { p:true },
	h6      : { p:true },
	select  : formTags,
	input   : formTags,
	output  : formTags,
	button  : formTags,
	datalist: formTags,
	textarea: formTags,
	option  : { option:true },
	optgroup: { optgroup:true }
  */
};

var formTags = {
  /*
  input: true,
	option: true,
	optgroup: true,
	select: true,
	button: true,
	datalist: true,
	textarea: true
  */
};

var voidElements = {

  // coldfusion void elements
  cfset: true,
  cfdump: true,
  cfinclude: true
}

class CfmlParser extends Parser {

  constructor(cbs, options){
    super(cbs, options)

    this._line = 0
    this._pos = 0
    this._previousStartIndex = 0
  }

  writeLine(chunk) {

    // split 1 line with \n into multiple lines
    var lines = chunk.split('\n')

    for (var i = 0; i < lines.length; i++) {

      var line = lines[i]

      this._previousStartIndex = this._tokenizer._bufferOffset

      // increase line number
      this._line ++

      // write line
      super.write(line)
    }
  }

  // method override to implement a custom list of voidElements
  onopentagname(name){

    // normalize tag names
  	name = name.toLowerCase()

    // do not process any non-coldfusion tag
    if (!name.startsWith('cf'))
      return

  	this._tagname = name

  	if(!this._options.xmlMode && name in openImpliesClose) {
      for(
  			var el;
  			(el = this._stack[this._stack.length - 1]) in openImpliesClose[name];
  			this.onclosetag(el)
  		);
  	}

  	if(this._options.xmlMode || !(name in voidElements)){
  		this._stack.push(name)
  	}

  	if(this._cbs.onopentagname) this._cbs.onopentagname(name);
  	if(this._cbs.onopentag) this._attribs = {}
  }

// method override to implement a custom list of voidElements
  onopentagend(){
//inspect(this._tokenizer)
     this._updatePosition(1)

  	if(this._attribs){
  		if(this._cbs.onopentag) this._cbs.onopentag(this._tagname, this._attribs)
  		this._attribs = null
  	}

  	if(!this._options.xmlMode && this._cbs.onclosetag && this._tagname in voidElements){
  		this._cbs.onclosetag(this._tagname)
  	}

  	this._tagname = ""
  }

  // method override to implement a custom list of voidElements
  onclosetag(name){
  	this._updatePosition(1);

  	if(this._lowerCaseTagNames){
  		name = name.toLowerCase();
  	}

  	if(this._stack.length && (!(name in voidElements) || this._options.xmlMode)){
  		var pos = this._stack.lastIndexOf(name)
  		if(pos !== -1){
  			if(this._cbs.onclosetag){
  				pos = this._stack.length - pos
  				while(pos--) this._cbs.onclosetag(this._stack.pop())
  			}
  			else this._stack.length = pos
  		} else if(name === "p" && !this._options.xmlMode){
  			this.onopentagname(name)
  			this._closeCurrentTag()
  		}
  	} else if(!this._options.xmlMode && (name === "br" || name === "p")){
  		this.onopentagname(name)
  		this._closeCurrentTag()
  	}
  }

  _updatePosition(initialOffset){
  	if(this.endIndex === null){
  		if(this._tokenizer._sectionStart <= initialOffset){
  			this.startIndex = 0;
  		} else {
  			this.startIndex = this._tokenizer._sectionStart - initialOffset;
  		}
  	}
  	else this.startIndex = this.endIndex + 1;
  	this.endIndex = this._tokenizer.getAbsoluteIndex();
  }
}

module.exports = CfmlParser;
