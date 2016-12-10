import $ from 'jquery';
import Cursor from './cursor';
import Speaker from './speaker';

const App = class {

    constructor() {

        new Cursor('.cursor');
        new Speaker('.speaker');

        $('html').removeClass('is-loading');
    }
};

new App();
