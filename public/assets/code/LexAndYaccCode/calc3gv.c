#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef enum { typeCon, typeId, typeOpr } nodeEnum;

/* constants */
typedef struct {
    int value;                  /* value of constant */
} conNodeType;

/* identifiers */
typedef struct {
    int i;                      /* subscript to sym array */
} idNodeType;

/* operators */
typedef struct {
    int oper;                   /* operator */
    int nops;                   /* number of operands */
    struct nodeTypeTag *op[1];	/* operands, extended at runtime */
} oprNodeType;

typedef struct nodeTypeTag {
    nodeEnum type;              /* type of node */

    union {
        conNodeType con;        /* constants */
        idNodeType id;          /* identifiers */
        oprNodeType opr;        /* operators */
    };
} nodeType;

#include "y.tab.h"              /* bison-generated parser header */

extern int sym[26];

/* Print label associated with node */
void printLabel(nodeType **p);

/* Recursive drawing of the syntax tree */
void exNode(nodeType **p);

/* Main entry point of the manipulation of the syntax tree */
int ex(nodeType *p) {
    printf("digraph AST {\n");
    exNode(&p);
    printf("}\n");
    return 0;
}

/* Recursive drawing of the syntax tree */
void exNode(nodeType **p) {
    int k;              /* child number */

    /* Add string label */
    printLabel(p);

    /* Add arrows to children */
    for (k = 0; k < (*p)->opr.nops; k++)
        printf("\"%p\"->\"%p\";\n", (void*)p, (void*)&((*p)->opr.op[k]));

    /* Process children */
    for (k = 0; k < (*p)->opr.nops; k++)
        exNode(&((*p)->opr.op[k]));
}

/* Print label associated with node */
void printLabel(nodeType **p) {
    switch((*p)->type) {
        case typeCon:
            printf("\"%p\" [label=\"NUM(%d)\"];\n", (void*)p, (*p)->con.value);
            break;
        case typeId:
            printf("\"%p\" [label=\"ID(%c)\"];\n", (void*)p, (*p)->id.i + 'A');
            break;
        case typeOpr:
            switch((*p)->opr.oper){
                case WHILE:     
                    printf("\"%p\" [label=\"while\"];\n", (void*)p); break;
                case IF:        
                    printf("\"%p\" [label=\"if\"];\n", (void*)p);    break;
                case PRINT:     
                    printf("\"%p\" [label=\"print\"];\n", (void*)p); break;
                case ';':       
                    printf("\"%p\" [label=\";\"];\n", (void*)p);     break;
                case '=':       
                    printf("\"%p\" [label=\"=\"];\n", (void*)p);     break;
                case UMINUS:    
                    printf("\"%p\" [label=\"_\"];\n", (void*)p);     break;
                case '+':       
                    printf("\"%p\" [label=\"+\"];\n", (void*)p);     break;
                case '-':       
                    printf("\"%p\" [label=\"-\"];\n", (void*)p);     break;
                case '*':       
                    printf("\"%p\" [label=\"*\"];\n", (void*)p);     break;
                case '/':       
                    printf("\"%p\" [label=\"/\"];\n", (void*)p);     break;
                case '<':       
                    printf("\"%p\" [label=\"<\"];\n", (void*)p);     break;
                case '>':       
                    printf("\"%p\" [label=\">\"];\n", (void*)p);     break;
                case GE:        
                    printf("\"%p\" [label=\">=\"];\n", (void*)p);    break;
                case LE:        
                    printf("\"%p\" [label=\"<=\"];\n", (void*)p);    break;
                case NE:        
                    printf("\"%p\" [label=\"!=\"];\n", (void*)p);    break;
                case EQ:        
                    printf("\"%p\" [label=\"==\"];\n", (void*)p);    break;
            }
            break;
    }
}