/*
 * CSS rendering implementation
 * of car performance demo
 *  
 */

/// <reference path="common.ts" />

class CSSRenderer implements Renderer {

    private _container: HTMLDivElement;
    private _elements: HTMLImageElement[];

    constructor() {
        this._container = <HTMLDivElement>document.getElementById("container");
        this._elements = [];
    }

    public init(cars: Car[]): void {
        this._container.style.backgroundColor = "#fff";

        for(var i = 0; i < cars.length; ++i) {
            this.createCar(cars[i]);
        }
    }

    public carsUpdated(cars: Car[], first: number): void {
        for(var i = first; i < cars.length; ++i) {
            this.createCar(cars[i]);
        }
    }

    private createCar(car: Car): void {
        var elem = <HTMLImageElement>car.getImage().cloneNode(false);
        elem.style.position = "absolute";
        elem.style.left = car.getX() + "px";
        elem.style.top = car.getY() + "px";
        this._elements.push(elem);
        this._container.appendChild(elem);
    }

    public draw(cars: Car[]): void {
        for(var i = 0, l = cars.length; i < l; ++i) {
            var elem = this._elements[i];
            var car = cars[i];
            elem.style.left = CAR_WIDTH * -.5 + car.getX() + "px";
            elem.style.top = CAR_HEIGHT * -.5 + car.getY() + "px";
        }
    }
}


var ptest = new Perftest();
ptest.start(new CSSRenderer());
