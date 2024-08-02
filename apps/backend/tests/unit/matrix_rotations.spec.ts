import { matrix2dToMatrixDto, matrixDtoToMatrix2d, rotateMatrix } from "@galadrim-tools/shared";
import { test } from "@japa/runner";

test.group("Matrix rotations", () => {
    test("matrix2dToMatrixDto & rotateMatrix works", async ({ assert }) => {
        const matrix1 = {
            red: 0b01000_00001_10010_10110_10001,
            blue: 0b00100_01110_00001_00001_01100,
            white: 0b10011_10000_01000_01000_00010,
            black: 12,
        };

        const matrix2 = {
            red: 0b11100_00001_01000_01100_10010,
            blue: 0b00000_10010_10011_00010_01100,
            white: 0b00011_01100_00000_10001_00001,
            black: 12,
        };

        const matrixTestBlack = {
            red: 0b0,
            blue: 0b0,
            white: 0b0,
            black: 6,
        };

        assert.deepEqual(matrix2dToMatrixDto(matrixDtoToMatrix2d(matrix1)), matrix1);

        assert.deepEqual(rotateMatrix(matrix1), matrix2);
        assert.deepEqual(rotateMatrix(rotateMatrix(rotateMatrix(rotateMatrix(matrix1)))), matrix1);

        assert.deepEqual(rotateMatrix(matrixTestBlack).black, 8);
    });
});
