import assert from 'assert';
import {makeDiagram, makeProps} from '../src/js/code-analyzer';

describe('worst cases', () => {
    let input1 = 'function foo(){}';
    let result1 = '';
    let params1 = '';

    it('empty', () => {
        assert.deepEqual(makeDiagram(input1,params1), result1);
    });

    let input2 = 'function foo(){' +
        'return 1;}';
    let result2 = 'st=>start\n' +
        'op1=>start: (1)\nreturn 1 | onFlow\n' +
        'st->op1\n';
    let params2 = '1';

    it('no params', () => {
        assert.deepEqual(makeDiagram(input2,params2), result2);
    });

    let input3 = 'function foo(x){' +
        'return x;}';
    let result3 = 'st=>start\n' +
        'op1=>start: (1)\nreturn x | onFlow\n' +
        'st->op1\n';
    let params3 = '1';

    it('one param', () => {
        assert.deepEqual(makeDiagram(input3,params3), result3);
    });
});

describe('let and assignment expressions', () => {

    let input4 = 'function foo(x){\n' +
        '    let a = 1;\n' +
        '    return x;\n' +
        '}';
    let result4 = 'st=>start\n' +
        'op1=>operation: (1)\na = 1| onFlow\n' +
        'st->op1\n' +
        'op2=>start: (2)\nreturn x | onFlow\n' +
        'op1->op2\n';
    let params4 = '1';

    it('one let', () => {
        assert.deepEqual(makeDiagram(input4,params4), result4);
    });

    let input5 = 'function foo(x){\n' +
        '    let a = 1;\n' +
        '    a = a + x;\n' +
        '    return x;\n' +
        '}';
    let result5 = 'st=>start\n' +
        'op1=>operation: (1)\na = 1\n' +
        'a = a + x| onFlow\n' +
        'st->op1\n' +
        'op2=>start: (2)\nreturn x | onFlow\n' +
        'op1->op2\n';
    let params5 = '1';

    it('let and assignment', () => {
        assert.deepEqual(makeDiagram(input5,params5), result5);
    });
});

describe('if statments', () => {

    let input6 = 'function foo(x, y){\n' +
        '   let a = 1;\n' +
        '   a = a + x;    \n' +
        '   if(a > x)\n' +
        '       x = x + 1;\n' +
        '   return x;\n' +
        '}';
    let result6 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 1\n' +
        'a = a + x| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'a > x| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1| onFlow\n' +
        'cond2(yes)->op3\n' +
        'op4=>start: (4)\n' +
        'return x | onFlow\n' +
        'op3->op4\n' +
        'cond2(no)->op4\n';
    let params6 = '1,2';

    it('simple if', () => {
        assert.deepEqual(makeDiagram(input6,params6), result6);
    });

    let input7 = 'function foo(x, y){\n' +
        '    let a = 1;\n' +
        '    a = a + x;\n' +
        '    if(a > x){\n' +
        '        x = x + 1;\n' +
        '    }\n' +
        '    else {\n' +
        '        x = x + 2;\n' +
        '    }\n' +
        '    return x;\n' +
        '}';
    let result7 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 1\n' +
        'a = a + x| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'a > x| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1| onFlow\n' +
        'cond2(yes)->op3\n' +
        'op4=>operation: (4)\n' +
        'x = x + 2\n' +
        'cond2(no)->op4\n' +
        'op5=>start: (5)\n' +
        'return x | onFlow\n' +
        'op3->op5\n' +
        'op4->op5\n';
    let params7 = '1,2';

    it('if with block and else', () => {
        assert.deepEqual(makeDiagram(input7,params7), result7);
    });

    let input8 = 'function foo(x){\n' +
        '    if(x < 1){\n' +
        '         x = x + 1;\n' +
        '    } else if (x < 2){\n' +
        '         x = x + 2;\n' +
        '    } else \n' +
        '         x = x + 3;\n' +
        '    return x;\n' +
        '}';
    let result8 = 'st=>start\n' +
        'cond1=>condition: (1)\n' +
        'x < 1| onFlow\n' +
        'st->cond1\n' +
        'op2=>operation: (2)\n' +
        'x = x + 1\n' +
        'cond1(yes)->op2\n' +
        'cond3=>condition: (3)\n' +
        'x < 2| onFlow\n' +
        'cond1(no)->cond3\n' +
        'op4=>operation: (4)\n' +
        'x = x + 2| onFlow\n' +
        'cond3(yes)->op4\n' +
        'op5=>operation: (5)\n' +
        'x = x + 3\n' +
        'cond3(no)->op5\n' +
        'op6=>start: (6)\n' +
        'return x | onFlow\n' +
        'op2->op6\n' +
        'op4->op6\n' +
        'op5->op6\n';
    let params8 = '1';

    it('if else if', () => {
        assert.deepEqual(makeDiagram(input8,params8), result8);
    });
});

