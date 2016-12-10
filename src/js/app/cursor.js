import $ from 'jquery';

export default class Cursor {

    constructor(_el) {

        this.el = $(_el);

        $(document)
            .on('touchstart mousedown',  function(){  $(document.body).addClass('mouse-down'); })
            .on('touchmove mousemove',   this.onMouseMove.bind(this))
            .on('touchend mouseup',      function(){  $(document.body).removeClass('mouse-down'); });
    }

    onMouseMove(e) {
        if (this.mouseIsPaused) {
            this.unpauseMouse();
        }

        let _x = this.getEvent(e).clientX;
        let _y = this.getEvent(e).clientY;
        this.el.css({
            'transform': 'translate('+_x+'px, '+_y+'px)'
        });

        clearTimeout(this.mousePause);
        this.mousePause = setTimeout(this.pauseMouse.bind(this), 400);
    }

    pauseMouse() {
        $(document.body).addClass('mouse-pause');
        this.mouseIsPaused = true;
    }

    unpauseMouse() {
        $(document.body).removeClass('mouse-pause');
        this.mouseIsPaused = false;
    }

    getEvent(e) {
        return (Modernizr.touchevents) ? e.originalEvent.touches[0] : e;
    }
}