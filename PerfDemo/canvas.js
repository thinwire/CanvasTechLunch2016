var SCREEN_WIDTH = 800;
var SCREEN_HEIGHT = 600;
var CAR_WIDTH = 128;
var CAR_HEIGHT = 64;
var images = [
    document.getElementById("car1"),
    document.getElementById("car2"),
    document.getElementById("car3"),
    document.getElementById("car4"),
    document.getElementById("car5")
];
var Car = (function () {
    function Car() {
        this._x = Math.random() * SCREEN_WIDTH;
        this._y = Math.random() * SCREEN_HEIGHT;
        this._img = (Math.random() * images.length) | 0;
        this.setSpeed(Math.random() * 360.0, 10 + Math.random() * 100);
    }
    Car.prototype.getX = function () {
        return this._x;
    };
    Car.prototype.getY = function () {
        return this._y;
    };
    Car.prototype.getImage = function () {
        return images[this._img];
    };
    Car.prototype.setSpeed = function (angle, speed) {
        var a = angle * Math.PI / 180.0;
        this._dx = Math.cos(a) * speed;
        this._dy = Math.sin(a) * speed;
    };
    Car.prototype.update = function (delta) {
        this._x += this._dx * delta;
        this._y += this._dy * delta;
        while (this._x > SCREEN_WIDTH + (CAR_WIDTH * .5)) {
            this._x -= SCREEN_WIDTH + CAR_WIDTH;
        }
        while (this._x < (CAR_WIDTH * -.5)) {
            this._x += SCREEN_WIDTH + CAR_WIDTH;
        }
        while (this._y > SCREEN_HEIGHT + (CAR_HEIGHT * .5)) {
            this._y -= SCREEN_HEIGHT + CAR_HEIGHT;
        }
        while (this._y < (CAR_HEIGHT * -.5)) {
            this._y += SCREEN_HEIGHT + CAR_HEIGHT;
        }
    };
    return Car;
})();
var Perftest = (function () {
    function Perftest() {
        var _this = this;
        this._cars = [];
        this._stats = document.getElementById("stats");
        this.addCars(50);
        document.addEventListener("keypress", function (ev) {
            if (ev.charCode == 32) {
                _this.addCars(10);
            }
        });
    }
    Perftest.prototype.addCars = function (count) {
        var first = this._cars.length;
        for (var i = 0; i < count; ++i) {
            this._cars.push(new Car());
        }
        if (this._renderer) {
            this._renderer.carsUpdated(this._cars, first);
        }
        this.updateStats(0);
    };
    Perftest.prototype.start = function (renderer) {
        var _this = this;
        var fps = 0;
        var tm_stat = 0;
        var tm_last = null;
        var callback = function (time) {
            var delta;
            if (tm_last == null) {
                tm_last = time;
                delta = 0;
            }
            else {
                delta = time - tm_last;
                tm_last = time;
                delta *= 0.001;
            }
            tm_stat += delta;
            if (tm_stat > 1) {
                _this.updateStats(fps);
                tm_stat = 0;
                fps = 0;
            }
            else {
                fps++;
            }
            for (var i = 0, l = _this._cars.length; i < l; ++i) {
                _this._cars[i].update(delta);
            }
            renderer.draw(_this._cars);
            window.requestAnimationFrame(callback);
        };
        window.requestAnimationFrame(callback);
        this._renderer = renderer;
        renderer.init(this._cars);
    };
    Perftest.prototype.updateStats = function (fps) {
        this._stats.innerText = "Cars: " + this._cars.length + ", FPS: " + fps;
    };
    return Perftest;
})();
var CanvasRenderer = (function () {
    function CanvasRenderer() {
        this._canvas = document.getElementById("output");
        this._context = this._canvas.getContext("2d");
    }
    CanvasRenderer.prototype.init = function (cars) {
        this._canvas.width = SCREEN_WIDTH;
        this._canvas.height = SCREEN_HEIGHT;
    };
    CanvasRenderer.prototype.carsUpdated = function (cars, first) {
    };
    CanvasRenderer.prototype.draw = function (cars) {
        var ctx = this._context;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.fill();
        ctx.beginPath();
        for (var i = 0, l = cars.length; i < l; ++i) {
            var car = cars[i];
            ctx.drawImage(car.getImage(), car.getX() - CAR_WIDTH * .5, car.getY() - CAR_HEIGHT * .5);
        }
    };
    return CanvasRenderer;
})();
var ptest = new Perftest();
ptest.start(new CanvasRenderer());
