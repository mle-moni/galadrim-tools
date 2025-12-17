import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { ChangeDefaultOffice } from "./ChangeDefaultOffice";

export const ChangeDefaultOfficePage = () => (
    <MainLayout fullscreen>
        <div style={{ display: "flex", justifyContent: "center" }}>
            <ChangeDefaultOffice />
        </div>
    </MainLayout>
);

export default ChangeDefaultOfficePage;
