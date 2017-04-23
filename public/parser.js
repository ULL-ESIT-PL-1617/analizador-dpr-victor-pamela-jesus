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
var 
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
      elseif: "ELSE IF",
      "else": "ELSE",
      "while": "WHILE",
      "var": "VAR",
      "function": "FUNCTION"
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
    var condition, expression, factor, lookahead, match, statement, statements, term, tokens, tree;
    var primario, declaracion, asignacion, llamada, funcion, parametro, instruccion, sentencia, bucle, condicion2;
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
      if(lookahead.type === "VAR") {
        //declaracion
      }
      else if(lookahead.type === "ID") {
        if(lookahead.lookahead.type === "=") {
          asignacion();
        } else if(lookahead.lookahead.type === "(") {
          // Todos los match los hago ya en llamada
          llamada();
        }
      }
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
    llamada = function() {
      var result = null;
      var id;
      var parameters = [];
      id = lookahead.value();
      match("ID");
      match("(");
      while(lookahead.type != ")") {
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
      return result;
    };
    parametro = function() {
      var result = expression();
      return result;
    };
    asignacion = function() {
      var lh, rh;
      var result = null;
      lh = lookahead.value;
      match("ID");
      match("=");
      // Lo podemos hacer como en JS donde pones function para definir funciones
      if(lookahead.type === "function"){
        rh = funcion();
      }
      else {
        rh = expression();
      }
      result = {
        left_hand: lh,
        right_hand: rh,
      };
      match(";");
      return result;
    };
    funcion = function(){
      var id;
      var parameters, instructions = [];
      var result;
      // ?
      //match("HAZESTO");
      id = lookahead.value;
      match("ID");
      match("(");
      while(lookahead.type === "ID" || lookahead.type === "(" || lookahead.type === "NUM"){
        parameters.push(parametro());
      }
      match(")");
      match("{");
      while(lookahead.type !== "}") {
        instructions.push(instruccion());
      }
      match("}");
      match(";");
      result = {
        type: "function",
        id: id,
        parameters: parameters,
        instructions: instructions
      };
      return result;
    };

    tree = primario(input);
    if (lookahead != null) {
      throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
    }
    return {tree: tree, tabla_id: tabla_id};
  };
