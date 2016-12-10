import $ from 'jquery';
import { TweenLite, CSSPlugin } from "gsap";

export default class Speaker {

    constructor(_el) {

        // Cache DOM elements
        this.el = $(_el);

        this.tConeInner = this.el.find('.tweeter__cone-inner');
        this.wConeInner = this.el.find('.woofer__cone-inner');
        this.wConeMid   = this.el.find('.woofer__cone-mid');
        this.wConeOuter = this.el.find('.woofer__cone-outer');

        // State
        this.isPlaying = false;

        try {
            this.initAudio();

            this.el
                .on('touchstart mousedown', this.onTouchStart.bind(this))
                .on('touchmove mousemove',  this.onTouchMove.bind(this))
                .on('touchend mouseup',     this.onTouchEnd.bind(this));
          }
          catch(e) {
            $(document.body).addClass('unsupported-browser');
          }
    }

    initAudio() {

        // Load and create Loop
        this.loop = new Pizzicato.Sound({
            source: 'file',
            options: {
                path: '/audio/drum-break-99bpm.wav',
                loop: true
            }
        }, function(error) {
            if (error) {
                alert(error);
            }
        });

        // Create Low Pass Filter
        this.LPF = new Pizzicato.Effects.LowPassFilter();

        // Create Stereo Panner
        this.pan = new Pizzicato.Effects.StereoPanner();

        // Create Analyser
        this.analyser = Pizzicato.context.createAnalyser();
        this.analyser.fftSize = 1024;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Link 'em up
        this.loop.addEffect(this.LPF);
        this.loop.addEffect(this.pan);
        this.LPF.connect(this.analyser);
    }

    onTouchStart(e) {
        e.preventDefault();

        this.isPlaying = true;
        this.onTouchMove(e);
        this.startLoop();
    }

    onTouchMove(e){
        if (!this.isPlaying) {
            return;
        }

        this.setLPF(e);
        this.setPan(e);
    }

    onTouchEnd(e) {
        this.stopLoop();
        this.isPlaying = false;
    }

    onTick() {

        this.raf = requestAnimationFrame(this.onTick.bind(this));

        this.analyser.getByteFrequencyData(this.dataArray);

        // No of bins = fftSize (1024) / 2 = 516
        // Bandwidth of eah bin = 44100 / fftSize (1024) = ~43 Hz

        // bin 3 : ~86 Hz
        let vol = this.dataArray[2] / 255;
        TweenLite.to(this.wConeOuter, 0.001, {css:{scale: (1 + (vol * 0.05)) }});

        // bin 8 : ~301 Hz
        vol = this.dataArray[7] / 255;
        TweenLite.to(this.wConeMid, 0.001, {css:{scale: (1 + (vol * 0.1)) }});

        // bin 17 : ~689 Hz
        vol = this.dataArray[16] / 255;
        TweenLite.to(this.wConeInner, 0.001, {css:{scale: (1 + (vol * 0.1)) }});

        // bin 221 : ~9500 Hz
        vol = this.dataArray[220] / 255;
        TweenLite.to(this.tConeInner, 0.001, {css:{scale: (1 + (vol * 0.09)) }});
    }

    startLoop() {
        this.loop.play();
        this.onTick();
    }

    stopLoop() {
        cancelAnimationFrame(this.raf);
        this.loop.stop();

        // Animate woofer/tweeter back to normal scale
        TweenLite.to(this.tConeInner,   0.1, {scale: 1 });
        TweenLite.to(this.wConeInner,   0.15, {scale: 1 });
        TweenLite.to(this.wConeMid,     0.2, {scale: 1 });
        TweenLite.to(this.wConeOuter,   0.25, {scale: 1 });
    }

    /**
     * Set the Low Pass Filter frequency based on pageY position
     * Possible values between 0 and 1000
     * @param Event e   Touchmove or Mousemove event
     */
    setLPF(e) {
        let f = 10000 - ((this.getEvent(e).pageY / $(window).height()) * 10000);
        this.LPF.frequency = f;
    }

    /**
     * Set the Stereo Panner pan position based on pageX position
     * Possible values between -1 and 1
     * @param Event e   Touchmove or Mousemove event
     */
    setPan(e) {
        let p = (((this.getEvent(e).pageX / $(window).width())*2)-1);
        this.pan.pan = p;
    }

    getEvent(e) {
        return (Modernizr.touchevents) ? e.originalEvent.touches[0] : e;
    }
};
