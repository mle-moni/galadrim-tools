import { type PropsWithChildren, useEffect } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const random = (...params: any[]): number => {
    if (params.length === 1) {
        if (Array.isArray(params[0])) {
            const index = Math.round(random(0, params[0].length - 1));
            return params[0][index];
        }
        return random(0, params[0]);
    }
    if (params.length === 2) {
        return Math.random() * (params[1] - params[0]) + params[0];
    }
    return 0;
};

// Screen helper
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const screenInfo = (e?: any) => {
    const _w = window;
    const _b = document.body;
    const _d = document.documentElement;

    const width = Math.max(0, _w.innerWidth || _d.clientWidth || _b.clientWidth || 0);
    const height = Math.max(0, _w.innerHeight || _d.clientHeight || _b.clientHeight || 0);
    const scrollx =
        Math.max(0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0) - (_d.clientLeft || 0);
    const scrolly =
        Math.max(0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0) - (_d.clientTop || 0);

    return {
        width: width,
        height: height,
        ratio: width / height,
        centerx: width / 2,
        centery: height / 2,
        scrollx: scrollx,
        scrolly: scrolly,
    };
};

// Point object
class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = 0;
        this.y = 0;
        this.set(x, y);
    }

    set(x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    copy(point: Point) {
        this.x = point.x || 0;
        this.y = point.y || 0;
        return this;
    }

    multiply(x: number, y: number) {
        this.x *= x || 1;
        this.y *= y || 1;
        return this;
    }

    divide(x: number, y: number) {
        this.x /= x || 1;
        this.y /= y || 1;
        return this;
    }

    add(x: number, y: number) {
        this.x += x || 0;
        this.y += y || 0;
        return this;
    }

    subtract(x: number, y: number) {
        this.x -= x || 0;
        this.y -= y || 0;
        return this;
    }

    clampX(min: number, max: number) {
        this.x = Math.max(min, Math.min(this.x, max));
        return this;
    }

    clampY(min: number, max: number) {
        this.y = Math.max(min, Math.min(this.y, max));
        return this;
    }

    flipX() {
        this.x *= -1;
        return this;
    }

    flipY() {
        this.y *= -1;
        return this;
    }
}

type FactoryOptions = {
    colorSaturation: string;
    colorBrightness: string;
    colorAlpha: number;
    colorCycleSpeed: number;
    verticalPosition: string;
    horizontalSpeed: number;
    ribbonCount: number;
    strokeSize: number;
    parallaxAmount: number;
    animateSections: boolean;
};

class Factory {
    _canvas: HTMLCanvasElement | null;
    _context: CanvasRenderingContext2D | null;
    _sto: number | null;
    _width: number;
    _height: number;
    _scroll: number;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    _ribbons: Array<any>; // Replace 'any' with the appropriate type for ribbon sections
    _options: FactoryOptions;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    constructor(options?: any) {
        // Replace 'any' with a specific type if you have options defined
        this._canvas = null;
        this._context = null;
        this._sto = null;
        this._width = 0;
        this._height = 0;
        this._scroll = 0;
        this._ribbons = [];
        this._options = {
            colorSaturation: "80%",
            colorBrightness: "60%",
            colorAlpha: 0.65,
            colorCycleSpeed: 6,
            verticalPosition: "center",
            horizontalSpeed: 200,
            ribbonCount: 3,
            strokeSize: 0,
            parallaxAmount: -0.5,
            animateSections: true,
        };

        // Bind methods
        this._onDraw = this._onDraw.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onScroll = this._onScroll.bind(this);

        if (options) {
            this.setOptions(options);
        }
        this.init();
    }

    setOptions(options: FactoryOptions) {
        // Replace 'any' with a specific type if you have options defined
        if (typeof options === "object") {
            for (const rawKey in options) {
                const key = rawKey as keyof FactoryOptions;

                // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
                if (options.hasOwnProperty(key)) {
                    // @ts-ignore
                    this._options[key] = options[key];
                }
            }
        }
    }

