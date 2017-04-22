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
    var RESERVED_WORD, BOOLEAN, from, getTok, i, key, m, make, n, result, rw, tokens, value;
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
      "if": "IF",
      "then": "THEN",
      "else": "ELSE"
    };
    
    RESERVED_WORD = {
      p: "P",
      "quedices": "IF",
      "entonces": "THEN",
      "sinoesto": "ELSE IF",
      "sino": "ELSE",
      "noparesplis": "WHILE",
      "cosa": "VAR",
      "hazesto": "FUNCTION"
    };
    
    BOOLEAN = {
      "true": "TRUE",
      "false": "FALSE"
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
        b = BOOLEAN[m[0]];
        if (rw) {
          result.push(make(rw, getTok()));
        } else if(b) {
          result.push(make("BOOLEAN", eval(getTok())));
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
    var condition, expression, factor, comma, assign, compare, start, conditional, lookahead, match, statement, statements, term, tokens, tree;
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
      if(lookahead.type === "COSA"){
        //declaración
      }
      else if(lookahead.type === "ID"){
        if(lookahead.lookahead.type === "="){
          //asignación
        }
        else if(lookahead.lookahead.type === "("){
          //llamada
        }
      }
    };
    
    declaracion = function() {
      match("COSA");
      //asignación();
    }
    
    asignacion = function(){
      match("ID");
      match("=");
      if(lookahead.type === "HAZESTO"){
        //Función
      }
      else if(lookahead.type === "(" || lookahead.type === "NUM"){
        //expression
      }
      else if(lookahead.type === "ID"){
        //asignacion
      }
      match(";");
    }
    
    llamada = function(){
      match("ID");
      match("(");
      while(lookahead.type === "ID" || lookahead.type === "(" || lookahead.type === "NUM"){
        //atributo
      }
      match(")");
      match(";");
    }
    
    funcion = function(){
      match("HAZESTO");
      match("(");
      while(lookahead.type === "ID" || lookahead.type === "(" || lookahead.type === "NUM"){
        //atributo
      }
      match(")");
      match("{");
      //while algo
        //instruccion
      match("}");
      match(";");
    }
    
    atributo = function(){
      if(lookahead.type === "ID"){
        match("ID");
      }
      else if(lookahead.type === "(" || lookahead.type === "NUM"){
        //expression
      }
    }
    
    expression = function(){
      var result, right, type;
      result = term();
      console.log(result);
      while(lookahead && lookahead.type === "ADDOP"){
        type = lookahead.value;
        match("ADDOP");
        right = term();
        if(type === "+"){
          result += right;
        }
        else if(type === "-"){
          result -= right;
        }
      }
      return result;
    }
    
    term = function(){
      var result, right, type;
      result = factor();
      if (lookahead && lookahead.type === "MULTOP") {
        type = lookahead.value;
        match("MULTOP");
        right = term();
        if(type === "*"){
          result *= right;
        }
        else if(type === "/"){
          result /= right;
        }
      }
      return result;
    }
    
    factor = function(){
      var result;
      result = null;
      if (lookahead.type === "NUM") {
        result = lookahead.value;
        match("NUM");
      } else if (lookahead.type === "(") {
        match("(");
        result = expression();
        match(")");
      } else {
        throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
      }
      return result;
    }
    
    instruccion = function(){
      while(true){
        if(lookahead.type === "COSA"){
          //declaracion
        }
        else if(lookahead.type === "SIESTO"){
        //  sentencia
        }
        else if(lookahead.type === "NOPARESPLIS"){
        //  bucle
        }
        else if(lookahead.type === "ID"){
          if(lookahead.lookahead.type === "="){
            //asignación
          }
          else if(lookahead.lookahead.type === "("){
            //llamada
          }
        }
        else{
          break;
        }
      }
    }
    
    sentencia = function(){
      match("SIESTO");
      match("(");
      //condicion2
      match(")");
      match("{");
      //instruccion
      match("}");
      while(lookahead.type === "SINOESTO"){
        match("SINOESTO");
        match("(");
        //condicion2
        match(")");
        match("{");
        //instruccion
        match("}");
      }
      if(lookahead.type === "SINO"){
        match("SINO");
        match("{");
        //instruccion
        match("}");
      }
    }
    
    bucle = function(){
      match("NOPARESPLIS");
      match("(");
      //condicion2
      match(")");
      match("{");
      //instruccion
      match("}");
      match(";");
    }
    
    condicion2 = function(){
      if(lookahead.type === "("){
        match("(");
        //condicion
        match(")");
      }
      //else if(lo que sea){
      //  condicion
      //}
    }
    
    start = function() {
      var result = primario();
      return [result, tabla_id];
    }

    tree = start(input);
    if (lookahead != null) {
      throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
    }
    return tree;
  };
