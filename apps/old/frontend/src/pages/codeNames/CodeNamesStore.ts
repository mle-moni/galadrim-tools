import {
    type ApiCodeNamesGame,
    type ApiMatrix,
    type MatrixDto,
    _assert,
    getMatrixCandidates,
    matrix2dToMatrixDto,
    matrixDtoToMatrix2d,
} from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getApiUrl, getErrorMessage } from "../../api/fetch";
import { notifyError, notifySuccess } from "../../utils/notification";
import { CodeNamesFormStore } from "./CodeNamesFormStore";

// X = black
const MATRIX_CHAR = ["?", "R", "B", "W", "X"] as const;
export type DrawableMatrixChar = (typeof MATRIX_CHAR)[number];
export type DrawableMatrix = DrawableMatrixChar[];

const COLOR_CHAR_TO_COLOR: { [K in DrawableMatrixChar]: string } = {
    "?": "grey",
    R: "red",
    B: "blue",
    W: "white",
    X: "black",
};

const getCanvasRealCoordinates = (x: number, y: number, canvas: HTMLCanvasElement) => {
    const offsetW = canvas.offsetWidth;
    const offsetH = canvas.offsetHeight;

    const percentageX = (x * 100) / offsetW;
    const percentageY = (y * 100) / offsetH;

    const realX = (canvas.width * percentageX) / 100;
    const realY = (canvas.height * percentageY) / 100;

    return { x: Math.round(realX), y: Math.round(realY) };
};

export class CodeNamesStore {
    matrix: MatrixDto = {
        red: 0,
        blue: 0,
        white: 0,
        black: -1,
    };

    matrices: ApiMatrix[] = [];

    _ctx: CanvasRenderingContext2D | null = null;

    showResult = false;

    _canvas: HTMLCanvasElement | null = null;

    game: ApiCodeNamesGame | null = null;

    codeNamesFormStore = new CodeNamesFormStore();

    constructor() {
        makeAutoObservable(this);

        this.fetch();
    }

    setGame(game: ApiCodeNamesGame) {
        this.game = game;

        this.codeNamesFormStore.setBlueSpyMaster(game.blueSpyMasterId);
        this.codeNamesFormStore.setRedSpyMaster(game.redSpyMasterId);
        this.codeNamesFormStore.imageStore.setImageSrc(`${getApiUrl()}${game.image.url}`);
        if (game.rounds.length > 0) {
            const lastState = game.rounds[game.rounds.length - 1];
            this.matrix.red = lastState.red;
            this.matrix.blue = lastState.blue;
            this.matrix.white = lastState.white;
            this.matrix.black = lastState.black;
            this.draw();
        }
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this.draw();
    }

    get canvas() {
        _assert(this._canvas, "canvas is null, it should not be");
        return this._canvas;
    }

    get ctx() {
        _assert(this._ctx, "ctx is null, it should not be");
        return this._ctx;
    }

    async fetch() {
        const res = await fetchBackendJson<ApiMatrix[], unknown>("/matrices", "GET");
        if (!res.ok) {
            notifyError("Impossible de récupérer les matrices, bizarre");
            return;
        }

        this.setMatrices(res.json);
    }

    async fetchGame(id: number) {
        const res = await fetchBackendJson<ApiCodeNamesGame, unknown>(
            `/codeNamesGames/${id}`,
            "GET",
        );
        if (!res.ok) {
            notifyError("Impossible de récupérer la partie, bizarre");
            return;
        }

        this.setGame(res.json);
    }

    setShowResult(state: boolean) {
        this.showResult = state;
        this.draw();
    }

    setMatrices(matrices: ApiMatrix[]) {
        this.matrices = matrices;
    }

    setMatrix(x: number, y: number) {
        const originalColor = this.getDrawableMatrix()[y * 5 + x];

        const color = MATRIX_CHAR[(MATRIX_CHAR.indexOf(originalColor) + 1) % MATRIX_CHAR.length];

        const matrix2d = matrixDtoToMatrix2d(this.matrix);
        const index = x + y * 5;

        matrix2d.red[index] = color === "R" ? 1 : 0;
        matrix2d.blue[index] = color === "B" ? 1 : 0;
        matrix2d.white[index] = color === "W" ? 1 : 0;

        if (color !== "X" && this.matrix.black === index) {
            matrix2d.black = -1;
        }
        if (color === "X") {
            matrix2d.black = index;
        }

        this.matrix = matrix2dToMatrixDto(matrix2d);
    }

    getDrawableMatrix(): DrawableMatrix {
        const shouldShowResult = this.showResult && this.filteredMatrices.length === 1;
        const matrixDto = shouldShowResult ? this.filteredMatrices[0] : this.matrix;
        const drawableMatrix: DrawableMatrix = Array(25).fill("?");
        const matrix2d = matrixDtoToMatrix2d(matrixDto);

        for (let i = 0; i < 25; i++) {
            if (matrix2d.red[i] === 1) drawableMatrix[i] = "R";
            if (matrix2d.blue[i] === 1) drawableMatrix[i] = "B";
            if (matrix2d.white[i] === 1) drawableMatrix[i] = "W";
        }

        if (matrixDto.black !== -1) drawableMatrix[matrixDto.black] = "X";

        return drawableMatrix;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const drawableMatrix = this.getDrawableMatrix();

        const width = this.canvas.width / 5;
        const height = this.canvas.height / 5;

        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                const color = COLOR_CHAR_TO_COLOR[drawableMatrix[y * 5 + x]];

                this.ctx.fillStyle = color;
                this.ctx.fillRect(x * width, y * height, width, height);

                // draw grid
                if (y !== 0) {
                    this.ctx.fillStyle = "black";
                    this.ctx.fillRect(0, y * height - 2, this.canvas.width, 4);
                }
            }

            // draw grid
            if (x !== 0) {
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(x * width - 2, 0, 4, this.canvas.height);
            }
        }
    }

    onClick(relativeX: number, relativeY: number) {
        const pos = getCanvasRealCoordinates(relativeX, relativeY, this.canvas);
        const x = Math.floor(pos.x / (this.canvas.width / 5));
        const y = Math.floor(pos.y / (this.canvas.height / 5));

        this.setMatrix(x, y);

        this.draw();
    }

    get filteredMatrices() {
        return getMatrixCandidates(this.matrix, this.matrices);
    }

    get numberOfMatricesText() {
        if (this.filteredMatrices.length === 1) return "1 matrice possible";

        return `${this.filteredMatrices.length} matrices possibles`;
    }

    async submitNewRound() {
        const data = this.codeNamesFormStore.getRoundPayload();

        if (!data || !this.game) return;

        data.append("red", this.matrix.red.toString());
        data.append("blue", this.matrix.blue.toString());
        data.append("white", this.matrix.white.toString());
        data.append("black", this.matrix.black.toString());

        const res = await fetchBackendJson(`/codeNamesGames/addRound/${this.game.id}`, "POST", {
            body: data,
        });

        if (res.ok) {
            notifySuccess("Round sauvegardé !");
        } else {
            notifyError(getErrorMessage(res.json, "Impossible de créer le round, bizarre"));
        }
    }
}
