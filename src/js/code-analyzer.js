import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

let diagram;
let nodeNum;

export function makeDiagram(code, params) {
    diagram = '';
    nodeNum = 1;
    let exp = esprima.parseScript(code);
    let paramsArr = eval('[' + params + ']');
    let env = {};
    let funDecl = exp.body[0].params;
    for(let i = 0; i < funDecl.length; i++)
    {
        env[funDecl[i].name] = paramsArr[i];
    }
    parseBlock(exp.body[0].body.body, env, ['st'], true);
    if(diagram !== '')
        diagram = 'st=>start\n' + diagram;
    return diagram;
}

const parseBlock = (arr, curEnv, lastNodes, onFlow) => {
    for (let i = 0; i < arr.length; i++) {
        if (isLetOrAss(arr[i])) {
            let response = createNodeOfLetAndAss(arr, curEnv, lastNodes, i, onFlow);
            lastNodes = response[0];
            i = response[1] - 1;
        }
        else if (isWhileOrLoop(arr[i])) {
            lastNodes = createNodeOfWhileOrIf(arr[i], curEnv, lastNodes, onFlow);
        }
        else {
            lastNodes = createNodeOfReturn(arr[i], curEnv, lastNodes, onFlow);
        }
    }
    return lastNodes;
};

const isWhileOrLoop = (exp) =>{
    return exp.type === 'WhileStatement' ||
        exp.type === 'IfStatement';
};

const isLetOrAss = (exp) =>{
    return exp.type === 'VariableDeclaration' ||
        exp.type === 'ExpressionStatement';
};

const parseLetAssMem = (exp, curEnv) => {
    return exp.type === 'VariableDeclaration' ? parseVarDec(exp, curEnv):
        parseAssignmentUpdate(exp.expression, curEnv);
};

const parseAssignmentUpdate = (exp, curEnv) => {
    if(exp.type === 'AssignmentExpression')
        curEnv[exp.left.name] = subAndEval(exp.right, curEnv);
    else
        curEnv[exp.argument.name]++;
    return escodegen.generate(exp);
};

const parseVarDec = (varDec, curEnv) => {
    varDec.declarations.forEach ((varDec) => {
        let variable = varDec.id.name;
        if(varDec.init)
            curEnv[variable] = subAndEval(varDec.init, curEnv);
    });
    let toAdd = escodegen.generate(varDec);
    return toAdd.substring(4, toAdd.length - 1);
};

const createNodeOfReturn = (expr, curEnv, lastNodes, onFlow) => {
    let exprS = escodegen.generate(expr);
    exprS = exprS.substring(0, exprS.length - 1);
    diagram += 'op' + nodeNum + '=>start: '
            + exprS;
    if(onFlow)
        diagram += ' | onFlow';
    diagram += '\n';
    lastNodes.forEach((node) => {
        diagram += node + '->' + 'op' + nodeNum + '\n';
    });
    nodeNum++;
    return [];
};

const createNodeOfWhileOrIf = (expr, curEnv, lastNodes, onFlow) =>{
    if(expr.type === 'WhileStatement') {
        diagram += 'op' + nodeNum + '=>operation: NULL';
        if (onFlow)
            diagram += '| onFlow';
        diagram += '\n';
        lastNodes.forEach((node) => {
            diagram += node + '->op' + nodeNum + '\n';
        });
        nodeNum++;
        return parseWhile(expr, curEnv, ['op' + (nodeNum - 1)], onFlow);
    }
    else {
        nodeNum++;
        return parseIf(expr, curEnv, lastNodes, onFlow);
    }
};

const parseIf = (exp, curEnv, lastNodes, onFlow) => {
    let testNode = 'cond' + nodeNum;
    diagram += testNode + '=>condition: ' + escodegen.generate(exp.test);
    if(onFlow)
        diagram += '| onFlow';
    diagram += '\n';
    lastNodes.forEach((node) => {
        diagram += node + '->' + testNode + '\n';
    });
    let tmpEnv = Object.assign({}, curEnv);
    let newConsNodes = [], newAltNodes = [];
    newConsNodes = parseConseq(exp, tmpEnv, testNode, onFlow, curEnv, '(yes)');
    tmpEnv = Object.assign({}, curEnv);
    if(exp.alternate) {
        newAltNodes = parseAlt(exp, tmpEnv, testNode, onFlow, curEnv, '(no)');
    }
    return newConsNodes.concat(newAltNodes);
};

