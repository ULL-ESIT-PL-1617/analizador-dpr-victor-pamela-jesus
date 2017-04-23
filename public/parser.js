Object.constructor.prototype.error = function(message, t) {
    t = t || this;
    t.name = "SyntaxError";
    t.message = message;
    throw treturn;
  };

  RegExp.prototype.bexec = function(str) {
    var i, m;
    i = this.lastIndex;
    m = this.exec(str);
    if (m && m.index === i) {
      return m;
    }
    return null;
  };

  String.prototype.tokens = function() {
    var RESERVED_WORD, from, getTok, i, key, m, make, n, result, rw, tokens, value;
    from = void 0;
    i = 0;
    n = void 0;
    m = void 0;
    result = [];
    tokens = {
      WHITES: /\s+/g,
      ID: /[a-zA-Z_]\w*/g,
      NUM: /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
      STRING: /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
      ONELINECOMMENT: /\/\/.*/g,
      MULTIPLELINECOMMENT: /\/[*](.|\n)*?[*]\//g,
      COMPARISONOPERATOR: /[<>=!]=|[<>]/g,
      ONECHAROPERATORS: /([=()&|;:,{}[\]])/g,
      ADDOP: /[+-]/g,
      MULTOP: /[*\/]/g
    };
    RESERVED_WORD = {
      p: "P",
      "IF": "IF",
      "then": "THEN",
      "ELSEIF": "ELSEIF",
      "ELSE": "ELSE",
      "WHILE": "WHILE",
      "VAR": "VAR",
      "FUNCTION": "FUNCTION"
    };
    make = function(type, value) {
      return {
        type: type,
        value: value,
        from: from,
        to: i
      };
    };
    
    getTok = function() {
      var str;
      str = m[0];
      i += str.length;
      return str;
    };
    
    if (!this) {
      return;
    }
    
    while (i < this.length) {
      for (key in tokens) {
        value = tokens[key];
        value.lastIndex = i;
      }
      from = i;
      if (m = tokens.WHITES.bexec(this) || (m = tokens.ONELINECOMMENT.bexec(this)) || (m = tokens.MULTIPLELINECOMMENT.bexec(this))) {
        getTok();
      } else if (m = tokens.ID.bexec(this)) {
        rw = RESERVED_WORD[m[0]];
        if (rw) {
          result.push(make(rw, getTok()));
        } else {
          result.push(make("ID", getTok()));
        }
      } else if (m = tokens.NUM.bexec(this)) {
        n = +getTok();
        if (isFinite(n)) {
          result.push(make("NUM", n));
        } else {
          make("NUM", m[0]).error("Bad number");
        }
      } else if (m = tokens.STRING.bexec(this)) {
        result.push(make("STRING", getTok().replace(/^["']|["']$/g, "")));
      } else if (m = tokens.COMPARISONOPERATOR.bexec(this)) {
        result.push(make("COMPARISON", getTok()));
      } else if (m = tokens.ADDOP.bexec(this)) {
        result.push(make("ADDOP", getTok()));
      } else if (m = tokens.MULTOP.bexec(this)) {
        result.push(make("MULTOP", getTok()));
      } else if (m = tokens.ONECHAROPERATORS.bexec(this)) {
        result.push(make(m[0], getTok()));
      } else {
        throw "Syntax error near '" + (this.substr(i)) + "'";
      }
    }
    return result;
  };

  var parse = function(input) {
    var expression, factor, lookahead, match, statement, statements, term, tokens, tree;
    var primario, declaracion, asignacion, llamada, funcion, parametro, instruccion, sentencia, bucle, condicion;
    var tabla_id = {};
    tokens = input.tokens();
    lookahead = tokens.shift();
    match = function(t) {
      if (lookahead.type === t) {
        lookahead = tokens.shift();
        if (typeof lookahead === "undefined") {
          lookahead = null;
        }
      } else {
        throw ("Syntax Error. Expected " + t + " found '") + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
      }
    
    };
    
    primario = function() {
      var result = [];
      var temp, lh;
      
      while (lookahead && (lookahead.type === "ID" || lookahead.type === "VAR")) {
        if(lookahead.type === "VAR") {
         result.push(declaracion());
        }
        else if(lookahead.type === "ID") {
          lh = lookahead.value;
          match("ID");
          if(lookahead.type === "=") {
            result.push(asignacion(lh));
          } else if(lookahead.type === "(") {
            // Todos los match los hago ya en llamada
            result.push(llamada(lh));
          }
        }
      }
      
      return result;
    };
    
    declaracion = function() {
      var result;
      match("VAR");
      lh = lookahead.value;
      match("ID");
      result = asignacion(lh);
      
      result = {
        type: "VAR",
        value: result
      };
      
      return result;
    };
    
    asignacion = function(lh) {
      var rh;
      var result = null;
      //lh = lookahead.value;
      match("=");
      if(lookahead.type === "FUNCTION"){
        rh = funcion();
      }
      else {
        rh = expression();
      }
      result = {
        type: "ASSIGN",
        left_hand: lh,
        right_hand: rh
      };
      match(";");
      tabla_id[lh] = rh;
      return result;
    };
    
    funcion = function(){
      var id;
      var parameters = [], instructions = [];
      var result;
      match("FUNCTION");
      match("(");
      while(lookahead.type === "ID" || lookahead.type === "(" || lookahead.type === "NUM"){
        parameters.push(parametro());
        if(lookahead.type === ",") {
          match(",");
        }
      }
      match(")");
      match("{");
      while(lookahead.type !== "}") {
        instructions.push(instruccion());
      }
      match("}");
      result = {
        type: "FUNCTION",
        parameters: parameters,
        instructions: instructions
      };
      return result;
    };
    
    instruccion = function(){
      var result = [];
      while(true){
        if(lookahead.type === "VAR"){
          result.push(declaracion());
        }
        else if(lookahead.type === "IF"){
         result.push(sentencia());
        }
        else if(lookahead.type === "WHILE"){
          result.push(bucle());
        }
        else if(lookahead.type === "ID"){
          lh = lookahead.value;
          match("ID");
          if(lookahead.type === "="){
            result.push(asignacion(lh));
          }
          else if(lookahead.type === "("){
            result.push(llamada(lh));
          }
        }
        else{
          break;
        }
      }
      
      return result;
    };
    
    expression = function() {
      var result, right, type;
      result = term();
      while (lookahead && lookahead.type === "ADDOP") {
        type = lookahead.value;
        match("ADDOP");
        right = term();
        result = {
          type: type,
          left: result,
          right: right
        };
      }
      return result;
    };
    
    term = function() {
      var result, right, type;
      result = factor();
      while (lookahead && lookahead.type === "MULTOP") {
        type = lookahead.value;
        match("MULTOP");
        right = factor();
        result = {
          type: type,
          left: result,
          right: right
        };
      }
      return result;
    };
    
    factor = function() {
      var result;
      result = null;
      if (lookahead.type === "NUM") {
        result = {
          type: "NUM",
          value: lookahead.value
        };
        match("NUM");
      } else if (lookahead.type === "ID") {
        result = {
          type: "ID",
          value: lookahead.value
        };
        match("ID");
      } else if (lookahead.type === "(") {
        match("(");
        result = expression();
        match(")");
      } else {
        throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
      }
      return result;
    };
    
    condicion = function() {
      var left, result, right, type;
      left = parametro();
      type = lookahead.value;
      match("COMPARISON");
      right = parametro();
      result = {
        type: type,
        left: left,
        right: right
      };
      return result;
    };
    
    sentencia = function(){
      var result = [];
      var cond, instruc, elemento;
      
      match("IF");
      match("(");
      cond = condicion();
      match(")");
      match("{");
      instruc = instruccion();
      match("}");
      
      elemento = {
        type: "IF",
        condition: cond,
        instruction: instruc
      };
      
      result.push(elemento);
      
      while(lookahead.type === "ELSEIF"){
        match("ELSEIF");
        match("(");
        cond = condicion();
        match(")");
        match("{");
        instruc = instruccion();
        match("}");
        
        elemento = {
          type: "ELSEIF",
          condition: cond,
          instruction: instruc
        };
       
        result.push(elemento);
      }
      if(lookahead.type === "ELSE"){
        match("ELSE");
        match("{");
        instruc = instruccion();
        match("}");
        
        elemento = {
          type: "ELSE",
          instruction: instruc
        };
       
        result.push(elemento);
      }
      
      return result;
    };
    
    bucle = function(){
      var result, cond, instruc;
      match("WHILE");
      match("(");
      cond = condicion();
      match(")");
      match("{");
      instruc = instruccion();
      match("}");
      result = {
        type: "BUCLE",
        condition: cond,
        instruction: instruc
      };
      
      return result;
    };
    
    llamada = function(id) {
      var result = null;
      var parameters = [];
      match("(");
      while(lookahead.type !== ")") {
        parameters.push(parametro());
        if(lookahead.type === ",") {
          match(",");
        }
      }
      result = {
        type: "call",
        id: id,
        parameters: parameters
      };
      match(")");
      match(";");
      return result;
    };
    
    parametro = function() {
      var result = expression();
      return result;
    };

    tree = primario(input);
    if (lookahead != null) {
      throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
    }
    return {tree: tree, tabla_id: tabla_id};
  };