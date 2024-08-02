// @ts-nocheck
import { observer } from "mobx-react-lite";
import { CenteredDiv } from "../../reusableComponents/common/CenteredDiv";
import MainLayout from "../../reusableComponents/layouts/MainLayout";

export const ScamWinnerPage = observer(() => {
    return (
        <MainLayout>
            <CenteredDiv>
                <div style={{ width: "80%" }}>
                    {/* biome-ignore lint/a11y/noDistractingElements: <explanation> */}
                    <marquee bgcolor="red" behavior="alternate" scrolldelay="60">
                        <h1>🚨Vous avez booké la 50 000 ème reservation de salle !🚨</h1>
                    </marquee>
                    <br />
                    <h2 style={{ textDecoration: "underline" }}>
                        🎉🎉🎉🎉Vous aver gagné GATEAU fabriqué par MAYEUL gratuit 🎉🎉🎉🎉
                    </h2>

                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />

                    <h3>Commentaires :</h3>
                    <br />
                    <div>
                        <h4>Benjamin D.</h4>
                        <p>Heureuse surprise, sans doute mon jour de chance !</p>

                        <h4>Jean-Paul Dubost</h4>
                        <p>
                            Au début, je pensais que c'était une blague, mais j'ai finalement eu mon
                            GATEAU GRATUIT ! J'en ai parlé à des amis, pour qu'ils puissent aussi
                            participer
                        </p>

                        <h4>Natanaël Baugé</h4>
                        <p>
                            Je me suis inscrit, j'ai gagné et j'ai reçu mon GATEAU GRATUIT au bout
                            de 5 jours. Merci beaucoup les gars !
                        </p>

                        <h4>Jennifer Ballesdens</h4>
                        <p>
                            Fantastique ! Je n'ai jamais rien gagné, mais ici j'ai eu de la chance
                            :)
                        </p>

                        <h4>Hugo Montgomery</h4>
                        <p>
                            J'ai gagné, j'ai gagné! Quelle belle surprise en ces temps difficiles!
                        </p>

                        <h4>Nicolette Lambert</h4>
                        <p>
                            Je n'ai rien gagné ! Les prix n'étaient pas disponibles lorsque j'ai
                            terminé l'enquête
                        </p>
                    </div>
                </div>
            </CenteredDiv>
        </MainLayout>
    );
});

export default ScamWinnerPage;