    init() {
        try {
            this._canvas = document.createElement("canvas");
            this._canvas.style.display = "block";
            this._canvas.style.position = "fixed";
            this._canvas.style.margin = "0";
            this._canvas.style.padding = "0";
            this._canvas.style.border = "0";
            this._canvas.style.outline = "0";
            this._canvas.style.left = "0";
            this._canvas.style.top = "0";
            this._canvas.style.width = "100%";
            this._canvas.style.height = "100%";
            this._canvas.id = "bgCanvas";
            this._onResize();

            this._context = this._canvas.getContext("2d");
            this._context?.clearRect(0, 0, this._width, this._height);
            if (this._context) {
                this._context.globalAlpha = this._options.colorAlpha;
            }

            window.addEventListener("resize", this._onResize);
            window.addEventListener("scroll", this._onScroll);
            document.body.appendChild(this._canvas);
        } catch (e) {
            if (e instanceof Error) {
                console.warn(`Canvas Context Error: ${e.toString()}`);
            } else {
                console.warn(`Canvas Context Error: ${e}`);
            }
            return;
        }
        this._onDraw();
    }

    _onResize() {
        const screen = screenInfo();
        this._width = screen.width;
        this._height = screen.height;

        if (this._canvas) {
            this._canvas.width = this._width;
            this._canvas.height = this._height;
            if (this._context) {
                this._context.globalAlpha = this._options.colorAlpha;
            }
        }
    }

    _onScroll() {
        const screen = screenInfo();
        this._scroll = screen.scrolly;
    }

