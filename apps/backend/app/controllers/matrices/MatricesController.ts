import Matrix from "#models/matrix";

export default class MatricesController {
    async index() {
        const matrices = await Matrix.all();

        return matrices;
    }
}
