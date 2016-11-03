var ElementType = {
	Text: "text", //Text
	Directive: "directive", //<? ... ?>
	Comment: "comment", //<!-- ... -->
	Script: "script", //<script> tags
	Style: "style", //<style> tags
	Tag: "tag", //Any tag
	CDATA: "cdata", //<![CDATA[ ... ]]>
	Doctype: "doctype",

	isTag: function(elem){
		return elem.type === "tag" || elem.type === "script" || elem.type === "style"
	}
}


var inspect = require('eyes').inspector({maxLength: false})

var re_whitespace = /\s+/g;
//var NodePrototype = require("./lib/node");
//var ElementPrototype = require("./lib/element");

function CfmlHandler(callback, options, elementCB){
	if(typeof callback === "object"){
		elementCB = options;
		options = callback;
		callback = null;
	} else if(typeof options === "function"){
		elementCB = options;
		options = defaultOpts;
	}
	this._callback = callback;
	this._options = options || defaultOpts;
	this._elementCB = elementCB;
	this.dom = [];
	this._done = false;
	this._tagStack = [];
	this._parser = this._parser || null;
}

//default options
var defaultOpts = {
	normalizeWhitespace: false, //Replace all whitespace with single spaces
	withStartIndices: true, //Add startIndex properties to nodes
	decodeEntities: true,
	recognizeSelfClosing: true
}

CfmlHandler.prototype.onparserinit = function(parser){
	this._parser = parser
}

//Resets the handler back to starting state
CfmlHandler.prototype.onreset = function(){
  //debug('onreset')
	CfmlHandler.call(this, this._callback, this._options, this._elementCB);
};

//Signals the handler that parsing is done
CfmlHandler.prototype.onend = function(){
  //debug('onend')
	if(this._done) return;
	this._done = true;
	this._parser = null;
	this._handleCallback(null);
};

CfmlHandler.prototype._handleCallback =
CfmlHandler.prototype.onerror = function(error){
  //console.log('error:' + error)
	if(typeof this._callback === "function"){
		this._callback(error, this.dom);
	} else {
		if(error) throw error;
	}
}

CfmlHandler.prototype.onclosetag = function(name){
  //debug('onclosetag: ' + name)
	//if(this._tagStack.pop().name !== name) this._handleCallback(Error("Tagname didn't match!"));
	var elem = this._tagStack.pop();
	if(this._elementCB) this._elementCB(elem);
}

CfmlHandler.prototype._addDomElement = function(element){
  //debug('_addDomElement')
	var parent = this._tagStack[this._tagStack.length - 1];
	var siblings = parent ? parent.children : this.dom;
	//var previousSibling = siblings[siblings.length - 1];
	//debug('parent: ' + parent)
	//console.log('children: ' + parent.children)
	//console.log('dom: ' + this.dom)
		//element.next = null;
	  /*
		if(this._options.withStartIndices){
			element.startIndex = this._parser.startIndex;
		}
	  */

//inspect(this._parser)
	element.line = this._parser._line
	//element.startIndex = this._parser.startIndex

//console.log('STARTINDEX: ' + this._parser.startIndex)
//console.log('PREV_STARTINDEX: ' + this._parser._previousStartIndex)

	if (this._parser.startIndex > 0)
		element.col =  this._parser.startIndex - this._parser._previousStartIndex
	else
		element.col = 0

//inspect(this._parser._tokenizer)

	//if (this._options.withDomLvl1) {
		//element.__proto__ = element.type === "tag" ? ElementPrototype : NodePrototype;
	//}

	/*
  if(previousSibling){
		element.prev = previousSibling;
		previousSibling.next = element;
	} else {
		element.prev = null;
	}
  */

	siblings.push(element);
	//element.parent = parent || null;
};

CfmlHandler.prototype.onopentag = function(name, attribs){
  //debug('onopentag: ' + name)

  var element = {
		type: name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag,
		name: name,
		attribs: attribs,
		children: []
	};

	this._addDomElement(element);

	this._tagStack.push(element);

};

CfmlHandler.prototype.ontext = function(data){
  //debug('ontext: ' + data)
  /*
  //the ignoreWhitespace is officially dropped, but for now,
	//it's an alias for normalizeWhitespace
	var normalize = this._options.normalizeWhitespace || this._options.ignoreWhitespace;

	var lastTag;

	if(!this._tagStack.length && this.dom.length && (lastTag = this.dom[this.dom.length-1]).type === ElementType.Text){
		if(normalize){
			lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
		} else {
			lastTag.data += data;
		}
	} else {
		if(
			this._tagStack.length &&
			(lastTag = this._tagStack[this._tagStack.length - 1]) &&
			(lastTag = lastTag.children[lastTag.children.length - 1]) &&
			lastTag.type === ElementType.Text
		){
			if(normalize){
				lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
			} else {
				lastTag.data += data;
			}
		} else {
			if(normalize){
				data = data.replace(re_whitespace, " ");
			}

			this._addDomElement({
				data: data,
				type: ElementType.Text
			});
		}
	}
  */
};

CfmlHandler.prototype.oncomment = function(data){
  //debug('oncomment: ' + data)
  /*
	var lastTag = this._tagStack[this._tagStack.length - 1];

	if(lastTag && lastTag.type === ElementType.Comment){
		lastTag.data += data;
		return;
	}

	var element = {
		data: data,
		type: ElementType.Comment
	};

	this._addDomElement(element);
	this._tagStack.push(element);
  */
};

CfmlHandler.prototype.oncdatastart = function(){
  //debug('oncdatastart')
  /*
	var element = {
		children: [{
			data: "",
			type: ElementType.Text
		}],
		type: ElementType.CDATA
	};

	this._addDomElement(element);
	this._tagStack.push(element);
  */
};

CfmlHandler.prototype.oncommentend = CfmlHandler.prototype.oncdataend = function(){
  //debug('oncommentend')
	//this._tagStack.pop();
};

CfmlHandler.prototype.onprocessinginstruction = function(name, data){
  //debug('onprocessinginstruction')
  /*
  this._addDomElement({
		name: name,
		data: data,
		type: ElementType.Directive
	});
  */
}

module.exports = CfmlHandler
