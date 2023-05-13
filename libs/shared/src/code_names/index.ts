export type Matrix2d = {
    red: number[]
    blue: number[]
    white: number[]
    black: number
}

export interface MatrixDto {
    red: number
    blue: number
    white: number
    black: number
}

export interface Matrix extends MatrixDto {
    id: number
    createdAt: string
    updatedAt: string
}

export const rotate90Clockwise = (input: Matrix2d): Matrix2d => {
    const LEN = 5
    const copy = JSON.parse(JSON.stringify(input)) as Matrix2d

    for (const color of COLORS) {
        for (let x = 0; x < LEN; x++) {
            for (let y = 0; y < LEN; y++) {
                const value = input[color][y * LEN + x]
                const newX = LEN - y - 1
                const newY = x
                copy[color][newY * LEN + newX] = value
            }
        }
    }

    const blackX = input.black % LEN
    const blackY = Math.floor(input.black / LEN)
    const newBlackX = LEN - blackY - 1
    const newBlackY = blackX

    copy.black = newBlackY * LEN + newBlackX

    return copy
}

const COLORS = ['red', 'blue', 'white'] as const

export function matrixDtoToMatrix2d(matrix: MatrixDto): Matrix2d {
    const result: Matrix2d = {
        red: [],
        blue: [],
        white: [],
        black: matrix.black,
    }

    for (const color of COLORS) {
        const row = []
        for (let i = 0; i < 25; i++) {
            row.push((matrix[color] >> i) & 1)
        }
        result[color].push(...row.reverse())
    }

    return result
}

export function matrix2dToMatrixDto(matrix2d: Matrix2d): MatrixDto {
    const result: MatrixDto = {
        red: 0,
        blue: 0,
        white: 0,
        black: matrix2d.black,
    }

    for (const color of COLORS) {
        let value = 0
        const reversedArray = [...matrix2d[color]].reverse()
        for (let i = 0; i < reversedArray.length; i++) {
            value |= reversedArray[i] << i
        }
        result[color] = value
    }

    return result
}

export const rotateMatrix = (matrix: MatrixDto): MatrixDto => {
    const matrix2D = matrixDtoToMatrix2d(matrix)
    const rotatedMatrix2D = rotate90Clockwise(matrix2D)

    return matrix2dToMatrixDto(rotatedMatrix2D)
}

export const checkMatrix = (matrix: MatrixDto, matrixToCheck: MatrixDto): boolean => {
    const checkRed = (matrix.red | matrixToCheck.red) === matrix.red
    const checkBlue = (matrix.blue | matrixToCheck.blue) === matrix.blue
    const checkWhite = (matrix.white | matrixToCheck.white) === matrix.white

    return checkRed && checkBlue && checkWhite
}

export const getMatrixCandidates = (
    matrixToCheck: MatrixDto,
    matrices: MatrixDto[]
): MatrixDto[] => {
    const filteredMatrices = matrices.filter((matrix) => checkMatrix(matrix, matrixToCheck))

    return filteredMatrices
}
