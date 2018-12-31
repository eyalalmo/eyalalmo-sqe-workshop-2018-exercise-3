import $ from 'jquery';
import {makeDiagram, makeProps} from './code-analyzer';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let paramsToParse = $('#paramPlaceholder').val();
        let resultDiagram = makeDiagram(codeToParse, paramsToParse);
        if(resultDiagram !== '') {
            const diagram = flowchart.parse(resultDiagram);
            let prop = makeProps();
            diagram.drawSVG('diagram', prop);
        }
    });
});