    addRibbon() {
        // Movement data
        const dir = Math.round(random(1, 9)) > 5 ? "right" : "left";
        let stop = 1000;
        const hide = 200;
        const min = 0 - hide;
        const max = this._width + hide;
        let movex = 0;
        let movey = 0;
        const startx = dir === "right" ? min : max;

        let starty = Math.round(random(0, this._height));

        if (starty > (this._height * 1) / 3 && starty < (this._height * 2) / 3) {
            starty = starty < this._height / 2 ? this._height / 3 : (this._height * 2) / 3;
        }

        // Adjust starty based on options
        if (/^(top|min)$/i.test(this._options.verticalPosition)) {
            starty = 0 + hide;
        } else if (/^(middle|center)$/i.test(this._options.verticalPosition)) {
            starty = this._height / 2;
        } else if (/^(bottom|max)$/i.test(this._options.verticalPosition)) {
            starty = this._height - hide;
        }

        // Ribbon sections data
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const ribbon: any[] = [];
        const point1 = new Point(startx, starty);
        const point2 = new Point(startx, starty);
        let color = Math.round(random(0, 360));
        let point3 = null;
        let delay = 0;

        // Build ribbon sections
        while (true) {
            if (stop <= 0) break;
            stop--;

            movex = Math.round((Math.random() - 0.2) * this._options.horizontalSpeed);
            movey = Math.round((Math.random() - 0.5) * (this._height * 0.25));

            point3 = new Point(0, 0);
            point3.copy(point2);

            if (dir === "right") {
                point3.add(movex, movey);
                if (point2.x >= max) break;
            } else if (dir === "left") {
                point3.subtract(movex, movey);
                if (point2.x <= min) break;
            }

            ribbon.push({
                // single ribbon section
                point1: new Point(point1.x, point1.y),
                point2: new Point(point2.x, point2.y),
                point3: point3,
                color: color,
                delay: delay,
                dir: dir,
                alpha: 0,
                phase: 0,
            });

            point1.copy(point2);
            point2.copy(point3);

            delay += 4;
            color += this._options.colorCycleSpeed;
        }

        this._ribbons.push(ribbon);
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    _drawRibbonSection(section: any) {
        if (section) {
            if (section.phase >= 1 && section.alpha <= 0) {
                return true; // Done with this section
            }
            if (section.delay <= 0) {
                section.phase += 0.02;
                section.alpha = Math.sin(section.phase);
                section.alpha = section.alpha <= 0 ? 0 : section.alpha;
                section.alpha = section.alpha >= 1 ? 1 : section.alpha;

                if (this._options.animateSections) {
                    const mod = Math.sin(1 + (section.phase * Math.PI) / 2) * 0.1;

                    // Déterminez le centre de l'écran
                    const centerX = this._width / 2;
                    const centerY = this._height / 2;

                    // Vérifiez si le ruban est proche du centre
                    const isNearCenterX = Math.abs(section.point2.x - centerX) < this._width / 4;
                    const isNearCenterY = Math.abs(section.point2.y - centerY) < this._height / 4;

                    if (isNearCenterX && isNearCenterY) {
                        // stop current ribbons from moving towards the center and make them go around it
                        section.point1.add(mod * -1, mod);
                        section.point2.add(mod * -1, mod);
                        section.point3.add(mod * -1, mod);
                    }

                    if (section.dir === "right") {
                        section.point1.add(mod, 0);
                        section.point2.add(mod, 0);
                        section.point3.add(mod, 0);
                    } else {
                        section.point1.subtract(mod, 0);
                        section.point2.subtract(mod, 0);
                        section.point3.subtract(mod, 0);
                    }
                    section.point1.add(0, mod);
                    section.point2.add(0, mod);
                    section.point3.add(0, mod);
                }
            } else {
                section.delay -= 0.5;
            }

            const s = this._options.colorSaturation;
            const l = this._options.colorBrightness;
            const c = `hsla(${section.color}, ${s}, ${l}, ${section.alpha} )`;

            this._context?.save();

            if (this._options.parallaxAmount !== 0) {
                this._context?.translate(0, this._scroll * this._options.parallaxAmount);
            }
            this._context?.beginPath();
            this._context?.moveTo(section.point1.x, section.point1.y);
            this._context?.lineTo(section.point2.x, section.point2.y);
            this._context?.lineTo(section.point3.x, section.point3.y);
            this._context!.fillStyle = c;
            this._context?.fill();

            if (this._options.strokeSize > 0 && this._context) {
                this._context.lineWidth = this._options.strokeSize;
                this._context.strokeStyle = c;
                this._context.lineCap = "round";
                this._context.stroke();
            }
            this._context?.restore();
        }
        return false; // Not done yet
    }

    _onDraw() {
        // Cleanup on ribbons list to remove finished ribbons
        for (let i = 0; i < this._ribbons.length; ++i) {
            if (this._ribbons[i] === null) {
                this._ribbons.splice(i, 1);
            }
        }

        // Clear canvas
        this._context?.clearRect(0, 0, this._width, this._height);

        // Draw new ribbons
        for (let i = 0; i < this._ribbons.length; ++i) {
            const ribbon = this._ribbons[i];
            const numSections = ribbon.length;
            let numDone = 0;

            for (let j = 0; j < numSections; ++j) {
                const section = ribbon[j];
                if (this._drawRibbonSection(section)) {
                    numDone++; // Section done
                }
            }

            if (numDone >= numSections) {
                // If all sections of a ribbon are done
                this._ribbons[i] = null;
            }
        }

        // Maintain optional number of ribbons on canvas
        if (this._ribbons.length < this._options.ribbonCount) {
            this.addRibbon();
        }

        // Request the next frame for animation
        requestAnimationFrame(this._onDraw);
    }
}

const WithRibbons = ({ children }: PropsWithChildren) => {
    useEffect(() => {
        new Factory();

        return () => {
            const canvas = document.getElementById("bgCanvas");
            if (canvas) {
                canvas.remove();
            }
        };
    }, []);

    return <div style={{ position: "fixed", zIndex: 5 }}>{children}</div>;
};

export default WithRibbons;
