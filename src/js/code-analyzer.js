import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as spliting from 'split-string';

let redsAndGreens = [];
let numOfRows = 0;
let funcDecl = [];

const parseCode = (codeToParse) => {
    let res = esprima.parseScript(codeToParse, {loc : true});
    return res;
};

const makeParams = (str, vardecs) => {
    let res = {};
    let vals = spliting(str, {separator: ',', brackets: true});
    for(let i = 0; i < vardecs.length; i++){
        res[escodegen.generate(vardecs[i])] =
            esprima.parseScript(vals[i]).body[0].expression;
    }
    return res;
};

export function makeTableHTML(parsedCode, parsedParams) {
    let res = '<pre>';
    let codeString = makeTable(parsedCode, parsedParams);
    let splitted = codeString.split('\n');
    for(let i = 0; i < splitted.length; i++){
        let color = pickColor(redsAndGreens[i+1]);
        if(redsAndGreens[i+1] !== undefined)
            res += '<span style="background-color:'
                + color + ';">' + splitted[i] + '</span>';
        else
            res += splitted[i];
        res += '\n';
    }
    res += '</pre>';
    return res;
}

function pickColor(x){
    if(x)
        return 'green';
    return 'red';
}

export const makeTable = (parsedCode, parsedParams) => {
    numOfRows = 0;
    funcDecl = [];
    redsAndGreens = [];
    let newBody = [];
    let env = {};
    parsedCode.body.forEach ((exp) =>{
        let x = parseExp(exp, env, parsedParams);
        newBody = [...newBody ,x];
    });
    parsedCode.body = newBody.filter(exp => exp);
    return fixArrays(parsedCode);
};

function fixArrays (parsedCode1){
    let parsedCode = escodegen.generate(parsedCode1);
    let j;
    let res = '';
    for(let i =0; i < parsedCode.length; i++){
        if(parsedCode.charAt(i) === '['){
            j = i;
            while(parsedCode.charAt(++i) !== ']');
            let tmp = parsedCode.substring(j, i + 1);
            let x = tmp.replace(/ /gi, '');
            let y = x.replace(/\n/gi, '');
            res += y;
        }
        else res += parsedCode.charAt(i);
    }
    return res;
}

const parseExp = (exp, curEnv, parsedParams) => {
    return exp === null | exp === undefined | exp === []? exp :
        exp.type === 'FunctionDeclaration' |
    exp.type === 'VariableDeclaration' |
    exp.type === 'ExpressionStatement' ? parseFuncDecExpBlock(exp, curEnv, parsedParams) :
            exp.type === 'BlockStatement'? parseFuncDecExpBlock(exp, curEnv,parsedParams) :
                exp.type === 'WhileStatement' |
        exp.type === 'IfStatement' ? parseCond(exp, curEnv, parsedParams) :
                    parseReturn(exp, curEnv);
};

const parseCond = (exp, curEnv, parsedParams) =>{
    return exp.type === 'WhileStatement' ? parseWhile(exp, curEnv, parsedParams) :
        parseIf(exp, curEnv, parsedParams);
};

const parseFuncDecExpBlock = (exp, curEnv, parsedParams) =>{
    return exp.type === 'FunctionDeclaration' ? parseFun(exp, curEnv, parsedParams):
        exp.type === 'VariableDeclaration' ? parseVarDec(exp.declarations, curEnv) :
            exp.type === 'ExpressionStatement' ? parseAssignment(exp, curEnv) :
                parseBlock(exp, curEnv, parsedParams);
};

const parseFun = (funDec, curEnv, parsedParams) => {
    parsedParams = makeParams(parsedParams, funDec.params);
    funcDecl = funDec.params;
    let newBody = parseExp(funDec.body, curEnv, parsedParams);
    funDec.body = newBody;
    return funDec;
};

const parseVarDec = (varDecArray, curEnv) => {
    varDecArray.forEach ((varDec) => {
        let variable = varDec.id.name;
        if(varDec.init)
            curEnv[variable] = subs(varDec.init, curEnv, false);
    });
    numOfRows++;
    return null;
};

function subs(exp, curEnv, args) {
    let tmp = escodegen.generate(exp);
    let newExp = esprima.parseScript(tmp).body[0].expression;
    if(!args) newExp = exp;
    if(newExp.type == 'Identifier'){
        let newVal = curEnv[newExp.name];
        if(newVal)
            newExp = newVal;
        return newExp;
    }
    return subsHelper(newExp, curEnv, args);
}

function subsHelper(newExp, curEnv, args) {
    if(newExp.type == 'BinaryExpression'){
        newExp.left = subs(newExp.left, curEnv, args);
        newExp.right = subs(newExp.right, curEnv, args);
    }
    else if(newExp.type == 'MemberExpression'){
        newExp.object = subs(newExp.object, curEnv, args);
        newExp.property = subs(newExp.property, curEnv, args);
    }
    else if(newExp.type == 'ArrayExpression'){
        newExp.elements = newExp.elements.map((x) => subs(x, curEnv, args));
    }
    return newExp;
}

const parseAssignment = (ass, curEnv) => {
    let variable = ass.expression.left.name;
    ass.expression.right = subs(ass.expression.right, curEnv, false);
    curEnv[variable] = subs(ass.expression.right, curEnv, false);
    if(argContain(variable))
        return ass;
    else numOfRows++;
    return null;
};

function argContain (variable){
    for(let i = 0; i < funcDecl.length; i++){
        if(funcDecl[i].name == variable)
            return true;
    }
    return false;
}


const parseWhile = (whi, curEnv, parsedParams) => {
    whi.test = subs(whi.test, curEnv, false);
    redsAndGreens[whi.loc.start.line - numOfRows] =
        eval(escodegen.generate(subs(whi.test, parsedParams, true)));
    let tmpEnv = Object.assign({}, curEnv);
    whi.body = parseExp(whi.body, tmpEnv, parsedParams);
    return whi;
};

const parseBlock = (block, curEnv, parsedParams) => {
    let newBlock = [];
    block.body.forEach((exp) => {
        let newExp = parseExp(exp, curEnv, parsedParams);
        newBlock = [...newBlock, newExp];
    });
    block.body = newBlock.filter(exp => exp);
    return block;
};

const parseIf = (ifState, curEnv, parsedParams) => {
    ifState.test = subs(ifState.test, curEnv, false);
    let tmpEnv = Object.assign({}, curEnv);
    let x = subs(ifState.test, parsedParams, true);
    redsAndGreens[ifState.loc.start.line - numOfRows] =
        eval(escodegen.generate(x));
    let newCons = parseExp(ifState.consequent, tmpEnv, parsedParams);
    ifState.consequent = newCons;
    tmpEnv = Object.assign({}, curEnv);
    if(ifState.alternate)
        numOfRows++;
    let newAlt = parseExp(ifState.alternate, tmpEnv, parsedParams);
    ifState.alternate = newAlt;
    return ifState;
};

const parseReturn = (returnState, curEnv) => {
    returnState.argument = subs(returnState.argument, curEnv, false);
    return returnState;
};

export {parseCode};