import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {makeTableHTML} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let paramsToParse = $('#paramPlaceholder').val();
        $('#parsedCode').html(makeTableHTML(parsedCode, paramsToParse));
    });
});