const parseConseq = (exp, tmpEnv, testNode, onFlow, curEnv, yesOrNo) => {
    let body = exp.consequent;
    if (exp.consequent.type === 'BlockStatement')
        body = body.body;
    else body = [body];
    return parseBlock(body, tmpEnv, [testNode + yesOrNo],
        onFlow && subAndEval(exp.test, curEnv));
};

const parseAlt = (exp, tmpEnv, testNode, onFlow, curEnv, yesOrNo) => {
    let body = exp.alternate;
    if (exp.alternate.type === 'BlockStatement')
        body = body.body;
    else body = [body];
    return parseBlock(body, tmpEnv, [testNode + yesOrNo],
        onFlow && !subAndEval(exp.test, curEnv));
};

const parseWhile = (exp, curEnv, lastNodes, onFlow) => {
    let testNode = 'cond' + nodeNum;
    diagram += testNode + '=>condition: ' + escodegen.generate(exp.test);
    if(onFlow)
        diagram += '| onFlow';
    diagram += '\n' + lastNodes[0] + '->' + testNode + '\n';
    let tmpEnv = Object.assign({}, curEnv);
    nodeNum++;
    let body = exp.body;
    if (exp.body.type === 'BlockStatement')
        body = body.body;
    else
        body = [body];
    let newNodes = parseBlock(body, tmpEnv, [testNode + '(yes)'], subAndEval(exp.test, curEnv) && onFlow);
    newNodes.forEach((node) => {
        diagram += node + '->' + lastNodes[0] + '\n';
    });
    return [testNode + '(no)'];
};

const createNodeOfLetAndAss = (arr, curEnv, lastNodes, i, onFlow) =>{
    diagram += 'op' + nodeNum + '=>operation: ';
    while (i < arr.length && (arr[i].type === 'VariableDeclaration' ||
    arr[i].type === 'ExpressionStatement'))
        diagram += parseLetAssMem(arr[i++], curEnv) + '\n';
    diagram = diagram.substring(0, diagram.length - 1);
    if(onFlow)
        diagram += '| onFlow';
    diagram += '\n';
    lastNodes.forEach((node) => {
        diagram += node + '->' + 'op' + nodeNum + '\n';
    });
    nodeNum++;
    return [['op' + (nodeNum - 1)], i];
};

function subAndEval(exp, curEnv) {
    if(exp.type === 'Identifier')
        return curEnv[exp.name];
    return subsHelper(exp, curEnv);
}

function subsHelper(exp, curEnv) {
    let tmpExp = escodegen.generate(exp);
    tmpExp = esprima.parseScript(tmpExp).body[0].expression;
    if(tmpExp.type === 'BinaryExpression'){
        tmpExp.left = esprima.parseScript('' + subAndEval(tmpExp.left, curEnv)).body[0].expression;
        tmpExp.right = esprima.parseScript('' + subAndEval(tmpExp.right, curEnv)).body[0].expression;
        return eval(escodegen.generate(tmpExp));
    }
    else if(tmpExp.type === 'MemberExpression'){
        tmpExp.object = esprima.parseScript('[' + subAndEval(tmpExp.object, curEnv) + ']').body[0].expression.elements;
        tmpExp.property = esprima.parseScript('' + subAndEval(tmpExp.property, curEnv)).body[0].expression;
        let ind = escodegen.generate(tmpExp.property);
        let num = escodegen.generate(tmpExp.object[ind]);
        return eval('' + num);
    }
    else if(tmpExp.type === 'ArrayExpression'){
        return tmpExp.elements.map((x) => subAndEval(x, curEnv));
    }
    return eval(escodegen.generate(tmpExp));
}
