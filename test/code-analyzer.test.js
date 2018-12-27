import assert from 'assert';
import {makeTableHTML, parseCode} from '../src/js/code-analyzer';

describe('assignment tests', () => {
    let input;
    let result;
    let params;

    it('empty', () => {
        assert.deepEqual(makeTableHTML(parseCode(''), ''), '<pre>\n</pre>');
    });

    input = 'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } \n' +
        'else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } \n' +
        'else {\n' +
        '        c = c + z + 5;\n' +
        '        return x + y + z + c;\n' +
        '    }\n' +
        '}';
    result = '<pre>function foo(x, y, z) {\n' +
        '<span style="background-color:red;">    if (x + 1 + y < z) {</span>\n' +
        '        return x + y + z + (0 + 5);\n' +
        '<span style="background-color:red;">    } else if (x + 1 + y < z * 2) {</span>\n' +
        '        return x + y + z + (0 + x + 5);\n' +
        '    } else {\n' +
        '        return x + y + z + (0 + z + 5);\n' +
        '    }\n' +
        '}\n' +
        '</pre>';
    params = '1,1,1';

    input = 'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    while (a < z) {\n' +
        '        c = a + b;\n' +
        '        z = c * 2;\n' +
        '    }\n' +
        '    return z;\n' +
        '}';
    result = '<pre>function foo(x, y, z) {\n' +
        '<span style="background-color:red;">    while (x + 1 < z) {</span>\n' +
        '        z = (x + 1 + (x + 1 + y)) * 2;\n' +
        '    }\n' +
        '    return z;\n' +
        '}\n' +
        '</pre>';
    params = '1,1,1';

    it('example2', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });

    input = 'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } \n' +
        'else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '        return x + y + z + c;\n' +
        '    } \n' +
        'else {\n' +
        '        c = c + z + 5;\n' +
        '        return x + y + z + c;\n' +
        '    }\n' +
        '}';
    result = '<pre>function foo(x, y, z) {\n' +
        '<span style="background-color:red;">    if (x + 1 + y < z) {</span>\n' +
        '        return x + y + z + (0 + 5);\n' +
        '<span style="background-color:green;">    } else if (x + 1 + y < z * 2) {</span>\n' +
        '        return x + y + z + (0 + x + 5);\n' +
        '    } else {\n' +
        '        return x + y + z + (0 + z + 5);\n' +
        '    }\n' +
        '}\n' +
        '</pre>';
    params = '1,2,3';

    it('example3', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });

    input = 'function f(x,y){\n' +
        '        let a = [x,x+1,x+2];\n' +
        '        let b;\n' +
        '        b = a[1]-a[0];\n' +
        '        let c = 12;\n' +
        '        if(a[b] < c){\n' +
        '            b = 0;\n' +
        '            return y[b];\n' +
        '        }\n' +
        '        else{\n' +
        '            while(y[0] < 99){\n' +
        '                let k = 9;\n' +
        '                x = x +1;\n' +
        '                return b + 1;\n' +
        '            }\n' +
        '            while(y[0] < 101){\n' +
        '                c = c +1;\n' +
        '                return a[0];\n' +
        '            }\n' +
        '            let t = 1;\n' +
        '            return y[t];\n' +
        '        }\n' +
        '    }';
    result = '<pre>function f(x, y) {\n' +
        '<span style="background-color:green;">    if ([x,x+1,x+2][[x,x+1,x+2][1] - [x,x+1,x+2][0]] < 12) {</span>\n' +
        '        return y[0];\n' +
        '    } else {\n' +
        '<span style="background-color:green;">        while (y[0] < 99) {</span>\n' +
        '            x = x + 1;\n' +
        '            return [x,x+1,x+2][1] - [x,x+1,x+2][0] + 1;\n' +
        '        }\n' +
        '<span style="background-color:green;">        while (y[0] < 101) {</span>\n' +
        '            return [x,x+1,x+2][0];\n' +
        '        }\n' +
        '        return y[1];\n' +
        '    }\n' +
        '}\n' +
        '</pre>';
    params = '1,[20,23,9]';

    it('example4', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });
});

describe('assignment tests 2', () => {
    let input;
    let result;
    let params;

    input = 'let a = 3;\n' +
        'a = a + a;\n' +
        'function f(x){\n' +
        '    x = x + 2;\n' +
        '}';
    result = '<pre>function f(x) {\n' +
        '    x = x + 2;\n' +
        '}\n' +
        '</pre>';
    params = '1';

    it('example5', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });

    it('example6', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });

    input = 'function f(x){\n' +
        '    if(x < 2){}\n' +
        '}';
    result = '<pre>function f(x) {\n' +
        '<span style="background-color:green;">    if (x < 2) {</span>\n' +
        '    }\n' +
        '}\n' +
        '</pre>';
    params = '1';

    it('example7', () => {
        assert.deepEqual(makeTableHTML(parseCode(input), params), result);
    });
});

