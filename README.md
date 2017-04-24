# Enlace al analizador

[Analizador](http://immense-shore-19219.herokuapp.com/)

# Gramática

### Ejemplo de uso

    VAR a = 2; VAR b = 3; hola = FUNCTION () { IF (a > b) { a = 3; }};

Esta es la gramática:

    1.  Σ = { 'VAR', ID, '=', 'FUNCTION', 'IF', 'ELSEIF', 'ELSE', NUM, ADDOP, MULOP, 
              '{', '}', '(', ')', COMPARISONOPERATOR, '||', '&&', 'WHILE' ';' }
    2.  V = { primario, declaracion, asignacion, funcion, instruccion, expression,
              term, factor, condicion, sentencia, bucle, llamada, parametro}
    3.  Producciones:
        1.  primario → (declaracion | (llamada | asignacion))* //Esto es lo que puede haber en global
        2.  declaracion → 'VAR' asignacion 
        3.  asignacion → ID '=' ((funcion | expression) | asignacion) ;
        4.  funcion → 'FUNCTION' '(' (atributo)* ')' '{' (instruccion)* '}' ;
        5.  instruccion → ((declaracion | sentencia | bucle | llamada | asignacion) ;)*
        6.  expression → term ( ADDOP term)* 
        7.  term → factor (MULOP factor)*
        8.  factor → '(' expression ')' | NUM
        9.  condicion → parametro COMPARISONOPERATOR parametro
        10. sentencia → 'IF' (condicion) '{' instruccion '}' 
            ('ELSEIF' (condicion) '{' instruccion '}')* ('ELSE' '{' instruccion '}')? ;
        11. bucle → 'WHILE' (condicion) '{' instruccion '}' ;
        12. llamada → ID '(' (atributo)* ')' ;
        13. parametro → expression | ID

# Solución a la Práctica Evaluar Analizador Descendente Predictivo Recursivo

* [Campus PL1617: Práctica: Evaluar Analizador Descendente Predictivo Recursivo](https://campusvirtual.ull.es/1617/mod/assign/view.php?id=195888)
* [Descripción de la Práctica: Analizador Descendente Predictivo Recursivo](http://crguezl.github.io/pl-html/node26.html)
* [Analizadores Descendentes Recursivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/parsing/recursivodescendente/)

## Definición de la Práctica

### Forma de trabajo

* Use su portátil o su cuenta en c9 para llevar a cabo los objetivos planteados.
* Esta práctica se divide en objetivos o hitos:  indique al profesor  cuando ha terminado y suba los enlaces a los repos y despliegues.

### Descripción del Código de la Práctica

1. [Eloquent JS: The Secret Life of Objects. Lying Out a Table](http://eloquentjavascript.net/06_object.html##h_36C2FHHi44)
2. [Repo original de esta práctica](https://github.com/ULL-ESIT-DSI-1617/oop-eloquentjs-example)

### Hitos

1. Use el repo de GitHub dado por la asignación de esta tarea. 
2. Separe las clases `UnderlinedCell`, `TexCell`, etc. en distintos ficheros exportando los objetos adecuados
3. Reescriba las clases usando ECMA6
4. Añada pruebas para cada una de las clases `UnderlinedCell`, `TexCell`, etc
5. Añada integración continua usando Travis
6. Añada a su `README.md` un badge Travis como este:
[![Build Status](https://travis-ci.org/crguezl/mocha-chai-sinon--example.svg?branch=travis)](https://travis-ci.org/crguezl/mocha-chai-sinon--example)
indicando el estado de las pruebas en Travis y enlazando a las mismas. 
7. Entrege los enlaces al repo en GitHub y a Travis


### Recursos

* [Apuntes: Programación Orientada a Objetos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/oop/)
* [Apuntes: Pruebas. Mocha](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html)
* [Apuntes: Pruebas. Should](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/mocha.html#shouldl)
* [Apuntes: Integración Contínua. Travis](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/pruebas/travis.html)
* [node-sass-middleware](https://github.com/sass/node-sass-middleware/blob/master/README.md)