describe('while statments', () => {

    let input9 = 'function foo(x){\n' +
        '    let a = 0;\n' +
        '    while(x[a] < 1){\n' +
        '         a++;\n' +
        '    }\n' +
        '    return a;\n' +
        '}';
    let result9 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 0| onFlow\n' +
        'st->op1\n' +
        'op2=>operation: (2)\n' +
        ' NULL| onFlow\n' +
        'op1->op2\n' +
        'cond3=>condition: (3)\n' +
        'x[a] < 1| onFlow\n' +
        'op2->cond3\n' +
        'op4=>operation: (4)\n' +
        'a++| onFlow\n' +
        'cond3(yes)->op4\n' +
        'op4->op2\n' +
        'op5=>start: (5)\n' +
        'return a | onFlow\n' +
        'cond3(no)->op5\n';
    let params9 = '[0,1]';

    it('while with memberExp', () => {
        assert.deepEqual(makeDiagram(input9,params9), result9);
    });
});

describe('examples', () => {

    let input10 = 'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '\n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '    } else {\n' +
        '        c = c + z + 5;\n' +
        '    }\n' +
        '\n' +
        '    return c;\n' +
        '}';
    let result10 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = x + 1\n' +
        'b = a + y\n' +
        'c = 0| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'b < z| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'c = c + 5\n' +
        'cond2(yes)->op3\n' +
        'cond4=>condition: (4)\n' +
        'b < z * 2| onFlow\n' +
        'cond2(no)->cond4\n' +
        'op5=>operation: (5)\n' +
        'c = c + x + 5| onFlow\n' +
        'cond4(yes)->op5\n' +
        'op6=>operation: (6)\n' +
        'c = c + z + 5\n' +
        'cond4(no)->op6\n' +
        'op7=>start: (7)\n' +
        'return c | onFlow\n' +
        'op3->op7\n' +
        'op5->op7\n' +
        'op6->op7\n';
    let params10 = '1,2,3';

    it('ex1', () => {
        assert.deepEqual(makeDiagram(input10,params10), result10);
    });

    let input11 = 'function foo(x, y, z){\n' +
        '   let a = x + 1;\n' +
        '   let b = a + y;\n' +
        '   let c = 0;\n' +
        '   \n' +
        '   while (a < z) {\n' +
        '       c = a + b;\n' +
        '       z = c * 2;\n' +
        '       a++;\n' +
        '   }\n' +
        '   \n' +
        '   return z;\n' +
        '}\n';
    let result11 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = x + 1\n' +
        'b = a + y\n' +
        'c = 0| onFlow\n' +
        'st->op1\n' +
        'op2=>operation: (2)\n' +
        ' NULL| onFlow\n' +
        'op1->op2\n' +
        'cond3=>condition: (3)\n' +
        'a < z| onFlow\n' +
        'op2->cond3\n' +
        'op4=>operation: (4)\n' +
        'c = a + b\n' +
        'z = c * 2\n' +
        'a++| onFlow\n' +
        'cond3(yes)->op4\n' +
        'op4->op2\n' +
        'op5=>start: (5)\n' +
        'return z | onFlow\n' +
        'cond3(no)->op5\n';
    let params11 = '1,2,3';

    it('ex2', () => {
        assert.deepEqual(makeDiagram(input11,params11), result11);
    });

    let input12 = 'function foo(x){\n' +
        '   let a = [1];\n' +
        '   if(x > 1){\n' +
        '       x = x + 1;\n' +
        '   }\n' +
        '   else x = x + 2;\n' +
        '   return x;\n' +
        '}';
    let result12 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = [1]| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'x > 1| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1\n' +
        'cond2(yes)->op3\n' +
        'op4=>operation: (4)\n' +
        'x = x + 2| onFlow\n' +
        'cond2(no)->op4\n' +
        'op5=>start: (5)\n' +
        'return x | onFlow\n' +
        'op3->op5\n' +
        'op4->op5\n';
    let params12 = '1';

    it('ex3', () => {
        assert.deepEqual(makeDiagram(input12,params12), result12);
    });
});

