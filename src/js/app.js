import $ from 'jquery';
import {makeDiagram} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let paramsToParse = $('#paramPlaceholder').val();
        let resuletDiagram = makeDiagram(codeToParse, paramsToParse);
        if(resuletDiagram !== '') {
            const diagram = flowchart.parse(resuletDiagram);
            let opt = {
                'x': 0,
                'y': 0,
                'line-width': 3,
                'line-length': 50,
                'text-margin': 10,
                'font-size': 14,
                'font-color': 'black',
                'line-color': 'black',
                'element-color': 'black',
                'fill': 'white',
                'yes-text': 'T',
                'no-text': 'F',
                'arrow-end': 'block',
                'scale': 1,
                // style symbol types
                'symbols': {
                    'start': {
                        'font-color': 'black',
                        'element-color': 'red',
                        'fill': 'white',
                        'font-size': 16,
                        'line-width': 4
                    },
                    'end': {
                        'class': 'end-element'
                    }
                },
                // even flowstate support ;-)
                'flowstate': {
                    'onFlow': {'fill': '#88B04D', 'font-size': 12},
                }
            };
            diagram.drawSVG('diagram', opt);
        }
    });
});
