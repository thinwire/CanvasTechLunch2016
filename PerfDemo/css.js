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
var CSSRenderer = (function () {
    function CSSRenderer() {
        this._container = document.getElementById("container");
        this._elements = [];
    }
    CSSRenderer.prototype.init = function (cars) {
        this._container.style.backgroundColor = "#fff";
        for (var i = 0; i < cars.length; ++i) {
            this.createCar(cars[i]);
        }
    };
    CSSRenderer.prototype.carsUpdated = function (cars, first) {
        for (var i = first; i < cars.length; ++i) {
            this.createCar(cars[i]);
        }
    };
    CSSRenderer.prototype.createCar = function (car) {
        var elem = car.getImage().cloneNode(false);
        elem.style.position = "absolute";
        elem.style.left = car.getX() + "px";
        elem.style.top = car.getY() + "px";
        this._elements.push(elem);
        this._container.appendChild(elem);
    };
    CSSRenderer.prototype.draw = function (cars) {
        for (var i = 0, l = cars.length; i < l; ++i) {
            var elem = this._elements[i];
            var car = cars[i];
            elem.style.left = CAR_WIDTH * -.5 + car.getX() + "px";
            elem.style.top = CAR_HEIGHT * -.5 + car.getY() + "px";
        }
    };
    return CSSRenderer;
})();
var ptest = new Perftest();
ptest.start(new CSSRenderer());