describe('add ons', () => {

    let input13 = 'function foo(){\n' +
        'let a = [1];\n' +
        'return a;\n' +
        '}';
    let result13 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = [1]| onFlow\n' +
        'st->op1\n' +
        'op2=>start: (2)\n' +
        'return a | onFlow\n' +
        'op1->op2\n';
    let params13 = '[1]';

    it('ex7', () => {
        assert.deepEqual(makeDiagram(input13,params13), result13);
    });

    let input14 = 'function foo(x, y){\n' +
        '   let a = 1;\n' +
        '   a = a + x;    \n' +
        '   if(a > x)\n' +
        '       x = x + 1;\n' +
        '   return x;\n' +
        '}';
    let result14 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 1\n' +
        'a = a + x| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'a > x| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1| onFlow\n' +
        'cond2(yes)->op3\n' +
        'op4=>start: (4)\n' +
        'return x | onFlow\n' +
        'op3->op4\n' +
        'cond2(no)->op4\n';
    let params14 = '1,2';

    it('simple if2', () => {
        assert.deepEqual(makeDiagram(input14,params14), result14);
    });

    let input15 = 'function foo(x, y){\n' +
        '   let a = 1;\n' +
        '   a = a + x;    \n' +
        '   if(a > x)\n' +
        '       x = x + 1;\n' +
        '   else {x = x + 1;}\n' +
        '   return x;\n' +
        '}';
    let result15 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 1\n' +
        'a = a + x| onFlow\n' +
        'st->op1\n' +
        'cond2=>condition: (2)\n' +
        'a > x| onFlow\n' +
        'op1->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1| onFlow\n' +
        'cond2(yes)->op3\n' +
        'op4=>operation: (4)\n' +
        'x = x + 1\n' +
        'cond2(no)->op4\n' +
        'op5=>start: (5)\n' +
        'return x | onFlow\n' +
        'op3->op5\n' +
        'op4->op5\n';
    let params15 = '1,2';

    it('simple if2', () => {
        assert.deepEqual(makeDiagram(input15,params15), result15);
    });

    let input16 = 'function foo(x){\n' +
        '    let a = 1;\n' +
        '    while(a < 2)\n' +
        '        a++;\n' +
        '    return a;\n' +
        '}';
    let result16 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a = 1| onFlow\n' +
        'st->op1\n' +
        'op2=>operation: (2)\n' +
        ' NULL| onFlow\n' +
        'op1->op2\n' +
        'cond3=>condition: (3)\n' +
        'a < 2| onFlow\n' +
        'op2->cond3\n' +
        'op4=>operation: (4)\n' +
        'a++| onFlow\n' +
        'cond3(yes)->op4\n' +
        'op4->op2\n' +
        'op5=>start: (5)\n' +
        'return a | onFlow\n' +
        'cond3(no)->op5\n';
    let params16 = '1';

    it('ex4', () => {
        assert.deepEqual(makeDiagram(input16,params16), result16);
    });

    let input19 = 'function foo(x){\n' +
        '    if(1 < 0)\n' +
        '        return x;\n' +
        '}';
    let result19 = 'st=>start\n' +
        'cond1=>condition: (1)\n' +
        '1 < 0| onFlow\n' +
        'st->cond1\n' +
        'op2=>start: (2)\n' +
        'return x\n' +
        'cond1(yes)->op2\n';
    let params19 = '1';

    it('simple if3', () => {
        assert.deepEqual(makeDiagram(input19,params19), result19);
    });

    let input20 = 'function foo(x){\n' +
        '        if(1 < 0)\n' +
        '            while(x < 0)\n' +
        '                x = x + 1;\n' +
        '        return x;\n' +
        '    }';
    let result20 = 'st=>start\n' +
        'cond1=>condition: (1)\n' +
        '1 < 0| onFlow\n' +
        'st->cond1\n' +
        'op2=>operation: (2)\n' +
        ' NULL\n' +
        'cond1(yes)->op2\n' +
        'cond3=>condition: (3)\n' +
        'x < 0\n' +
        'op2->cond3\n' +
        'op4=>operation: (4)\n' +
        'x = x + 1\n' +
        'cond3(yes)->op4\n' +
        'op4->op2\n' +
        'op5=>start: (5)\n' +
        'return x | onFlow\n' +
        'cond3(no)->op5\n' +
        'cond1(no)->op5\n';
    let params20 = '1';

    it('while off flow', () => {
        assert.deepEqual(makeDiagram(input20,params20), result20);
    });

    let input21 = 'function foo(x){\n' +
        '        if(1 < 0)\n' +
        '            if(x < 0)\n' +
        '                x = x + 1;\n' +
        '        return x;\n' +
        '    }';
    let result21 = 'st=>start\n' +
        'cond1=>condition: (1)\n' +
        '1 < 0| onFlow\n' +
        'st->cond1\n' +
        'cond2=>condition: (2)\n' +
        'x < 0\n' +
        'cond1(yes)->cond2\n' +
        'op3=>operation: (3)\n' +
        'x = x + 1\n' +
        'cond2(yes)->op3\n' +
        'op4=>start: (4)\n' +
        'return x | onFlow\n' +
        'op3->op4\n' +
        'cond2(no)->op4\n' +
        'cond1(no)->op4\n';
    let params21 = '1';

    it('while off flow', () => {
        assert.deepEqual(makeDiagram(input21,params21), result21);
    });

    let input22 = 'function foo(x){\n' +
        '   let a;\n' +
        '   return x;\n' +
        '}';
    let result22 = 'st=>start\n' +
        'op1=>operation: (1)\n' +
        'a| onFlow\n' +
        'st->op1\n' +
        'op2=>start: (2)\n' +
        'return x | onFlow\n' +
        'op1->op2\n';
    let params22 = '1';

    it('add  on 1', () => {
        makeProps();
        assert.deepEqual(makeDiagram(input22,params22), result22);
    });
});
